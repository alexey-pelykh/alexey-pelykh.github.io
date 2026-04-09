---
title: "The Governance Gap: AI Arrived in 2023. Policy Still Pending in 2026."
slug: governance-gap-ai-policy-pending
date: "2026-04-09"
excerpt: "In September 2025, someone proposed mandatory LLM disclosure for OCA contributions. Seven months later, no formal policy exists. The gap between 'AI is being used' and 'we have rules for AI use' is where the real damage happens."
pillar: eng-economics
tags:
  - AI
  - Open Source
  - Governance
  - Odoo
---

# The Governance Gap: AI Arrived in 2023. Policy Still Pending in 2026.

In September 2025, Stefan Rijnhart posted to the OCA contributors mailing list. He'd noticed a contributor planning to flood OCA repositories with LLM-generated migration PRs. His proposal was straightforward: mandatory disclosure of LLM usage, a requirement that generated code be self-reviewed and tested before submission, and a prohibition against copying LLM responses directly into reviewer comments.

Six messages followed over the next few weeks. "+1 for transparency." "Governance working group should lead this." "We need knowledge-building before policy-making."

Then silence.

It is now April 2026. Seven months later. No formal policy exists.

## The debate is real

The community concerns aren't trivial. They span copyright law, economic disruption, environmental impact, and digital sovereignty.

**AGPL and copyright risk.** Stuart Mackintosh raised the hard question: if AI is trained on AGPL-licensed code, must its outputs carry AGPL terms? You can't use AI as a filter to republish AGPL code under MIT. The legal landscape is unresolved industry-wide, but OCA ships AGPL code and can't ignore it.

**Abdication vs. delegation.** Stuart's distinction was precise: "Abdication of responsibility is very different to delegating, and it takes quite some effort to keep up with moderating code at the speed and volume that it can be generated." Responsible AI use requires supervision. Not everyone provides it.

**Economic model disruption.** Raphael Valyi warned that AI could disrupt OCA's merit-based economic model. The community runs on earned credibility through contribution quality. If AI can generate volume without proportional expertise, the social contract that holds OCA together starts to erode.

**Digital sovereignty and energy.** Janik von Rotz expanded the frame beyond code quality. Most developer-facing LLMs come from Big Tech companies building nuclear reactors to power data centers. He argued that supporting these tools conflicts with the open source community's values around independence and sustainability. He proposed OCA create guides for privacy-respecting, sustainably hosted alternatives.

**Knowledge before policy.** Hussain Hammad pushed back on rushing to rules. "Proper decision comes from facts and understanding these facts." He offered to run internal training sessions, arguing that OCA's management and contributors needed to understand AI tooling before they could govern it.

## The gap is the problem

But discussion isn't governance. Without a policy, the damage compounds.

**AI-assisted contributions are already happening.** Stefan's original post was triggered by an actual contributor planning LLM-generated migration PRs. My review campaign happened. Others are using AI tools in their workflows without disclosure, because no policy requires it. The question isn't whether AI is being used in OCA contributions. It's whether anyone knows when it is.

**Undocumented conventions fill the void.** Tom Blauwendraat asked in January 2026 about basic PR contribution rules: one module per PR, one change per PR, single commit. He couldn't find them in the guidelines because they aren't there. Pedro Baeza confirmed they're informal, context-dependent, enforced by reviewer judgment. This is how OCA operates across the board. Few formal rules, heavy reliance on institutional knowledge. That works when the contributor base is small and stable. It breaks when the volume and velocity of contributions change.

**Without policy, reactions are arbitrary.** When I ran 449 AI reviews in 9 days, there was no framework for evaluating them. No quality threshold to measure against. No disclosure requirement I failed to meet. No process for reviewing AI-assisted contributions. The community response was "stop." Which is reasonable. But it was a judgment call, not a policy enforcement. The next person who tries something similar will face the same vacuum.

**Labels replace standards.** "AI slop" became the shorthand for my reviews. Two words that categorized and dismissed 449 reviews before anyone measured whether they were valid. When I did measure, 69% were fully valid against independent verification. But there was no benchmark to compare that number to, because no one had defined what "acceptable" looks like for AI-assisted contributions.

## What my experiment exposed

I set out to fill a reviewer gap. Governance testing was a side effect. But the experiment produced data that the governance discussion has been missing.

**Quality is measurable.** 68.9% fully valid. 90.9% including partially valid. 7.5% rubber-stamps. 4 fabricated claims in roughly 2,000. Less than 0.2% fabrication rate. These numbers exist now. A policy could reference them.

**Failure modes are categorizable.** The quality problems weren't random. They followed patterns: reviewing wrong code versions, missing intentional design decisions, approving without reading, flagging removed features as missing. Each failure mode has a specific mitigation. A policy could require specific safeguards for each.

**The validation methodology is reusable.** Self-assessment produced 98.6%. Independent validation produced 68.9%. The 30-point gap proves that AI evaluating itself doesn't work. Any governance framework needs independent validation built in. I published the methodology.

**Volume thresholds exist.** Quality started at 34%, climbed to 87% with pipeline improvements, then degraded to 70% as volume increased. There's a pace beyond which quality drops. A policy could set limits.

## What policy could look like

The community gets to decide. But the components are visible:

**Disclosure.** Stefan proposed this in September 2025. It's the minimum viable policy. Require contributors to state when and how AI tools were used. This was consensus in the original thread. It could have been implemented the same month.

**Quality thresholds.** Define what "acceptable" means for AI-assisted contributions. My data provides a starting baseline. Is 69% fully valid acceptable? Is 91% including partial? The community should pick a number instead of debating in the abstract.

**Validation requirements.** Mandate independent validation for AI-assisted work above a certain volume. Self-assessment doesn't work. The 30-point gap proves it.

**Volume controls.** Set limits on batch sizes or daily throughput to prevent notification flooding and quality degradation. My campaign showed both are real at high volume.

**Scope distinctions.** Raphael Valyi correctly noted that risks vary by use case. Reviewing existing code has different implications than generating new code. Migration PRs differ from novel feature development. Policy should reflect this.

## The cost of waiting

Every month without policy, the gap compounds.

Contributors use AI tools without disclosure because nothing requires it. Reviewers can't calibrate their scrutiny because there's no framework for what to expect. Anyone who experiments gets the same arbitrary response I got: judgment calls instead of policy enforcement.

The governance working group acknowledged the need. The community signaled consensus on basic transparency. Stuart Mackintosh, Joel Grand-Guillaume, Daniel Reis all supported having the governance working group develop formal policy. That was October 2025.

It's April 2026. The next LLM-generated PR flood could arrive tomorrow. The policy discussion is still six messages long.

The OCA community has hard questions to answer about AGPL compliance, economic model preservation, energy consumption, and digital sovereignty. Those questions deserve careful answers. But "mandatory LLM disclosure" doesn't require resolving every philosophical question about AI in open source. It requires a vote on a paragraph.

Seven months is long enough for a paragraph.

---

*This is part of a series on running 449 AI code reviews across OCA repositories. The full validation methodology and quality data are documented across the series.*
