---
title: "The IP of Skills[.md]"
slug: ip-of-skills
date: "2026-03-04"
excerpt: "Your employer asked you to write a CLAUDE.md file. Under work-for-hire law, they own it the moment you save. A deep dive into who owns AI configuration files, what history tells us, and what you should do about it."
pillar: industry-commentary
tags:
  - AI
  - Intellectual Property
  - Engineering Economics
  - Career Strategy
  - Legal Analysis
---

## The IP of Skills[.md]

### The Moment Your Boss Asks You to Write a skills.md

Your company rolls out Claude Code, Cursor, or Copilot across the engineering org. The CTO sends a Slack message: "Everyone, please document your architectural decisions and coding standards in a CLAUDE.md file for your repos. Also, senior engineers - we'd love you to write skills files that capture your debugging workflows and design heuristics."

Reasonable ask. Good engineering hygiene.

Except what you're being asked to create isn't documentation. Not in the way a README is documentation. It's a machine-readable file that teaches an AI to replicate your professional judgment. Your 15 years of debugging instincts. Your architectural taste. The pattern-matching you can't even fully articulate - distilled into a text file that works without you in the room.

And under your employment contract, your employer almost certainly owns that file.

I've been thinking about this for a while. This post is my attempt to work through what happens when professional expertise becomes a portable, executable artifact. Who owns it. What the law says. What history tells us. And what you should do about it.

---

## What's a skills.md, Anyway?

For readers outside the AI-assisted development world: a new class of files has emerged in software engineering. They go by different names depending on the tool - `CLAUDE.md` for Anthropic's Claude Code, `.cursorrules` for Cursor, `copilot-instructions.md` for GitHub Copilot, `.windsurfrules` for Windsurf.

These files serve as the "cognitive environment" for AI coding agents. They tell the AI how to behave in your specific codebase - what patterns to follow, what libraries to use, what mistakes to avoid. Without them, an AI agent is what one researcher called a "senior engineer with amnesia" - highly capable but ignorant of local customs.

What makes these files different from traditional documentation:

| Feature | Traditional Runbook | AI Context File |
|---------|-------------------|-----------------|
| **Audience** | Human operators | LLM agents |
| **Language** | Explanatory, educational | Imperative, constraint-based |
| **Trigger** | Manual lookup when things break | Auto-injected every session |
| **Goal** | Teach understanding | Constrain behavior and output |

A runbook explains *why* a deployment flag exists. A CLAUDE.md simply commands: "Always use `--production` when running the build." The AI doesn't need to understand. It needs to comply.

These files contain three distinct layers of professional knowledge:

1. **Project conventions** (the "what"): "Use TypeScript. Prefer functional components. 2 spaces for indentation." Low IP value. Commodity knowledge.

2. **Architectural judgment** (the "how"): "Always use the Repository pattern for database access. Never call Prisma directly from UI components. Let the global error handler manage exceptions." Medium IP value. This is senior engineering judgment.

3. **Domain heuristics** (the "why" and "watch out"): "A 'User' and a 'Customer' are distinct entities in this system - do not conflate them. The date-fns library has a timezone bug - use our custom helper instead." High IP value. This is hard-won expertise that took years to accumulate.

When your employer asks you to "write a CLAUDE.md," they're asking for all three layers. Layer 1 is fine. Layers 2 and 3 are where things get complicated.

---

## The Old World: When Knowledge Lived in Heads

The tension between employers wanting to extract expertise and employees wanting to keep it is not new. This fight has been going on for decades. Employers kept losing.

### The Philosopher's Warning

In 1966, Michael Polanyi wrote what might be the most important sentence in knowledge management: "We know more than we can tell." He used the example of recognizing a face - you can do it instantly, but you cannot write an algorithm for how you do it. The knowledge lives in the act of recognition itself, not in any manual.

This is the epistemological barrier. A significant portion of professional expertise is strictly *inarticulable*. It's acquired through years of practice - what Polanyi called "indwelling" - not through formal instruction. If the expert doesn't consciously know *how* they solve a problem, they can't tell a machine how to do it.

### The Expert Systems Crash

The first industrial attempt to crack Polanyi's paradox was the Expert Systems movement of the 1980s. The idea was straightforward: interview domain experts, extract their decision rules, encode them as IF-THEN logic. Systems like MYCIN (medical diagnosis), XCON (computer configuration at DEC), and DELTA (locomotive repair at GE) were built on this premise.

They all hit the same wall: the Knowledge Acquisition Bottleneck. Experts routinely omitted "common sense" heuristics because they weren't aware they were using them. The extraction process was slow, expensive, and the resulting systems were brittle. They failed catastrophically on edge cases outside their narrow domain. A doctor knows that a patient with a broken leg doesn't need a blood infection workup even if some symptoms overlap. An expert system didn't.

The industry learned an expensive lesson: **rules are not knowledge. They are artifacts of knowledge.**

### The Knowledge Management Graveyard

In the 1990s, corporations tried a different approach. Instead of automating expertise, they'd *manage* it. The Knowledge Management (KM) wave invested billions in Lotus Notes, intranets, and document repositories. The theoretical framework was Nonaka and Takeuchi's SECI model - a spiral process for converting tacit knowledge to explicit knowledge through socialization, externalization, combination, and internalization.

It largely failed. Not because the technology was bad, but because the economics were wrong.

**Knowledge hoarding was rational.** In a competitive corporate environment, possessing unique knowledge provides job security. Sharing it reduces your indispensability. Organizations asked employees to document their secrets for the "greater good" while rewarding them based on individual performance. Classic principal-agent problem.

**Repositories became data junkyards.** Organizations confused *information* (documents) with *knowledge* (contextual understanding). Without the tacit context of *why* a decision was made, the explicit record was useless.

**The burden fell on the wrong people.** The experts who had the most valuable knowledge were the ones least incentivized and least available to document it.

The KM era's epitaph, as one analysis put it, was a progression from hubris to bureaucracy to pragmatism - from "we can logic-gate human thought" to "we can document everything" to "we document what kills us if we don't."

### What Remained: Runbooks and the Bus Factor

What survived the KM graveyard was modest and practical. Runbooks for repeatable operations. Playbooks for complex scenarios. The "bus factor" metric - the minimum number of people who could disappear before a project stalls. Companies stopped trying to capture all wisdom and settled for documenting operational necessity.

The important thing is: through all of this, the knowledge stayed in people's heads. Companies could incentivize sharing, build repositories, create documentation cultures - but they couldn't *extract* the expertise into a form that worked without the expert. The expert always retained leverage.

Until now.

---

## The New World: Knowledge as Executable Artifacts

Generative AI broke through every one of those barriers. Simultaneously.

**The epistemological barrier fell.** Expert Systems required humans to articulate rules they couldn't articulate. LLMs don't need that. They need you to *describe the constraints and outcomes you want*, and they infer the patterns. A CLAUDE.md file doesn't encode your decision tree. It tells the AI what "good" looks like, and the model figures out how to get there.

**The economic barrier shifted.** Knowledge entry cost dropped to near zero. You're not filling out forms in a repository nobody reads. You're writing a markdown file that immediately makes your AI tools work better. Your own productivity goes up. The extraction is a side effect of self-improvement. Nobody has to be talked into it.

**The technical barrier dissolved.** Previous systems required structured inputs - rows, columns, logic trees. Human expertise is unstructured and messy. LLMs handle unstructured natural language natively. You can write "The date-fns library has a timezone bug in our version, use the custom helper instead" and the AI understands what to do.

This is what makes skills.md files fundamentally different from every previous attempt at codifying expertise. They're not documentation that might get read. They're executable instructions that get followed every single time. They don't need the expert to be present. They keep working after the expert leaves.

The authorship is shifting too. Early adopters wrote these files as personal productivity hacks - individual dotfiles for their AI. Now teams are checking them into version control as shared constitutions. Enterprise security teams are deploying centralized rules across hundreds of repositories. Personal tool to corporate asset, in under two years.

The "Senior Engineer" is increasingly defined not by how much code they write, but by how well they write the rules the AI follows.

---

## The Legal Landscape: What the Law Actually Says

The law has a framework for who owns what you create at work. It wasn't designed for this.

### Work Made for Hire: The Default

Under the U.S. Copyright Act (17 U.S.C. § 101), anything you create "within the scope of your employment" is a "work made for hire." Your employer is the legal author. They own it. No negotiation required.

A skills.md file written on company time, on company equipment, for company projects? Work made for hire. The employer owns it from the moment you save the file.

### The California Exception (and Its Limits)

California Labor Code § 2870 offers some protection: your employer can't claim inventions you develop entirely on your own time, without company equipment or trade secrets, that don't relate to the employer's business.

But a skills.md file almost never qualifies for this exception. You wrote it at work. Using work tools. To improve work output. The exception is designed for weekend side projects, not for files that optimize your employer's codebase.

### The Reverse Vector: "Can You Share Your Personal Config?"

Now flip the scenario. You didn't write the skills file at work. You spent your weekends building a personal library of AI configurations - your own CLAUDE.md skills, your debugging heuristics, your architectural patterns. You refined them across side projects, open-source contributions, and personal experimentation. On your own time, on your own machine, with your own AI subscription.

Under California Labor Code § 2870, that's yours. Clean and simple.

Except it isn't clean at all.

**The "relates to" trap is wider than you think.** In *Cubic Corp v. Marty* (1986), a California court ruled that an employee's personal invention - an electronic warfare simulator - "related to" his employer's business even though the company didn't make that product yet. The court interpreted "related to" broadly enough to encompass anything connected to the employer's business objectives. For a software engineer at a tech company, a personal skills.md file about software engineering patterns almost certainly "relates to" the employer's business. The more valuable your personal config would be to your employer, the weaker your § 2870 protection becomes. The statute's protection evaporates precisely when it matters most.

Then Monday comes. Your team lead sees your AI producing noticeably better output than everyone else's. The question arrives - casually at first, then less casually: "Hey, would you mind sharing your config with the team?"

**The social pressure problem.** Saying no makes you look like a hoarder. You're "not a team player." In a culture that celebrates knowledge sharing and open-source contribution, keeping your personal skills file private feels like hiding the answer key. Research on knowledge sharing in organizations shows this isn't abstract - employees who feel job-insecure rationally hoard knowledge to maintain their competitive advantage, but those who share are rewarded socially and professionally. The incentive structure pushes you to give up the asset even when the law might protect your right to keep it.

**The contamination problem.** Say you agree and commit your personal skills file to the company repo. The team starts adding company-specific patterns on top of your foundation. Six months later, the file is a hybrid - your original heuristics interwoven with proprietary company knowledge. In contract law, this is the "background IP" vs "foreground IP" problem. Companies are supposed to maintain a clear demarcation between pre-existing IP (yours) and newly developed IP (theirs). In practice, nobody tracks this for a markdown file. When you leave, which parts are yours? The git blame might show authorship, but the *intellectual contribution* is hopelessly entangled. Your clean personal IP is now contaminated with company trade secrets, and theirs is built on your foundation.

**The Schedule A problem.** Most employment agreements include an invention assignment clause with a "Schedule A" - a place where you're supposed to list pre-existing inventions you're bringing to the job. If you don't list your personal skills library on Schedule A at hiring time, you may lose the ability to prove it pre-existed your employment. And if you *do* list it but later incorporate it into company work, the agreement typically grants the company a license to use it. Either way, the act of bringing personal IP into the workplace triggers a legal ratchet that only moves in one direction.

**The implicit mandate.** There's a spectrum between "would you mind sharing?" and "we need you to integrate your workflow into the team standard." The first is a request you can decline. The second is a job duty - and anything you produce as part of your job duties is work-for-hire. Most real situations fall somewhere in between, where the social and professional pressure makes "no" technically possible but practically career-limiting.

**What actually happens in practice:** Most engineers share. They don't think about IP. They want to be helpful. And the moment their personal file enters the company repository, it becomes functionally indistinguishable from any other company asset. No employment contract needed. No explicit assignment. Just a `git push` and a cultural expectation.

There is a better model. GitHub open-sourced its Balanced Employee IP Agreement (BEIPA) in 2017, updated to version 2.0 in 2020. Under BEIPA, IP created outside the scope of work but related to the employer's business remains *owned by the employee*, while the employer gets a non-exclusive license to use it. It's the most progressive IP agreement in tech - and almost nobody else has adopted it. The default across the industry remains: what touches the company repo becomes the company's property.

This is arguably the most common scenario in AI-assisted development today - and the least legally examined.

### General Skills vs. Trade Secrets

This is the critical legal distinction. Courts consistently hold that you can take your "general skill, knowledge, and experience" to a new job. Knowing *how* to write a good CLAUDE.md is a portable skill. The *specific* CLAUDE.md you wrote for your employer is not.

Under the Defend Trade Secrets Act (DTSA) and state trade secret laws, information that derives economic value from not being generally known - and is subject to reasonable secrecy measures - is a trade secret. If your skills.md contains proprietary debugging workflows, internal API quirks, or domain-specific heuristics unique to your employer, it qualifies.

The line between "general knowledge" and "trade secret" has always been blurry. With skills.md files, it gets blurrier. The file is a concrete artifact - you can point to it, version it, diff it. It's harder to argue "I just naturally think this way" when there's a 500-line markdown file that says exactly how you think.

### The Inevitable Disclosure Problem

In *PepsiCo v. Redmond* (1995), a court prevented a former PepsiCo executive from joining Quaker Oats because he'd inevitably use PepsiCo's strategic playbook in his new role. The court compared it to a football player taking a playbook to an opposing team.

About 17 states recognize some form of this "inevitable disclosure" doctrine. California explicitly rejects it. The DTSA limits it to cases with concrete evidence of threatened misuse, not just "this person knows things."

Now imagine a senior engineer who spent months writing detailed skills.md files at Company A. They join Company B and write similar files from memory. The files aren't copied - they're reconstructed. But the architectural heuristics, the domain-specific patterns, the "watch out for this" warnings - they're substantially similar.

This is legally untested territory. And it's coming.

### The International Split: How Europe Sees It Differently

The US analysis above is half the picture. If you work in the EU - or for an EU company - the legal framework is fundamentally different. Not always better. But different in ways that matter.

**The first thing to understand: the EU has no work-for-hire doctrine.** In France, in Germany, across the continent - the employee is always the author. Always. The employer cannot be the legal author of a work, period. This is a philosophical commitment to *droit d'auteur* (author's rights) that continental European law has maintained for over a century.

But before you celebrate: both France and Germany have software-specific exceptions that reach roughly the same practical outcome as the US. Different mechanism. Same result.

**The classification question is everything.** In France, Article L113-9 of the Code de la propriété intellectuelle automatically transfers economic rights to the employer for "software and its documentation" created by employees. In Germany, §69b of the Urheberrechtsgesetz does the same thing - exclusive economic rights transfer to the employer automatically for computer programs created in the course of employment.

The critical word is "software." If a skills.md file is classified as software, the employer gets automatic ownership of the economic rights in both countries. If it's classified as a general literary work, the legal landscape shifts dramatically - in France, the employee retains rights unless there's a specific written assignment clause. There is no blanket assignment for literary works under French law. None.

So which is it?

French law defines *logiciel* (software) broadly. The Arrêté du 22 décembre 1981 includes "programs, procedures, rules, and documentation" related to data processing systems. A `.cursorrules` file is literally a set of rules. A `CLAUDE.md` file functions as operating documentation for an AI agent. French courts historically take a unitary view of software - anything integral to its operation gets swept into the software regime. The likely classification: *logiciel*. Automatic transfer.

German law tracks similarly. §69a UrhG defines computer programs broadly, explicitly including "preparatory design material." German IT law scholarship treats configuration files that determine system behavior as computer programs or design material. The originality threshold is low - the *Kleine Münze* ("small coin") standard requires only that the work be the author's own intellectual creation, with no aesthetic merit needed. A complex skills.md clears that bar easily.

**Where Europe diverges from the US in the employee's favor:**

**Moral rights are inalienable.** In France and Germany, the employee retains the right to be named as author and the right to oppose distortion of their work. These rights cannot be sold or waived entirely. In practice, industry custom limits their exercise for software - German courts accept that programmers implicitly waive attribution on shipped products. But the rights exist as a legal floor, and they have no US equivalent.

**Germany's "bestseller clause" (§32a UrhG) has no parallel anywhere.** If an employee's agreed compensation - their salary - is "conspicuously disproportionate" to the profits the employer derives from the work, the employee can sue for additional compensation. The Federal Court of Justice has confirmed this applies to software developers. If your skills.md becomes the foundation of a product generating millions and you're on a standard salary, you have a legal claim. The US and UK have nothing like this.

**The EU Trade Secrets Directive protects skill portability explicitly.** Article 1(3) of Directive 2016/943 states that the Directive shall not limit employees' use of "experience and skills honestly acquired in the normal course of their employment." This is not a vague principle. It's a statutory carve-out, implemented across all member states - in Germany as the *Geschäftsgeheimnisgesetz* (GeschGehG), with courts distinguishing between *Betriebsgeheimnis* (trade secrets) and *Handwerkszeug* (tools of the trade).

The practical implication: the *method* of writing effective skills.md files - knowing how to structure prompts, how to express constraints, how to organize heuristics - is a portable professional skill under EU law. The *specific content* of a skills.md - proprietary debugging workflows, internal API documentation, domain-specific heuristics - may be a trade secret. The methodology travels with you. The specifics don't.

**And the EU explicitly rejects "inevitable disclosure."** Unlike the US, where some states allow employers to block a former employee from joining a competitor because they'd "inevitably" use trade secret knowledge, the EU requires evidence of actual misuse. The "unaided memory" test applies: knowledge you carry in your head from legitimate work experience is yours. If you can rewrite a skills.md from scratch for a new employer's tech stack using your general expertise, that's the exercise of honestly acquired skill, not trade secret theft.

In summary:

| Aspect | France (L113-9 CPI) | Germany (§69b UrhG) | United States |
|--------|---------------------|---------------------|---------------|
| **Who is the author?** | Employee | Employee | Employer |
| **Economic rights for software** | Auto-transfer to employer | Auto-transfer to employer | Employer owns initially |
| **If classified as literary work** | Employee retains rights | Limited purpose-of-transfer (§43) | Work-for-hire still applies |
| **Moral rights** | Inalienable (limited for software) | Inalienable (implicit waiver in practice) | None |
| **Extra compensation** | Seldom invoked | Yes - §32a bestseller clause | None |
| **Skill portability** | Protected (EU TSD Art 1(3)) | Protected (Handwerkszeug) | Weaker, state-dependent |
| **Inevitable disclosure** | Rejected | Rejected | Accepted in ~17 states |

The bottom line: European employees writing skills.md files face the same ownership outcome as their American counterparts for the files themselves. But they have stronger protections for what they carry away when they leave - their methodology, their expertise, their right to rebuild similar files from scratch at a new employer. The EU treats professional skill as belonging to the professional. The US is less certain about that.

---

## The Extraction Incentive: Why Your Company Will Push for This

The corporate calculus here isn't subtle.

**A senior architect costs $250-400K/year.** Their value isn't typing speed - it's judgment. Knowing what to build, how to structure it, what will break at scale. If that judgment lives in a skills.md file, a junior engineer plus an AI can approximate the senior's output for a fraction of the cost.

Consulting firms are explicit about this. McKinsey talks about "knowledge capture" as an AI strategy. Deloitte and AWS advocate for systems that "capture the expertise of seasoned employees" to minimize disruptions when those employees leave. The framing is always about resilience and continuity. The subtext is about reducing dependency on expensive humans.

**Compliance accelerates the demand.** In regulated industries, skills.md files aren't optional - they're governance tools. A .cursorrules file that enforces HIPAA identifiers, mandates encryption standards, or prevents SQL injection is a compliance asset. Open-source "HIPAA agents" already exist in markdown. Companies in healthcare and finance will *require* these files, not just encourage them.

**The productivity multiplier is real.** Investment firms estimate that context-aware AI coding could generate trillions in economic value. Tools are already being marketed as "Senior Engineer in a Box." Vercel has launched skills registries - npm for AI capabilities. The future these firms envision is one where expertise is bought off the shelf rather than hired.

None of this is bad faith. It's rational economics. A company that captures and scales its best engineers' judgment has a genuine competitive advantage. They will pursue this aggressively. The question is what happens to the engineers.

---

## The Employee's Dilemma: What You're Really Handing Over

The asymmetry here is brutal.

**Time to build vs. time to transfer.** You spent 15-20 years developing the judgment to know *why* a specific architectural pattern matters. Writing it into a skills.md takes days. Once written, those 20 years of experience are available to your employer instantly and indefinitely - separate from you.

**The counter-argument and why it's incomplete.** "It's just documentation. We've always expected employees to document their work." True. But documentation tells a human how to think about a problem. A skills.md file tells a machine how to solve it. Documentation requires a competent human to interpret and apply. A skills.md file works on its own. That's not a difference of degree. It's a difference of kind.

**The obsolescence paradox.** By writing excellent skills.md files, senior engineers improve team velocity in the short term. They also lower the barrier to entry for their own role. If a junior developer can produce senior-quality output by following AI-enforced heuristics, the premium for senior expertise erodes. The "knowledge transfer" that used to happen through mentorship - where the senior retains status - gets replaced by "knowledge extraction" into a file - where the senior gives up the asset.

**The portability trap.** Many developers maintain personal libraries of scripts and configs. But a skills.md developed on company time to solve company problems is company property. Taking it to a new employer risks trade secret claims. Even recreating it from memory is legally risky if it contains specific proprietary patterns.

**The freelancer angle.** For contractors, the stakes are different. Without a clear IP clause in the contract, the client likely owns the configuration files upon payment. Smart freelancers are beginning to treat their skills.md libraries as competitive advantages - something they license rather than sell. But most haven't thought about this yet.

I don't think most engineers have internalized this yet: the act of writing a skills.md is functionally an act of transferring capital from labor (you) to the organization (your employer). Not because anyone designed it that way. Because that's how work-for-hire law works when applied to a new kind of artifact.

---

## Historical Parallels: When This Happened Before

This is not unprecedented. Every time technology gains the ability to extract and replicate professional expertise, the same pattern plays out.

### Photography (1884)

When cameras arrived, courts had to decide whether a photograph was creative work or mechanical reproduction. In *Burrow-Giles v. Sarony*, the Supreme Court ruled that Napoleon Sarony owned the copyright to his portrait of Oscar Wilde because he exercised creative control - posing the subject, selecting lighting, arranging costumes. The *selection and arrangement* by the human operator, not the mechanical capture, created the IP.

A skills.md file is like the photographer's arrangement. The human selects which heuristics to include, how to express them, what to prioritize. The AI is the camera. Under *Sarony* logic, the human author should own the file. Under work-for-hire doctrine, the employer does.

### Sound Recording (1971)

Before the Sound Recording Amendment, music was an ephemeral service. A musician played, an audience listened, the transaction ended. Recording technology turned the performance into a replicable artifact. The legal system responded by creating a new IP category - the master recording, owned by the label, separate from the composition owned by the songwriter.

The senior engineer's judgment used to be a live service. Every code review, every architecture decision, every debugging session was ephemeral. Skills.md files turn it into a master recording. And just like musicians learned, the person who "records" the expertise - the employer - tends to end up owning the artifact.

### Software Copyright (1980-2021)

Software went from "machine parts" (not copyrightable) to "literary works" (fully copyrightable) in the span of a few court decisions. *Apple v. Franklin* (1983) established that even object code in ROM chips is copyrightable expression. But *Oracle v. Google* (2021) held that API declarations - the *interface* between programs - can be fair use, because they're functional necessities for interoperability.

Skills.md files sit on this same boundary. The *structure* of a skills file (headers, YAML frontmatter) is likely a method of operation - not copyrightable. The *descriptions* inside - the creative expression of heuristics - probably are copyrightable. But since the AI relies on the semantic meaning of those descriptions to function, the merger doctrine kicks in: the description *is* the function. The expression may not be protectable separately from the idea.

### The Academic Exception (Eroding)

University professors traditionally owned their course materials under the "teacher exception" to work-for-hire. Then MOOCs arrived. When a professor's expertise is recorded on Coursera, universities started rewriting IP policies to claim "digitally mediated courseware" that uses "substantial university resources." The lecture gets detached from the lecturer. The university can offer the course without the original professor.

Skills.md files are the MOOC of engineering expertise. They detach the judgment from the judge.

### The Chef's Recipe

Less obvious but strikingly close. A chef develops personal recipes over years of experimentation. They bring those recipes to a restaurant. The restaurant serves them to customers. The chef leaves. Who owns the recipes?

The legal answer: recipes developed during employment generally belong to the employer if created as part of job duties. Trade secret protection is the strongest avenue - but enforcement is notoriously spotty. Many chefs simply take their recipes when they leave, and most restaurants don't pursue it.

A senior engineer develops personal heuristics over years. They bring those heuristics to a company via a skills.md file. The company uses them to ship products. The engineer leaves. The legal situation is the same - but with one critical difference. A chef's recipe lives in their head and their hands. A skills.md file lives in a git repository with a full audit trail. The enforcement problem that protected chefs doesn't protect engineers.

### The Algorithm Shift

After *Alice v. CLS Bank* (2014) made it harder to patent abstract software methods, companies shifted to trade secret protection. Unlike patents (which require public disclosure), trade secrets rely on keeping logic hidden. This creates black boxes - expertise extracted, codified, then locked away, inaccessible even to the experts who provided the training data.

This is where skills.md files are heading. Not patent-protected (too abstract). Copyright-uncertain (merger doctrine problems). But absolutely protectable as trade secrets - if the company takes reasonable measures to keep them secret.

---

## The Honest Read: What We Know, Don't Know, and What's at Stake

Here is where things actually stand.

**What we know:**
- Work-for-hire doctrine almost certainly gives employers ownership of skills.md files created at work
- The "general skills vs. trade secret" line is well-established in principle but untested for AI configuration files
- Historical precedent consistently shows IP consolidating with employers/platforms, not individual creators
- The EU reaches the same ownership outcome for the files themselves (France's L113-9 and Germany's §69b auto-transfer economic rights for software), but provides stronger protections for what employees carry away: explicit statutory protection for "honestly acquired skills," rejection of inevitable disclosure, and Germany's §32a bestseller clause for disproportionate profits

**What we don't know:**
- Whether skills.md files are copyrightable expression or uncopyrightable methods of operation (the merger doctrine issue is genuinely unresolved)
- Whether recreating a skills.md from memory at a new employer constitutes trade secret misappropriation
- How the *OpenEvidence v. Pathway Medical* case (filed February 2025) will resolve - it's the first major test of whether system prompts are trade secrets and whether prompt injection is "improper means" of extraction
- Whether the US-China jurisdictional split on AI output copyright (*Thaler v. Perlmutter* vs. *Li v. Liu*) will converge or diverge further

**What's at stake:**
- A new form of professional leverage is being created and simultaneously captured
- The skills marketplace is emerging (Vercel has launched an npm for AI capabilities) - expertise may become a commodity you install rather than a person you hire
- The "10x engineer" is no longer just a person. It's a person plus their configuration files. And the company owns the files.

---

## What to Do About It

Practical guidance by role. None of this is legal advice. Talk to a lawyer about your specific situation.

### If You're a Senior Engineer

**Understand what you're creating.** Every time you write a skills.md, CLAUDE.md, or .cursorrules file at work, you're producing a corporate asset. That's fine - it's your job. But be conscious of the distinction between documenting project conventions (low IP, everyone does this) and codifying your unique architectural judgment (high IP, this is your competitive advantage).

**Declare your pre-existing IP.** If you have a personal library of AI configurations you built on your own time, list it on Schedule A of your employment agreement. If you didn't list it when you were hired, talk to your employer about documenting it now. This creates a paper trail that separates what you brought from what you built on the job. It's not bulletproof - *Cubic Corp v. Marty* shows how broadly courts interpret "relates to employer's business" - but it's better than nothing.

**Keep personal and company configs separate.** The moment you commit your personal skills file to a company repo, contamination begins. If you want to share techniques with your team, create a *derivative* version for the company that references general patterns. Keep your original library in a personal repository that never touches company infrastructure.

**Maintain your portable knowledge separately.** Your general expertise in writing effective AI configuration files is yours. The specific files you write for an employer are not. Keep learning, keep developing your meta-skills. The ability to write the *next* skills.md is more valuable than any single skills.md.

**Negotiate if you can.** If you're senior enough to be asked to codify your expertise, you're senior enough to negotiate terms. Ask about IP provisions. Ask whether your company would adopt something like GitHub's BEIPA - where personal IP remains yours and the employer gets a license. At minimum, understand what your employment contract says about IP assignment.

### If You're a Freelancer or Contractor

**Specify IP ownership in every contract.** This is non-negotiable. If your contract doesn't address who owns the AI configuration files you create, the default usually favors the client. Decide upfront: are you selling the fish or licensing the fishing technique?

**Consider licensing your skills libraries.** Your personal collection of battle-tested skills.md files is your competitive advantage. Don't give it away as part of a fixed-bid project. License it. Or keep a "core" library that's yours and create derivative versions for clients.

### If You're a CTO or VP of Engineering

**Write an explicit AI configuration IP policy.** Your employees are creating these files now, whether you've asked them to or not. The default work-for-hire doctrine gives you ownership, but ambiguity breeds resentment and attrition. Be clear about what you're asking for and what you'll do with it.

**Look at GitHub's BEIPA model.** GitHub's Balanced Employee IP Agreement says: personal IP created outside the scope of work but related to the business stays owned by the employee; the employer gets an unlimited license. This is the most progressive framework in tech, and it solves the "reverse vector" problem cleanly. Your best engineers already have personal skills libraries. You want them to bring those skills to work, not hide them. Give them a framework where sharing doesn't mean surrendering.

**Consider fair compensation.** Germany's §32a UrhG allows employees to claim additional compensation when their salary is disproportionate to the profits derived from their work. There's no U.S. equivalent. But the companies that treat knowledge extraction as a fair exchange - compensation, career growth, equity - will attract and retain the senior engineers who write the best files. The companies that treat it as an entitlement will lose them.

**Version control and protect these files.** Treat skills.md files as source code, not documentation. Apply access controls. Include them in your trade secret inventory. If you're going to claim these files have value, you need to protect them like they have value.

### For Everyone

**Where I think the law will land** once case law develops:

- **Skills you brought to the job** (general expertise, patterns learned from open-source, industry-standard practices): yours. Portable. Not a trade secret.
- **Skills developed on the job using company data and context** (proprietary debugging workflows, domain-specific heuristics, internal system knowledge): the company's. Work product. Potentially a trade secret.
- **General methodology** (how to structure a skills.md, how to write effective AI constraints, meta-patterns): shared. This is general professional knowledge.

The open-source angle is worth noting. If everyone shares their skills files, the whole profession benefits. The "awesome-cursorrules" repositories on GitHub are already doing this for project conventions. But the high-value domain heuristics? Those are staying private. And they should, until there's a framework that compensates the people who create them.

---

## The Uncomfortable Truth

For 40 years, the knowledge extraction problem protected professionals. Expert systems couldn't crack it. Knowledge management systems couldn't incentivize it. Runbooks and playbooks could capture procedures but not judgment.

GenAI solved the extraction problem. Not perfectly - Polanyi's paradox still holds, and the deepest expertise remains inarticulable. But "good enough" extraction is here. The cost dropped to zero. The friction disappeared. And the legal framework that governs ownership was written for a world where professional judgment couldn't be saved as a markdown file.

We are in the gap between what's technically possible and what's legally settled. The engineers who understand what they're creating - and negotiate accordingly - will be fine. The ones who write skills.md files without thinking about what they're giving away will discover, eventually, that they trained their replacement.

Not the AI. The next lower-cost engineer who uses their file.

---

*If this resonated, I'm working through more of these engineering economics questions on this blog. Or send me a DM on [LinkedIn](https://www.linkedin.com/in/alexey-pelykh/) - I'm curious what your company's policy looks like on this.*
