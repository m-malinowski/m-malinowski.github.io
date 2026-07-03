/* noise.js — deterministic random-number generation and noise processes.
 *
 * Global: Noise
 *   Noise.rng(seed)              mulberry32 PRNG, returns () => uniform [0,1)
 *   Noise.randn(rand)            one standard-normal sample (Box-Muller)
 *   Noise.white(n, rand)         white Gaussian noise, unit variance
 *   Noise.randomWalk(n, rand)    cumulative sum of white noise (1/f^2)
 *   Noise.powerLaw(n, alpha, rand)
 *       noise with one-sided PSD proportional to f^(-alpha), unit RMS.
 *       alpha = 0 white, 1 flicker (pink), 2 random walk (brown/red).
 *   Noise.linspace(a, b, n)
 *   Noise.rms(x), Noise.mean(x), Noise.std(x)
 *
 * All generators take an explicit rand() function so demos are reproducible
 * and a "new sample" button can simply reseed.
 */
(function (global) {
  'use strict';

  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Box-Muller; caches the spare sample on the rand function itself.
  function randn(rand) {
    if (rand._spare !== undefined) {
      const s = rand._spare;
      rand._spare = undefined;
      return s;
    }
    let u = 0, v = 0;
    while (u === 0) u = rand();
    v = rand();
    const r = Math.sqrt(-2 * Math.log(u));
    rand._spare = r * Math.sin(2 * Math.PI * v);
    return r * Math.cos(2 * Math.PI * v);
  }

  function white(n, rand) {
    const x = new Float64Array(n);
    for (let i = 0; i < n; i++) x[i] = randn(rand);
    return x;
  }

  function randomWalk(n, rand) {
    const x = new Float64Array(n);
    let s = 0;
    for (let i = 0; i < n; i++) { s += randn(rand); x[i] = s; }
    return x;
  }

  // Power-law noise by spectral shaping: white noise -> FFT -> multiply each
  // bin by f^(-alpha/2) -> inverse FFT. DC bin is zeroed (the process has no
  // defined mean for alpha >= 1 anyway). Output normalized to unit RMS.
  function powerLaw(n, alpha, rand) {
    const m = global.FFT.nextPow2(n);
    const re = new Float64Array(m);
    const im = new Float64Array(m);
    for (let i = 0; i < m; i++) re[i] = randn(rand);
    global.FFT.fft(re, im);
    re[0] = 0; im[0] = 0;
    for (let k = 1; k <= m / 2; k++) {
      const g = Math.pow(k, -alpha / 2);
      re[k] *= g; im[k] *= g;
      if (k !== m / 2) { // keep Hermitian symmetry
        re[m - k] *= g; im[m - k] *= g;
      }
    }
    global.FFT.ifft(re, im);
    const x = new Float64Array(n);
    for (let i = 0; i < n; i++) x[i] = re[i];
    const r = rms(x);
    if (r > 0) for (let i = 0; i < n; i++) x[i] /= r;
    return x;
  }

  function linspace(a, b, n) {
    const x = new Float64Array(n);
    const d = n > 1 ? (b - a) / (n - 1) : 0;
    for (let i = 0; i < n; i++) x[i] = a + d * i;
    return x;
  }

  function mean(x) {
    let s = 0;
    for (let i = 0; i < x.length; i++) s += x[i];
    return s / x.length;
  }

  function rms(x) {
    let s = 0;
    for (let i = 0; i < x.length; i++) s += x[i] * x[i];
    return Math.sqrt(s / x.length);
  }

  function std(x) {
    const m = mean(x);
    let s = 0;
    for (let i = 0; i < x.length; i++) s += (x[i] - m) * (x[i] - m);
    return Math.sqrt(s / x.length);
  }

  global.Noise = { rng: rng, randn: randn, white: white, randomWalk: randomWalk,
                   powerLaw: powerLaw, linspace: linspace,
                   mean: mean, rms: rms, std: std };
})(typeof window !== 'undefined' ? window : globalThis);
