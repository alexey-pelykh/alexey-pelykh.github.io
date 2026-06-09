---
title: "Open Source Is Drowning in Unreviewed Code"
slug: open-source-drowning-unreviewed-code
date: "2026-06-07"
excerpt: "10,808 PRs across 6 repositories. 28% got zero reviews. The top human reviewer averaged about 230 reviews a year for nearly a decade, and still couldn't keep up. An AI experiment produced 449 reviews in 9 days, and the community said stop."
pillar: eng-economics
tags:
  - AI
  - Open Source
  - Code Review
  - Engineering Economics
---

# Open Source Is Drowning in Unreviewed Code

I spent the last month analyzing 10,808 pull requests across 6 repositories in the Odoo Community Association (OCA). The data tells a story the community already knows but hasn't quantified: there aren't enough reviewers, the gap is widening, and the solutions being proposed can't close it.

## The reviewer landscape

I compiled the all-time review history for these 6 repos. The top 5 reviewers, ranked by unique PRs reviewed:

| Rank | Reviewer | Unique PRs | Active Span | Best Year |
|------|----------|-----------|-------------|-----------|
| 1 | [pedrobaeza](https://github.com/pedrobaeza) | 2,197 | 9.5 years | 290 (2025) |
| 2 | [rousseldenis](https://github.com/rousseldenis) | 967 | 9.4 years | 267 (2025) |
| 3 | [alexey-pelykh](https://github.com/alexey-pelykh) | 881 | 7.4 years | 449 (2026) |
| 4 | [chienandalu](https://github.com/chienandalu) | 456 | 8.9 years | 96 (2024) |
| 5 | [simahawk](https://github.com/simahawk) | 375 | 9.4 years | 97 (2018) |

Look at the drop-off. The top reviewer has more than double the second. By fifth place it's 375 reviews spread across nearly a decade. Review capacity in this ecosystem isn't distributed across the community. It's carried by a handful of people, and the curve collapses fast behind them.

[Pedro Baeza](https://github.com/pedrobaeza) is exceptional. Not "pretty good" exceptional. His 2,197 reviews over 9.5 years average out to about 230 PRs per year, sustained across a decade of unpaid effort. His best year ever was 290 PRs in 2025.

At the community-estimated 15 minutes per review, Pedro Baeza's entire 9.5-year review career represents 549 hours of work. That's 13.7 full 40-hour work weeks. Spread across 9.5 years. Donated to the community.

That's the ceiling. The absolute best case for sustained human reviewing in this ecosystem.

## The coverage crisis

That ceiling is trying to cover this:

- **10,808 total PRs** across these 6 repos.
- **3,070 PRs (28%) received zero reviews.** No comments. No feedback. Nothing.
- **984 PRs merged without any formal review trail.** Someone with merge rights presumably read the code, but left no GitHub review. No audit trail.
- **471 PRs went stale without ever being reviewed.** Contributors submitted work, waited, and watched a bot close it months later.
- **OCA/web alone has 90 open PRs with no review right now.** 51 have been waiting over 6 months.

On modern branches (16.0+), 58% of all closed PRs were closed without a single review. More than half of rejected or abandoned PRs never had anyone look at them.

This is the baseline. The "normal" that doesn't trigger community discussions.

## The math doesn't work

In January 2026, [Holger Brunn](https://github.com/hbrunn) proposed enforcing a 2:1 review-to-PR ratio on the OCA contributors mailing list. Contributors would need to review twice as much as they submit. PRs would auto-close if the ratio wasn't met.

The community pushed back. [Jairo Llopis](https://github.com/yajo) argued statistics should be "a prize, not a weapon." [Enric Tobella Alomar](https://github.com/etobella) noted that newcomers need about a year before they start reviewing meaningfully. [Tom Blauwendraat](https://github.com/thomaspaulb) suggested ranking contributors by review quality so their PRs surface first. A carrot, not a stick.

But forget the policy debate for a moment. Look at the arithmetic.

Pedro Baeza, the most prolific reviewer in this ecosystem, reviewed 290 unique PRs in his best year ever. The system receives thousands of new PRs every year across these repos alone. The OCA maintains hundreds of repositories beyond these 6.

If the single most dedicated reviewer in the community's history, sustaining a decade of unpaid effort, can only cover a fraction of the inflow from 6 repositories, no ratio enforcement is going to close the gap. You can't enforce your way out of a supply problem.

Even Holger himself acknowledged the core issue. When Tom suggested the "carrot" approach of ranking and recognition, Holger replied: "seeing it fail for 10+ years."

He's not wrong. The problem isn't motivation. The problem is throughput.

## 449 reviews in 9 days

Between February 24 and March 4, 2026, I ran an AI-assisted review campaign across these 6 repos. 449 unique PRs reviewed in 9 days.

The throughput comparison:

- Pedro Baeza's best daily pace: 0.79 PRs/day (290 PRs in his best year)
- AI campaign: 49.9 PRs/day
- Multiplier: **63x**
- Time for Pedro Baeza to match the campaign at his best-year pace: **~19 months**

The quality wasn't perfect. Independent validation (not self-assessment) showed 69% fully valid, 22% partially valid, 7.5% rubber-stamps. Real problems. I've written about the quality findings separately.

But on 138 of those PRs, the AI review was the only review the PR ever received. For those, the alternative wasn't a better review. It was no review at all.

## The community said stop

[Stefan Rijnhart](https://github.com/StefanRijnhart) flagged the campaign, linking to a specific review as an example. Denis Roussel reported continued "flooding PRs with non-contextual reviews." [Akim Juillerat](https://github.com/grindtildeath) called the reviews "AI slop" after receiving 10+ notifications. Tom Blauwendraat asked me to stop until a policy was established.

Some of those criticisms were legitimate. The notification volume was disruptive. Ten-plus pings in a sitting is a real cost, and I imposed it without asking. 7.5% of the reviews were rubber-stamps that added noise, not signal. Running at that scale without warning the community first was a misstep.

And there's a deeper objection underneath the notifications. I ran this on shared infrastructure, touching other people's PRs, before anyone agreed it was okay. That's a fair thing to be angry about. The consent question is real, and it's separate from the throughput question.

But the throughput question doesn't wait for consent to be resolved. The community had a 31-message thread debating reviewer scarcity, ratio enforcement, and contributor bans. Nobody in that thread proposed an alternative that could match even a fraction of the throughput the AI demonstrated. The solutions on the table were recognition programs, karma scores, and ratio enforcement. All human-scale interventions for a problem that has outgrown human scale.

Meanwhile, the Governance Working Group is developing a policy proposal. The LLM guidelines discussion started in September 2025. As of March 2026, there is no policy. The 471 PRs that died unreviewed didn't wait for policy either.

## The supply problem

Open source has a reviewer supply crisis. Not an AI policy crisis. Not a community etiquette crisis. A supply crisis.

The demand side is clear: contributors keep submitting PRs. AI-generated code will only accelerate that. The supply side is capped by the number of humans willing to donate review hours indefinitely.

Pedro Baeza has donated an estimated 549 hours of review work over 9.5 years. He's an outlier. Most reviewers contribute far less, for shorter periods. And even his extraordinary sustained effort can't prevent a 28% zero-review rate across just 6 repositories.

No amount of ratio enforcement, karma scoring, or recognition programs changes the fundamental math. These are all demand-side interventions applied to a supply-side problem. They redistribute existing review capacity. They don't create more of it.

AI-assisted review is the only mechanism anyone has demonstrated that can create new review capacity at the scale the problem requires. 449 reviews in 9 days. 19 months of top-reviewer output compressed into just over a week.

It was imperfect. 69% fully valid is not good enough for a production workflow. But it was real, measured, and the methodology is improvable.

The community's position is: stop until we have a policy. The problem's position is: 90 PRs in OCA/web alone are waiting for a review right now, and nobody is coming.

Open source needs to decide which problem it's more afraid of: imperfect AI reviews, or no reviews at all.
