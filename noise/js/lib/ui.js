/* ui.js — small helpers for demo control panels.
 *
 * Global: UI
 *   UI.slider(parent, { label, min, max, step, value, unit, fmt, log, onInput })
 *       returns { get value(), set value(v), el }
 *       log: true makes the slider act in log space (min/max > 0).
 *   UI.select(parent, { label, options: [{value, label}], value, onChange })
 *   UI.checkbox(parent, { label, checked, onChange })
 *   UI.button(parent, { label, onClick })
 *   UI.readout(parent, { label })   -> { set(text) }  live numeric display
 *   UI.bigReadout(parent, { label, unit, min, max, log, fmt }) -> { set(v) }
 *       prominent result: big number + moving bar-gauge over [min, max].
 *       Use for a demo's HEADLINE output, so slider changes are seen.
 *   UI.playButton(parent, { onFrame, label })
 *       Play/pause driving requestAnimationFrame; onFrame(t, dt) in seconds.
 *
 * `parent` is an element or selector for a .controls container.
 */
(function (global) {
  'use strict';

  function resolve(parent) {
    return typeof parent === 'string' ? document.querySelector(parent) : parent;
  }

  function field(parent, labelText) {
    const wrap = document.createElement('label');
    wrap.className = 'ctl';
    const lab = document.createElement('span');
    lab.className = 'ctl-label';
    lab.textContent = labelText;
    wrap.appendChild(lab);
    resolve(parent).appendChild(wrap);
    return wrap;
  }

  function slider(parent, o) {
    const wrap = field(parent, o.label);
    const input = document.createElement('input');
    input.type = 'range';
    const out = document.createElement('span');
    out.className = 'ctl-value';
    const fmt = o.fmt || (v => Plot && Plot.fmtNum ? Plot.fmtNum(v, 3) : String(v));
    const unit = o.unit ? ' ' + o.unit : '';

    let toSlider, fromSlider;
    if (o.log) {
      const lmin = Math.log10(o.min), lmax = Math.log10(o.max);
      input.min = 0; input.max = 1000; input.step = 1;
      toSlider = v => 1000 * (Math.log10(v) - lmin) / (lmax - lmin);
      fromSlider = s => Math.pow(10, lmin + (s / 1000) * (lmax - lmin));
    } else {
      input.min = o.min; input.max = o.max;
      input.step = o.step === undefined ? 'any' : o.step;
      toSlider = v => v; fromSlider = s => s;
    }
    input.value = toSlider(o.value);
    let current = o.value;
    const show = () => { out.textContent = fmt(current) + unit; };
    show();
    input.addEventListener('input', () => {
      current = fromSlider(parseFloat(input.value));
      show();
      if (o.onInput) o.onInput(current);
    });
    wrap.appendChild(input);
    wrap.appendChild(out);
    return {
      get value() { return current; },
      set value(v) { current = v; input.value = toSlider(v); show(); },
      el: wrap
    };
  }

  // Two-thumb range slider: UI.range(parent, { label, min, max, log,
  //   value: [lo, hi], unit, fmt, onInput(lo, hi) }) -> { get lo, get hi }
  // The thumbs cannot cross (a small gap is enforced).
  function range(parent, o) {
    const wrap = field(parent, o.label);
    const box = document.createElement('span');
    box.className = 'ctl-range';
    const track = document.createElement('span');
    track.className = 'ctl-range-track';
    const fill = document.createElement('span');
    fill.className = 'ctl-range-fill';
    box.appendChild(track);
    box.appendChild(fill);
    const mkInput = () => {
      const i = document.createElement('input');
      i.type = 'range';
      i.min = 0; i.max = 1000; i.step = 1;
      box.appendChild(i);
      return i;
    };
    const iLo = mkInput(), iHi = mkInput();
    const out = document.createElement('span');
    out.className = 'ctl-value';
    const fmt = o.fmt || (v => Plot && Plot.fmtNum ? Plot.fmtNum(v, 3) : String(v));
    const lmin = o.log ? Math.log10(o.min) : o.min;
    const lmax = o.log ? Math.log10(o.max) : o.max;
    const toS = v => 1000 * ((o.log ? Math.log10(v) : v) - lmin) / (lmax - lmin);
    const fromS = s => {
      const u = lmin + (s / 1000) * (lmax - lmin);
      return o.log ? Math.pow(10, u) : u;
    };
    let lo = o.value[0], hi = o.value[1];
    const GAP = 12;                       // slider units the thumbs keep apart
    function show() {
      iLo.value = toS(lo); iHi.value = toS(hi);
      fill.style.left = (toS(lo) / 10) + '%';
      fill.style.right = (100 - toS(hi) / 10) + '%';
      out.textContent = fmt(lo) + ' – ' + fmt(hi) + (o.unit ? ' ' + o.unit : '');
    }
    iLo.addEventListener('input', () => {
      const s = Math.max(0, Math.min(parseFloat(iLo.value),
                                     parseFloat(iHi.value) - GAP));
      lo = fromS(s);
      show();
      if (o.onInput) o.onInput(lo, hi);
    });
    iHi.addEventListener('input', () => {
      const s = Math.min(1000, Math.max(parseFloat(iHi.value),
                                        parseFloat(iLo.value) + GAP));
      hi = fromS(s);
      show();
      if (o.onInput) o.onInput(lo, hi);
    });
    wrap.appendChild(box);
    wrap.appendChild(out);
    show();
    return { get lo() { return lo; }, get hi() { return hi; }, el: wrap };
  }

  function select(parent, o) {
    const wrap = field(parent, o.label);
    const sel = document.createElement('select');
    for (const opt of o.options) {
      const e = document.createElement('option');
      e.value = opt.value !== undefined ? opt.value : opt;
      e.textContent = opt.label !== undefined ? opt.label : opt;
      sel.appendChild(e);
    }
    if (o.value !== undefined) sel.value = o.value;
    sel.addEventListener('change', () => { if (o.onChange) o.onChange(sel.value); });
    wrap.appendChild(sel);
    return { get value() { return sel.value; }, set value(v) { sel.value = v; }, el: wrap };
  }

  function checkbox(parent, o) {
    const wrap = document.createElement('label');
    wrap.className = 'ctl ctl-check';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !!o.checked;
    input.addEventListener('change', () => { if (o.onChange) o.onChange(input.checked); });
    wrap.appendChild(input);
    const lab = document.createElement('span');
    lab.className = 'ctl-label';
    lab.textContent = o.label;
    wrap.appendChild(lab);
    resolve(parent).appendChild(wrap);
    return { get value() { return input.checked; }, set value(v) { input.checked = v; }, el: wrap };
  }

  function button(parent, o) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ctl-btn';
    b.textContent = o.label;
    b.addEventListener('click', o.onClick);
    resolve(parent).appendChild(b);
    return b;
  }

  function readout(parent, o) {
    const wrap = field(parent, o.label);
    const out = document.createElement('span');
    out.className = 'ctl-value ctl-readout';
    wrap.appendChild(out);
    let maxW = 0;
    return {
      // Never let the readout shrink: variable-length text would otherwise
      // reflow the controls row on every slider tick. Prime with the longest
      // expected string to reserve the width up front.
      set: (t) => {
        out.textContent = t;
        const w = out.offsetWidth;
        if (w > maxW) { maxW = w; out.style.minWidth = w + 'px'; }
      },
      el: wrap
    };
  }

  /* Prominent result display: a big number over a bar-gauge that slides as
   * the value moves through [min, max] (log or linear), so a small change
   * from a slider is visible as motion, not just a digit flicker.
   *   UI.bigReadout(parent, { label, unit, min, max, log, fmt })
   *     -> { set(value) }                                                  */
  function bigReadout(parent, o) {
    const wrap = document.createElement('div');
    wrap.className = 'ctl ctl-bigread';
    const lab = document.createElement('span');
    lab.className = 'ctl-label';
    lab.textContent = o.label;
    const val = document.createElement('span');
    val.className = 'bigread-value';
    const bar = document.createElement('span');
    bar.className = 'bigread-bar';
    const fill = document.createElement('span');
    fill.className = 'bigread-fill';
    bar.appendChild(fill);
    wrap.appendChild(lab);
    wrap.appendChild(val);
    wrap.appendChild(bar);
    resolve(parent).appendChild(wrap);
    const fmt = o.fmt ||
      (v => Plot && Plot.fmtNum ? Plot.fmtNum(v, 3) : String(v));
    const unit = o.unit ? ' ' + o.unit : '';
    return {
      set(v) {
        val.textContent = fmt(v) + unit;
        let x = o.log
          ? (Math.log10(v) - Math.log10(o.min)) /
            (Math.log10(o.max) - Math.log10(o.min))
          : (v - o.min) / (o.max - o.min);
        if (!isFinite(x)) x = 0;
        x = Math.max(0.02, Math.min(1, x));
        fill.style.width = (100 * x).toFixed(1) + '%';
      },
      el: wrap
    };
  }

  function playButton(parent, o) {
    let running = false, raf = null, t0 = null, tAcc = 0, tLast = 0;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ctl-btn ctl-play';
    const setLabel = () => {
      b.textContent = (running ? '❚❚ ' : '▶ ') + (o.label || (running ? 'Pause' : 'Play'));
    };
    const frame = (ms) => {
      if (!running) return;
      if (t0 === null) { t0 = ms; tLast = ms; }
      const t = tAcc + (ms - t0) / 1000;
      const dt = (ms - tLast) / 1000;
      tLast = ms;
      o.onFrame(t, dt);
      raf = requestAnimationFrame(frame);
    };
    b.addEventListener('click', () => {
      running = !running;
      setLabel();
      if (running) { t0 = null; raf = requestAnimationFrame(frame); }
      else { tAcc = tAcc + (tLast - (t0 === null ? tLast : t0)) / 1000; cancelAnimationFrame(raf); }
    });
    setLabel();
    resolve(parent).appendChild(b);
    return {
      get running() { return running; },
      stop() { if (running) b.click(); },
      start() { if (!running) b.click(); },
      el: b
    };
  }

  global.UI = { slider, range, select, checkbox, button, readout, bigReadout,
    playButton };
})(typeof window !== 'undefined' ? window : globalThis);
