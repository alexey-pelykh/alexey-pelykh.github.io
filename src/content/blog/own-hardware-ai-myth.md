---
title: "The 'Own Hardware for AI' Myth"
slug: own-hardware-ai-myth
date: "2026-06-15"
excerpt: "17.7 billion tokens in two weeks. $15,027.63 at API list prices, about $30K a month at that pace. Actual cost: $800. I ran the full math on buying GPUs instead - context, concurrency, utilization - and the hardware isn't close."
pillar: eng-economics
tags:
  - AI
  - Infrastructure
  - Engineering Economics
  - LLM
---

In the last two weeks of April, my AI tooling consumed 17.7 billion tokens. At Anthropic's API list prices, that fortnight of compute is worth a hair over $15,000 - call it $30,000 a month at the same pace. I paid $800.

Every "stop renting intelligence, buy your own GPUs" thread I read falls apart on contact with this workload. So I ran the numbers properly: my measured usage profile against GPU rental prices, on-premise TCO, and the best open-weight models available in June 2026. The hardware loses, and not by a little. The reasons it loses are more interesting than the price tag.

## The workload

All figures below are measured from complete local session logs, April 16-30, 2026. Personal projects only, employer work excluded. Monthly numbers are that pace doubled - and the weeks after this window ran hotter, not cooler, so the extrapolation is the conservative read. Pricing basis: Anthropic list as of June 2026 ($5/$25 per million input/output tokens, $6.25 cache writes, $0.50 cache reads). External prices and benchmarks throughout are as of June 12, 2026.

| Metric | Measured (15 days) |
|--------|--------------------|
| Sessions | 1,886 (126/day) |
| User-side messages (incl. tool results) | 121,343 |
| API requests | 76,546 |
| Total tokens (input + output + cache) | 17.7B |
| Cache hit rate | 95.8% |
| Peak context in a single session | 964K tokens |
| Peak concurrent sessions | 15 |
| Active time | 4,251 of 21,600 minutes (19.7%) |
| Model mix | 96% Opus 4.7 (the current model that fortnight) |
| API-equivalent cost | $15,027.63 |

About a third of that compute went into [RemoteClaw](https://github.com/remoteclaw/remoteclaw), the AI agent middleware I maintain. The rest spread across 50+ repos: open-source libraries like [PCRE4J](https://github.com/alexey-pelykh/pcre4j) and [lhremote](https://github.com/alexey-pelykh/lhremote), infrastructure, automation, writing, even household paperwork.

This is interactive agentic work. Claude Code sessions doing architecture, implementation, review, in parallel, on demand. Not batch jobs. That shape matters more than the volume, and the whole argument below comes down to it.

## What $30K actually means

The headline number is the part everyone gets wrong in both directions.

$30,055 a month is not what Anthropic charges me. It's what the same tokens would bill at API list prices: the value of compute consumed. The actual bill is four Claude Max 20x subscriptions at $200 each, because the usage limits on one account can't hold this volume. $800 a month, a 97.3% discount against list. That was April's terms; Anthropic changes part of this on June 15, and I'll get to it.

The token mix is the first clue about what this workload actually is. It's prefill-dominated: for every token the model writes, it reads 216. And 95.8% of those reads hit Anthropic's prefix cache, billed at $0.50 per million tokens instead of the $5.00 input rate. Without the cache discount, the same traffic would bill roughly $90K for the fortnight - six times the headline, around $180K a month.

Hold that thought. Prefix caching itself is a config flag in vLLM or SGLang, and a single tenant re-reading his own session prefixes is the easy case - the hit rate is in the workload, not in some Anthropic magic. What the $30K figure nets out is the discount for it. What self-hosting has to replicate is keeping that cache alive: across restarts, across eviction, across whatever capacity holds it. That thread gets pulled at wall two.

## Wall one: context

My sessions peak at 964K tokens of context. Not as a stunt - as a Tuesday. Long agentic sessions accumulate repository state, tool outputs, conversation history, and the model has to keep reasoning over all of it.

Until this spring, the answer was blunt: no open-weight model served that depth for real coding work. DeepSeek V3 topped out at 160K native context. Qwen3's "1M" was YaRN extrapolation, with no independent validation past 512K. Llama 4's "10M" was a theoretical RoPE limit on a model that scores 21% on SWE-bench.

Then the wall moved. DeepSeek V4 shipped in preview on April 24: open weights, MIT license, native 1M context on a new attention stack. On paper, the strongest argument against self-hosting is gone.

In practice, "on paper" is doing heavy lifting. Independent evaluation exists now, and it cuts both ways. NIST's CAISI tested V4 Pro in May and put it roughly eight months behind the frontier - GPT-5-class, behind the Opus 4.6 in their test set. And the model's own showcase numbers tell the depth story: on 8-needle MRCR retrieval it holds above 0.82 through 256K of context, then drops to 0.59 at 1M. That's retrieval, the easy part. What happens to coding quality at the depths my sessions live at, nobody has published at all. The wall went from "impossible" to "unproven, with measured degradation at depth." That is real progress. It is not something you sign a $300-400K node order against.

## Wall two: concurrency

Peak load on this workload is 15 concurrent sessions. Not all fifteen sit at a million tokens at once - but capacity gets provisioned for the envelope you promise yourself, and interactive latency leaves no queue to hide in. For GQA-attention models, the only long-context architecture on offer until this spring, KV-cache at ~1M context runs around 150GB at FP8 per session: an envelope measured in terabytes of hot cache, hardware multiplied an estimated 8-15x, $130-240K a month. (DeepSeek's MLA models ran 4-5x leaner per session - and capped out at 160K context, so they couldn't serve the depth at all.) That was the concurrency wall as it stood in April.

V4's compressed-attention stack moved this wall too. DeepSeek's published figures put V4 Pro at 10% of V3.2's already-lean KV-cache at 1M tokens, and V4-Flash at 7% - which works out to single-digit gigabytes per million-token session. Fifteen sessions now fit in under 100GB of cache. On paper, the memory side of the concurrency wall just fell.

Here's what's still standing. V4 Pro is 1.6T parameters: at FP8 the weights overflow an 8x H200 node, so you're buying two before the first request - or quantizing to 4-bit to squeeze into one, and whether 4-bit holds for agentic coding at depth is one more unproven bet. V4-Flash fits a node outright, but it's the smaller variant of a model line that independent evaluation already puts months behind the frontier. The cache still has to stay alive: prefix caching is free software, but holding weeks of session state through restarts, evictions, and failures is an operations discipline of its own - the tiered KV-cache architectures built for it (SGLang's HiCache, Moonshot's Mooncake) are real and still young. And the honest 3-year single-node TCO, with colocation, power, networking, and 0.25 FTE of ops:

| Setup | Monthly TCO | vs $30,055 API-equivalent |
|-------|-------------|---------------------------|
| 8x MI300X (1 node) | ~$11,000 | 63% cheaper |
| 8x H200 (1 node) | ~$16,000 | 47% cheaper |
| 15 streams on GQA-class models (the April math) | $130-240K | 4-8x more expensive |

Those rows have knobs. Stretch amortization from three years to five and they drop by a quarter; staff the node realistically at 0.5-1.0 FTE instead of 0.25 and they climb right back. No setting changes the shape. A single node undercuts API list prices by half, and that's the row the advice is built on. Against the API. I don't pay API prices. The cheapest node under the friendliest knobs is still north of 10x my actual bill, and it buys the model that's unproven at depth, the cache discipline you own, and the ops you staff.

## Wall three: utilization

Active minutes over the measured window: 19.7%. The other 80% of the time the metal would sit idle - nights, weekends, the hours where I think instead of dispatch. Owned GPUs bill 100% of the calendar regardless.

The standard rebuttal is burst rental: spin nodes up when working, down when not. Cold starts still kill it. Loading a frontier-size model takes minutes, and every cold start drops the prefix cache that makes the economics work in the first place. The floor is moving - CUDA checkpoint/restore demos cut cold starts roughly 10x on serverless platforms, and vLLM's sleep mode swaps models in seconds on a node you keep paying for - but nobody ships instant-on for a frontier-size MoE with its cache intact. Pay-per-active-minute at May's H200 spot rates would have been about $1,451 a month: a fantasy number that assumes exactly that.

Spot pricing itself is the quieter lesson. Between early May and mid-June, H200 rentals went from $1.28/GPU/hr to $2.15-4.00 - a 1.7-3x jump in five weeks, while H100 held around $1.50. Owning hardware locks in depreciation; renting it inherits that volatility. Either way your capacity plan carries risk a subscription doesn't.

The desktop boxes deserve a line here too, because they break this wall - from below. Two linked DGX Sparks amortize to about $220 a month: the only configuration in this whole analysis that undercuts my subscription, and at that price, idling is free. What it buys is one stream at 16-41 tokens per second on V4-Flash, the cheap tier - against my fifteen streams at a 226 tok/s decode median on Opus. Even the ~$97K GB300 Station, 784GB of coherent memory on a desk, can't hold the one near-rival open model: V4 Pro's 4-bit weights run ~800GB. Cheap enough to idle means too small to rival. Big enough to rival means too expensive to idle.

## The part nobody computes

Line them up:

| Path | Monthly cost for this workload |
|------|-------------------------------|
| Self-host at 15 streams, GQA-class (the April math) | $130-240K |
| Anthropic API list prices | ~$30K |
| Single-node self-host (V4-Flash-class, unproven at depth) | $11-16K |
| DeepSeek V4-Flash API (their cheap tier), same buckets naively repriced | ~$0.4-5K |
| Four Max subscriptions | $800 |

The subscription wins for one reason: pooling. Anthropic's fleet runs hot because my idle 80% is someone else's active 20%; the concurrency spikes average out across subscribers; the capacity is provisioned once for everyone. Pooled compute is what solved utilization looks like - a subscription is just one packaging of it.

Which is why the row that deserves respect isn't the GPU one. It's DeepSeek's API. Take my exact token buckets and reprice them at V4-Flash rates and the whole workload lands somewhere between $400 and $5K a month, depending on how their cache discount treats it. That's another pool, running the same utilization play, potentially cheaper than my subscription. What it isn't is proven: it's the same quality-at-depth bet as the hardware - a model line measured months behind the frontier, retrieval already sagging at 1M - just with zero capex attached. And that's the point. If open-model quality at depth ever gets proven, the rational move still isn't a GPU order. It's an API key. The hardware loses this comparison in every branch.

And the terms do change. On June 15, 2026, Anthropic moves programmatic usage - the Agent SDK, headless `claude -p` runs, CI integrations, third-party apps riding subscription auth - off the flat subscription onto a monthly credit ($200 of it on a Max 20x account) that overflows into standard API rates. Interactive Claude Code stays on subscription limits.

That lands on me, not hypothetically. A real share of my workload runs through headless `claude -p`: I use it as a heavier-duty subagent dispatcher, because a failed headless session can be resumed where an in-session subagent can't. From June 15 that share draws from a $200 monthly credit on each account - $800 across the four, not poolable - and past that it bills at API rates. The fortnight I measured turns out to be a snapshot from the closing weeks of the old terms. Whether my bill stays $800 or not, I'll know by July.

Read what that change says. Anthropic is pricing by the same variable this whole article measures: utilization shape. Human-paced interactive work keeps the amortized flat rate; always-on automated fleets get metered. The subscription discount exists precisely because human-shaped workloads idle 80% of the time. The 97.3% is today's measured arbitrage, not a law of nature - but the GPU side repriced up to 3x in five weeks too. There is no path without volatility. There's only the path where volatility is someone else's problem.

One more objection I owe the skeptics: this workload's shape is partly a child of its pricing. At a flat rate, marginal tokens are free, so nothing forced me to compact contexts, prune sessions, or route easy work to a cheaper tier. Meter me and I'll do all three - the 17.7B would shrink, maybe several-fold. But run the shrink. A workload compacted to a third still values at $10K a month against list, still bursts, still idles 80% of the calendar. And a workload re-architected hard enough to live at 128K, steady and saturated, has quietly become the other workload - the one the rubric below already sends to the hardware store. The argument doesn't depend on my excess. It depends on the shape.

## When buying GPUs actually wins

The myth isn't that owning hardware is always wrong. It's that the advice generalizes. Self-hosting wins when all of these hold:

- **Data can't leave.** Sovereignty or compliance constraints make the economics secondary. (Concentration is a real cost on my path too: 50+ repos of my work flow through one US vendor that observes the usage shape and prices accordingly.)
- **Utilization is sustained.** Batch pipelines and 24/7 serving that keep GPUs above 60% busy. A team pooling one node gets there honestly - ten engineers' bursts interleave. A solo bursty workload doesn't.
- **Context stays at or under 128K.** Where open models are validated and KV-cache stays cheap.
- **Concurrency is known and stable.** So you can size the cluster once instead of provisioning for peaks.
- **Open-model quality clears your bar.** On June's SWE-bench Verified leaderboard the best open model, DeepSeek-V4-Pro-Max at 80.6%, sits about 8 points behind Opus 4.8 at 88.6% - and [controlled same-harness comparisons](https://www.swebench.com) have run closer. NIST's independent evaluation puts V4 roughly eight months behind the frontier.
- **Volume justifies it.** Self-hosting breaks even against DeepSeek's own API at roughly 30-60B *full-rate* tokens a month. Count yours before claiming the bar: my 35B/month is 96% cache reads, which an API discounts to near-nothing and a self-hosted box re-serves from RAM either way. My full-rate volume is under 2B. If your workload is agentic, yours probably collapses the same way.
- **You're training, not just serving.** Fine-tuning, distillation, RL on proprietary data produce model assets you own. No subscription sells that, and none of this article's math applies to it - this is an inference-economics piece.

Fit the first six and a single node beats API list prices by half. That's the workload the advice was written for. It's not what agentic development looks like.

Short of betting everything on one pool, routing is the middle path: V4-Flash costs $0.14 per million input tokens against Opus's $5.00, a 36x gap, and the same logic works inside one vendor's ladder - Sonnet-tier models and batch discounts for the work that doesn't need the frontier. Every version of that arbitrage is API-to-API. None of it is API-to-hardware.

## Measure before you buy

Three numbers decide this, and they're already in your logs:

1. **Peak context depth.** Mine: 964K tokens.
2. **Peak concurrent streams.** Mine: 15.
3. **Active-minute utilization.** Mine: 19.7%.

Deep, bursty, and idle-heavy: the subscription wins and it isn't close. Shallow, steady, and saturated: buy the node and bank the 50%.

The "own hardware" advice was written for the second workload and gets repeated at people running the first. Pull your numbers before you buy the metal. Mine get a sequel either way: the June 15 repricing hits my own fleet, and I'll publish what the July bill says. And if your measured math comes out different from mine, send me a DM - I want to see the workload where the hardware wins.
