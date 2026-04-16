---
title: "What AI Catches That Humans Miss in Code Review - And Vice Versa"
slug: ai-catches-vs-misses-code-review
date: "2026-04-16"
excerpt: "449 AI code reviews produced hard data on where AI and humans diverge as reviewers. AI found security bugs that 3 prior human approvals missed. It also flagged intentionally removed features as 'missing' because it didn't read the PR discussion. The complementary model isn't AI vs human. It's AI first, human second."
pillar: ai-architecture
tags:
  - AI
  - Code Review
  - Open Source
  - Software Architecture
---

## What AI Catches That Humans Miss in Code Review - And Vice Versa

Most debates about AI code review stay theoretical. "AI can't understand context." "AI catches things humans miss." "AI generates slop."

I have 449 data points that move past the speculation.

Between February 24 and March 4, 2026, I ran an AI-assisted code review campaign across 6 OCA (Odoo Community Association) repositories. Every review was independently validated against the actual code diffs by 40 separate AI validators. The result: a detailed picture of where AI excels, where it fails, and where the two approaches complement each other.

### Where AI excels

#### Security surface scanning

The AI caught 6 genuine security vulnerabilities that human reviewers missed. These weren't theoretical concerns. They were in code heading toward production in widely-used open source modules.

**Portal sudo bypass** (timesheet #857): A controller endpoint called `sudo()` without restricting access, allowing any portal user to access arbitrary project records. No human reviewer flagged it.

**Cross-record token exposure** (project #1599): An endpoint with `auth=public` accepted tokens that could be used to access records belonging to other users. The security surface was non-obvious because the auth decorator looked standard.

**getattr traversal** (sale-workflow #3664): A review with 19 findings identified an `getattr` call that could be exploited for attribute traversal. This was part of the AI's strongest single review across the entire campaign.

**`.sudo(user)` migration gap** (timesheet #881): During a version migration, a `.sudo(user)` call wasn't properly converted, leaving an elevation path in the portal layer.

The pattern: AI excels at scanning every code path for security-relevant patterns. Human reviewers tend to focus on the functional logic and skip the security surface, especially on familiar modules.

#### Catching what multiple human approvers missed

This is the data point that surprised me most. Multiple PRs had been reviewed and approved by experienced human maintainers, and the AI still found bugs they all missed.

**PR #3679**: Three prior human approvals. The AI found that `api.Environment.manage()` had been removed in Odoo 16.0, making the migration code reference a non-existent API. Three reviewers signed off on it.

**PR #3449**: Two prior human approvals missed an `or`-to-`and` logic regression. A boolean condition that should have used `and` was using `or`, changing the filtering behavior entirely. The AI caught it.

**PR #3584**: Two prior human approvals missed a `return True` inside a `for` loop. Only the first line item was being processed. The rest were silently skipped.

**PR #3760**: A critical procurement skip bug where `_action_launch_stock_rule` returns `True` for the entire batch when any single line is a byproduct. No prior reviewer caught it.

These aren't obscure edge cases. They're logic bugs that change program behavior. The AI found them because it reads every line systematically. Humans skim, especially on large diffs from trusted contributors.

#### Consistent coverage

The AI reviewed all 449 PRs. Every one got the same level of structural analysis: architecture, test coverage, security, migration patterns, dependency checks.

Human review coverage in these same repositories was uneven. 28% of PRs received zero reviews. 984 were merged without any formal review trail. The AI didn't solve the depth problem, but it eliminated the coverage gap for the PRs it touched.

Contributors noticed. Multiple PR authors pushed fixes directly in response to AI review feedback, confirming the reviews were actionable enough to act on without waiting for a human to weigh in.

### Where AI fails

#### Reading the room

**PR #3819**: The AI flagged features as "missing" that had been intentionally removed. Months of maintainer discussion in the PR thread had established consensus to remove those features. The AI didn't read the PR discussion. It reviewed the diff in isolation, saw code removed, and flagged it as a regression.

This is AI's single biggest limitation as a reviewer. Code review isn't just about the code. It's about the conversation around the code. Why was this change made? What did the community agree on? What prior attempts were tried and rejected? The AI has no access to that context unless someone feeds it in.

#### Recommending buggy patterns

**Project #1583**: The AI recommended "aligning with the purchase module pattern" for a computation method. The purchase module had the actual bug. It was putting `price_subtotal` in a `groupby` position, treating it as a group key instead of summing it. Following the AI's advice would have introduced incorrect totals.

This is a different failure mode from hallucination. The AI correctly identified a pattern from another module. The pattern was real. The pattern was also wrong. The AI couldn't evaluate whether the reference implementation was correct because it treated existing code as authoritative.

#### Fabricating observations on large diffs

**Timesheet #748**: The AI described a `pre_init_hook` performance pattern with confidence. No `pre_init_hook` exists anywhere in the 7,362-line diff. The AI generated a plausible technical description from training knowledge instead of reading what was actually there.

**Timesheet #830**: The AI claimed "tests pass." Zero tests exist. Codecov was failing. The AI pattern-matched: most modules have tests, so tests probably pass.

**HR #1462**: All three bug descriptions cite variable names (`qty_initial`, `qty_done`) from version 16.0 source code. The PR is an 18.0 migration. The AI reviewed code it had memorized, not code in the diff.

Large diffs are the trigger. When diffs exceed several thousand lines, the AI's attention degrades. It substitutes what it expects to see for what's actually there. The fabrication rate was low (4 claims out of ~2,000, under 0.2%), but each fabrication was confidently stated and would have passed self-assessment.

#### Rubber-stamping at scale

33 reviews (7.5%) approved PRs with no evidence the diff was read. The worst: a 7,538-line diff that got "LGTM" (Looks Good To Me) and nothing else. A typo was found in that same code 4 months later, proving the code hadn't been read at approval time.

Diff size inversely correlated with review depth. PR #4163, a 3,500-line new module, was approved with no inline comments while ignoring 13 existing substantive review comments from a community reviewer posted a week prior.

The AI treated large migrations as low-risk by default. "Clean migration, CI green, LGTM." Migrations are where the hardest bugs hide.

#### Inconsistency across identical code

PRs #4135 and #4136 contained identical code (a forward-port pair). The AI flagged `float_compare` precision concerns on one and approved the other without mentioning it. Same code, different treatment, no explanation.

This inconsistency undermines trust. If the AI's assessment depends on which batch a PR lands in rather than the code itself, the signal is unreliable.

#### Soft language on blocking issues

At least 5 reviews identified genuine blocking issues but used COMMENTED instead of CHANGES_REQUESTED. A `return True` inside a loop that breaks all processing? COMMENTED. A missing `@api.depends` that prevents field updates? COMMENTED.

The AI was calibrated to be polite rather than firm. In code review, soft language on a real blocker means the issue gets ignored. CHANGES_REQUESTED exists for a reason.

### The complementary model

The data points to a clear division of labor.

**AI first pass**: Security surface scanning, style consistency, migration pattern verification, test coverage checks, dependency analysis. These are systematic, pattern-based tasks where coverage matters more than depth. The AI will review every PR, every file, every path. Humans won't.

**Human second pass**: PR discussion context, domain-specific conventions, evaluating whether referenced patterns are actually correct, judgment calls on architectural trade-offs, deciding if "tests pass" is a fact or an assumption.

The model isn't "AI or human." It's "AI catches the surface that humans skip, then humans add the judgment that AI lacks."

#### What this looks like in practice

1. AI reviews every PR for security patterns, style violations, test coverage, migration completeness, and obvious logic bugs.
2. AI flags findings with evidence but does NOT issue final verdicts on large or context-dependent PRs.
3. Human reviewers start from the AI's findings instead of a blank diff. They add context, validate or dismiss flags, and make the judgment calls.
4. AI findings that reference patterns from other modules get verified against those modules before being acted on.
5. Any AI claim about test status gets verified against actual CI output.

#### The economics

At 15 minutes per review, the 449-PR campaign represents 112 hours of review work. OCA's top human reviewer does 290 PRs in his best year. The AI campaign did 449 in 9 days.

The question isn't whether AI reviews are as good as human reviews. They're not. The question is whether imperfect AI coverage is better than no coverage. For the 138 PRs where the AI review was the only review the PR ever received, the answer is obvious.

### The uncomfortable takeaways

**AI finds real bugs that experienced humans miss.** Three prior approvals on PR #3679. Two on #3449. Two on #3584. These aren't junior reviewers. These are maintainers who've been reviewing code for years. The AI caught what they missed because it reads every line instead of pattern-matching on familiarity.

**AI also generates confident nonsense.** A non-existent hook described in detail. "Tests pass" with no tests. Variable names from the wrong version of the codebase. Confidence and correctness are uncorrelated.

**The biggest AI failure is social, not technical.** Not reading PR discussions. Not engaging with prior reviewer feedback. Not understanding that removed code was removed on purpose. The technical analysis can be excellent while the review is still invalid because it ignored the human context around the code.

**Diff size is the reliability boundary.** Below a few thousand lines, AI reviews are strong. Above that threshold, rubber-stamps and fabrications spike. Know where the AI's attention breaks down.

**Neither AI nor human review is sufficient alone.** Humans miss surface-level bugs because they skim. AI misses context-dependent issues because it can't read the room. The combination covers more ground than either approach solo.

The tooling for this complementary model doesn't fully exist yet. But the data from 449 reviews makes the case clearly: the future of code review isn't choosing between AI and human reviewers. It's figuring out the handoff between them.
