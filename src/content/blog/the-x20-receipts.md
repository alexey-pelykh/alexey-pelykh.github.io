---
title: "The x20 Receipts"
slug: the-x20-receipts
date: "2026-02-24"
excerpt: "One day proved nothing. A full week across three Max x20 accounts, 882 sessions, 4.1 billion tokens. The x20 multiplier held up — here are the receipts."
pillar: industry-commentary
tags:
  - AI
  - Claude Code
  - Developer Tools
  - Cost Analysis
---

## The Follow-Up

[Previously: The x20 Is Literal](/blog/the-x20-is-literal/)

A few days ago I shared a single day's data: Claude Code API costs versus the Max x20 subscription. One day, roughly $200 in API-equivalent compute, covered by a $200/month subscription. The x20 in the plan name appeared to be literal.

A single day proves nothing. So I ran it for a full week across three Max x20 accounts, working across multiple projects. Same conditions: real work, no stress test, no optimization for or against cost.

## The Numbers

**Activity**

| Metric | Value |
|--------|-------|
| Sessions | 882 |
| User Turns | 75,817 |
| API Requests | 39,825 |
| Tool Calls | 11,955 |

**Tokens**

| Metric | Value |
|--------|-------|
| Input | 2.1M |
| Output | 1.4M |
| Cache Write | 234.9M |
| Cache Read | 3.8B |
| Total | 4.1B |

**Cost by Model (API rates)**

| Model | Requests | Est. Cost |
|-------|----------|-----------|
| Opus 4.6 | 29,734 (74.7%) | $2,573.94 |
| Haiku 4.5 | 8,329 (20.9%) | $127.79 |
| Sonnet 4.6 | 1,360 (3.4%) | $76.72 |
| Sonnet 4.5 | 402 (1.0%) | $48.66 |
| **Total** | **39,825** | **$2,827.12** |

That's one week. Subscription cost: $600/month (3 x $200).

## The Math

$2,827 is one week of API-equivalent costs across three accounts. Extrapolated to a month: ~$12,241.

The subscription for those same three accounts: $600/month.

$12,241 / $600 = 20.4.

Per account: ~$942/week, or ~$4,080/month at API rates. The subscription is $200/month.

$4,080 / $200 = 20.4.

The x20 isn't a marketing label. It's what falls out of the arithmetic when you use the tool as a primary coding partner.

Annualized: roughly $49,000 per account at API rates versus $2,400 in subscription fees.

## The Cache Story

~5.9 billion tokens per account per month. That sounds dramatic. Look at the composition: the vast majority are cache reads - context that Claude Code efficiently reuses across conversation turns rather than retransmitting.

Cache reads for Opus 4.6 cost $0.50 per million tokens versus $5 per million for regular input. Without caching, this same week would cost several multiples of $2,827.

The subscription absorbs all of it.

## The Model Distribution

74.7% of requests went to Opus 4.6 - the most capable and most expensive model. For complex tasks like architecture decisions, multi-file refactoring, and debugging, Claude Code routes to Opus. For simpler tasks, it falls back to Haiku or Sonnet.

Opus accounts for 91% of the total estimated cost despite handling 75% of requests. For subscription users, this doesn't matter - flat rate. For API users, every Opus call carries premium pricing. That's the gap the subscription fills.

## What I Was Actually Doing

Not a benchmark. 882 sessions across three accounts, ten projects. Here's where the tokens went.

The biggest chunk — over a third — went to open-source work. Four OSS projects including [puppeteer-capture](https://github.com/nicholasgasior/puppeteer-capture), [lhremote](https://lhremote.org), [pcre4j](https://pcre4j.org), and one that's still pre-announcement. Feature development, debugging, release prep. The commits are public — go look.

Almost 18% went to Claude improving itself. Custom skills, agents, configuration — Claude Code building its own tooling. The tool that makes the tool better.

Another 18% went to a stealth startup. The rest split between personal brand operations (this very post), and household management — paperwork, recurring tasks, keeping life organized. Nearly 10% of compute went to things no one would call software engineering.

All through Claude Code — if I do something twice, I create a skill/command/agent.

## For Individual Developers

| Path | Cost |
|------|------|
| API rates | ~$4,080/month |
| Max x20 subscription | $200/month |
| Break-even | Less than one working day/month |

If you use Claude Code more than a few hours per month at serious intensity, the subscription is the right economic choice. Not close - an order of magnitude.

## For CTOs

| Team Size | Weekly API Cost | Monthly Subscription | Annual Savings |
|-----------|----------------|---------------------|----------------|
| 5 engineers | ~$4,710 | $1,000 | ~$233,000 |
| 10 engineers | ~$9,420 | $2,000 | ~$466,000 |
| 20 engineers | ~$18,840 | $4,000 | ~$932,000 |

These assume my usage intensity. Your team will vary. The point isn't precision - it's the order of magnitude.

## Caveats

- **Sample size of one.** All through Claude Code, multiple projects, primarily Opus-tier tasks.
- **Pricing will change.** AI tooling is in its land-grab phase. These numbers have a shelf life.
- **Subscription value depends on usage.** Light usage won't hit the 20:1 ratio. This data is for daily, sustained coding.
- **Cache rates depend on workflow.** Iterative coding with persistent context produces high cache rates. Ad-hoc usage would cost more per token.

## The Punchline

The x20 in "Max x20" still isn't a marketing label.

Here are the receipts.
