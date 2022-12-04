---
layout: post
published: true
title: "How fast are quantum computers (part 2: clock speeds)"
---

In the [last post](https://m-malinowski.github.io/2022/11/06/how-fast-are-quantum-computers.html), we asked how to quantify the speed of quantum computers. 

Our answer was: this is tricky, but provisionally, let's say quantum computer cycle time = single-qubit gate time + two-qubit gate time + measurement time[^1], and that quantum computer clock speed = 1/cycle time.

[^1]: For now, we will assume that measurement time = readout time + reset time, i.e. that ancilla reset cannot be parallelised with gates. Furthermore, we will assume that classical logic (result communication, decoders etc) do not introduce any overheads.

In today's post, we will find out:

- What are the typical clock speeds of today's quantum computers?
- Do the clock speeds vary significantly between different hardware platforms?

In order to answer these questions, I looked into the literature to find state-of-the-art gate times and measurement times for different types of small-scale quantum computers. However, extrapolating from these papers can be tricky for several reasons:

- Suppose paper A says "we performed two-qubit gates in 10 ns, single-qubit gates in 10 ns, and measurements 1000 ns in platform X", while paper B says "we performed two-qubit gates in 1000 ns, and single-qubit gates in 1000 ns, and measurements in 10 ns in platform X". What should we conclude about the cycle times in platform X? On one hand, both A and B recorded cycle times of 1020 ns, so that's one possible answer. However, they also demonstrated that it's possible to do each of these operations in 10 ns, so maybe the correct answer is 30 ns? It really depends on whether the trick used by A to make fast gates and the trick used by B to make fast measurements can be combined into one device, which is usually challenging to judge without in-depth knowledge.

- Suppose paper A says "we performed two-qubit gates with 95 % fidelity in 10 ns in platform X", while paper B says "we performed two-qubit gates with 99% fidelity in 100 ns in platform X". What should we conclude about two-qubit gate times in platform X? On one hand, they can be as low as 10 ns. On the other hand, maybe A used a gate implementation that fundamentally leads to noisy but fast operations - in which case 100 ns would be the more relevant number.

- Suppose paper A says "we performed measurements in 10 ns on a single-qubit in platform X", while paper B says "we performed measurements in 1000 ns on 100 qubits in parallel in platform X". What should we conclude about measurement times in platform X? On one hand, they can be as low as 10 ns. On the other hand, maybe the single-qubit measurement method is fundamentally hard to scale to larger qubit numbers, and increasing qubit count always increases the measurement duration?
  
The correct way of handling those caveats would be to put a lot of work into this research, interview domain experts, organise panels and surveys etc. However, lacking resources and motivation, I resorted to the next best solution, which is to try to eyeball it! Thus, in researching this post, I googled a lot of papers, rejected the obvious outliers, some obviously non-scalable solutions etc. Sometimes I took the best result I could find, sometimes the best-fidelity result, and sometimes the most representative-looking result, depending on what felt right deep down.

By the end of that research, I became convinced that - given their different mechanics, nuances, and levels of technological maturity - there is no fair way of comparing the platforms anyway. I tried to work with full honesty and without bias, but this is not very realistic, so please treat the numbers below as "biased orders of magnitude."

With that out of the way, is the summary table with the most popular QC platforms, ordered from fastest to slowest.

| Platform      | Today's clock speed   | Limited by |
| -----------   | -----------   | -- |
| Superconducting qubits | 1.4 MHz | Measurements |
| Silicon spin qubits | 750 kHz | Measurements |
| Trapped ions | 6 kHz | 2-q gates & measurements |
| Rydberg arrays | 170 Hz | Measurements |
| Photons (fusion-based) | 10 Hz | State preparation |


If you're interested in how those numbers came to be, read on.

**Superconducting qubits: 1.4 MHz** 

Enough people do serious QEC demonstrations with superconducting qubits that those numbers are pretty easy to pull together. Here is what I used:

- Single-qubit gate time
    - 25 ns in [Google's quantum supremacy paper](https://www.nature.com/articles/s41586-019-1666-5#Sec9) 
- Two-qubit gate time
    - 160 ns in a [recent IBM result (99.8% fidelity)](https://journals.aps.org/prl/abstract/10.1103/PhysRevLett.127.130501) 
    - ~ 15 ns at google above
- Measurement + reset time
    - ~100 ns + 100 ns [recently for a single qubit](https://arxiv.org/abs/2202.06202)
    - 500 ns + 160 ns in [Google's 72-qubit device in 2022]([link_generated_on_download](https://arxiv.org/abs/2207.06431)) 
- Cycle time
    - Adding the numbers above, we get ~ 700 ns, thus 1.4 MHz. However, going down to ~250 ns (4 MHz) seems feasible if something like the [above-mentioned measurement solution](https://arxiv.org/abs/2202.06202)) can be executed at scale.
  
Here is how I understand the dominant physics. Superconducting qubits are circuits coupled to superconducting resonators. Qubit readout requires coupling to a lossy resonator, such that information about the qubit state can be transmitted to the outside world. But if you make the resonator too lossy, the information about the qubit state will escape to the outside world even when we don't want it to, leading to decoherence. So most people make measurement deliberately slow to protect the qubit, though it might be possible to speed it up by designing innovative filters. 

**Silicon spin qubits: 750 kHz**

I'm not very familiar with the ins and outs of this platform, but I did my best.

- Single- and two-qubit gate times:
  - [[2107.06485] Review of performance metrics of spin qubits in gated semiconducting nanostructures](https://arxiv.org/abs/2107.06485) did some painstaking work tabulating all the results from everyone so far: ![](https://remnote-user-data.s3.amazonaws.com/bdCThb7D0rmMWy0tcRmJsvMmEDTOxsZ89PDejgTTMqkqmmrPdxCs5zD1bgrHFNuL0rt0h9JdbxaRFuu1_WUnW9awy_skuVuUKTgt-emSkFnQV5OsyGm0JBGdbsgYewDi.png){: width="500" } 
  - Looking at LD/e and ST (singlet-triplet) qubits - which seem to be the popular types - we find gate times in silicon (red/orange dots) clustered around 100 ns, and the fastest two-qubit gates in non-charge qubits have gate times ~ 1 ns. I don't have enough expertise to understand if pushing gate times to 1 ns is reasonable, or if it comes with trade-offs (fidelity limits, device scale limits etc). For now, let's say we'll set 1-qubit gate times and 2-qubit gate times to be ~ 10 ns. 
- Measurement and reset times
  - The paper above only reports very slow reset speeds (several milliseconds). This struck me as implausibly large, suggesting nobody tried to do it very fast, rather than nobody managed. 
  - Indeed, a bit of googling revealed that, since 2021, somebody tried to push measurement/reset times down and managed. In 2022 [ Fast and High-Fidelity State Preparation and Measurement in Triple-Quantum-Dot Spin Qubits](https://journals.aps.org/prxquantum/abstract/10.1103/PRXQuantum.3.010352) showed, in the same system, readout in ~1 us and reset in ~300 ns, both with an error of ~1e-3. 
  - Thus, let's use 1.3 us as a timescale for "measurement + reset" 
- Cycle times:
  - Based on the numbers above, the cycle speed is ~1.3 us (750 kHz clock speed), completely dominated by the measurement and reset time.

**Trapped ions: 60 kHz** 

Here are the numbers and references I put together 
- Single-qubit gate time 
    - World's best single-qubit gates, [[1403.1524] High-fidelity preparation, gates, memory and readout of a trapped-ion quantum bit](https://arxiv.org/abs/1403.1524) had 1 ppm error and about 10 us duration, so let's go with that
- Two-qubit gate time
    - I think the speediest two-qubit gate around is [[1709.06952] Fast quantum logic gates with trapped-ion qubits](https://arxiv.org/abs/1709.06952): 1.6 us (!) for 99.8% fidelity. However, that result was fairly unique and difficult to replicate, as it required high powers and tightly-toleranced control.
    - Far more usual is to see two-qubit gate timescales of 50-100 us (with laser-based gates). So let's go with 50 us as a more representative quantity
- Measurement + reset time
    - I think the speediest readout around is [High-speed low-crosstalk detection of a 171Yb+ qubit using superconducting nanowire single photon detectors](https://www.nature.com/articles/s42005-019-0195-8): 11 us for >99.9% fidelity.
    - However, the result above requires pointing a big NA = 0.6 lens directly at a single ion - perhaps not the most relevant for scalability. In a more relevant demonstration, [State Readout of a Trapped Ion Qubit Using a Trap-Integrated Superconducting Photon Detector](https://www.arxiv-vanity.com/papers/2008.00065/) built traps with integrated detectors to demonstrate 99.9% fidelity readout in 46 us. So let's take that, and say that the readout timescale is ~ 50 us. 
    - After readout, ancillas need to be reinitialised and, most importantly, recooled. This can easily add another 50 us, so let's allocate ~100 us for readout + reset
- Cycle time
    - Adding the numbers above, we get 160 us cycle time, i.e. 60 kHz clock speed. 
    - It seems feasible to push it by a factor of 2 or so. However, since it's not limited by any single operation, orders-of-magnitude improvements would require simultaneous innovation on many fronts!

**Rydberg tweezer arrays: 170 Hz**

Rydbergs struggle with readout without losing atoms. A lot of initial experiments relied on "state-selective kicking atoms out", rather than simply "state-selective fluorescence". More recently, people have put a lot of work into improving qubit measurement. Here is what I could find on their main achievements:

- [[1706.09497] Parallel low-loss measurement of multiple atomic qubits](https://arxiv.org/abs/1706.09497) reported around 6 ms readout time, and 1% probability of kicking an ion out, in a 5-ion array
- [[1706.00264] Fast non-destructive parallel readout of neutral atom registers in optical potentials](https://arxiv.org/abs/1706.00264) reported ~10 ms for a few-atom system
- [[1809.09197] Stern-Gerlach detection of neutral atom qubits in a state dependent optical lattice](https://arxiv.org/abs/1809.09197) imaged a 3d array of atoms plane-by-plane without atom loss, and with very high fidelity, but took ~150 ms per plane
- [[2105.11050] Fast Preparation and Detection of a Rydberg Qubit using Atomic Ensembles](https://arxiv.org/abs/2105.11050) improved the readout time by 3 OOMs to 6 us! But their trick was to trap an atom next to 400 spectator atoms, and use the spectators to enhance the fluorescence. This is super cool, and maybe there is a way to incorporate it in a future quantum computer, but for now, I'd say it doesn't count!

 So there we are, with measurement times that span 4 orders of magnitude! For now, I'm going to go conservative and estimate ~10 ms for a proper parallel non-destructive ancilla readout, but wouldn't be surprised to see it come down to 1 ms or so quite soon

In contrast to the readout, gates in Rydberg arrays can be very fast. What's nice about Rydberg atoms is that, once you bring a bunch of them close enough together (typically a few um suffices), the dynamics become inherently collective. Thus, two-qubit gate times are very similar to single-qubit gate times. For example, [[1806.04682] High-fidelity control and entanglement of Rydberg atom qubits](https://arxiv.org/abs/1806.04682) demonstrated single-qubit Rabi frequency of 2 pi x 2 MHz (i.e. a pi-pulse takes 250 ns), and a two-qubit Rabi frequency of 2 Pi x 2.8 MHz (i.e. creating a maximally entangled state takes 170 ns). What's also worth noting is that it might be possible to entangle more than two qubits in a single step on a similar timescale

Thus, Rydberg cycle time is at around ~6 ms (clock frequency 170 Hz), completely dominated by readout time. But if Rydberg blockade could be successfully harnessed to boost the fluorescence signal, we could see it come down, perhaps realistically by 1-2 orders of magnitude (1.7 - 17 kHz).

**Photonic qubits: 10 Hz** 

Photons are always [a bit different](https://arxiv.org/abs/1607.08535), and there are many different schemes to consider. Here, we will look at fusion-based QC, for example as described in a recent preprint from PsiQuantum, [[2101.09310] Fusion-based quantum computation](https://arxiv.org/abs/2101.09310).

Fusion-based computing works differently from circuit-based QC, but we can still think of it as sequences of gates and measurements. However, in this case, we don't have a qubit that just sits there. Instead, we use "resource states" which are continually created and consumed at every time step. Here is a very nice image:

![](https://remnote-user-data.s3.amazonaws.com/CY5aPedZnrwLrTlqj3tx7pRyRvHSho8j5sYgVwtO97OdpeJUNIZhdt5gin2WAXuWpvlSheP88RU4mD092nYXvEeURkQyjl1oZIhXwD7dFCblNTJD3G9SbzSqEMs4VBoC.png){: width="700" }  

The assumption is that the rate of the resource state generation is equal to the rate of their consumption, which is measurement + feed-forward. So cycle time is equal to the worst of the two.

In [[2101.09310] Fusion-based quantum computation](https://arxiv.org/abs/2101.09310), they consider two types of resource states- a 4-photon graph state and a 6-photon graph state. Looking at the literature to date, it seems that the graph state generation time is the definite bottleneck:

- [Jeremy C. Adcock](https://research-information.bris.ac.uk/ws/portalfiles/portal/202643120/Jeremy_C._Adcock_Ph.D_thesis_Generating_Optical_Graph_States_v2.pdf), in his PhD thesis, measured 4-photon graph state generation rate of 0.04 Hz. Anticipated it could be improved to 40 kHz by amazing fabrication
- [[1908.05722] Scalable generation of multi-photon entangled states by active feed-forward and multiplexing](https://arxiv.org/abs/1908.05722) used 20 multiplexed sources to generate 6-photon GHZ states at a rate of 1 Hz
- [Sequential generation of linear cluster states from a single photon emitter](https://www.nature.com/articles/s41467-020-19341-4) says it used a quantum dot emitter to create 4-photon cluster states at a rate of 10 Hz
- [Multiphoton Graph States from a Solid-State Single-Photon Source](https://pubs.acs.org/doi/abs/10.1021/acsphotonics.0c00192) created 4-photon cluster states at a rate of 13 Hz 

Thus, today's best (fusion-based) photonic quantum computer would thus have a clock speed of ~10 Hz, i.e. a cycle time of 100 ms.

**Final thoughts**.  

This was a very interesting piece of research to put together!

The first surprising finding was that, except trapped-ion qubits, all the platforms have one operation which is much slower than all others. In solid state and Rydberg qubits, the only way to improve cycle times would be to speed up the measurements, while in photonic qubits, the only relevant figure of merit is the graph state generation time.

The second surprising finding was how slow photonic qubits are! In their architecture papers, folks at PsiQuantum [seem to have settled](https://arxiv.org/pdf/2211.15465.pdf) for "1 ns" as a timescale for resource state generation in photonic qubits:

![](https://remnote-user-data.s3.amazonaws.com/2KBFykYaqXiZz_WzPtzEEKeObCWpCn0uAErcWXO3pjwXZ7_wY0_03BijyemNNNoT0D1vq1RsQuGJbmxmN2epTs3JaDqDNQKx76MyubXCrA7tZmss1TSPdcMxUTehN0Tl.png){: width="500" }

I always suspected this was hard, but I never thought it was *8 orders of magnitude hard*. I hope their optimism and hard work pay off!

I hope you enjoyed this, and as always, let me know in the comments if I've made any blunders.

**Next time**: By now, we have established typical QC clock speeds. But what does it mean in terms of QC speedup? To answer this question, we will look into QC efficiency - more specifically, how the number of steps quantum computers need to solve interesting problems compares to the number of steps classical computers need.