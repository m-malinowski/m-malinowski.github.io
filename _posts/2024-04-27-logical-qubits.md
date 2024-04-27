---
layout: post
published: true
title: "The logic of logical qubits"
---
Over the recent years, the focus of QC hardware research has been gradually shifting from building qubits to building logical qubits. It is with some regularity that some press release somewhere announces some first-of-its-kind logical qubit, in a way that can be frankly quite confusing. So in today's post, we will try to start disentangling this mess by answering the question: what actually is a logical qubit?

Before we define the logical qubit, we need to take a step back and define a qubit. If you are a student of QC, you might expect that a qubit is simply a two-level quantum system that encodes quantum information. However, this is **not** **quite** the meaning of the word "qubit" in "logical qubit". 

The change of language involves a distinction between qubits and operations. Strictly speaking, one should always talk separately about qubit encodings and operation errors, i.e. "this and that quantum gate, when implemented in this and that fashion on this and that qubit, has an error rate of 0.1%". However - especially when talking about logical qubits - it is common practice to lump the encoding and the operation methods into one bucket, and say things like "this logical qubit fidelity is 99.9%".

So, the "qubit" in "logical qubit" really refers to the methods of both encoding and manipulating quantum information. With that out of the way, what makes a qubit "logical"?

There are a few angles to approach this. Some people introduce logical qubits strictly in the context of quantum error correction (QEC): a logical qubit uses multiple physical qubits to reduce error rates. Other people equate logical qubits with perfect qubits, i.e. a logical qubit is error-free.

I find there are several challenges with these answers:
- I think equating logical qubits with QEC is limiting. Suppose Alice runs an algorithm using 900 physical qubits which encode 100 logical qubits using the nine-qubit code. Bob on the other hand has better qubits, so he can run the same algorithm using 100 physical qubits, without any QEC. All in all, Alice and Bob run the same algorithm at the same level of abstraction, so why would Alice's qubits be logical, but Bob's qubits not? Suppose further that Charlie runs the same algorithm using 200 physical qubits, using pairs of qubits to encode a decoherence-free subspace. Just because Charlie does not use QEC in the usual meaning of the word, are his qubits not logical?
- I think equating logical qubits with perfect qubits is illogical. What would it even mean for a qubit to be error-free? Suppose that a quantum computer runs for a decade without any errors, except for a half-hour-long power cut. Is that not enough to say the qubits are not error-free?

These definitions are also challenged by non-traditional approaches to QEC. What if quantum information is encoded into a continuous-variable system, for example as a GKP qubit? Is that a physical qubit, a logical qubit, or both?

In my view, it is much more helpful to define logical qubits by considering the application first. The idea is really simple. Let's say that you have an algorithm which, in the absence of errors, uses N qubits. I will then say that "this algorithm requires N logical qubits". Next, we count how many gates the algorithm uses. If we need to apply M gates, then the algorithm will only succeed with decent probability if the operation error rate p <~ 1/M. I will then say that "the algorithm requires N logical qubits with error rate p". 

In this definition, what constitutes a logical qubit is highly application-specific. In a simple demonstration of Deutsch's algorithm, it may suffice to have N = 2 logical qubits with p = 10% error rates. In this case, a logical qubit may be implemented as a (very shitty) physical qubit. In a more complex NISQ algorithm, we may want N = 100 logical qubits with p = 0.1% error rates. Then, we may for example implement each logical qubit using a triplet of physical qubits in a decoherence-free subspace, but without employing QEC. In a more complex application, we may achieve an error rate of 0.001% by concatenating this decoherence-free subspace with a simple three-qubit repetition code. Finally, Shor's algorithm may require N = 5000 logical qubits with p = 1e-12 error rates. This may be achieved using full-blown QEC, encoding each logical qubit as 1000 physical qubits in a surface code.


What I like about this way of thinking about logical qubits is that it emphasises that improving QCs is a continuous process. Some people believe in a sharp discontinuity between the noisy QC regime (error rates p ~ 1e-3) and the fault-tolerant QC regime (error rates ~ 1e-12). I do find it unlikely the change will be quite so abrupt. Instead, a far more likely scenario is that, from this point on, QC error rates just keep continuously improving - through a combination of hardware engineering, coherent control, and QEC - unlocking new applications with every order of magnitude noise reduction. Instead of suggesting a discontinuity between "noisy physical qubits" and "noise-less logical qubits", we should treat all qubits as logical, and simply ask: "What is the logical error rate of your qubit?".


I was first exposed to this way of thinking about quantum computation through Andrew Steane's work [[quant-ph/0207119] Overhead and noise threshold of fault-tolerant quantum error correction]([quant-ph_0207119] Overhead and noise threshold of fault-tolerant quantum error correction.md). In this paper, Steane talks about quantum algorithms in terms of their "KQ number", i.e. the number of logical qubits K multiplied by the number of gates Q. He emphasises that the right question to ask is not "Is this qubit fault-tolerant", but rather "what is the maximum value of KQ that can be reached for a given encoding and noise level".

![](https://remnote-user-data.s3.amazonaws.com/6U8saa5P6eW1w3wcJbvlgTTjDg_VSU8_2TpfW6Nk_ExxzgYlZXYJ5z-Bxmgfm94ffogbDmmMn_uPvTd7L5U9O0HjKUF4w9LtSBJAylQZzUlGMvhC7QIUUDKU9eLflFHn.png)

I do not know how universally accepted my definition of logical qubits is, but it's certainly not the common colloquial use. If you do find yourself at a theoretical talk about QC, do keep in mind that ‒ in the absence of any qualifiers ‒ "logical qubit" usually refers to something with super-duper-awesome error rates, usually p ~ 1e-12. The reason is that Shor's algorithm requires that kind of noise level, and it's a well-established and popular benchmark ‒ with a well-quantified quantum advantage ‒ and an easily justifiable goal. This is fine, just keep in mind that this target is very futuristic, and there will be plenty of QC applications with significantly relaxed resource needs.

On the other hand, if you find yourself at an experimental talk, you might encounter the other definition, where essentially any deployment of QEC is equivalent to building a logical qubit. The logical qubit might even have higher error rates than the physical one, but that's fine, as the goal is to test the performance, rather than optimise it. The obvious reason experimentalists do not require p ~ 1e-12 before declaring a logical qubit is that if they did, there would be no experiments on logical qubits for a long long time still.

All in all, I propose that questions such as "How many logical qubits do you have?" are essentially meaningless when asked in isolation. Instead, here are four better questions to actually get to the bottom of things:
 - What are your physical error rates?
 - What are your logical error rates?
 - What is the price you pay for the logical encoding? Extra qubits? Extra time? Extra control?
 - At those logical error rates, how many logical qubits do you have?