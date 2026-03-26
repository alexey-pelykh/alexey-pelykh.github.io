---
title: "53K Lines, 28 Days, $1,600: The Real Numbers Behind QontoCtl 1.0"
slug: qontoctl-1.0-the-numbers
date: "2026-03-26"
excerpt: "28 days ago QontoCtl didn't exist. Today: 53K lines of TypeScript, full Qonto API coverage, 69 MCP tools. Industry estimate: $1.9M. Actual cost: $1,597."
pillar: ai-architecture
tags:
  - AI
  - Open Source
  - CLI
  - MCP
  - TypeScript
---

## The Headline Numbers

28 days ago, QontoCtl didn't exist. Today it's at 1.0.0 with full Qonto banking API coverage. Here's the codebase:

| Metric | Value |
|--------|-------|
| TypeScript lines of code | 52,713 |
| Source files | 501 |
| Total lines (incl. blanks, comments) | 64,497 |
| Publishable packages | 5 |

I ran [scc](https://github.com/boyter/scc) on the repo. It estimates development cost using the COCOMO model, which factors in lines of code, complexity, and industry benchmarks for team-based development:

| COCOMO Estimate | Value |
|-----------------|-------|
| Cost to develop | $1,923,212 |
| Schedule effort | 17.63 months |
| People required | 9.69 |

What it actually took:

| Actual | Value |
|--------|-------|
| Cost | $1,597 in API costs |
| Time | 28 days |
| People | 1 |

These aren't projections. The cost is from Claude Code's usage tracking. The timeline is from git history. First commit: February 26, 2026.

## What Was Built

The [0.1 release](/blog/announcing-qontoctl/) covered the basics: organizations, accounts, transactions, statements, labels, memberships. 10 MCP tools. Read-only access via API keys.

1.0.0 covers everything Qonto exposes:

- **Account management** - create, update, close, IBAN certificates
- **SEPA beneficiaries** - add, update, trust/untrust
- **Transfers** - SEPA (with cancel, proof, verify-payee), internal, bulk, recurring, international
- **Client invoicing** - full lifecycle from create through finalize, send, mark-paid, cancel
- **Supplier invoices** - list, view, bulk-create
- **Quotes and credit notes**
- **Cards and insurance**
- **Payment links and webhooks**
- **Attachments** - upload, link to transactions
- **Teams and membership management**
- **E-invoicing settings**
- **International currencies and eligibility**

All of this through OAuth 2.0 with PKCE. Strong Customer Authentication handling for every write operation. Idempotency keys for safe retries. 69 MCP tools total. Same operations available as CLI commands and MCP tools, backed by one shared core library.

## How the Sausage Was Made

306 Claude Code sessions over 28 days. Here's the raw usage data:

| Metric | Value |
|--------|-------|
| Sessions | 306 |
| User turns | 37,004 |
| API requests | 23,399 |
| Tool calls | 9,113 |
| Total tokens | 2.47 billion |
| Estimated cost | $1,597 |

That's roughly 11 sessions per day, about 1,300 turns per day.

Here's the part that changes the economics: I didn't manually design the architecture for this project. I have a library of [Claude Code skills](https://docs.anthropic.com/en/docs/claude-code/skills) - reusable configuration files that encode how I approach software architecture. Monorepo structure, package boundaries, test strategy, API design patterns, security handling - these are captured as skills that Claude applies automatically when the project context matches.

The skills are the IP. Not this project's architecture specifically, but the architectural judgment encoded in a format that compounds across every project. When I start a new integration project, those skills kick in. The monorepo structure with Turborepo, the shared core library with thin CLI and MCP layers, the OAuth flow design, the Zod schemas for runtime validation - none of that was designed from scratch for QontoCtl. It was applied from patterns I've refined across dozens of projects.

Each new Qonto API domain followed a pattern: read the API docs, design the service layer, implement CLI commands, implement MCP tools, write tests. Once the pattern was established for one domain, Claude applied it across dozens more. Consistent internal patterns multiply AI productivity the same way they multiply human productivity, just faster.

The gap between "decide what to build" and "it exists and is tested" is where this setup changes the math. And the skills library is what makes it repeatable.

## The Multiplier Nobody Measures

Here's what COCOMO doesn't account for: third-party API quality.

Qonto's API team built an API that's clean, consistent, and well-documented across every domain. Same patterns everywhere. Predictable naming. Coherent pagination. Consistent error handling.

This matters more than people realize for AI-augmented development. When patterns are consistent, the AI learns them once and applies them across dozens of domains correctly. When documentation is accurate, the implementation matches the spec on the first pass. When error handling follows conventions, you don't spend cycles debugging inconsistencies.

I've built integrations against APIs with inconsistent naming, undocumented edge cases, pagination that works differently per endpoint. That friction multiplies with AI tooling - every inconsistency becomes a correction cycle instead of a generation cycle.

Qonto's API had none of that. Full coverage in 28 days was possible because the API was built right.

## What This Data Shows (And Doesn't)

One data point isn't a trend. Here's what I think is defensible:

**What the data supports:**

- A single experienced architect with a reusable skills library can ship production-grade software at a pace that would have required a team 18 months ago
- The economics of "is this worth building?" change when implementation cost drops by two orders of magnitude
- API/SDK-shaped projects - well-defined interfaces, systematic patterns, comprehensive test coverage - are particularly well-suited to AI-augmented development
- The real IP isn't in the code. It's in the skills that generate the code. Those compound across projects
- Third-party API quality is a force multiplier that compounds with AI tooling

**What it doesn't:**

- COCOMO models team dynamics, communication overhead, organizational friction. A single expert would never hit $1.9M even without AI. The honest baseline for a solo expert is probably $150K-200K worth of effort - still a 100:1 ratio against $1,600, just not 1,200:1
- This doesn't generalize to all software. Integration projects with well-defined external contracts are the best case. Novel algorithm design, ambiguous requirements, or coordination-heavy systems would show different ratios
- The human is not optional. The skills library encodes architectural judgment built over years. AI multiplies that judgment. It doesn't replace it

The question this data raises isn't "will AI replace developers?" That framing misses the point. The question is: what becomes worth building when the implementation cost drops by two orders of magnitude? What tools, integrations, and products were previously "not worth the engineering effort" that now make sense?

QontoCtl exists because the answer to "should someone build a full CLI and MCP server for Qonto's API?" changed from "it would take a team months" to "I can do this in February."

## Try It

QontoCtl is open source under AGPL-3.0. CLI tool or MCP server usage carries no license obligations.

[https://github.com/alexey-pelykh/qontoctl](https://github.com/alexey-pelykh/qontoctl)

---

*P.S. The $1,597 is the pay-as-you-go API estimate. I'm on Claude Max x20 ($200/month), and this project consumed roughly 30% of it. Actual out-of-pocket: ~$60.*
