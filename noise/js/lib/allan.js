/* allan.js — Allan deviation from fractional-frequency data.
 *
 * Global: Allan
 *   Allan.adev(y, tau0, opts)
 *       y    : fractional-frequency samples y[i], sampled every tau0 seconds
 *       tau0 : base sampling interval (s)
 *       opts : { maxM (largest averaging factor, default N/4),
 *                pointsPerDecade (default 4), overlapping (default true) }
 *       returns { tau: Float64Array, adev: Float64Array, m: Int32Array }
 *
 *   Overlapping Allan variance from frequency data:
 *     sigma_y^2(m*tau0) = 1/(2 (N - 2m + 1)) * sum_j ( ybar[j+m] - ybar[j] )^2
 *   where ybar[j] is the average of y[j..j+m-1], computed via cumulative sums.
 */
(function (global) {
  'use strict';

  function adev(y, tau0, opts) {
    opts = opts || {};
    const N = y.length;
    const maxM = Math.max(1, Math.floor(opts.maxM || N / 4));
    const ppd = opts.pointsPerDecade || 4;
    const overlapping = opts.overlapping === undefined ? true : opts.overlapping;

    // cumulative sum with leading zero: c[k] = sum of y[0..k-1]
    const c = new Float64Array(N + 1);
    for (let i = 0; i < N; i++) c[i + 1] = c[i] + y[i];

    // logarithmically spaced m values, deduplicated
    const ms = [];
    let last = 0;
    const decades = Math.log10(maxM);
    const steps = Math.max(1, Math.round(decades * ppd));
    for (let s = 0; s <= steps; s++) {
      const m = Math.round(Math.pow(10, (s / steps) * decades));
      if (m >= 1 && m <= maxM && m !== last) { ms.push(m); last = m; }
    }

    const tau = [];
    const dev = [];
    const mOut = [];
    for (const m of ms) {
      const stride = overlapping ? 1 : m;
      let sum = 0, count = 0;
      for (let j = 0; j + 2 * m <= N; j += stride) {
        const a = (c[j + m] - c[j]) / m;
        const b = (c[j + 2 * m] - c[j + m]) / m;
        const d = b - a;
        sum += d * d;
        count++;
      }
      if (count < 1) continue;
      tau.push(m * tau0);
      dev.push(Math.sqrt(sum / (2 * count)));
      mOut.push(m);
    }
    return { tau: Float64Array.from(tau), adev: Float64Array.from(dev),
             m: Int32Array.from(mOut) };
  }

  // Convert phase data x[i] (seconds) sampled at tau0 into fractional frequency.
  function phaseToFreq(x, tau0) {
    const y = new Float64Array(x.length - 1);
    for (let i = 0; i < y.length; i++) y[i] = (x[i + 1] - x[i]) / tau0;
    return y;
  }

  global.Allan = { adev: adev, phaseToFreq: phaseToFreq };
})(typeof window !== 'undefined' ? window : globalThis);
