---
layout: post
published: false
---


# The amazing part

The number one reason I'm excited about trapped ions is: quantum compution is hard because of errors, and errors in trapped-ion quantum computers can be so damn low.

Trapped ions have [for a long time](https://github.com/m-malinowski/quantum-benchmarks/blob/main/entanglement_fidelities/summary.md) been at the forefront of low-error QC: T. Harty et al demonstrated single-qubit gates with 1 ppm error (99.9999% fidelity) [already in 2014](https://arxiv.org/abs/1403.1524), still a world record in mid-2022 as far as I'm aware. More recently, NIST and GTRI demonstrated in 2021 first two-qubit gates with over 99.9% fidelity - best of any platform to date.

But it gets better. Trapped-ion architectures are often fully-connected: you can entangle two distant ions by first bringing them together and then executing the entangling gate. Doing this may be a bit involved - you have to optimise the transport waveforms, and recool at the end - but it comes with essentially zero error. More concretely, you can easily move ions at the speed of 30 m/s, so it would take $~1 ms$ to transport across a 30 mm chip (big enough to host 10-100 qubits). With coherence times of $~60 s$ - typical for atomic clock states - that's about 20 ppm error on top of the entangling gate. 

The role of low-error transport is fundamental. Consider, for comparison, a hypothetical 100-qubit chip with superconducting qubits arranged in a 10x10 grid. Entangling qubits 0 and 100 requires 20 swaps - that is, 60 CNOT gates. Even at 99.9% CNOT fidelity, that's a 6% error penalty. And what's worse, increasing the qubit number x4 requires decreasing the two-qubit gate error 2x to maintain the same effective fidelity!

Ion traps look even more appealing when you zoom into what the errors are. Laser-based gates in trapped ions are limited by incoherent errors - Raman scattering or laser linewidth. On the other hand, laser-free (microwave) gates really don't have any fundamental limits to worry about - it's down to microwave engineering! And while microwave gates started slow and noisy, they've just recently caught up with laser-based approaches. In my mind, this strongly suggests that two-qubit gates with fidelities of 99.99% and beyond are very very doable.

Ion traps can have all kinds of nasty issues, but most of them are coherent. There is no new physics standing in the way of quantum volumes of over $100$ (or, if you like, $2^100$). And when you eventually need quantum error correction, you will be able to use codes with low overheads, really maxing out the value of each and every qubit. I don't think any other platform is even close to this level of low-noise performance.

# The ugly part

In my view, the number one issue with trapped ions is the slow operation speed. Entangling gates can be executed in a few microseconds, but 50-500 us is the more comfortable range, and ion transport operates on similar timescales. Overall, the chip "clock rate" is around 1 kHz - and that's for physical, not logical operations. 

The textbook view is that this is not an issue, as the figure of merit for quantum information processing is the operation time divided by the coherence time (that's the essence of the "amazing part" section). That is certainly true in the NISQ era, where quantum processors are limited in how many operations they can perform before they decohere. But in the fault-tolerant future this consideration no longer applies. An error-corrected quantum computer is capable of performing arbitrarily long computations. Whether those computations are useful depends purely on how long they take - that is, on the clock speed.

Recent estimates for Shor factoring of 2048-bit integers with superconducting qubits give 8 hour run-time with physical error rates of 0.1% and a surface code cycle time of 1 us. Compared to this, trapped ions suffer a 3 OOM penalty right off the bat (for the same qubit count, that' a runtime of 8000 hours - 10% of your career)! This alone tells me surface codes are most likely a no-go for trapped ions.

It is possible that suitable QEC codes can leverage the low errors and flexible connectivity of trapped ions to produce very low-overhead error correction. Or maybe techniques for trapping electrons mature enough to enable high-speed quantum gates. But until then, I will remain sceptical about the utility of trapped ions for large-scale fault-tolerant quantum computing.
