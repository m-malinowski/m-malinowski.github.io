---
layout: post
published: true
title: "How fast are quantum computers (part 2.5: Terry Rudolph)"
---

A few months back, I wrote a [blog post comparing the clock speeds of different quantum computers](https://m-malinowski.github.io/2022/12/04/how-fast-are-quantum-computers-part-2.html). In it, I stated that the clock speed of photonic QCs is essentially set by the resource state generation rate. This, I argued, is no small challenge, as the state-of-the-art photonic graph state generation rate is ~ 10 Hz, while PsiQuantum architecture papers assume it to be ~ 1 GHz: that's 8 OOMs to bridge!

Recently, PsiQuantum's Terry Rudolph wrote a[ very interesting blog post about the speeds of photonic quantum computers](https://quantumfrontiers.com/2023/06/21/what-is-the-logical-gate-speed-of-a-photonic-quantum-computer/). It's full of nuanced discussions of various tricks they devised to optimise their architecture, and I thoroughly recommend it.

While my post discusses physical clock speeds (see [part 1](https://m-malinowski.github.io/2022/11/06/how-fast-are-quantum-computers.html) for a discussion of what I mean by that), Terry's post talks about logical speeds in the surface code. These are only different by a pre-factor: basically, logical clock speed = physical clock speed / d, where d is the code distance (and d ~ 30 is what you want for reasonable error rates). 

However, on the surface, there appear to be some other discrepancies between my and Terry's analyses. So let's have a look at what I got right and what I got wrong!

First, while in my post, the clock speed is set by resource state generation time, in Terry's post, the clock speed is set by maximum delay time. So which is right?

Actually, I think this discrepancy is only very shallow, and that the posts agree on the fundamentals. This is fortunate, as Terry Rudolph is an intellectual powerhouse who knows a lot about error correction, while I'm basically an experimentalist dressed up in theorists' clothing, learning about fault tolerance from Twitter. 

Here is how the analyses converge: First, Terry's blog post acknowledges that the photonic QC clock speed is set by the resource state generation (RSG) time $t_{RSG}$ in the baseline case. It then discusses PsiQuantum's trick of interleaved RSG.
 
What they discovered is that delay lines can be added to keep more photons alive at the same time and, in turn, increase the effective number of qubits. It turns out that by routing some photons through a delay line (e.g. a low-loss optical fibre) of time-length $t_{delay} = k \times t_{RSG}$, the effective number of qubits can be increased $k$ times. In fact, the number of logical qubits in their system is given by $N = k/d^2 \approx k/1000$, so you better have a long delay line, or else you'll struggle to even get a single logical qubit!

What's the effect of interleaving the clock speed? It drops! By keeping $k$ times more qubits alive, the clock speed drops $k$ times, from $1/t_{RSG}$ to $1/(k \times t_{RSG})$, i.e. $1/t_{delay}$.

To summarise, the resource state generation time $t_{RSG}$ sets the  __maximum__  clock speed of a photonic quantum computer. This clock speed can be however deliberately reduced by using a delay line to increase the qubit number. In this case, it is the delay line that sets the clock speed. Sounds like I wasn't too wrong on this one.

The second thing that Terry points out is that we need be clear about what is meant by $t_{RSG}$. Just because we say $t_{RSG} = 1$ ns, it does not mean we need to build a single resource state generator that operates at 1 GHz. Instead, a potentially more straightforward route is to multiplex a number of separate sources. For example, one billion sources operating at 1 Hz could be multiplexed to produce an effective 1 GHz generator.  I agree - and of course, I imagine that building a suitable multiplexer takes up a very significant fraction of PsiQuantum's resources!

Third, while I said that 10 Hz is state of the art for cluster state generation, Terry says that a 2022 experiment has actually achieved cluster states at 1 GHz from a quantum dot: [Deterministic generation of indistinguishable photons in a cluster state](https://www.nature.com/articles/s41566-022-01152-2). 

This sounds like quite a poo-poo on my part. During my brief literature review, the best I could find was this 2020 paper going at 10 Hz: [Sequential generation of linear cluster states from a single photon emitter](https://www.nature.com/articles/s41467-020-19341-4). So wait, did this really improve by 8 OOMs in two years, or is there some major caveat I'm not getting? I'm hoping to hear some comments from experts before I revise the original post.

As you can see, I learned quite a bit from Terry Rudolph's blog post. To be honest, I hope this is just the launch of his blogging career! His wits, combined with this one-of-a-kind dry absurdist humour, have always been an inspiration to me (as you'll know if you've heard any of my talks!). Secretly, I hope to one day have enough interesting ideas (and/or status!) to incorporate his level of comedy and opinionatedness into my own papers, like Terry has been doing for years.

