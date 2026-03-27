---
title: "I Ran 449 AI Code Reviews in 9 Days. Then I Almost Got Banned."
slug: 449-ai-code-reviews-9-days
date: "2026-03-13"
excerpt: "Between Feb 24 and Mar 4, 2026, I ran an unauthorized AI-assisted code review campaign across 6 OCA repositories. 449 PRs reviewed at 63x the top human reviewer's best daily pace. The community said stop."
pillar: builders-journal
tags:
  - AI
  - Open Source
  - Code Review
  - Odoo
---

# I Ran 449 AI Code Reviews in 9 Days. Then I Almost Got Banned.

The OCA (Odoo Community Association) has a quiet crisis. Across 6 repositories I tracked, 28% of all pull requests - 3,070 out of 10,808 - received zero reviews. Ever.

984 PRs were merged without any formal review trail. 471 went stale and were closed by a bot, unreviewed. 58% of closed PRs on modern branches died without a single human looking at them.

Nobody panicked about this. It was just how things were.

I decided to do something about it. Between February 24 and March 4, 2026, I ran an AI-assisted review campaign: 449 unique PRs reviewed across 6 OCA repositories in 9 days.

For scale: OCA's most prolific reviewer, pedrobaeza, has reviewed 2,197 unique PRs over 9.5 years. His best year was 290 PRs in 2025, which works out to 0.79 PRs per day. The AI campaign ran at 49.9 PRs per day. That's 63x his best-ever daily pace. To match the campaign's 9-day output at his best-year rate would take roughly 19 months.

At the community-estimated 15 minutes per review, the campaign represented 112 hours of review work. 2.8 full work weeks compressed into 9 calendar days.

## Why I didn't ask permission

There was no formal AI policy to comply with. An LLM guidelines thread had been open on the OCA contributors mailing list since September 2025. Six months later, still no policy. Meanwhile, 471 PRs sat rotting in the queue, contributors' work ignored until a stale bot swept it away.

I had the tooling. I had Odoo domain knowledge from years of contributing. The gap was quantified and obvious. I filled it.

## How the pipeline worked

The setup was straightforward. Claude Code read each PR's diff via the GitHub API, analyzed the code changes against Odoo framework conventions, and posted structured reviews. I reviewed the pipeline output and iterated on the prompts as quality patterns emerged.

The campaign covered sale-workflow (261 PRs), project (53), hr (46), bank-statement-import (39), timesheet (38), and web (3). Sale-workflow dominated because it had the largest unreviewed backlog.

## The results, honestly

I didn't trust self-assessment. When I first had the AI evaluate its own review quality, it came back at 98.6% valid. That number was garbage.

So I ran a second round: 40 independent validator instances, each reading actual PR diffs via `gh pr diff` and verifying every technical claim against the code. The corrected number: **68.9% fully valid**. Including partially valid reviews where some claims were correct but significant issues were missed: 90.9%.

The 30-point gap between self-assessment and independent validation is itself a finding worth its own post. But here's the quality breakdown:

| Verdict | Count | % |
|---------|-------|---|
| Fully valid | 303 | 68.9% |
| Partially valid | 97 | 22.0% |
| Rubber-stamp | 33 | 7.5% |
| Invalid | 4 | 0.9% |

34 false positives across 440 validated reviews. 4 fabricated claims out of roughly 2,000 total claims, a rate under 0.2%. And 2 harmful suggestions where following the advice would have made the code worse. One was high-severity: the AI recommended following a pattern from another module that itself had a bug.

## What the AI actually caught

6 genuine security findings. Portal sudo bypass. Cross-record token exposure on a public auth endpoint. getattr traversal. These weren't theoretical. They were in code heading toward production.

The AI consistently found bugs that prior human reviewers missed. On PR #3584, two prior approvals missed a `return True` inside a loop. On #3449, two prior approvals missed an `or`-to-`and` logic regression. On #3679, three prior approvals missed issues the AI flagged.

## What the AI got wrong

4 reviews were outright invalid. One reviewed the wrong version of the code entirely, describing 16.0 bugs on an 18.0 migration PR with variable names that didn't exist in the diff. One approved a fix that a maintainer corrected 15 minutes later. One flagged features as "missing" that had been intentionally removed per months of community consensus it hadn't read.

The rubber-stamp rate was 7.5%. These were PRs approved with no evidence the diff was actually read. Some were large migrations that got "clean migration, CI green, LGTM" and nothing else.

Quality improved over time, from 34% fully valid on early repos to 87% on mid-campaign work, then degraded back to 70% in later batches. Volume fatigue is real, even for AI pipelines.

## 138 PRs nobody else ever reviewed

This is the number that matters most to me: on 138 of the PRs I reviewed, the AI review was the only review the PR ever received. 30% of my reviews were the first and only external eyes on that code.

Some of those PRs had been sitting for months. Some for over a year. Contributors submitted work, waited, heard nothing, and eventually watched a stale bot close their effort.

The AI review wasn't perfect. But it was something. For those 138 PRs, the alternative wasn't a better review. The alternative was no review at all.

## The community response

"Stop."

Stefan Rijnhart flagged the campaign as "flooding PRs with non-contextual reviews." Tom Blauwendraat asked me to stop until policy was established. Akim Juillerat called the reviews "AI slop" after receiving 10+ notifications. Denis Roussel reported continued "flooding."

They weren't entirely wrong. The notification volume was real. Some reviews were shallow. The rubber-stamps were a legitimate quality problem.

But nobody had data on any of this before I ran the experiment. The "AI slop" label was applied before anyone measured whether the reviews were valid. When I measured, 69% were fully valid. 91% had at least some legitimate value. And 138 PRs got their first-ever review.

## What I learned

**Volume and quality are in tension.** The campaign started at 34% quality and climbed to 87% as the pipeline improved. Then it degraded back to 70% as I pushed volume. The optimal pace is slower than what's technically possible.

**Self-assessment is worthless.** 98.6% vs 68.9%. A 30-point gap. If you're using AI for anything consequential and not running independent validation, you're flying blind.

**Communities punish action more than inaction.** 28% of PRs getting zero reviews? Acceptable. 471 contributions dying unreviewed? Normal. AI reviews with a 69% validity rate filling the gap? Stop immediately. The asymmetry is real.

**The coverage crisis is the actual problem.** The debate about AI review quality is important but secondary. The primary crisis is that open source communities don't have enough reviewers. Period. The 28% zero-review rate didn't start when AI showed up. It was there the whole time. Nobody was panicking about it.

**Permission isn't always available.** There was no policy to comply with. There was no process to request permission through. There was only a gap and a community thread six months into discussion with no resolution. Sometimes you act and deal with the consequences.

---

The full quality audit, reviewer landscape analysis, and community discussion context are documented in detail. I'll be publishing the validation methodology, security findings, and lessons for AI-augmented teams in follow-up posts.

I ran an unauthorized experiment. The results weren't perfect. They were real. And for 138 PRs that had never gotten a single review, they were the only thing that happened.
