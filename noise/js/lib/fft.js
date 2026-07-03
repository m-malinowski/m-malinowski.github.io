/* fft.js — radix-2 FFT and Welch power spectral density estimation.
 *
 * Global: FFT
 *   FFT.fft(re, im)            in-place forward FFT (arrays, length = power of 2)
 *   FFT.ifft(re, im)           in-place inverse FFT (includes 1/N)
 *   FFT.nextPow2(n)
 *   FFT.hann(n)                Hann window as Float64Array
 *   FFT.periodogram(x, fs, opts)  one-sided PSD of a single record
 *   FFT.welch(x, fs, opts)     Welch-averaged one-sided PSD
 *       opts: { nseg (segment length, power of 2), window: 'hann'|'rect',
 *               overlap (fraction, default 0.5), detrend: true }
 *       returns { f, psd }  with psd in units of x^2 / Hz
 *
 * Conventions: one-sided PSD, so  integral of psd df  =  variance of x
 * (for a zero-mean signal). This is the convention used throughout the site.
 */
(function (global) {
  'use strict';

  function nextPow2(n) {
    let p = 1;
    while (p < n) p <<= 1;
    return p;
  }

  // In-place iterative radix-2 Cooley-Tukey. re, im: arrays of equal pow-2 length.
  function fft(re, im) {
    const n = re.length;
    if (n !== im.length || (n & (n - 1)) !== 0) {
      throw new Error('FFT length must be a power of 2 (got ' + n + ')');
    }
    // bit-reversal permutation
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) {
        let t = re[i]; re[i] = re[j]; re[j] = t;
        t = im[i]; im[i] = im[j]; im[j] = t;
      }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = -2 * Math.PI / len;
      const wRe = Math.cos(ang), wIm = Math.sin(ang);
      for (let i = 0; i < n; i += len) {
        let curRe = 1, curIm = 0;
        for (let k = 0; k < len / 2; k++) {
          const uRe = re[i + k], uIm = im[i + k];
          const vRe = re[i + k + len / 2] * curRe - im[i + k + len / 2] * curIm;
          const vIm = re[i + k + len / 2] * curIm + im[i + k + len / 2] * curRe;
          re[i + k] = uRe + vRe; im[i + k] = uIm + vIm;
          re[i + k + len / 2] = uRe - vRe; im[i + k + len / 2] = uIm - vIm;
          const nRe = curRe * wRe - curIm * wIm;
          curIm = curRe * wIm + curIm * wRe;
          curRe = nRe;
        }
      }
    }
  }

  function ifft(re, im) {
    const n = re.length;
    for (let i = 0; i < n; i++) im[i] = -im[i];
    fft(re, im);
    for (let i = 0; i < n; i++) {
      re[i] /= n;
      im[i] = -im[i] / n;
    }
  }

  function hann(n) {
    const w = new Float64Array(n);
    for (let i = 0; i < n; i++) w[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (n - 1)));
    return w;
  }

  function rect(n) {
    const w = new Float64Array(n);
    w.fill(1);
    return w;
  }

  // One-sided PSD of one windowed segment, normalized so that
  // sum(psd) * df = variance (for zero-mean input, rect window).
  function segmentPSD(x, start, w, fs, out) {
    const n = w.length;
    const re = new Float64Array(n);
    const im = new Float64Array(n);
    // detrend (remove mean of segment) then window
    let mean = 0;
    for (let i = 0; i < n; i++) mean += x[start + i];
    mean /= n;
    let wpow = 0;
    for (let i = 0; i < n; i++) {
      re[i] = (x[start + i] - mean) * w[i];
      wpow += w[i] * w[i];
    }
    fft(re, im);
    const scale = 1 / (fs * wpow);
    const half = n / 2;
    for (let k = 0; k <= half; k++) {
      let p = (re[k] * re[k] + im[k] * im[k]) * scale;
      if (k !== 0 && k !== half) p *= 2; // one-sided
      out[k] += p;
    }
  }

  function welch(x, fs, opts) {
    opts = opts || {};
    const N = x.length;
    let nseg = opts.nseg || Math.min(1 << 10, nextPow2(Math.floor(N / 4)) || 2);
    nseg = Math.min(nseg, nextPow2(N) === N ? N : nextPow2(N) >> 1);
    if (nseg < 2) nseg = 2;
    const overlap = opts.overlap === undefined ? 0.5 : opts.overlap;
    const step = Math.max(1, Math.floor(nseg * (1 - overlap)));
    const w = (opts.window === 'rect') ? rect(nseg) : hann(nseg);
    const half = nseg / 2;
    const acc = new Float64Array(half + 1);
    let count = 0;
    for (let start = 0; start + nseg <= N; start += step) {
      segmentPSD(x, start, w, fs, acc);
      count++;
    }
    if (count === 0) { // signal shorter than one segment: pad-free single shot
      segmentPSD(x, 0, (opts.window === 'rect' ? rect(N) : hann(N)), fs, acc);
      count = 1;
    }
    const f = new Float64Array(half + 1);
    const psd = new Float64Array(half + 1);
    for (let k = 0; k <= half; k++) {
      f[k] = k * fs / nseg;
      psd[k] = acc[k] / count;
    }
    return { f: f, psd: psd };
  }

  function periodogram(x, fs, opts) {
    opts = opts || {};
    const n = nextPow2(x.length) === x.length ? x.length : nextPow2(x.length) >> 1;
    return welch(x, fs, { nseg: n, overlap: 0, window: opts.window || 'rect' });
  }

  global.FFT = { fft: fft, ifft: ifft, nextPow2: nextPow2, hann: hann,
                 welch: welch, periodogram: periodogram };
})(typeof window !== 'undefined' ? window : globalThis);
