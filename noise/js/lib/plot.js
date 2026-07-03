/* plot.js — a small canvas plotting library for the interactive demos.
 *
 * Global: Plot
 *
 *   const p = new Plot('#container', {
 *     xlabel: 'time (s)', ylabel: 'V', title: '',
 *     xlog: false, ylog: false,
 *     xlim: [a, b] | 'auto', ylim: [a, b] | 'auto',
 *     height: 280,            // CSS pixels
 *     xunit: 's', yunit: 'V', // appended in the hover tooltip
 *     legend: true            // auto: shown when >= 2 labeled series
 *   });
 *   p.line(x, y, { label, color, width, dash, fill });   // fill: area wash to 0
 *   p.points(x, y, { label, color, r });
 *   p.guideX(x0, { label, color, dash });                 // vertical guide line
 *   p.guideY(y0, { label, color, dash });
 *   p.clear();      // remove all series/guides (keeps options)
 *   p.draw();       // render (also re-renders on hover/resize automatically)
 *
 * Series colors default to the categorical palette in fixed slot order.
 * Hovering shows a crosshair + tooltip with the nearest sample of each series.
 */
(function (global) {
  'use strict';

  const PALETTE = ['#2a78d6', '#1baf7a', '#eda100', '#008300',
                   '#4a3aa7', '#e34948', '#e87ba4', '#eb6834'];
  const PALETTE_DARK = ['#3987e5', '#199e70', '#c98500', '#008300',
                        '#9085e9', '#e66767', '#d55181', '#d95926'];

  const SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²',
    '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷',
    '8': '⁸', '9': '⁹' };
  function sup(n) { return String(n).split('').map(c => SUP[c] || c).join(''); }

  function pow10Label(e) { return '10' + sup(e); }

  // Compact number formatting for ticks and tooltips.
  function fmtNum(v, digits) {
    if (!isFinite(v)) return '–';
    if (v === 0) return '0';
    const a = Math.abs(v);
    if (a >= 1e4 || a < 1e-3) {
      const e = Math.floor(Math.log10(a));
      const mant = v / Math.pow(10, e);
      const m = mant.toFixed(digits === undefined ? 2 : digits)
        .replace(/\.?0+$/, '');
      return (m === '1' ? '' : m === '-1' ? '−' : m + '×') + pow10Label(e);
    }
    let s = v.toPrecision(digits === undefined ? 4 : digits + 1);
    if (s.indexOf('.') >= 0) s = s.replace(/\.?0+$/, '');
    return s;
  }

  function isDark() {
    return global.matchMedia &&
      global.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function chrome() {
    const d = isDark();
    return {
      surface: d ? '#1a1a19' : '#fcfcfb',
      ink:     d ? '#ffffff' : '#0b0b0b',
      sec:     d ? '#c3c2b7' : '#52514e',
      muted:   '#898781',
      grid:    d ? '#2c2c2a' : '#e1e0d9',
      axis:    d ? '#383835' : '#c3c2b7',
      palette: d ? PALETTE_DARK : PALETTE
    };
  }

  // "Nice" linear ticks.
  function linTicks(lo, hi, n) {
    const span = hi - lo;
    if (!(span > 0)) return [lo];
    const raw = span / n;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    const step = (norm < 1.5 ? 1 : norm < 3.5 ? 2 : norm < 7.5 ? 5 : 10) * mag;
    const ticks = [];
    const i0 = Math.ceil(lo / step - 1e-9), i1 = Math.floor(hi / step + 1e-9);
    for (let i = i0; i <= i1; i++) ticks.push(i === 0 ? 0 : i * step);
    return ticks;
  }

  class Plot {
    constructor(target, opts) {
      opts = opts || {};
      let el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) throw new Error('Plot: target not found: ' + target);
      if (el.tagName === 'CANVAS') {
        this.canvas = el;
        this.holder = el.parentElement;
      } else {
        this.holder = el;
        this.canvas = document.createElement('canvas');
        el.appendChild(this.canvas);
      }
      this.canvas.className = 'plot-canvas';
      this.o = Object.assign({
        xlabel: '', ylabel: '', title: '',
        xlog: false, ylog: false, xlim: 'auto', ylim: 'auto',
        height: 280, xunit: '', yunit: '', legend: 'auto',
        hover: true
      }, opts);
      this.series = [];
      this.guides = [];
      this._hover = null;
      this.canvas.style.display = 'block';
      this.canvas.style.width = '100%';
      this.canvas.style.height = this.o.height + 'px';
      this.canvas.style.touchAction = 'pan-y';

      if (this.o.hover) {
        this.canvas.addEventListener('pointermove', (e) => {
          const r = this.canvas.getBoundingClientRect();
          this._hover = { px: e.clientX - r.left, py: e.clientY - r.top };
          this.draw();
        });
        this.canvas.addEventListener('pointerleave', () => {
          this._hover = null;
          this.draw();
        });
      }
      if (global.ResizeObserver) {
        this._ro = new ResizeObserver(() => this.draw());
        this._ro.observe(this.canvas);
      }
      if (global.matchMedia) {
        global.matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', () => this.draw());
      }
    }

    clear() { this.series = []; this.guides = []; return this; }

    line(x, y, o) {
      this.series.push(Object.assign({ x, y, type: 'line', width: 2 }, o));
      return this;
    }

    points(x, y, o) {
      this.series.push(Object.assign({ x, y, type: 'points', r: 4 }, o));
      return this;
    }

    guideX(v, o) { this.guides.push(Object.assign({ axis: 'x', v }, o)); return this; }
    guideY(v, o) { this.guides.push(Object.assign({ axis: 'y', v }, o)); return this; }

    _limits() {
      const o = this.o;
      let xlo = Infinity, xhi = -Infinity, ylo = Infinity, yhi = -Infinity;
      for (const s of this.series) {
        for (let i = 0; i < s.x.length; i++) {
          const xv = s.x[i], yv = s.y[i];
          if (!isFinite(xv) || !isFinite(yv)) continue;
          if (o.xlog && xv <= 0) continue;
          if (o.ylog && yv <= 0) continue;
          if (xv < xlo) xlo = xv; if (xv > xhi) xhi = xv;
          if (yv < ylo) ylo = yv; if (yv > yhi) yhi = yv;
        }
      }
      if (!isFinite(xlo)) { xlo = o.xlog ? 0.1 : 0; xhi = 1; }
      if (!isFinite(ylo)) { ylo = o.ylog ? 0.1 : 0; yhi = 1; }
      if (Array.isArray(o.xlim)) { xlo = o.xlim[0]; xhi = o.xlim[1]; }
      if (Array.isArray(o.ylim)) { ylo = o.ylim[0]; yhi = o.ylim[1]; }
      else {
        // pad y a little
        if (o.ylog) { ylo /= 1.5; yhi *= 1.5; }
        else {
          const pad = (yhi - ylo) * 0.06 || Math.abs(yhi) * 0.1 || 1;
          ylo -= pad; yhi += pad;
        }
        // Sticky, snapped autoscale: (1) snap the limits outward to a
        // tick-sized grid (log axes: whole decades); (2) reuse the previous
        // auto-limits while the data still fits inside them and fills at
        // least half the range. Without this, slider-driven data wobbles
        // re-derive slightly different limits every tick and the whole
        // axis jitters.
        if (o.ylog) {
          if (ylo > 0 && yhi > 0) {
            ylo = Math.pow(10, Math.floor(Math.log10(ylo) + 1e-9));
            yhi = Math.pow(10, Math.ceil(Math.log10(yhi) - 1e-9));
          }
          const p = this._autoY;
          if (p && p[0] > 0 && ylo >= p[0] && yhi <= p[1] &&
              Math.log10(yhi / ylo) > 0.5 * Math.log10(p[1] / p[0])) {
            ylo = p[0]; yhi = p[1];
          } else {
            this._autoY = [ylo, yhi];
          }
        } else if (yhi > ylo) {
          const raw = (yhi - ylo) / 5;
          const mag = Math.pow(10, Math.floor(Math.log10(raw)));
          const nrm = raw / mag;
          const step = (nrm < 1.5 ? 1 : nrm < 3.5 ? 2 : nrm < 7.5 ? 5 : 10) * mag;
          ylo = Math.floor(ylo / step) * step;
          yhi = Math.ceil(yhi / step) * step;
          const p = this._autoY;
          if (p && ylo >= p[0] && yhi <= p[1] &&
              (yhi - ylo) > 0.5 * (p[1] - p[0])) {
            ylo = p[0]; yhi = p[1];
          } else {
            this._autoY = [ylo, yhi];
          }
        }
      }
      if (o.xlog && xlo <= 0) xlo = xhi / 1e6;
      if (o.ylog && ylo <= 0) ylo = yhi / 1e12;
      if (xlo === xhi) { xlo -= 1; xhi += 1; }
      if (ylo === yhi) { ylo -= 1; yhi += 1; }
      return { xlo, xhi, ylo, yhi };
    }

    draw() {
      const c = this.canvas;
      const ctx = c.getContext('2d');
      const dpr = global.devicePixelRatio || 1;
      const W = c.clientWidth || 600, H = this.o.height;
      if (c.width !== Math.round(W * dpr) || c.height !== Math.round(H * dpr)) {
        c.width = Math.round(W * dpr);
        c.height = Math.round(H * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const th = chrome();
      ctx.fillStyle = th.surface;
      ctx.fillRect(0, 0, W, H);

      const o = this.o;
      // assign palette colors in fixed slot order
      let slot = 0;
      for (const s of this.series) {
        s._color = s.color || th.palette[slot % th.palette.length];
        if (!s.color) slot++;
      }
      const labeled = this.series.filter(s => s.label);
      const showLegend = o.legend === true ||
        (o.legend === 'auto' && labeled.length >= 2);

      const padL = o.ylabel ? 62 : 46;
      const padR = 14;
      const padT = 10 + (o.title ? 22 : 0) + (showLegend ? 22 : 0);
      const padB = o.xlabel ? 42 : 26;
      const pw = W - padL - padR, ph = H - padT - padB;
      if (pw < 20 || ph < 20) return;

      const L = this._limits();
      const xs = o.xlog
        ? v => padL + pw * (Math.log10(v) - Math.log10(L.xlo)) /
               (Math.log10(L.xhi) - Math.log10(L.xlo))
        : v => padL + pw * (v - L.xlo) / (L.xhi - L.xlo);
      const ys = o.ylog
        ? v => padT + ph * (1 - (Math.log10(v) - Math.log10(L.ylo)) /
               (Math.log10(L.yhi) - Math.log10(L.ylo)))
        : v => padT + ph * (1 - (v - L.ylo) / (L.yhi - L.ylo));
      this._xs = xs; this._ys = ys; this._L = L;
      this._rect = { l: padL, t: padT, w: pw, h: ph };

      ctx.font = '11px system-ui, -apple-system, "Segoe UI", sans-serif';

      // ---- gridlines + ticks
      const drawTicksX = (vals, minor) => {
        for (const v of vals) {
          const px = xs(v);
          if (px < padL - 0.5 || px > padL + pw + 0.5) continue;
          ctx.strokeStyle = th.grid;
          ctx.globalAlpha = minor ? 0.45 : 1;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px, padT); ctx.lineTo(px, padT + ph);
          ctx.stroke();
          ctx.globalAlpha = 1;
          if (!minor) {
            ctx.fillStyle = th.muted;
            ctx.textAlign = 'center'; ctx.textBaseline = 'top';
            ctx.fillText(o.xlog ? pow10Label(Math.round(Math.log10(v)))
                                : fmtNum(v, 3), px, padT + ph + 5);
          }
        }
      };
      const drawTicksY = (vals, minor) => {
        for (const v of vals) {
          const py = ys(v);
          if (py < padT - 0.5 || py > padT + ph + 0.5) continue;
          ctx.strokeStyle = th.grid;
          ctx.globalAlpha = minor ? 0.45 : 1;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(padL, py); ctx.lineTo(padL + pw, py);
          ctx.stroke();
          ctx.globalAlpha = 1;
          if (!minor) {
            ctx.fillStyle = th.muted;
            ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
            ctx.fillText(o.ylog ? pow10Label(Math.round(Math.log10(v)))
                                : fmtNum(v, 3), padL - 6, py);
          }
        }
      };
      const logTicks = (lo, hi) => {
        const e0 = Math.floor(Math.log10(lo)), e1 = Math.ceil(Math.log10(hi));
        const major = [], minor = [];
        for (let e = e0; e <= e1; e++) {
          const d = Math.pow(10, e);
          if (d >= lo * 0.999 && d <= hi * 1.001) major.push(d);
          if (e1 - e0 <= 4) {
            for (let m = 2; m <= 9; m++) {
              const v = m * d;
              if (v >= lo && v <= hi) minor.push(v);
            }
          }
        }
        return { major, minor };
      };
      if (o.xlog) {
        const t = logTicks(L.xlo, L.xhi);
        drawTicksX(t.minor, true); drawTicksX(t.major, false);
      } else drawTicksX(linTicks(L.xlo, L.xhi, Math.max(3, Math.floor(pw / 90))), false);
      if (o.ylog) {
        const t = logTicks(L.ylo, L.yhi);
        drawTicksY(t.minor, true); drawTicksY(t.major, false);
      } else drawTicksY(linTicks(L.ylo, L.yhi, Math.max(3, Math.floor(ph / 55))), false);

      // baseline axes
      ctx.strokeStyle = th.axis;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + ph);
      ctx.lineTo(padL + pw, padT + ph);
      ctx.stroke();
      // zero line on linear y if in range
      if (!o.ylog && L.ylo < 0 && L.yhi > 0) {
        ctx.strokeStyle = th.axis;
        ctx.beginPath();
        ctx.moveTo(padL, ys(0)); ctx.lineTo(padL + pw, ys(0));
        ctx.stroke();
      }

      // ---- guides
      for (const g of this.guides) {
        ctx.strokeStyle = g.color || th.muted;
        ctx.lineWidth = 1;
        ctx.setLineDash(g.dash === false ? [] : [5, 4]);
        ctx.beginPath();
        if (g.axis === 'x') {
          const px = xs(g.v);
          if (px >= padL && px <= padL + pw) {
            ctx.moveTo(px, padT); ctx.lineTo(px, padT + ph);
          }
        } else {
          const py = ys(g.v);
          if (py >= padT && py <= padT + ph) {
            ctx.moveTo(padL, py); ctx.lineTo(padL + pw, py);
          }
        }
        ctx.stroke();
        ctx.setLineDash([]);
        if (g.label) {
          ctx.fillStyle = th.sec;
          if (g.axis === 'x') {
            ctx.textAlign = 'left'; ctx.textBaseline = 'top';
            ctx.fillText(g.label, Math.min(xs(g.v) + 5, padL + pw - 60), padT + 4);
          } else {
            ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
            ctx.fillText(g.label, padL + pw - 5, ys(g.v) - 3);
          }
        }
      }

      // ---- series (clipped to plot area)
      ctx.save();
      ctx.beginPath();
      ctx.rect(padL, padT, pw, ph);
      ctx.clip();
      for (const s of this.series) {
        const n = Math.min(s.x.length, s.y.length);
        if (s.type === 'points') {
          ctx.fillStyle = s._color;
          for (let i = 0; i < n; i++) {
            if (!isFinite(s.x[i]) || !isFinite(s.y[i])) continue;
            if (o.xlog && s.x[i] <= 0) continue;
            if (o.ylog && s.y[i] <= 0) continue;
            const px = xs(s.x[i]), py = ys(s.y[i]);
            ctx.strokeStyle = th.surface;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(px, py, s.r, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
          }
          continue;
        }
        // area wash
        if (s.fill) {
          ctx.globalAlpha = 0.1;
          ctx.fillStyle = s._color;
          ctx.beginPath();
          let started = false;
          const y0 = o.ylog ? padT + ph : ys(Math.max(0, L.ylo));
          for (let i = 0; i < n; i++) {
            if (!isFinite(s.y[i]) || (o.xlog && s.x[i] <= 0) ||
                (o.ylog && s.y[i] <= 0)) continue;
            const px = xs(s.x[i]), py = ys(s.y[i]);
            if (!started) { ctx.moveTo(px, y0); started = true; }
            ctx.lineTo(px, py);
          }
          if (started) {
            ctx.lineTo(xs(s.x[n - 1]), y0);
            ctx.closePath();
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        }
        ctx.strokeStyle = s._color;
        ctx.lineWidth = s.width || 2;
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        if (s.dash) ctx.setLineDash(s.dash);
        ctx.beginPath();
        let pen = false;
        for (let i = 0; i < n; i++) {
          const xv = s.x[i], yv = s.y[i];
          const bad = !isFinite(xv) || !isFinite(yv) ||
            (o.xlog && xv <= 0) || (o.ylog && yv <= 0);
          if (bad) { pen = false; continue; }
          const px = xs(xv), py = ys(yv);
          if (pen) ctx.lineTo(px, py); else { ctx.moveTo(px, py); pen = true; }
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.restore();

      // ---- title / legend / axis labels
      let ty = 8;
      if (o.title) {
        ctx.fillStyle = th.ink;
        ctx.font = '600 13px system-ui, -apple-system, "Segoe UI", sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText(o.title, padL, ty);
        ty += 22;
      }
      if (showLegend) {
        ctx.font = '11px system-ui, -apple-system, "Segoe UI", sans-serif';
        let lx = padL;
        for (const s of labeled) {
          ctx.strokeStyle = s._color;
          ctx.lineWidth = s.width || 2;
          if (s.dash) ctx.setLineDash(s.dash);
          ctx.beginPath();
          ctx.moveTo(lx, ty + 6); ctx.lineTo(lx + 16, ty + 6);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = th.sec;
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillText(s.label, lx + 21, ty + 6.5);
          lx += 21 + ctx.measureText(s.label).width + 18;
        }
      }
      ctx.fillStyle = th.muted;
      ctx.font = '12px system-ui, -apple-system, "Segoe UI", sans-serif';
      if (o.xlabel) {
        ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
        ctx.fillText(o.xlabel, padL + pw / 2, H - 6);
      }
      if (o.ylabel) {
        ctx.save();
        ctx.translate(12, padT + ph / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText(o.ylabel, 0, 0);
        ctx.restore();
      }

      // ---- hover crosshair + tooltip
      if (this._hover && o.hover) this._drawHover(ctx, th, W, H);
    }

    _drawHover(ctx, th, W, H) {
      const { px, py } = this._hover;
      const R = this._rect;
      if (px < R.l || px > R.l + R.w || py < R.t || py > R.t + R.h) return;
      const o = this.o;
      const xv = o.xlog
        ? Math.pow(10, Math.log10(this._L.xlo) +
            (px - R.l) / R.w * (Math.log10(this._L.xhi) - Math.log10(this._L.xlo)))
        : this._L.xlo + (px - R.l) / R.w * (this._L.xhi - this._L.xlo);

      const rows = [];
      for (const s of this.series) {
        if (s.hover === false || s.type === 'points') continue;
        // nearest index by x (assume monotonic x; fall back to scan)
        let idx = -1, best = Infinity;
        const n = Math.min(s.x.length, s.y.length);
        let lo = 0, hi = n - 1;
        if (n > 2 && s.x[0] <= s.x[n - 1]) {
          while (hi - lo > 1) {
            const mid = (lo + hi) >> 1;
            if (s.x[mid] < xv) lo = mid; else hi = mid;
          }
          for (let i = Math.max(0, lo - 1); i <= Math.min(n - 1, hi + 1); i++) {
            const d = Math.abs((o.xlog ? Math.log10(s.x[i]) : s.x[i]) -
                               (o.xlog ? Math.log10(xv) : xv));
            if (isFinite(d) && d < best) { best = d; idx = i; }
          }
        } else {
          for (let i = 0; i < n; i++) {
            const d = Math.abs(s.x[i] - xv);
            if (isFinite(d) && d < best) { best = d; idx = i; }
          }
        }
        if (idx < 0) continue;
        const yv = s.y[idx];
        if (!isFinite(yv) || (o.ylog && yv <= 0)) continue;
        rows.push({ s, xv: s.x[idx], yv });
      }
      if (!rows.length) return;

      // crosshair at the first series' snapped x
      const cx = this._xs(rows[0].xv);
      ctx.strokeStyle = th.muted;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.moveTo(cx, R.t); ctx.lineTo(cx, R.t + R.h);
      ctx.stroke();
      ctx.globalAlpha = 1;
      // markers with surface ring
      for (const r of rows) {
        const mx = this._xs(r.xv), my = this._ys(r.yv);
        ctx.fillStyle = r.s._color;
        ctx.strokeStyle = th.surface;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mx, my, 4, 0, 2 * Math.PI);
        ctx.fill(); ctx.stroke();
      }
      // tooltip
      ctx.font = '11px system-ui, -apple-system, "Segoe UI", sans-serif';
      const head = fmtNum(rows[0].xv, 3) + (o.xunit ? ' ' + o.xunit : '');
      const lines = rows.map(r =>
        (r.s.label ? r.s.label + ': ' : '') + fmtNum(r.yv, 3) +
        (o.yunit ? ' ' + o.yunit : ''));
      let tw = ctx.measureText(head).width;
      for (const l of lines) tw = Math.max(tw, ctx.measureText(l).width + 14);
      const lh = 16, pad = 8;
      const bw = tw + 2 * pad, bh = (lines.length + 1) * lh + 2 * pad - 4;
      let bx = cx + 12, by = Math.min(Math.max(py - bh / 2, R.t + 4),
                                      R.t + R.h - bh - 4);
      if (bx + bw > R.l + R.w) bx = cx - 12 - bw;
      ctx.fillStyle = th.surface;
      ctx.globalAlpha = 0.96;
      ctx.strokeStyle = th.grid;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 5);
      else ctx.rect(bx, by, bw, bh);
      ctx.fill(); ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillStyle = th.sec;
      ctx.fillText(head, bx + pad, by + pad);
      rows.forEach((r, i) => {
        const yy = by + pad + (i + 1) * lh;
        ctx.fillStyle = r.s._color;
        ctx.beginPath();
        ctx.arc(bx + pad + 4, yy + 6, 3.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = th.ink;
        ctx.fillText(lines[i], bx + pad + 12, yy);
      });
    }
  }

  Plot.palette = PALETTE;
  Plot.fmtNum = fmtNum;
  global.Plot = Plot;
})(typeof window !== 'undefined' ? window : globalThis);
