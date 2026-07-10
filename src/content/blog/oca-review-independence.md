---
title: "How Communal Is OCA Review, Really?"
slug: oca-review-independence
date: "2026-07-09"
excerpt: "OCA's merge bot never counts approvals, so its review norm is unenforced. Across 68,000 merged pull requests: five companies hold the keys, they review much of their own work, and independent review has thinned to a coin flip. Concentrated and unenforced — not captured."
pillar: eng-economics
tags:
  - Odoo
  - OCA
  - Open Source
  - Governance
  - Code Review
  - Data
---

The Odoo Community Association ships one of the largest open-source libraries in business software. Thousands of addons, 261 repositories, tens of thousands of merged pull requests keeping accounting, inventory, HR, and e-commerce modules alive across dozens of Odoo versions.

I contribute to OCA myself, so I wanted to know one thing about all of it. When a change gets merged, who signed off?

The answer starts with a surprise in the tooling.

## The bot doesn't count approvals

OCA merges through a bot. You comment `/ocabot merge` on a green pull request and it goes in. So I read what the bot actually checks.

It checks two things. That CI is green, and that the person triggering the merge has push access or is a declared maintainer of the modules the PR touches. That is the entire gate.

It does not count approvals. There is an `APPROVALS_REQUIRED` setting, and it defaults to 2, but all it does is set a label. The merge task never reads it. The contributing guide asks for at least one review from someone with write access. That request lives in prose, not in code.

Merge rights are not open to everyone. To trigger `/ocabot merge` at all, you need repo write access or you have to be a declared maintainer of every module the PR touches. Anyone else gets turned away. But for the people who clear that bar, the bot asks nothing about who reviewed the change. A maintainer can merge their own pull request into OCA with zero outside approval, and the tooling permits it. So OCA's review norm is a convention, not a gate. The question is how much the convention holds — and where it doesn't.

## What I measured

Every merged pull request across all 261 OCA repositories. 68,214 of them. For each one: who approved it, what company that reviewer belonged to, and whether that matched the author's company. My own contributions are in there, measured no differently.

There is a tension at the root of this. OCA's charter says contributors take part as individuals, so that "affiliations do not cloud the personal contributions." That is the ideal. This measures whether, in practice, they do. If affiliation truly did not matter, the company a contributor works for would not predict who reviews their code. It does.

Attributing a GitHub login to an employer takes triangulation. Profile company field first, then commit-email domains, username conventions, and public org membership. It resolves 79.3% of merged PRs to an author company. The rule for the rest is deliberately conservative: a login I cannot resolve is never counted as sharing anyone's company. Misattribution can only push the figures down.

One correction up front. GitHub's review API did not exist before September 2016, so pull requests merged before then carry no review data at all. Including them would invent a fake "nobody reviewed anything" prehistory. Every figure below is over PRs merged in 2017 or later, where the record is complete. That is 61,337 merges and 96,231 approvals.

The full method and the code that produces every number are public. More on that at the end.

## A handful of companies hold the keys

OCA's charter says its contributors take part as individuals. Count the merged code by company anyway, and the individualism is hard to find. 634 companies have contributed. Five of them wrote almost half of everything.

| Company | Merged PRs | Self-review rate\* | On others' turf\*\* |
|---|---|---|---|
| Tecnativa | 10,148 | 66.7% | 5.8% |
| ForgeFlow | 4,646 | 28.3% | 2.2% |
| Akretion | 4,006 | 8.4% | 0.8% |
| Camptocamp | 2,308 | 11.5% | 3.3% |
| Acsone | 2,306 | 8.3% | 1.9% |

\* Share of the company's *reviewed* PRs approved only by its own people. \*\* Share of its own PRs merged with no outside review onto a module another company maintains.

Tecnativa authored more than 10,000 merged pull requests — over double the next contributor, and better than a fifth of every merge the analysis could trace to a company. The top five account for 48% of all authorship; six companies for half. Five companies cast 51% of every approval, and both Gini coefficients sit above 0.9, where 1.0 would mean one company did everything. (Attribution is by GitHub organization name, and a few firms contribute under more than one, so these per-name totals run conservative.)

None of this is capture, and the last column is why. Tecnativa's two-thirds self-review looks alarming until you read across the row: only 5.8% of its merges land on a module anyone else maintains. Heavy self-review is what you get when a company reviews the modules it owns, not when it reaches onto someone else's. The rate is not even uniform. Camptocamp, just as large, stays near one in nine. Size lets a company review itself; it does not make it. Across the table the turf figure never leaves the low single digits. The heaviest self-reviewers are the heaviest maintainers, reviewing the modules they own. That is the governance model working as intended.

## Most of it is legitimate maintenance

That "on others' turf" column is doing a lot of work. OCA grants module maintainers merge rights over the modules they maintain, and a company approving its own PR on a module it maintains is doing exactly what the model intends. So for every merge with no outside approval, I pulled the modules it touched and compared the author's company against each module's declared maintainers. Then I did it again at the exact merge commit of each PR, not today's manifest — so a company that became a maintainer later couldn't make its past self-reviews look independent.

Across every no-outside-review merge, the split comes out around 37% on the company's own maintained modules, 50% on modules that declare no maintainer at all, and only about 14% on another company's declared turf. That 14% is the whole of what could even be called encroachment, and once maintainership is credited, no major contributor stands out. The self-review is real. It is mostly companies reviewing their own code.

## Self-review scales with company size

The named five are visible because they are big. Widen to all 634 companies and the same pull is a gradient. Group each by how many distinct people it has sent to OCA, then ask what share of its reviewed PRs were approved only by its own colleagues.

| Company size | Self-reviewed share of reviewed PRs |
|---|---|
| 1 person | 0.1% |
| 2–4 | 3.8% |
| 5–9 | 15.1% |
| 10–19 | 16.1% |
| 20+ | 55.6% |

A one-person company cannot self-review; it has no colleague to approve the work. A large one can, and on average the larger it gets, the more of its own reviewed work it signs off internally, until past twenty people more than half of it never sees an outside approver. These are floors, not ceilings: the unresolved fifth of reviewers never count as insiders, so the true rates only run higher. Nothing here is a rule being broken. Every one of these merges cleared the bot. That is the point.

## Independent review used to be the norm. Now it's a coin flip.

If one measurement answers the headline, it is this one. In 2017, 67.5% of merged PRs had an approver from an outside company. That share slid through 2021, dropped sharply in 2022, and bottomed at 40.8% in 2023. It has recovered to 47.8% in 2025, but the norm it used to be is gone. (2026 is a partial year, left out of the trend.)

Independent review was once how OCA worked, the clear majority of the time. For the last four years it has been a coin flip. And it thins fastest exactly where the code concentrates, in the handful of companies large enough to review their own.

## What this measures, and what it doesn't

This measures provenance. Who approved a change. It says nothing about the quality of the change, the intent behind it, or whether anyone pushed an agenda. A self-reviewed patch can be excellent. An independently-reviewed one can be junk. I am not claiming any company games review to serve itself, because this data cannot show that, and I will not dress it up as if it could.

There is also what I could not see. I count formal approvals, not the comments and change-requests where plenty of real review happens. A change an outside engineer picked apart in comments, but never formally approved, still reads here as self-reviewed. Read these as rates of formal sign-off, not of every eyeball on the code.

## Why the code is public too

Numbers about a community, with company names attached, should be checkable by that community.

So the whole pipeline is open. Collection, company attribution, analysis, the aggregate dataset, and a methodology that documents its own four corrections. The first-pass numbers were wrong in four different ways, each caught and fixed before this went out. A method that hides its own mistakes is not one you should trust. Clone it, re-run it against live GitHub, and disagree with me in public if the numbers move.

[github.com/alexey-pelykh/oca-review-independence](https://github.com/alexey-pelykh/oca-review-independence)

So, how communal is OCA review, really? Communal by charter, not by code. A handful of companies hold the keys, and they review a great deal of their own work — legitimately, on the modules they maintain. But the merge bot never asks who reviewed a change, so the "at least one review" norm is a convention, not a gate, and independent review has thinned to a coin flip exactly where the work concentrates. Concentrated and unenforced, not captured. That is not an accusation. It is a measurement — of a communal norm that lives in prose, not in code, and has been eroding while nobody counted.
