---
title: "'AI Slop' vs No Review at All - Which Actually Kills Open Source?"
slug: ai-slop-vs-no-review
date: "2026-04-01"
excerpt: "AI code reviews with 69% validity got labeled 'slop' and nearly banned. 28% of PRs get zero reviews and nobody panics. Full data on both sides."
pillar: eng-economics
tags:
  - AI
  - Open Source
  - Code Review
  - Engineering Economics
---

# "AI Slop" vs No Review at All - Which Actually Kills Open Source?

Two things are true at once:

1. AI-assisted code reviews have real quality problems.
2. The alternative most PRs actually face is no review at all.

I ran 449 AI-assisted code reviews on OCA (Odoo Community Association) open source PRs in 9 days. Then I ran rigorous independent validation against the actual code. I also pulled the review statistics across all 10,808 PRs in the same 6 repositories.

Both datasets tell a story. The community's reaction to each tells another.

The AI reviews got called "slop," triggered near-ban discussions, and were shut down within days. The 28% zero-review rate has been running for years. The community debated the former. The latter is just how things are.

Here's the full data on both sides.

## The case against AI reviews: every flaw, quantified

The AI reviews had real problems. Independent validation - 40 AI instances reading actual PR diffs, not the review text - covered 440 of the 449 reviews and produced these numbers:

| Category | Count | % |
|----------|-------|---|
| Fully valid | 303 | 68.9% |
| Partially valid | 97 | 22.0% |
| Rubber-stamp | 33 | 7.5% |
| Invalid | 4 | 0.9% |

68.9% fully valid. 31.1% had issues ranging from "missed something important" to "factually wrong."

The specific failures:

**4 fabricated claims** out of roughly 2,000 total (<0.2%). One described a code pattern that doesn't exist in a 7,362-line diff. One claimed "tests pass" on a module with zero tests. These are hallucinations.

**33 rubber-stamp reviews** (7.5%). PRs approved with "LGTM, CI green" and no evidence the diff was read. One approved a 3,500-line new module with no inline comments. Another approved a security-sensitive portal module with three words.

**2 harmful suggestions**. One was high-severity: the AI recommended following a pattern from another module that itself contained a bug. Following the advice would have introduced incorrect totals.

**34 false positives**. Things flagged as bugs that weren't. Wrong version conventions applied, code already doing what was suggested, misread diffs.

**340+ significant issues missed** across 440 reviews. Things the AI should have caught and didn't.

That's the full record. It's real.

## The case against no review: the invisible damage

Same 6 repositories, 10,808 PRs total.

| Metric | Number | What it means |
|--------|--------|---------------|
| PRs with zero reviews | 3,070 (28%) | No human ever looked at these |
| Merged without review trail | 984 (15% of all merges) | In production with no audit record |
| Stale, died unreviewed | 471 | Contributor effort, wasted |
| Modern-branch PRs closed unreviewed | 58% | Majority of closed PRs never got a single review |

3,070 PRs received zero reviews. Not a shallow review. Not a rubber-stamp. Nothing.

984 were merged anyway. A maintainer with merge rights presumably read the code, but left nothing on record. No feedback for the contributor. No searchable review history. No audit trail. If something breaks, there's no reviewer to trace, no review to learn from.

471 went stale and were closed by bots. Contributors submitted work, waited weeks or months, got silence, and watched a stale bot sweep their effort into the archive. On modern branches (16.0+), 58% of closed PRs died this way.

At the community-estimated 15 minutes per review, reviewing those 471 stale PRs would have taken roughly 118 hours. About 3 work weeks spread over years. Nobody found the time.

## Side by side

| Dimension | AI reviews (449 PRs) | No review (3,070 PRs) |
|-----------|---------------------|----------------------|
| Valid feedback delivered | 303 fully valid + 97 partial | 0 |
| Security issues caught | 6+ genuine findings | 0 |
| Bugs found that humans missed | Multiple across 440 reviews | 0 |
| Fabricated claims | 4 (<0.2%) | N/A |
| Harmful suggestions | 2 (1 high-severity) | N/A |
| Rubber-stamps | 33 (7.5%) | N/A |
| Contributor feedback | Present, with issues | Absent |
| Audit trail | Present, with issues | Absent |
| Community response | "Stop" | Silence |

The AI reviews had a fabrication rate under 0.2%. The no-review path has a coverage rate of 0%. One of those numbers got a community thread. The other didn't.

## The risk calculus

What each failure mode actually costs:

**A fabricated claim in an AI review** (happened 4 times in ~2,000 claims): a human reviewer or the PR author sees the claim, recognizes it's wrong, and ignores it. The PR continues. The cost is noise and wasted attention.

**A harmful suggestion** (happened twice): if followed, introduces a bug. But the suggestion goes through normal review. It's a recommendation, not a merge. A maintainer can reject it. The cost is real but gated by human review downstream.

**A rubber-stamp approval** (happened 33 times): a false signal that the code was reviewed. This is genuinely dangerous. If a maintainer treats the AI approval as sufficient and merges without reading the code, real bugs ship. The mitigation: AI reviews shouldn't be counted as formal approvals. They're input, not decisions.

**A PR merged without any review** (happened 984 times): no signal at all. No feedback. No record. If bugs exist, they ship without anyone having a documented chance to catch them. No mitigation exists because no review happened.

**A PR that dies unreviewed** (happened 471 times): contributor time wasted. Future contributions from that person become less likely. The community shrinks by one potential contributor. Multiply by 471.

The AI failure modes are visible, quantifiable, and bounded. The no-review failure mode is invisible, unquantified, and compounding.

## What the community chose

The AI reviews triggered discussion within days. Multiple community members flagged the campaign. The term "AI slop" was applied. I was asked to stop. A near-ban discussion followed.

The feedback about notification volume was legitimate. The quality concerns were legitimate. I published the data showing every flaw.

The 28% zero-review rate has been running for years. The 471 stale PRs accumulated gradually. The 984 no-trail merges happened one at a time. There's no comparable urgency.

This isn't specific to OCA. It's a pattern in how communities process risk. Visible, novel disruptions trigger immune responses. Invisible, chronic problems don't. The immune system targets the new threat, not the ongoing one.

## The real security findings

While we're comparing risk: the AI reviews found 6+ genuine security vulnerabilities in code heading toward production.

- Portal sudo bypass in a timesheet module
- Cross-record token exposure on a public auth endpoint
- getattr traversal in sale-workflow
- Unfiltered portal properties in a project module
- .sudo(user) migration gaps in security-sensitive code

The AI also caught bugs that multiple human reviewers missed. On one PR, two prior human approvals missed a `return True` inside a loop. On another, two prior approvals missed an `or`-to-`and` logic regression. On a third, three prior human approvals missed issues the AI flagged.

These findings came from the same 69%-valid review set that was labeled "slop." The 6 security catches and the 4 fabricated claims exist in the same dataset.

## AI reviews aren't good enough

They're not. 69% validity is not where you want to be. 33 rubber-stamps are unacceptable. 2 harmful suggestions are too many.

But "good enough" depends on the comparison. Against a thorough human review by a domain expert, AI reviews lose badly. Against nothing, the calculus changes.

For 138 PRs where my AI review was the only review the PR ever received, the alternative wasn't a better review. It was no review at all. For those PRs, even a partially valid review with missed issues provides more value than the silence they were otherwise going to get.

## The question

Open source has a reviewer scarcity crisis. OCA's most prolific reviewer has done 2,197 unique PR reviews across 9.5 years. That's exceptional, sustained effort over a decade. The review backlog still grows faster than volunteers can clear it.

The question isn't whether AI reviews are perfect. They're not. The question is whether a community can afford to reject imperfect coverage when the alternative is no coverage at all.

28% of PRs get nothing. What's the plan for them?
