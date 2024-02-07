---
layout: post
published: true
title: "Are trapped ions hard to scale?"
---

A common outsider's view is that trapped-ion QCs are hard to scale. Are they really, and if so, what makes them so?
 
Tldr: No,
 I don't think trapped ions are harder to scale that other types of qubits! In
 fact, in most cases, the prospect of scaling trapped ion QCs to
 "proper" large scales seems quite easy compared to most other
 platforms!

 _Ok, mister. If trapped ions are so easy to scale, why are superconducting qubit counts are up into hundreds or even thousands, while commercial ion trap QCs are still solidly in the 10-30 qubits territory?_ 

Well, technically speaking, while you indeed cannot access hundreds of trapped ion
 qubits on the cloud, quantum information experiments with 100+ trapped ions are
 not uncommon in academia, where researchers have been using 1D and 2D ion
 crystals for experiments in quantum simulation for quite a while now.

![](https://remnote-user-data.s3.amazonaws.com/YuuJZMldJUrr8lTPE9emCaOh_uHbfDk-24iTt1Ul_dzArD_idIZ3aCGF_Uhkq-IGiJJbHwPqCswxNShwRBlGNodiLQiMVNSxeoAG3hxysw6iEp1G6l5xROcNm4-0wmdd.png)
(Image source: NIST)

_Nah, those don't look quite like quantum computers to me. I want something... More orderly. You know, a nice regular 2D grid of qubits!_  

Ok,you're right. I was just being a bit facetious. The problem with the pictures
above is that all those ions are in one potential - hence, they're all
interacting, whether we like it or not. This always-on interaction is in
practice difficult to control, so the more ions in a well, the worse our
control gets.

One way out is what's called a Quantum CCD architecture. There, instead of a one big mess of ions, we have a chip with multiple individual potential wells, each holding only a few qubits at a time. This is exactly what systems like Quantinuum's H2 implement:

![](https://remnote-user-data.s3.amazonaws.com/n5Zn0nh4FBVwRq5NxCduVgWpHawEkJ2DT9-8sjCDncJkpUddmh1VazErjy7yfjsdf7x_9niOaip4529PNOWl_4ka-dgnDO44EmaGUJ_GKBEUopRRRXCCsUGWuGCuqTYT.png)

_So why does Quantinuum H2 have only 16 qubits, while IBM's Eagle has 500? Is there something fundamentally hard about scaling trapped ion systems, or are ion trappers just lazy?_

One word: lasers. A fully controllable N-qubit trapped ion quantum computer usually uses ~ N individually controllable laser beams. Delivering those for N >> 1 , especially with low cross-talk, is usually... Quite a faff! The issue is can be grasped quite well by eyeballing this figure

![](https://remnote-user-data.s3.amazonaws.com/Bm9JcPIaNoc4UBFpl8a8fqHvoiyi5Xe4Ru7U5CyVMyigjIYKwVo5Q_lCukIL7OMQmSXWertuXCkVUBKl6v_E9NHdvZ-m09xrNpdjMzEGhv4qu9CCTpPTp3r3OE8lfzQl.png)

(Image credit: Chiara Decaroli)

_But don't neutral atom QCs deliver hundreds of tweezers at once?_ 

They do indeed! However, their work is made easier two-fold. First, the field of view
is smaller - non-interacting neutral atoms are only spaced by a few microns, vs
a few hundred microns for trapped ions. And second, neutral atoms are held
completely in free-space - there isn't an ion trap chip that the laser beams
must avoid!

_So you agree - ion traps are harder to scale!_  

Well... Not quite. The fundamental idea of free-space delivery with large optics is just not very scalable, period. Both neutral atoms and trapped ions need to use a different method to reach truly large scales - it just so happens that neutral atoms can go up to hundreds or thousands of qubits before worrying about scaling, while trapped ions can only go up to a few tens or low hundreds.

_What would a scalable solution look like then?_

Glad you asked!

Fundamentally, to reach large scales, free-space laser propagation must be largely replaced with guided lase propagation. You know, superconducting qubits deliver their signals using coaxial cables, not free-space microwave antennas, and we must do something similar.
 
The most mature architecture that has been proposed for scalable light delivery to trapped ions is that lasers are coupled to optical fibres, then to on-chip waveguides in the ion trap, and finally emitted onto the ions using grating couplers. Over the recent decade, several experiments demonstrated that this actually does work in practice:

- In 2016, Karan Mehta and collegues at MIT Lincoln Labs demonstrated [single-qubit gates in Sr+ using      integrated optics](https://arxiv.org/abs/1510.05618) 
- In 2020, my team at ETH Zurich (led by Karan Mehta) showed [two-qubit gates in Ca+ with ~ 99.3%      fidelity using integrated optics](https://arxiv.org/abs/2002.02258) 
- Also in 2020, Rob Niffeneger and colleagues at MIT Lincoln Labs demonstrated this method works for [all the Sr+ wavelengths at once](https://arxiv.org/abs/2001.05052) 
- In 2021, the team at Sandia [got this to work for Yb+](https://journals.aps.org/prx/pdf/10.1103/PhysRevX.11.041033), despite the fairly short wavelength of 435 nm
- An in 2023, Sandia upgraded  their traps to also include [integrated laser modulators](https://www.nature.com/articles/s41534-023-00737-1) 

With all of this work in place, I think it's fair to say we actually do know how to deliver hundreds of lasers to hundreds at ions at once, and it's now more of a matter of  _when_ than if.

_Why isn't this on the cloud then?_

Well, these things always take a bit of time! But trust me, it's coming!

For the most part, it's just the nature of complex fabrication projects. If you want to integrate optics into your existing ions traps, you have to considerably modify the layer stack. These additional processes necessitate additional engineering to ensure consistent performance, good yield, high reproducibility. In addition, there are always some kinks to iron out or issues to improve highlighted by the previous work, for example on integrating more ultraviolet wavelengths on reducing light-induced charging.

Long story short, you cannot wing it in a few months, and it will likely take several years for your work to bear fruit. But it will, and once it does, light delivery will no longer be a bottleneck.

Perhaps the first sign of this shifting tide is a [recent experiment led by Carmelo Mordini and Alfredo Vasquez at ETH Zurich](https://arxiv.org/abs/2401.18056) demonstrating a two-zone QCCD processor powered by integrated optics. It's a fantastic achievement with a lot of interesting details, and I can't recommend the paper enough.

![](https://remnote-user-data.s3.amazonaws.com/_KVaZa6jaiCHqeHf4TEoQ0cTS7-LlqvH7GPZ8H5ARnVE5aYfrJbgfqfbmKvChsjqjTP1HgxtvBy1H-fguCK-PVjQhwwFIQ2MA5pzo5Bl7A-BlujaIvCIdvOEXq9Aos7e.png)

It's soon 4 years since our seminal work on trapped-ion entanglement using integrated optics. I know that for a lot of folks out there, this demo was really the moment they realised this can work, and started looking into getting this capability themselves. I think a lot of these efforts are about to bear fruit soon, and I can't wait for what's about to be unveiled!

_Based on all of this, it sounds like trapped ions are a real pain. Why would you think they're more scalable than, say, superconducting qubits?_  

Admittedly, integrating photonic components into an ion trap chip is challenging and time-consuming. However, once integrated, it's very easy to scale! This is because:

- The semiconductor industry is very good at fabricating a lot of small structures with high      reproducibility
- Small fabrication defects only lead to small zone-to-zone control strength variations that can be easily calibrated out
 
All in all, fabricating classical control structures at scale is usually much easier than fabricating qubits at scale. This is both because solid-state qubits suffer from a different kind of noise than is relevant for classical electronics, and because fabrication defects can translate into non-correctable qubit properties (e.g. Poor T2 or a frequency shift). Thus, while fabricating one ion trap with one grating coupler may be more complex than fabricating one niobium chip with one superconducting qubit, fabricating 10,000 grating couplers with 50 +- 5 % efficiency is much easier than fabricating 10,000 superconducting qubits with T2 = 1 +- 0.1 ms.

The non-issue of qubit yield is only one reason why I am particularly optimistic about the scalability of trapped-ion QCs. Additional considerations include topics such as:

- [CMOS compatibility](https://m-malinowski.github.io/2023/03/20/cmos.html) If you're building a 10-qubit quantum computer, CMOS compatibility doesn't really matter, as you'll want to build it in your own artisanal process. On the other hand, if you're thinking of tens of thousands of qubits, then being able to piggyback on established semiconductor processes and supply chains is a big help.
- Power dissipation. In any reasonably large QC, some of the control must be integrated to avoid the limits of signal I/O. Assuming your process allows for electronic integration, the next question is: how much power can it use? For very-low-temperature qubits (like superconducting qubits), the answer is: not very much. For example, Bluefors's [recent monster system](https://bluefors.com/products/kide-cryogenic-platform/) boasts about 100 uW of cooling power at 20 mK, and 3 mW at 100 mK. By contrast, you can easily get several watts at 4K using inexpensive cryocoolers, and kilowatts are available at industrial scales. And, to nobody's surprise, electronic integration is orders of magnitude easier when you can use orders of magnitude more power.

Scalability is, of course, a funny term. There is no such thing as a "scalable" system, only systems capable of operation at certain scales. High-level analyses like this post glance over the fact that what stands between today and 1 million qubits is essentially just "a whole bunch of very platform-specific technical challenges" - and, by the nature of research, nobody can predict which will fall and which will resist. 

Still, we must remember that quantum computing is a research marathon, and we're just at the beginning of working our way through these issues. While today's qubit count can be suggestive, we shouldn't mistake it for a measure of the long-term viability of a quantum computing method.
