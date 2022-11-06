---
layout: post
published: true
title: "How fast are quantum computers (part 1)"
---

The point of quantum computers is that, once created, they will solve problems too complex for any present or future supercomputer. To a layperson, this sentence is equivalent to "quantum computers are much faster than any supercomputer will ever be". This annoys some quantum people because, technically, quantum computers are not fast at all.

How can that be? There are two ways to decrease the time it takes to solve a problem - increase speed, or improve efficiency. If you're annoyed about how long your computer takes to multiply a pair of matrices, you can buy a faster CPU (increase speed), or use a [better matrix multiplication algorithm](https://www.nature.com/articles/s41586-022-05172-4) (improve efficiency). **The power of quantum computers comes through their efficiency, not through their speed**. Specifically, quantum computers are the only devices capable of executing quantum algorithms, and quantum algorithms often require vastly fewer steps than their classical counterparts. 

In fact, existing quantum computer prototypes are significantly slower than classical chips. Actually, it's a real testament to their efficiency that practical quantum advantage seems possible despite how slow quantum computers are. 

So we have two interesting questions to consider:
1. How efficient are quantum computers?
2. How fast are quantum computers?

In this series of posts, we will try to find out the answers. We will start by proposing how to define and think about the speed of a quantum computer. In part 2, we will search for concrete numbers for the clock rate. And in part 3, we will compare the efficiency of quantum and classical computers.

Note of caution: I'm not an expert in quantum computing theory! But I found this question fascinating and did my best to educate myself by reading [C. Gidney et al 2019](https://arxiv.org/abs/1905.09749) and its references. All the clever stuff is from there, and all the silly statements are mine.

## What is speed, anyway?

In classical computing, processor speed is quantified in terms of clock cycle speed. Every classical computation corresponds to a sequence of layers of logic gates, and the time it takes to execute one layer is the "clock cycle". A modern CPU operates around 3 GHz, meaning 1/3 ns per cycle. The CPU includes several billion transistors, each operating in synchrony, multiplying matrices whenever you please.

Analogously, every quantum algorithm can be decomposed onto a sequence of layers of quantum gates, so one could define the "quantum clock speed" as an inverse of the "quantum gate layer time". However, as we don't yet have fully-functional quantum computers, this step is fuzzy at best. This is because there are two big unknowns at this stage:

1. Gate choice. Quantum algorithms can be decomposed into primitive gates, but the choice of gates is flexible. For example, one platform may implement a Toffoli gate natively, while another may require dozens of more primitive operations. In that case, should "quantum clock speed" reflect the time to implement a Toffoli, or an XX gate? Furthermore, different primitive operations - single-qubit gates, two-qubit gates, measurements, resets - may take vastly different times. Is the "quantum gate time" their average? Weighted average?

2. Quantum error correction. Classical CPUs make very few errors, thus every operation is useful. On the other hand, quantum computers make plenty of errors, and so need to work extra hard to correct their own mistakes. In fact, quantum algorithm runtime will likely be dominated by QEC overheads, and each QEC method comes with its own fundamental routines - potentially of very different durations. And as we don't know which QEC algorithm will be the method of choice for future quantum computers, we cannot make firm statements about their clock speeds.

All this is to say - once we have a quantum computer running a specific gate set and a specific QEC algorithm, it will get easier to make unambiguous statements about its speed. In the meantime, everything will be a bit fuzzy, and all the numbers are to be treated as orders of magnitude estimates at best.

## Quantum clock cycle.

With those caveats in mind, let's look at a case that's fairly well understood in the literature - Shor's algorithm running on a quantum computer implementing a surface code. Our goal is to understand what the primitive operations may be, and thus how the quantum clock cycle may be defined. Our answers will be approximate order of magnitude estimates, but hopefully illustrative.

The circuit for Shor's algorithm looks [like this](https://arxiv.org/pdf/quant-ph/0205095.pdf): 

![](https://remnote-user-data.s3.amazonaws.com/4bQCf42uCgzYOAHo4o2l6avSaWiqp6MdOKAxOsjUEq9sjM2al5VoAFI123a9ZWnhcrMjDhohiZ9GBPu_R9GuvBDnTg89xPW5Ku2SougJEdxBMJXhs82voKIFrVIAPkYn.png){: width="700" } 

The fundamental operation here is "controlled-U", which implements "controlled multiplication". This is not a primitive operation for any QC as far as I'm aware, so we need to break it down further. 

Following [this paper](https://arxiv.org/pdf/quant-ph/9511018.pdf),  "controlled multiplication" is broken down into "modular addition", and then further into "addition". Thus, the fundamental operation becomes:

![](https://remnote-user-data.s3.amazonaws.com/9XpvVrrpVRxCgHSjKPtUaFk8r1IZiSXpNqPmF82vqn0KjYCFlBFTwTPe7rloi-oOPielTIMnNL3munDGnSN1v8bjls1UVbajmnTcWbzX3GYyHsONaOKgGf_aCFEP144X.png){: width="300" }

As far as I'm aware, ADDER is not a primitive operation for any QC, so we need to break it down further. Following [this other paper](https://arxiv.org/pdf/quant-ph/0410184.pdf), addition can be broken down into Toffoli and CNOT gates as follows:

![](https://remnote-user-data.s3.amazonaws.com/QmWmqeW2zLR-HwTx97SNa1Dm-_DBZ7-MhbXSKKhpzfMgjXBXaRiMr6xTbKkGrGljWM4Xiph7p3YQnZ_hlXMTIbr0r62G9EJAXTnuG0OAU6XYQ8dCgtiONvJE5gRHx9hD.png){: width="600" }

Now, there might be some quantum computing platforms where Toffoli are primitive. More commonly, however, Toffoli is further broken down into CNOTs, for example like this:

![](https://remnote-user-data.s3.amazonaws.com/r7BvGy4j3S6b2-VqScu3fA7M3dkPWXGayEW71Ciix9R3_ZOtK-s6QCOJbtIcc8HFvo1nxx8xjkqV1kh3CwBqqv3Lvx4CctO7S9g6izgWGpdQONrKRCVM_52EavvxniXU.png){: width="600" }

At this point, we can describe the circuit in terms of T, H, and CNOT gates, which are probably very close to the hardware primitives - the hardware is likely to be able to implement single-qubit gates T & H directly, while CNOT can be broken down into ZZ/XX and H. At this point, it starts to make sense to look at the operations as representing some kind of primitives, and we might say that one "quantum clock cycle" corresponds to one T, one H, one CNOT, or some weighted average.

To move further in our analysis, we need to understand which of these operations is performed how often, and how the duration of a single T gate compares to a single CNOT gate, for example. You may be used to the idea that two-qubit gates are significantly more costly than single-qubit gates, and thus be tempted to approximate the circuit depth with its CNOT depth. Alas, this is where the story gets more interesting.

The twist comes from the need to perform QEC. To avoid disastrous error propagation, the circuit needs to be implemented fault-tolerantly on logical qubits. So the question is not "how long does one T/CNOT take", but "how long does one *fault-tolerant* T/CNOT take". And the answer is pretty surprising! In every QEC code, some gates are vastly easier to implement fault-tolerantly than others. It turns out that H & CNOT are usually very easy to implement fault-tolerantly (google "transversal gates"), while T gates are not. Therefore, it kind of doesn't matter how many H or CNOT gates your circuit has - all that matters for the run-time is the number of (sequential) T gates.

This motivates us to propose one possible definition of a "quantum clock cycle": 

*1) (T cycle) One layer of logical T gates.*

So, how long might this be? A logical T gate is not a primitive of a quantum computer. One may think that implementing it would be extremely costly - as it cannot be implemented transversally - but there is in fact a trick that allows us to perform T-gates very fast. The trick is called "state injection", and it looks [like this](https://arxiv.org/pdf/1612.07330.pdf):

![](https://remnote-user-data.s3.amazonaws.com/6xuqqqU7elUdF-_pQuvBQ4DMI00H5MzvymUWi3owsEPr3oTvcmPYE7LmjBF7i106R5uOpim8pgHJ_R4H1Jsbgr7sx2RTYxEcYFusmLKulK2B1v7KObjtNNc5zyxK5ppX.png){: width="500" }

In this circuit, we perform a T-gate on the logical qubit by preparing the ancilla in a well-defined initial state A, then executing "simple" transversal operations - CNOT, S & measurement. So in fact, a fault-tolerant T-gate can be a rather short block, consisting of a CNOT layer, a gate layer, a measurement layer, and a gate layer. We can therefore rewrite our provisional definition of a "quantum clock cycle" as:

*1) (T cycle) "A" state preparation + one layer of CNOTs + one layer of measurements + one layer of single-qubit gates*

Now, this feels like cheating! The implementation above looks simple only because we've pushed from the problem of fault-tolerant gate execution into the problem of fault-tolerant preparation of state A. In fact, the preferred method of preparing A - known as state distillation - is rather time-consuming! 

Distillation procedure is nicely illustrated [here](https://arxiv.org/pdf/1612.07330.pdf):

![](https://remnote-user-data.s3.amazonaws.com/Uu2eg7_b29gHGt3yiaFZod4JPXvD303gnA34djtVsgUJ-J7lRrzx7XhscBeQN6y-iC0rxfuiR1cBqfE_ET8bZH67xePXzSEq6Q2VnVgBiVWU_8u00l2VDSZd4kJB_bKm.png){: width="700" }

This will take a while. For example, [Fowler et al](https://arxiv.org/ftp/arxiv/papers/1208/1208.0928.pdf) estimated in 2012 that it takes 340 surface code cycles to distill two "A" states! A surface code cycle is a circuit that looks like this:

![](https://remnote-user-data.s3.amazonaws.com/bw-y2SfQ_Z-QlWZK6C1QtG4vh1GXHsUUDUTpTsj-7E9GcL-bczbik677HZ0YX2poFe-ShQEqPwp_VNR2-PvuWTTCdWbn2v2STHeXIC3iDboUkbG-UweoV6n-pkZSoWMT.png){: width="700" }

and is performed on all qubits in the system in parallel. So we have a second possible definition for a "quantum clock cycle":

*2) (Surface code cycle) Two layers of two-qubit gates + two layers of single-qubit gates + one layer of measurements.*

Based on the analysis above, it would seem that a T cycle is >100x longer than a surface code cycle, but that might be pessimistic. The reason is that "A" state preparation can be massively parallelised!

Suppose for example that we want to apply a sequence of 10,000 T-gates. With enough qubits, we can prepare 10,000 "A" states in parallel (in 320 surface code cycles) and then use them to apply 10,000 T gates via state injection.  So all in all, the distillation time might not bottleneck the algorithm - as long as we can afford enough qubits.

With this assumption, we can essentially set "time to prepare A" to zero, and we're left with two possible definitions:

*1) (T cycle) one layer of CNOTs + one layer of measurements + one layer of single-qubit gates.*

*2) (Surface code cycle) Two layers of two-qubit gates + two layers of single-qubit gates + one layer of measurements.*

Now, given how hand-wavy this whole analysis is, it does not really make sense to distinguish between the time necessary to execute one layer of CNOTS vs two layers of two-qubit gates. In fact, we may as well treat the T cycle and the surface code cycle as having basically the same length. Thus - with the full understanding that this is very approximate - we can propose the following simple definition:

**Quantum clock cycle: one layer of two-qubit gates + one layer of single-qubit gates + one layer of measurements**

Of course - as mentioned in the introduction - this is very rough, unoptimised, and perhaps largely specific to the surface code. Still, this is how I think about it, and hopefully a useful figure of thumb to have when thinking about runtimes comparing different platforms.

And that's exactly what's coming up next! Now that we have defined a "quantum clock cycle", we will look into the literature to find out how long a quantum clock cycle takes in different hardware implementations. Stay tuned!

