---
title: "How Communal Is OCA Review, Really?"
slug: oca-review-independence
date: "2026-07-09"
excerpt: "OCA's merge bot doesn't count approvals. I measured who actually reviews the code across 68,000 merged pull requests. Self-review scales with company size. The mechanism is measurable. The motive is not."
pillar: eng-economics
tags:
  - Odoo
  - OCA
  - Open Source
  - Code Review
  - Governance
---

The Odoo Community Association ships one of the largest open-source libraries in business software. Thousands of addons, 261 repositories, tens of thousands of merged pull requests keeping accounting, inventory, HR, and e-commerce modules alive across dozens of Odoo versions.

I contribute to OCA myself, so I wanted to know one thing about all of it. When a change gets merged, who signed off?

The answer starts with a surprise in the tooling.

## The bot doesn't count approvals

OCA merges through a bot. You comment `/ocabot merge` on a green pull request and it goes in. So I read what the bot actually checks.

It checks two things. That CI is green, and that the person triggering the merge has push access or is a declared maintainer of the modules the PR touches. That is the entire gate.

It does not count approvals. There is an `APPROVALS_REQUIRED` setting, and it defaults to 2, but all it does is set a label. The merge task never reads it. The contributing guide asks for at least one review from someone with write access. That request lives in prose, not in code.

Merge rights are not open to everyone. To trigger `/ocabot merge` at all, you need repo write access or you have to be a declared maintainer of every module the PR touches. Anyone else gets turned away. But for the people who clear that bar, the bot asks nothing about who reviewed the change. A maintainer can merge their own pull request into OCA with zero outside approval, and the tooling permits it. The question was never whether that is possible. It is how often it happens, and under what conditions.

## What I measured

Every merged pull request across all 261 OCA repositories. 68,214 of them. For each one: who approved it, what company that reviewer belonged to, and whether that matched the author's company. My own contributions are in there, measured no differently.

There is a tension at the root of this. OCA's charter says contributors take part as individuals, so that "affiliations do not cloud the personal contributions." That is the ideal. This measures whether, in practice, they do. If affiliation truly did not matter, the company a contributor works for would not predict who reviews their code. It does.

Attributing a GitHub login to an employer takes triangulation. Profile company field first, then commit-email domains, username conventions, and public org membership. It resolves 79.3% of merged PRs to an author company. The rule for the rest is deliberately conservative: a login I cannot resolve is never counted as sharing anyone's company. Misattribution can only push the figures down.

One correction up front. GitHub's review API did not exist before September 2016, so pull requests merged before then carry no review data at all. Including them would invent a fake "nobody reviewed anything" prehistory. Every figure below is over PRs merged in 2017 or later, where the record is complete. That is 61,337 merges and 96,231 approvals.

The full method and the code that produces every number are public. More on that at the end.

## Self-review scales with company size

This is the finding.

Group each contributing company by how many distinct people it has sent to OCA, then ask: of the PRs that got any review, what share were approved only by the author's own colleagues?

| Company size | Self-reviewed share of reviewed PRs |
|---|---|
| 1 person | 0.1% |
| 2–4 | 3.8% |
| 5–9 | 15.1% |
| 10–19 | 16.1% |
| 20+ | 55.6% |

The gradient is clean and it points one way. A one-person company cannot self-review. It has no colleague to approve the work. A large company can, and the data says the larger it gets, the more of its own work it signs off on internally. At the top of the scale, more than half of all reviewed changes never see an approver from outside the author's own payroll. These are floors, not ceilings. The unresolved fifth of reviewers never count as insiders, so the true rates only run higher.

## The work is highly concentrated

634 companies contribute code. The top five write 48% of it, and just six account for half of everything authored. On the review side, 496 companies cast approvals, and the top five cast 51% of them. On both axes the Gini coefficient sits above 0.9, where 1.0 would mean a single company did everything.

Concentration like this is normal for mature open source. It matters here for one reason: the companies most capable of self-reviewing are the same ones doing most of the work.

## Independent review eroded, then partly recovered

In 2017, 67.5% of merged PRs had an approver from an outside company. That share slid gradually through 2021, dropped sharply in 2022, and bottomed at 40.8% in 2023. It has climbed back since, to 47.8% in 2025. (2026 is only a partial year, so I am leaving its number out of the trend.)

Independent review used to be the clear norm in OCA. For the last four years it has hovered near a coin flip.

## Most of this is legitimate

A weaker analysis would stop here and name a villain. The data does not support one, and I checked.

OCA grants module maintainers merge rights over the modules they maintain. A company approving its own PR on a module it maintains is doing exactly what the governance model intends. Calling that "capture" would be wrong.

So I went down a level. For every merge with no outside approval, I pulled the specific modules it touched and compared the author's company against each module's declared maintainers. Then I did it again at the exact merge commit of each PR, not just today's manifest, so a company that became a maintainer later could not launder its history.

The result splits three ways. Around 37% of no-outside-review merges are a company's own maintained modules, which is legitimate. Around 50% touch modules that declare no maintainer at all. Only about 14% touch another company's declared turf.

And once maintainership is credited, no single company stands out. Tecnativa is the largest contributor by volume, with over 10,000 merged PRs. Of the ones that got any review, roughly two-thirds were approved only by its own people. Yet just 5.8% of its merges land on modules it does not maintain. That is not a company capturing other people's work. That is a company maintaining a very large amount of its own.

## What this says, and what it doesn't

This measures provenance. Who approved a change. It says nothing about the quality of the change, the intent behind it, or whether anyone pushed an agenda. A self-reviewed patch can be excellent. An independently-reviewed one can be junk. I am not claiming any company games review to serve itself, because this data cannot show that, and I will not dress it up as if it could.

There is also what I could not see. I count formal approvals, not the comments and change-requests where plenty of real review happens. A change an outside engineer picked apart in comments, but never formally approved, still reads here as self-reviewed. Read these as rates of formal sign-off, not of every eyeball on the code.

What it does show is structural, and it is enough on its own. OCA's independent-review norm is unenforced by the tooling. It thins out as companies grow. The largest firms review far more of their own work internally, and nothing in the merge path stops them.

Whether that is fine, or a problem worth changing the merge bot over, is a governance question for OCA. This data doesn't answer it. It measures it.

## Why the code is public too

Numbers about a community, with company names attached, should be checkable by that community.

So the whole pipeline is open. Collection, company attribution, analysis, the aggregate dataset, and a methodology that documents its own four corrections. Because the first-pass numbers were wrong in four different ways, each caught and fixed before this went out, and a method that hides its own mistakes is not one you should trust. Clone it, re-run it against live GitHub, and disagree with me in public if the numbers move.

[github.com/alexey-pelykh/oca-review-independence](https://github.com/alexey-pelykh/oca-review-independence)

Independent review holds for most of OCA, but it thins out at scale, and the largest firms review far more of their own work internally. That is not an accusation. It is a measurement.
