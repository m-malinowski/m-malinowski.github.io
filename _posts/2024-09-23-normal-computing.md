---
layout: post
published: true
title: "Normal computing"
image: "/assets/images/normal.png"
---

While this blog is primarily about quantum, I am keenly interested in any work pushing the boundaries of computation. Thus, when the folks at Normal Computing came up with [[2308.05660] Thermodynamic Linear Algebra](https://arxiv.org/pdf/2308.05660) last year, it immediately grabbed my attention. The paper presents what seemingly looks like a rather straightforward recipe for a better analog computer to solve linear algebra problems. In this post, I summarise the main result of their paper and ask: can this really work?

# Thermodynamic linear algebra: how does it work?
Let me try to explain, in my own words, the gist of what I think [[2308.05660] Thermodynamic Linear Algebra](https://arxiv.org/pdf/2308.05660) is all about. Starting with the basics, the story roughly goes as follows:

## Physics-based computing
Suppose you're trying to solve a classic linear algebra problem, namely a linear system of equations $A x = b$, where $A$ is a matrix and $x,b$ are vectors. Instead of solving it using established algorithms on a classical computer, you could instead build a dedicated analog device to simulate the problem.

What would this device have to look like? All you really need to do is set up some kind of a physical system to implement a potential energy $U(x) = \frac{1}{2} x^T A x - b^T x$. The value of $x$ at which $U(x)$ is minimised is the solution to your equation. So in theory, all you need to do is prepare the system, add some dissipation, wait, and then see where $x$ converges to.

If that rings a bell, it is because this method is a simple example of annealing! We normally think of *simulated annealing* - where the potential is set up and minimized on a digital computer - or *quantum annealing* - where quantum effects are utilised to speed up the process. But for the problem at hand, we don't need the quantum part at all. So we could, in theory, build a purely classical system for the task and, as long as it has the right potential energy, it can be used to find the solution. All we need is a ball and a hill, and we've got our annealer.

## But then there's noise...

So why do people generally use simulated annealing rather than "real" annealing? Well, *annealing struggles with the same problem that all other analog computers do: it is sensitive to hardware errors*. Because of unavoidable fluctuations and imperfections, the potential energy $U'(x)$ that we actually set up will be different from the function we want to create $U(x)$. Likewise, the value of $x$ at any given point in time is unlikely to be at the "true" minimum of $U(x)$ due to transient system dynamics. Finally, readout errors mean that the solution $x'$ we read out will differ from the actual state of the system $x$. Taken together, all these considerations limit the ability to generate accurate solutions to linear algebra problems.

This is where the folks at Normal make a crucial observation: to find the minimum of $U(x)$, we don't actually need to wait for the ball to roll down the hill and stay still. This is because, even if $x$ is a noisy variable, as long as we wait long enough to reach the thermal equilibrium, $x$ will always fluctuate around the potential minimum! This opens up an alternative way of operating the system, which embraces the noise rather than trying to minimize it. In particular, *rather than eliminating noise and waiting for $x$ to settle down, we can deliberately inject noise and repeatedly sample the (constantly fluctuating) state of the system to find the average of $x$, which is the solution to our equation*. Neat!

What's even neater about this thermodynamic way of thinking is that we can now ask all kinds of equations about the distribution of $x$. For example, once we record the values of $x = x_1, x_2, \ldots, x_N$ in thermal equilibrium, we can estimate not just their average, but higher-order moments such as two-point correlators $x_1 x_2, x_2 x_3, \ldots, x_{N-1} x_N$. As is shown in the paper, the average value of this correlator is actually the matrix inverse $A^{-1}$. Sweet!

The paper has a pretty graphic that summarises the method I just described.
![](https://remnote-user-data.s3.amazonaws.com/TybynSRwuUYpmLadLBrYQ_LsYEPgYxJPX_B3BPf_KwfYxprJOoJn6eAH8JoGHxWqclw_cRTlilpMFqnACCYzQwObdHuL6o_9IEJgPCGXvRRm2O2Jrix5ClB4oy5YvyPr.png)

## But... why?

Ok, so the method seems solid. However, digital computers are already pretty good at linear algebra. Can this thermodynamic computer be any better? And if so, on what metric?

The paper argues that the thermodynamic computer can bet digital computers at the speed of linear algebra on large matrices,  *as long as you don't need answers with perfect accuracy*. This graph illustrates this point well:

![](https://remnote-user-data.s3.amazonaws.com/1Q-5WQMDLM9uj1gURcPYfthgoSG3ZPxDDx82qOtg7eU7WBSm29g2Lj2Cs-LDuxhILadi9Y8c-BwPvbVNIwyV-c4nVF1M7IkQa1nOkdQZfjbAofXcKjmqfwrhP4EotRLf.png)

Let's consider the middle graph (b) first, which describes solving a problem of dimension $d = 1000$. The dashed vertical line represents the exact solution, i.e. it takes about $6.5$ ms to solve linear systems of equations of this kind on one Nvidia RTX 6000 GPU. The black line ("conjugate gradient") is the digital approximate method, and the coloured lines are the expected runtimes for a thermodynamic algorithm. We see that, after $t \approx 1$ ms, the thermodynamic computer algorithm has already found an approximate solution with an average error of $0.1$. The thermodynamic method continues to dominate until about $3.5$ ms, at which point the existing method wins again. This demonstrates a moderate speedup if what we care about is finding solutions with about $0.1$ error. From graphs a) and c), we see that the speedup is even more pronounced for larger problem dimensions ($d = 5000)$, while for small dimensions ($d=100$), it is not particularly significant.

Naturally, the exact runtime of the thermodynamic algorithm will be hardware-dependent, and this is only an estimate. Still, the point is that numerical simulations with not-completely-unrealistic parameters demonstrate that this method may win over digital computers!

Why would it win? The authors present a complexity analysis of their algorithms based on some solid thermodynamics, finding that their complexity often scales favourably compared to digital methods, e.g. $O(d)$ vs $O(d^2)$ for linear systems of equations.![](https://remnote-user-data.s3.amazonaws.com/20eg0HuWtYmnjA8FH-Wpnxtid7VFlL4gon0W6esVZKBD2gyZIyR4jVVXplzqdf5e53AuIP07fgKDYfSiFzJ9c-4iyNyPYU5ZOKCCshtF4uyg7MfiVA839MrCVuZRQ8sk.png)

## How can I build one of these?

So what would this thermodynamic computer actually look like? The most reasonable guess is to build it out of analog electronics. In that case, the computer would be composed of lots and lots of noise sources coupled to local RC/LC oscillators, with each oscillator coupled to every other oscillator. This coupling can be accomplished, for example, by placing a capacitor between every pair of oscillators, resulting in the following network:

![](https://remnote-user-data.s3.amazonaws.com/GGEVLYtR2lwmDCZ1y73NX7WhJuH0bUi2OSgN471XHt7uCXoJi0MMBrF3urfCSYLojYU56RYU0p32ds5aTIGu_f-C5pMU-S_EAxCM8b2I5gS2xbTVsrf58ggTtRD2stiK.png)

In this diagram (which comes from [their subsequent experimental paper](https://arxiv.org/pdf/2312.04836)), each noise source is represented as a noisy voltage source in series with a resistor $R_i$, producing an effective current noise $I_{R_i}$. Each noisy current source is then connected to a separate parallel LC oscillator to form a "noisy oscillator", a.k.a. a "stochastic mode" or "s-mode". Finally, s-modes $i$ and $j$ are capacitively coupled through a capacitor $C_{ij}$, and there is one such capacitor for every pair of $i$ and $j$.

The way that this computer is programmed and used in practice is that a compiler (which itself lives on a digital computer) ingests $A$ and calculates the values of $C_{ii}$ and $C_{ij}$ that implement the correct potential energy. Once that compilation is finished, the variable capacitors are set to the target values, and the system is let to evolve. After a precalculated evolution time, the voltages are repeatedly measured, and the result is obtained.

While it may seem that the computation flow is mainly analog, the digital compiler actually does a lot of heavy lifting. This is because calculating the correct values of $C$ takes time, and itself requires $d^2$ steps! Funnily enough, it actually turns out compilation is the dominant contribution to the runtime of the thermodynamic linear algebra in the plot above. As an aside, this is quite reminiscent of the story of quantum error correction, where the (classical) digital computer that decodes the error syndromes is frequently the bottleneck to the quantum circuit runtime. Digital computers are just hard to get rid of!

# What should I make of it?

I really enjoyed this paper, well as [[2302.06584] Thermodynamic AI and the fluctuation frontier](https://arxiv.org/pdf/2302.06584), which is an earlier [vision paper](https://scienceplusplus.org/visions/index.html) from the folks at Normal. It really got me reflecting about topics I haven't thought about in years (if ever), which is a great refreshment from the world of quantum computing...

I will share five thoughts below in no particular order. However, I will prefix by noting that 1) I'm not an expert on analog computing, 2) I haven't spoken with any of the authors or anyone knowledgeable in the matter to hear all the things I got wrong, and 3) I haven't gone through any of the maths in any real detail. So these are really raw thoughts - you'been warned! After this post is out, I will reach out to the authors to see what they make of my observations.

**#1: Why now?**. This question puzzles me on a few fronts. The method is really simple, and analog computing is really old. If thermodynamic computing is really as powerful as advertised, surely someone in the 1980s have thought of this algorithm, right? So is thermodynamic linear algebra a new breakthrough, or something that has already been discovered and discarded in the past?

The authors seem to have done their homework on prior art, so I'm of course willing to believe that the thermodynamic angle is genuinely new. On the other hand, some of the methods presented in the paper can be arguably "discovered" without ever thinking about thermodynamics at all. For example, can't the linear algebra algorithm be executed on [any analog annealer](https://www.nature.com/articles/s41598-019-49699-5), without noise injection? So where exactly is the distinction between analog computing and thermodynamic computing, and between old and new?

Of course, *it doesn't really matter if thermodynamic linear algebra is a novel idea, it only matters if it's a great idea*. But I do wonder: is there any obvious reason this idea would surface now, rather than say 50 years ago? From the hardware perspective, don't think there is anything about in proposal that is feasible today but wasn't in the past. Maybe the answer is that the recent advances in AI, and the resulting growth in demand for compute, simply makes the economic value of hardware accelerators much more pronounced than it was back in the day?

**#2: Uhm, so what about errors then?** In this paper, the question of error susceptibility is explicitly left out of scope. However, throughout the publications I have read/skimmed, the folks at Normal seem to make an argument that because thermodynamic computing is noise driven, it is also more noise resilient. However, *I'm not really convinced thermodynamic computing is genuinely more accurate than other analog computing modalities*.

Sure, there are some types of errors - e.g. in operation timing - that this method will be resilient to. But my understanding is that the crux of a lot of analog computing is not necessarily noise as much as precision, i.e. systematic errors from component imperfections. In the architecture discussed in this paper, the matrix $A$ is encoded into the values of physical capacitors. Those will unavoidably not be quite right, leading to wrong solutions - and the total magnitude of the error will grow with problem size.

Coming back to the comparison with annealing, it seems to me that while thermodynamic computing can indeed make annealing more efficient and less sensitive to readout noise, it suffers from the fundamental limitation that the implemented potential $U'(x)$ cannot be made identical to the target potential $U(x)$. The earlier paper from Normal argues that thermodynamic computers can get around this limitation by pre-training the system controller (which I think is equivalent to "careful calibration of systematics"), but I don't think this argument - whether correct or not - applies in this case. All in all, I don't yet see how thermodynamic computing improves on this fundamental limitation of analog computers, but I remain open to be proven wrong.

**#3: Building this won't be easy!** While the coupled oscillator architecture is simple to draw, it strikes me as challenging to build in practice on chip. First, adjusting the coupling matrix relies on electronically variable resistors/capacitors/inductors, and integrating these on chip with decent tuning range is a mess. These components also come with serious footprint challenges - a 1 nF capacitor in a standard CMOS processtakes about 1 square milimeter of area! High-speed data loading and readout also feels challenging - in the paper, they assumed one DAC and ADC per s-mode, which doesn't sound practical or power-efficient. And as mentioned above, I think the architecture requires equisite management and compensation of circuit non-idealities, be it systematics, paracitics, underised couplings (e.g. through ground or mutual inductance), as well as component non-linearies.

Of course, this is not to say that this architecture doesn't scale, only that it remains to be developed into a form that is practical and manufacturable. And really, none of this sounds too scary compared to the typical challenges of manufacturing and operating quantum computers! So from where I sit, I would say that *while architecting thermodynamic computers sounds hard, it also sounds both doable and fun*.

**#4: How well does it need to work, actually?** The paper demonstrates that the architecture allows for potential speed gains for linear algebra that is approximate (error norm around 0.1) and with dimension over $\approx 1000$. The obvious next question is: who exactly can benefit from fast approximate linear algebra with dimension over $\approx 1000$, and how much is this capability worth for them?

In don't know the answer myself - before reading this paper, I have never asked myself questions such as "could my code benefit from a solver that is faster but makes more errors", and I suppose neither did most people. My guess is that *most potential end-users will need to be shown the advantage, rather than just given access to a thermodynamic processor*. I suppose that's the reason why Normal seems to be heavily staffed with AI people looking into probabilitic algorithms - their best case scenario is to build end-to-end solutions that natively benefit from thermodynamic speedups.

The hardware-software codesign seems crucial for a few more reasons. One is that the hardware is likely to have indiosyncracies that make it sub-optimal for certain problems. For example, the coupling matrix is likely to be limited to a certain dynamic range, meaning it can't contain very small numbers if it already contains very large numbers. The other one is that linear algebra is only one of many subroutines that may be running on the thermodynamic processor, and a hardware-aware algorithm design is crucial to capturing all the potential gains.

**#5: Is this a new field of science?** The ideas presented in this work, as well as the [earlier vision paper about thermodynamic AI](https://arxiv.org/pdf/2302.06584), are clearly highly general and far-reaching. This is very exciting - I love bold, ambitious work of this kind. The challenges above notwithstanding, I do feel like a new field of science may be opening up, and it will be interesting to see if the enthusiasm for this thermodynamic computing architecture starts spreading beyond Normal over the coming years!

A few aspects of this work support this conclusion. The first is that these papers point out how a lot of algorithms and problems traditionally considered as separate can be unified, either because they can be solved by the same type of stochastic differential equation, or because they can be solved on the same type of analog hardware. The physicist in me strongly supports all efforts at idea unification, which is always a great starting point for developing strong intuitions about the world works.

The second is that thermodynamic computing could tell us something about the nature of our own intelligence. Despite the tremendous advances in AI, we know that the neural networks in our brains are in many ways superior to the artifical neural networks, e.g. in learning from limited data or in energy efficiency. However, we still we don't know how the brain pulls this off! Given that noise is ubiquotous in biological systems, perhaps it's reasonable to hypothesise that it could play an active role in the brain's computation. If so, neuromorphic thermodynamic computers could take us a step closer to understanding the mysteries of human and animal intelligence.

Finally, these early papers raise more questions than they answer! Ok, they don't do that explicitly, but as I read them, a little voice in my head keeps saying "Oh, this is interesting, I wonder if ...". This could be just because the field of analog computing is new to me, but it's also in general a great indicator that there's much much more to explore.
