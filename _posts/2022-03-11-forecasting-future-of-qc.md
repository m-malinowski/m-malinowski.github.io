---
layout: post
title: "Can we forecast the future of quantum computing?"
published: True
---

The billion/trillion dollar question: which hardware platform is the right one for quantum computing? This post is about why this question is so hard to answer!

The first obvious answer is that the question is fundamentally unanswerable, as to answer it requires knowledge that does not yet exist. If someone knew how to build a quantum computer, they'd do it. Since nobody has, nobody knows, end of the story.

But we can do better, as not all unknowns are equally unknown. Here is one way to make progress:
1. Write down all the breakthroughs that need to happen to turn the machine in your lab into a useful large-scale quantum computer.
2. Place each breakthrough somewhere along the easy-hard axis, which may look something like this:
![](https://remnote-user-data.s3.amazonaws.com/_a7ngHfAyF2xb2b083mL0BSGDTSa0zLu50ZEOr6TQ3gIxfnsgI_zQgwyXUNB-2OZboF3v-SkVgZn3U5bmT0xuZci3vDlvSG1j--TPYJJyVa5tz1FaTQL6jRT3ERhP7p-.png){: width="700" }
3. See how many hard-ish problems your platform has compared to other platforms.

This exercise is naturally rather challenging! The first issue is all the "unknown unknowns". In other words, even when using sophisticated simulations, it is very difficult to list with high confidence the main challenges of systems orders of magnitude more complex than anything in existence today. But for now let's not worry about this issue, as these "unknown unknowns" are equally unknown in different hardware platforms.

In this post, I will focus on what I think are two key factors that make those comparisons so hard to make: 
1. As a non-expert, answering these questions requires talking to people who will be **biased**
2. A single expert cannot provide a  useful platform comparison due to **limited mobility** in the QC community.


## Opinion bias

We're all biased! Furthermore, I find it a very valuable exercise to think about my own biases. Here are three sources of opinion skew that I believe affect my own judgement, as well as the judgment of the QC community as a whole.

### Optimism filter

Meet Alice, Bob and Charlie, three hypothetical PhD students working on one of these "breakthroughs" standing in the way of QC. For concreteness, suppose they're developing a method for high-speed generation of three-photon GHZ states (something some people in California might pay good money for). After many years of work, they develop a low-fidelity low-speed prototype and graduate.

Alice feels optimistic about the project - if a few grad students can develop a low-fidelity low-speed source, surely a team of skilled scientists and technicians can develop a high-fidelity high-speed one?! After the PhD, she joins a group of like-minded individuals and pursues the project in the industry.

Bob is more sceptical. Bob recognises that, fundamentally, **nobody knows** how to build an adequate GHZ source. And when nobody knows how to do something, sending an army of engineers at the problem is not the answer. Bob turns down the industry position, instead focusing his postdoc on broader challenges in quantum photonics - including novel approaches to the GHZ issue.

Charlie is fed up with the problem altogether. Many years of hard work yielded something that will benefit nobody anytime soon. Charlie packs up his bags, learns machine learning and joins a company that solves today's problems using today's methods.

Suppose we're trying to do the exercise above and put the three-photon GHZ question on the easy-hard axis. Since we're not knowledgeable enough ourselves, we reach out to Alice, Bob and other experts. What will we find out?

Alice and others in the industry will probably lean towards the optimistic side. Bob and other academics will sound a word of caution. All in all, the industry and academia will offer vastly divergent views - but crucially, neither Alice nor Bob are lying or being disingenuous. Instead, the industry simply filters for people with more optimistic viewpoints!

What is most challenging, however, is that Charlie's pessimistic thoughts are unlikely to be heard outside of his local pub. The moment he leaves academia, Charlie can no longer properly engage with the community, hence he's unlikely to show up in our "expert search". Moreover, even if we eventually find him, Charlie's knowledge will not be up-to-date, which can bias him further towards pessimism. 

The optimism filter is potentially a big source of bias. I don't know how many people leave the quantum computing community shortly after their PhD, but I wouldn't be surprised if the number of north of 50%. That is potentially a lot of QC sceptics, potentially distributed very differently across different platforms!

To summarise: Due to the "optimism filter" we can expect the "industry experts" to be more optimistic about the major challenges than the "academic experts". Furthermore, the "accessible community" will be more optimistic than the "whole community", as the most pessimistic individuals are more likely to leave.


### Self-preservation bias

It is an almost trivial observation, but worth spelling out for completeness: nobody can be trusted to speak their mind fully freely.

Alice and other "industry experts" have made a bet on a specific platform. This means there are all sorts of pressures - explicit or implicit - that prohibit them from voicing their doubts. This very much applies to me! Since I work at Oxford Ionics, you should have serious doubts whether I pull my punches when criticising trapped-ion QC, or whether I'm being excessively harsh about the limitations of superconducting qubits. 

Bob and other "academic experts" have also made a bet on a platform! Their ability to get sustained funding - and in turn, to pursue the most interesting projects - is tied to the "brand image" of the whole platform. Therefore, do not count on an "academic expert" to loudly voice their scepticism about the scalability of their hardware.

The result is that, as an outsider, you usually find out about other people's problems retrospectively once they're solved. Let me give you an example. I've been following the progress in superconducting qubits for years: I'd read the main papers, go to the talks, chat with people at conferences etc. Last year, I read the paper called [High Coherence in a Tileable 3D Integrated Superconducting Circuit Architecture](https://arxiv.org/abs/2107.11140) from Oxford's Peter Leek group, one of my favourite in the field. The introduction says:

>  Two requirements for scaling such superconducting qubit lattices are: (1) a method to route control wiring to the circuit such that all qubits remain addressable and measurable at progressively larger scales; and (2) a means of preventing low-frequency spurious modes from emerging in the circuit as the dimensions increase.

Wait, what? I've heard plenty about (1), but how come I never accidentally stumbled onto a talk about "low-frequency spurious modes in superconducting circuits"? It could have just been my own luck (good luck? bad luck?), but I think the answer is simple: "low-frequency spurious modes" is one of these things you speak about loudly to the outside world only once you solve it!

To summarise: Due to "self-preservation bias", we can expect both the "industry experts" and the "academic experts" to brush over major future challenges. 

### Private knowledge

Earlier this year, I've read a [fascinating article about the lab-grown meat industry](https://thecounter.org/lab-grown-cultivated-meat-cost-at-scale/). Here is the punchline. Scientists know how to produce cultured meat, but all known methods are not cost-effective, even at scale. On the other hand, lab-grown meat startups claim to have a path towards low-price cultured burgers, though they refuse to reveal the breakthroughs that enable that. 

What should we make of that? It is of course possible that the startups have nothing. They may well recognise the problem, and just say, hey, let's throw a hundred engineers at this challenge, and by the time the process is refined enough that cost-effectiveness is our main worry, I'm sure they'd have come up with something. 

On the other hand, suppose someone does have a solution to this problem. Unless it's very clearly patentable, they're likely to keep it close at hand. Or maybe they just conducted some initial successful tests, and they're working to verify the breakthrough at scale. Either way, they will not tell you what's on their mind!

The same issue takes place in our field. There are quite a few breakthroughs to be made on the path to useful trapped-ion quantum computers. At Oxford Ionics, we believe we know how to solve many if not all of them. However, I cannot provide you with any proof beyond "trust me on this" or "you'll have to wait until it's published"!

More broadly, people who can most easily list their platform's bottlenecks and speculate on their difficulty are also the people who are least likely to share this information. Many academics are aware of the bottlenecks, though they are less likely to actively think about how they could be overcome. 

To summarise: Due to "private knowledge", promising solutions to major problems will remain out of sight to outside observers.

## Low mobility of expertise

The sources of bias highlighted above make it difficult for a non-expert to understand the challenges of any given platform. One solution is of course to become an expert yourself! By joining a laboratory at the forefront of hardware development, one can gradually learn the answers to the questions above.

But to compare different platforms, one has to move between fields, and that seems more challenging than it should be.

One of my favourite papers is [Terry Rudoph's Why I am optimistic about the silicon-photonic route to quantum computing](https://arxiv.org/pdf/1607.08535.pdf). Terry phrases this issue quite bluntly (emphasis mine):

> (...) any individual scientist has finite resources, and so has to pick what to work on. The mundane,
unspoken drivers of this choice are normally what specific
physics we understand best given our background, and the fact
you can only raise funding for stuff you are already acknowledged as an expert in. **As such few people work with systems much different from those they did their early research
in, despite us all knowing this was primarily an accident of
geography**. The spoken justification for our choice, however,
is often of the form “my choice is going to be the winner of
the race” (a fact we should blame partly on our individual human competitiveness and partly on funding agencies and their
government overlords, who expect such trite from us)

This is true. As described above, it is not feasible to form an informed opinion about a specific QC platform without becoming an expert in it. What this means in practice is that one chooses a platform semi-randomly for their PhD. After the PhD, however, there is little incentive to swap platforms, so instead of exploring the hardware landscape with open minds, one continues down the same path and finds justifications that their platform is "the most promising".

OK, perhaps this is a little unfair. There are quite a few people who do a PhD in one platform, and then a postdoc in another. However, the mobility of expertise is far from free. First of all, in academia, the deal seems to be "PhD in X, postdoc in Y, professorship in Y". In the best-case scenario, the professorship could combine X and Y. Second, "PhD in X, postdoc in X" still seems to be the combination most likely to lead to a tenure-track position. Third, most would fear for Y to venture too far from X. This means most of the switches are cold atoms <-> trapped ions, superconducting qubits <-> silicon qubits, NV centres <-> other defect-based qubits etc. Probably the mobility is lower for people who work at the lowest level of hardware (e.g. in the cleanroom), and a bit easier at higher levels of abstraction (e.g. running algorithms). Feel free to post in the comments if you disagree with this overall take - my experience with the academic system is undoubtedly limited.

The phenomenon is of course not limited to QC. It's the global phenomenon of hyper-specialisation of labour, combined with stiff competition for permanent academic positions.

I don't think this approach is completely rational, and I hope that the quantum industry can serve to rectify some of these errors (I don't have any data on whether it is). It's almost a cliche that "diversity brings innovation", but aside from the diversity of gender and socioeconomic background, diversity of knowledge is king. I do hope that, in the years to come, we will see technical staff hopping between different hardware platforms. We will hopefully learn a lot about the most promising platforms just by observing where these people end up!

This change might not happen naturally, as different QC hardware platforms have their own communities. I've sat down for a beer with dozens and dozens of folks working on trapped-ion QC, but not once with someone working on silicon photonic QC. It's not because I don't want to, these opportunities simply come up less frequently (anyone out there? give me a shout!). But perhaps things are changing now. Twitter, for example, makes it easier to connect with interesting people across communities. Industry-friendly conferences and networking days might also be a great opportunity to bridge those divides as well.


## Summary

To summarise, a person looking to forecast the future of quantum computing hardware faces significant roadblocks:
- Over-optimistic community
- Significant differences in optimism between different types of experts
- Experts colouring their judgement to promote their own platform
- Experts with the most valuable knowledge withholding it
- Few experts who can compare different hardware platforms

I hope that, in the future, this blog can help cast some light on this murky territory!





