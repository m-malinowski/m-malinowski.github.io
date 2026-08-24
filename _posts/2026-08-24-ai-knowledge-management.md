---
layout: post
published: true
title: "Hey Claude... what are we actually building?"
image: /assets/images/posts/ai-knowledge-management/mindroom-logo.png
---
<style>
.post-screenshot img,
img.post-screenshot {
  border: 1px solid #000;
  box-sizing: border-box;
}
</style>

The best-known use of AI in 2026 is in execution of well-scoped tasks in the domains of software engineering, general productivity, and mathematics. Within any given company, the human still has the most context about what to build, but the agent does a lot of the building.

**But building, maintaining, and managing institutional knowledge is arguably one of the biggest unsolved problems in any large-scale program or organisation**. If you've ever been part of a serious engineering program - think a new quantum computer, or a new AR headset, or a fusion reactor - you probably know all too well that keeping hundreds of engineers continuously aligned about what exactly they're supposed to build, on what timescale, and to what specs - is easily half the effort (and it's not the fun half).

![Project communication illustrated through conflicting swing designs]({{ "/assets/images/posts/ai-knowledge-management/project-communication-swing.png" | relative_url }})

This post is about how AI can bring about a revolution in knowledge management.

# Status quo

Rapid knowledge dissemination is always a challenge in R&D work. As new information streams in - simulations that refine previous simplified analyses, lab data that reveals overlooked effects, or customer feedback that reveals neglected pain points - the organisation needs to continuously adapt its goals, timelines, budgets, architecture, and subsystem specs. To that end, enterprises require processes, people, and time to collect, organise, distill, and share knowledge. This includes a wide range of activities and systems, such as:

- Wikis and databases
- Design, build, and test documentation
- Architecture documents and white papers
- Formal requirement documentation and requirement reviews
- Daily standups, weekly project updates, quarterly program updates
- Meeting minutes, decision logs
- Matrix org structures and project assignments
- Project managers pestering you about updates
- Code, firmware, lab notes
- Timelines and Gantt charts

The trouble is: all this knowledge management structure comes with **tremendous friction**. There are real costs to staying aligned - primarily in how much time is spent on "aligning" vs "doing", but also in how many people need to be hired just to keep track of what's going on.

One example to illustrate the point: back in 2022, I attended a course on Systems Engineering, where engineering managers - most from the automotive, defense, or energy industries - exchanged best practices on knowledge management. As I learned then, the definitive software tool used for requirements documentation in the industry is called **IBM Rational DOORS**. The UI looks like this:
![IBM Rational DOORS requirements interface]({{ "/assets/images/posts/ai-knowledge-management/ibm-rational-doors.png" | relative_url }})
{: .post-screenshot }

Furthermore, it is generally considered too cumbersome or unsafe to let individual engineers and managers edit those requirements. Thus, in addition to TPMs, companies hire dedicated Systems Engineers whose sole role is to formalize requirements and their dependencies (in fact, many government contracts will actually require you to have these tools and these people in place to prove you're actually doing the thing you're supposed to be doing!).

Despite roles like those, let's admit it: most knowledge management work dramatically under-delivers on its promise. **Reports get written, timelines get updated - but very rarely do real insights surface in the right places as a result**. This is a real bottleneck to ambitious engineering.

# AI for knowledge management

I think AI is about to make a step change in knowledge management on large engineering projects. In an organization of the future, the AI agents will take on the bulk of the responsibility for [steering work into a common direction](https://sequoiacap.com/article/from-hierarchy-to-intelligence), allowing individuals to spend much more of their time *actually executing*.

At the time of writing (Aug 2026), we're only seeing the preview of what's to come, but here are some things that basically already work today - for the organizations that do the necessary groundwork.

1. **AI requirement management.** Employees write analyses, trade studies, simulations; AI turns those into project and product requirements.
2. **AI dependency tracking.** Halfway through the project, an assumption is found invalid, and a critical change is made to the design. AI automatically flags all reports and analyses impacted by this design change and DMs the authors with details of the issue.
3. **AI project reporting.** AI agents help turn notes and lightweight status reports into broadly digestible project updates.
4. **AI red-teaming.** AI agents continuously review project artefacts, searching for inconsistencies and poking holes in analyses and assumptions.
5. **AI as project guides.** AI agents help employees orient themselves around the program, answering questions like who works on what, what the timelines are, etc.

# The groundwork

The basic idea is to continuously feed all project knowledge to AI agents, and let individual (human) project members interrogate the agents for project context. In my view, doing this comes down to three main steps.

## Step 1: connecting knowledge

The starting point is, of course, to connect the agents with the internal knowledge sources. In practice, this tends to be a little more complicated than enabling the Google connector to ChatGPT, because enterprise knowledge tends to be scattered - especially on projects that started in the pre-AI era. Furthermore, especially for in-person teams, a lot of knowledge is simply not available digitally in the first place. The ideal playbook is therefore to:

1. Aggressively digitise information: use AI to take meeting minutes, record customer calls, scan equipment manuals, etc.
2. Aggressively hook up MCP connectors to anywhere where information may live: Google Drive, Gmail, Slack, SharePoint, Teams... but also your purchasing database, your GitHub, your electronics design software, your experimental result databases, etc. If you can connect it, you probably should connect it.

### Aside: making knowledge easy to ingest

Should information be reformatted for AI agents?

Three months ago - when I wrote the first draft of this post - my view was that one should prioritise code and text as a source of truth. At that time (in my experience), AI was not able to reliably ingest a screenshot of a Gantt chart and answer questions like "when does project phase 2 end?" Thus, my recommendation has been to aggressively move to programmatically generated figures, such that humans can see the image, but AI can read the code.

That's probably still not a bad idea, but over the last 3 months, AI has gotten much better at parsing figures, making this step much less critical. I imagine that multimodal understanding capabilities will keep evolving, and that AI will soon be also able to reliably parse video content as well.

## Step 2: (shared) memory

After they have access to the knowledge, AI agents still have a very hard task on their hands. Understandably, figuring out what the project is about just by reading the documentation is tricky, and AI will make lots of mistakes, just like a human would. Thus, it is critical to augment the agents with a [memory](https://docs.openclaw.ai/concepts/memory) and a self-improvement loop, such that the agent gets trained up over time.

Suppose you're looking for the number of people working on project X, but the agent gets confused and tells you the number of people working on project Y. The idea is that you tell it "that's incorrect, I asked about project X, but you gave me numbers for project Y", and the agent makes a note in its memory file "remember that folder A contains information about project X, but folder B contains information about project Y", and then (hopefully) doesn't repeat this again.

Since this feedback loop can be slow, I think it can be very valuable for multiple employees to collectively contribute to a single shared agent memory. Later on in this post, I will discuss the harness we use at IonQ to achieve this.
## Step 3: structuring and cleaning knowledge

Once the agent has knowledge and memory, quickly retrieving correct internal information may be a challenge.

For example, one thing you might find is that some information sources are easier to search than others. This is fundamentally because different providers will do different things under the hood when responding to a search request via an API. Let's say you're searching for information about power consumption in information sources A and B (e.g. Slack and Confluence). To that end, you send an MCP request akin to <<search: "power consumption">> to both. It may well be that (for example) source A interprets this as direct keyword search, while source B has a fast vector database with a semantic search. As a result, source A misses a page called "energy use", which source B finds because it's semantically related but doesn't have the right keywords.

As a result, you might want to take matters into your own hands, and build your own [hybrid search retrieval stacks](https://arxiv.org/abs/2404.16130) and/or [agentic wikis](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) on top of existing information, rather than relying on vendors' in-built search tools. It really depends on who you're working with, and how well the default solutions are working for you.

The second challenge comes about from incorrect and outdated information. We, as humans, use many heuristics to decide if information is fresh and trustworthy, such as "how is it written", "who wrote it", "when was it written", etc. One common example in R&D is that some analysis is superseded, but the original (stale/outdated/incorrect) write-up is still available somewhere (e.g. in daily logs/notes). This is usually not a problem for humans who are unlikely to find the old document in the first place, but it has been my experience that this trips up AI agents with some regularity.

If possible, I think it helps to use AI for (supervised) cleanup of internal documentation. This can be as simple as a periodic prompt to "go through project documentation, flag obsolete/superseded information, and delete it after I give my approval".

# Mindroom

The AI knowledge management system we're currently prototyping at IonQ is based on a platform called [Mindroom](https://github.com/mindroom-ai/mindroom).

<img src="{{ "/assets/images/posts/ai-knowledge-management/mindroom-logo.png" | relative_url }}" alt="Mindroom logo" width="180" style="display: block; margin: 0 auto;">

Mindroom is an amazing agentic harness developed by my talented colleague [Bas Nijholt](https://www.nijho.lt/), and you should check out [his blog](https://www.nijho.lt/post/mindroom/) for more details. Below, I want to show a few high-level features, and how they make our organisation faster.

Mindroom looks very much like Slack. Every project has its own room (channel), and its own AI agent who inhabits that room.

![A Mindroom project room with a human and an AI agent]({{ "/assets/images/posts/ai-knowledge-management/mindroom-room.png" | relative_url }})
{: .post-screenshot }

I can ask any question about the project in that project's room, and the project agent will help me out. For example, I may start my week by sending the following message to the project agent (note I'm sending messages by voice, and a separate agent automatically transcribes everything).

![A spoken project question routed to a Mindroom agent]({{ "/assets/images/posts/ai-knowledge-management/mindroom-voice-project-query.png" | relative_url }})
{: .post-screenshot }

Importantly, the **agent's response is always grounded in the internal data it has access to, with links and references to human-written artifacts for verification**. Furthermore, other humans can chip in with their own thoughts, and we can have a multi-human multi-agent conversation if we like (though it's not a popular feature right now).

Any feedback I give to the agent gets recorded in its memory, and others in the project benefit from it going forward. Thus, tokens are spent durably - when multiple people ask a similar question, the agent only needs to spend significant time and tokens the first time round; every subsequent question gets answered "from memory".

![A Mindroom agent recording and recalling a language preference]({{ "/assets/images/posts/ai-knowledge-management/mindroom-shared-memory.png" | relative_url }})
{: .post-screenshot }

Giving each project a separate agent - rather than assigning a global "know-it-all agent" for all needs - has several benefits, but one of them is that it [enforces knowledge access controls](https://arxiv.org/pdf/2505.18279). So, for example, the finance team could have a finance room, with an agent connected to sensitive finance information, that nobody else can access.

The platform contains both shared and personal agents, and (within the IonQ Mindroom deployment) each agent has its own virtual machine. Thus, one can use Mindroom beyond knowledge management, as a general-purpose AI harness for coding, simulation, learning, procrastinating, etc. In fact, many people will use Mindroom over Codex/Claude just because it's pre-configured and cloud-based.

<img class="post-screenshot" src="{{ "/assets/images/posts/ai-knowledge-management/mindroom-general-purpose-agent.png" | relative_url }}" alt="A Mindroom agent responding to a general-purpose image request" style="display: block; width: 70%; max-width: 431px; margin: 0 auto;">

## What comes next?

After the last 9 months of experimentation, I feel hugely optimistic about the potential of AI tools to crack the problem of knowledge management in large engineering projects. Organizations and programs which digitise knowledge and connect it to AI agents will get a huge edge over legacy competition - and the gains will only compound over time.

My prediction is that in the coming years, most of an IC's time on large R&D projects will be spent directly interacting with AI agents who don't just implement solutions, but also manage the work in some shape and form.

I imagine this will be similar to working with an experienced manager: someone who can do the work, but also feed you project and organizational context, structure the documentation, advocate for requirement updates, and poke holes in your arguments. This agentic layer will be highly connected within the organization - with multiple humans talking to the same "manager" agent, with the "manager" agents speaking to each other and to the "chief engineer" agent, and so on.

Most of all, I expect the future to be much more enjoyable! For all the doom and gloom about AI job loss, my experience is that engineers and project managers alike are almost universally appalled by the state of knowledge management in their organizations - whether the complaint is *"we don't document enough because we don't have time"* or *"we document too much for no good reason"*. Given better tools, they'd spend the exact same amount of time on knowledge management as they do today, albeit with dramatically better results.

If you're currently using AI for knowledge management in your organization - or you'd like to, but you don't know the best starting point - hit me up; we should exchange notes.
