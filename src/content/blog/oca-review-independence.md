---
title: "How Communal Is OCA Review, Really?"
slug: oca-review-independence
date: "2026-07-09"
excerpt: "OCA's merge bot doesn't count approvals — so I measured who actually reviews the code across 68,000 merged pull requests. Five companies wrote nearly half of it, and the biggest self-reviews two-thirds of its own work. The mechanism is measurable. The motive is not."
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

## A handful of companies hold the keys

OCA's charter says its contributors take part as individuals. Count the merged code by company anyway, and the individualism is hard to find.

634 companies have contributed. Five of them wrote almost half of everything.

| Company | Merged PRs |
|---|---|
| Tecnativa | 10,148 |
| ForgeFlow | 4,646 |
| Akretion | 4,006 |
| Camptocamp | 2,308 |
| Acsone | 2,306 |

Tecnativa alone has authored more than 10,000 merged pull requests — over double the next contributor, and better than a fifth of every merge the analysis could trace to a company. The top five account for 48% of all authorship; six companies for half of it. On the review side it is just as concentrated: five companies cast 51% of every approval. Both Gini coefficients sit above 0.9, where 1.0 would mean a single company did everything. (Attribution is by GitHub organization name, and a few firms contribute under more than one, so these per-name totals run conservative.)

Concentration like this is normal for mature open source. It matters here for one reason: the companies most able to review their own work — the ones with the colleagues, the write access, and the maintainer seats — are the same handful producing most of the work. So do they?

## They review a lot of their own work

Group every contributing company by how many distinct people it has sent to OCA, then ask: of the PRs that got any review, what share were approved only by the author's own colleagues?

| Company size | Self-reviewed share of reviewed PRs |
|---|---|
| 1 person | 0.1% |
| 2–4 | 3.8% |
| 5–9 | 15.1% |
| 10–19 | 16.1% |
| 20+ | 55.6% |

The gradient is clean and it points one way. A one-person company cannot self-review — it has no colleague to approve the work. A large one can, and the larger it gets, the more of its own work it signs off internally. At the top of the scale, more than half of all reviewed changes never see an approver from outside the author's own payroll. These are floors, not ceilings: the unresolved fifth of reviewers never count as insiders, so the true rates only run higher.

Put the biggest name to it. Tecnativa self-reviews two-thirds of its reviewed pull requests. 66.7%. On its face, that is the capture story writing itself.

It isn't. And the reason it isn't is the most important measurement here.

## Most of it is legitimate maintenance

OCA grants module maintainers merge rights over the modules they maintain. A company approving its own PR on a module it maintains is doing exactly what the governance model intends. Calling that "capture" would be wrong.

So I went down a level. For every merge with no outside approval, I pulled the specific modules it touched and compared the author's company against each module's declared maintainers. Then I did it again at the exact merge commit of each PR, not just today's manifest, so a company that became a maintainer later could not launder its history.

The result splits three ways. Around 37% of no-outside-review merges are a company's own maintained modules. Around 50% touch modules that declare no maintainer at all. Only about 14% touch another company's declared turf.

And once maintainership is credited, no single company stands out. The biggest, least of all. Of Tecnativa's 10,000-plus merges, just 5.8% land on modules another company maintains. Two-thirds self-reviewed, and almost none of it on anyone else's turf. That is not a company capturing other people's work. It is a company reviewing a very large amount of its own.

## Independent review eroded, then partly recovered

In 2017, 67.5% of merged PRs had an approver from an outside company. That share slid gradually through 2021, dropped sharply in 2022, and bottomed at 40.8% in 2023. It has climbed back since, to 47.8% in 2025. (2026 is only a partial year, so I am leaving its number out of the trend.)

Independent review used to be the clear norm in OCA. For the last four years it has hovered near a coin flip.

## What this says, and what it doesn't

This measures provenance. Who approved a change. It says nothing about the quality of the change, the intent behind it, or whether anyone pushed an agenda. A self-reviewed patch can be excellent. An independently-reviewed one can be junk. I am not claiming any company games review to serve itself, because this data cannot show that, and I will not dress it up as if it could.

There is also what I could not see. I count formal approvals, not the comments and change-requests where plenty of real review happens. A change an outside engineer picked apart in comments, but never formally approved, still reads here as self-reviewed. Read these as rates of formal sign-off, not of every eyeball on the code.

What it does show is structural, and it is enough on its own. A handful of companies hold most of the keys to OCA. They review much of their own work — legitimately, on modules they maintain — and OCA's independent-review norm is unenforced by the tooling. Nothing in the merge path would stop them if that work were someone else's.

Whether that is fine, or a problem worth changing the merge bot over, is a governance question for OCA. This data doesn't answer it. It measures it.

## Why the code is public too

Numbers about a community, with company names attached, should be checkable by that community.

So the whole pipeline is open. Collection, company attribution, analysis, the aggregate dataset, and a methodology that documents its own four corrections. The first-pass numbers were wrong in four different ways, each caught and fixed before this went out. A method that hides its own mistakes is not one you should trust. Clone it, re-run it against live GitHub, and disagree with me in public if the numbers move.

[github.com/alexey-pelykh/oca-review-independence](https://github.com/alexey-pelykh/oca-review-independence)

The keys to OCA sit with a handful of companies. They review a great deal of their own work, and the tooling would not stop them if that work were anyone else's. It mostly isn't — I checked. Independent review still holds across most of OCA, but it thins out exactly where the work concentrates. That is not an accusation. It is a measurement.
