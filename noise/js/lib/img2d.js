/* img2d.js — small helpers for two-dimensional noise demos.
 *
 * Global: Img2D
 *   Img2D.fft2d(re, im, n)          in-place 2-D FFT of an n×n field (n = 2^k)
 *   Img2D.ifft2d(re, im, n)
 *   Img2D.powerLaw2D(n, alpha, rand)
 *       n×n field whose 2-D PSD falls as |k|^(-alpha) (radial), zero mean,
 *       unit RMS. alpha = 0 white, ~2 "pink"/cloud-like, 4 very smooth.
 *   Img2D.radialPSD(field, n, opts)
 *       radially averaged power spectrum of the field:
 *       returns { k, psd } with k in cycles per image (1 .. n/2).
 *   Img2D.render(canvas, field, n, opts)
 *       draw a field as grayscale. Values are mapped via mean ± span·std
 *       (span default 2.5) to black..white; opts.smooth=false gives crisp
 *       pixels. Canvas CSS size is pinned (retina-safe).
 */
(function (global) {
  'use strict';

  function fftRows(re, im, n, transpose) {
    const rr = new Float64Array(n), ri = new Float64Array(n);
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const idx = transpose ? x * n + y : y * n + x;
        rr[x] = re[idx]; ri[x] = im[idx];
      }
      global.FFT.fft(rr, ri);
      for (let x = 0; x < n; x++) {
        const idx = transpose ? x * n + y : y * n + x;
        re[idx] = rr[x]; im[idx] = ri[x];
      }
    }
  }

  function fft2d(re, im, n) {
    fftRows(re, im, n, false);
    fftRows(re, im, n, true);
  }

  function ifft2d(re, im, n) {
    // conjugate trick
    for (let i = 0; i < n * n; i++) im[i] = -im[i];
    fft2d(re, im, n);
    const s = 1 / (n * n);
    for (let i = 0; i < n * n; i++) {
      re[i] *= s;
      im[i] = -im[i] * s;
    }
  }

  // wavenumber index of FFT bin j (0..n-1): 0,1,..,n/2,-(n/2-1)..-1
  function kIndex(j, n) {
    return j <= n / 2 ? j : j - n;
  }

  function powerLaw2D(n, alpha, rand) {
    const re = new Float64Array(n * n), im = new Float64Array(n * n);
    for (let i = 0; i < n * n; i++) re[i] = global.Noise.randn(rand);
    fft2d(re, im, n);
    for (let y = 0; y < n; y++) {
      const ky = kIndex(y, n);
      for (let x = 0; x < n; x++) {
        const kx = kIndex(x, n);
        const i = y * n + x;
        const k = Math.sqrt(kx * kx + ky * ky);
        const g = k === 0 ? 0 : Math.pow(k, -alpha / 2);
        re[i] *= g; im[i] *= g;
      }
    }
    ifft2d(re, im, n);
    // normalize to zero mean, unit RMS
    let mean = 0;
    for (let i = 0; i < n * n; i++) mean += re[i];
    mean /= n * n;
    let ss = 0;
    for (let i = 0; i < n * n; i++) { re[i] -= mean; ss += re[i] * re[i]; }
    const rms = Math.sqrt(ss / (n * n)) || 1;
    for (let i = 0; i < n * n; i++) re[i] /= rms;
    return re;
  }

  function radialPSD(field, n, opts) {
    opts = opts || {};
    const re = Float64Array.from(field), im = new Float64Array(n * n);
    fft2d(re, im, n);
    const half = n / 2;
    const sum = new Float64Array(half + 1), cnt = new Float64Array(half + 1);
    for (let y = 0; y < n; y++) {
      const ky = kIndex(y, n);
      for (let x = 0; x < n; x++) {
        const kx = kIndex(x, n);
        const k = Math.round(Math.sqrt(kx * kx + ky * ky));
        if (k < 1 || k > half) continue;
        const i = y * n + x;
        sum[k] += re[i] * re[i] + im[i] * im[i];
        cnt[k]++;
      }
    }
    const k = [], psd = [];
    for (let j = 1; j <= half; j++) {
      if (!cnt[j]) continue;
      k.push(j);
      psd.push(sum[j] / cnt[j] / (n * n)); // arbitrary consistent units
    }
    return { k: Float64Array.from(k), psd: Float64Array.from(psd) };
  }

  function render(canvas, field, n, opts) {
    opts = opts || {};
    const span = opts.span === undefined ? 2.5 : opts.span;
    let mean = 0;
    for (let i = 0; i < n * n; i++) mean += field[i];
    mean /= n * n;
    let ss = 0;
    for (let i = 0; i < n * n; i++) ss += (field[i] - mean) * (field[i] - mean);
    const std = Math.sqrt(ss / (n * n)) || 1;
    const lo = opts.lo !== undefined ? opts.lo : mean - span * std;
    const hi = opts.hi !== undefined ? opts.hi : mean + span * std;

    // draw at native n×n then let CSS scale; pin CSS size (retina-safe:
    // backing store is fixed at n, never derived from clientWidth)
    if (canvas.width !== n || canvas.height !== n) {
      canvas.width = n; canvas.height = n;
    }
    canvas.style.width = '100%';
    canvas.style.aspectRatio = '1';
    canvas.style.imageRendering = opts.smooth === false ? 'pixelated' : 'auto';
    const ctx = canvas.getContext('2d');
    const img = ctx.createImageData(n, n);
    const d = img.data;
    const scale = 255 / (hi - lo || 1);
    for (let i = 0; i < n * n; i++) {
      let v = (field[i] - lo) * scale;
      v = v < 0 ? 0 : v > 255 ? 255 : v;
      d[4 * i] = d[4 * i + 1] = d[4 * i + 2] = v;
      d[4 * i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }

  global.Img2D = { fft2d, ifft2d, powerLaw2D, radialPSD, render };
})(typeof window !== 'undefined' ? window : globalThis);
