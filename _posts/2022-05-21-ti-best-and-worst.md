---
layout: post
published: true
title: "Trapped ions: the good and the ugly"
---

It is [challenging](https://m-malinowski.github.io/2022/03/11/forecasting-future-of-qc.html) to form an informed understanding of the quantum computing landscape. For understandable reasons, most scientists avoid dissing their own work, and platform-to-platform comparisons rarely go beyond "trapped ions work well, but are hard to scale".

In an attempt to establish a more useful dialogue, here is my honest take on my domain of expertise: trapped-ion quantum computing. There are only two parts - one reason trapped ions are the best thing since sliced bread, and one reason they suck. [Quantum Observer](quantumobserver.substack.com/) has kindly agreed to write something similar about superconducting qubits, and I encourage you to check it out. And if you'd like to write a similar take on a platform that you know well, do let me know and I'll link your post here. 

# The amazing part

The number one reason I'm excited about trapped ions is: quantum computation is hard because of errors, and errors in trapped-ion quantum computers can be so damn low.

Trapped ions have [for a long time](https://github.com/m-malinowski/quantum-benchmarks/blob/main/entanglement_fidelities/summary.md) been at the forefront of low-error QC: T. Harty et al demonstrated single-qubit gates with 1 ppm error (99.9999% fidelity) [already in 2014](https://arxiv.org/abs/1403.1524), still a world record in mid-2022 as far as I'm aware. More recently, [NIST](https://arxiv.org/pdf/2102.12533.pdf) and [GTRI](https://arxiv.org/pdf/2105.05828.pdf) demonstrated in 2021 first two-qubit gates with over 99.9% fidelity - best of any platform to date.

But it gets better. Trapped-ion architectures are often fully-connected: you can entangle two distant ions by first bringing them together and then executing the entangling gate. Doing this may be a bit involved - you have to optimise the transport waveforms, and recool at the end - but it comes with essentially zero error. More concretely, you can easily move ions at the speed of 30 m/s or so, so it would take about 1 ms to transport across a 30 mm chip (big enough to host 10-100 qubits). With coherence times of about 60 s - typical for atomic clock states - that's about 20 ppm error on top of the entangling gate. 

The role of low-error transport is fundamental. Consider, for comparison, a hypothetical 100-qubit chip with superconducting qubits arranged in a 10x10 grid. Entangling qubits in opposite corners requires 20 swaps - that is, 60 CNOT gates. Even at 99.9% CNOT fidelity, that's a 6% error penalty. And what's worse, increasing the qubit number x4 requires decreasing the two-qubit gate error 2x to maintain the same effective fidelity!

Ion traps look even more appealing when you zoom into what the errors are. Given the inherent perfect quality of atomic qubits, the main noise sources to worry about are from the control fields. Laser-driven gates are currently limited by incoherent control-induced error sources - laser linewidth and/or Raman scattering - which are painful to engineer down. On the other hand, incoherent errors associated with laser-free (microwave) gates are negligibly low - [buy a nice local oscillator](https://www.nature.com/articles/npjqi201633.pdf) and it will introduce less than 0.1 ppm error on your gate.

Historically, the challenge with laser-free gates was that they were slow and hence limited by "natural" error sources. However, they've been getting faster and less noisy over the years, and as of 2021, their fidelities [have caught up](https://arxiv.org/pdf/2102.12533.pdf) with laser-based approaches. In my mind, this strongly suggests that two-qubit gates with fidelities of 99.99% and beyond are very very doable.

Ion traps can have all kinds of nasty issues, but most of them are coherent. There is no new physics standing in the way of quantum volumes of over 100 (or, if you like, $2^{100}$). And when you eventually need quantum error correction, you will be able to use codes with low overheads, really maxing out the value of each and every qubit. I don't think any other platform is even close to this level of low-noise performance.

# The ugly part

In my view, the number one issue with trapped ions is the slow operation speed. Entangling gates [can be executed in a few microseconds](https://www.nature.com/articles/nature25737), but 50-500 us is a more comfortable range, and ion transport operates on similar timescales. Overall, the chip "clock rate" is around 1 kHz - and that's for physical, not logical operations. 

The textbook view is that this is not an issue, as the figure of merit for quantum information processing is the operation time divided by the coherence time (that's the essence of the "amazing part" section). That is certainly true in the NISQ era, where quantum processors are limited in how many operations they can perform before they decohere. But in the fault-tolerant future, this consideration no longer applies. An error-corrected quantum computer is capable of performing arbitrarily long computations. Whether those computations are useful depends purely on how long they take - that is, on the clock speed.

[2019 estimates](https://arxiv.org/abs/1905.09749) for Shor factoring of 2048-bit integers with superconducting qubits give an 8-hour run-time with physical error rates of 0.1% and a surface code cycle time of 1 us. Compared to this, trapped ions suffer a 3 OOM penalty right off the bat (for the same qubit count, that' a runtime of 8000 hours - [10% of your career](https://en.wikipedia.org/wiki/80,000_Hours))! This alone tells me surface codes are most likely a no-go for trapped ions.

Instead, the QEC method for future trapped-ion systems must leverage the low errors and flexible connectivity to reduce the number of operations by 2-3 orders of magnitude compared to the surface code.

I'm therefore keeping my eye on the field of quantum error correction, particularly the [recent discoveries of "good" quantum LDPC codes](https://www.youtube.com/watch?v=5GO3BtJuo3I). I'm also keenly attentive to any attempts of improving clock speeds in trapped ion systems, such as [electron trapping](https://journals.aps.org/prx/abstract/10.1103/PhysRevX.11.011019). But for now, it is right to be cautious about the utility of trapped ions for large-scale fault-tolerant quantum computing.
