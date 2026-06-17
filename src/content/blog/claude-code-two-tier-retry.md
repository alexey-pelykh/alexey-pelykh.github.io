---
title: "Claude Code retries rate-limit errors for API keys, not for your Max plan"
slug: claude-code-two-tier-retry
date: "2026-06-20"
excerpt: "I decompiled the Claude Code binary to find out why my Max sessions die on rate-limit errors an API key would shrug off. The retry classifier has one branch, and it is keyed on how you pay."
pillar: ai-architecture
tags:
  - AI
  - LLM
  - Software Architecture
  - Engineering Economics
---

A long agent run on a Max plan, and a single 429 ends it. Not pauses it. **Ends it.** The turn dies, the work in flight is gone, and there is no backoff, no retry, no countdown. The same error, the exact same HTTP 429, on an API key would have been retried silently and you would never have seen it.

I wanted to know why, so I decompiled the Claude Code binary - version 2.1.179 - and read the retry path. The answer is one branch, and it is keyed on how you pay.

## One branch, keyed on how you pay

Claude Code wraps every model request in a retry classifier. Decompiled, the rate-limit decision reduces to a single line:

```js
if (status === 429) return !kq() || GsH()
```

`kq()` and `GsH()` are minified. The same branch with readable names for what each gate checks:

```js
if (status === 429) return !isConsumerSubscription() || isEnterprise()
```

`isConsumerSubscription()` is true when you authenticate with a consumer subscription - your OAuth token carries the `user:inference` scope that Pro and Max logins get. `isEnterprise()` is true only for Enterprise accounts. Read it out:

- **API key** - `isConsumerSubscription()` false - 429 retryable.
- **Enterprise** - `isEnterprise()` true - 429 retryable.
- **Pro / Max** - `isConsumerSubscription()` true, `isEnterprise()` false - `!true || false` is **false** - **429 not retryable.**

When the classifier returns non-retryable, the request throws. On a subscription, that throw is your session ending.

It gets sharper. The 529 "overloaded" error, Anthropic's at-capacity signal, is retried for everyone with no tier check at all - `status >= 500` returns retryable unconditionally. So the split is not "subscriptions get less retry." It is specifically the 429 rate-limit error, and only for the flat-rate tiers. And the official Anthropic SDK retries 429s by default, two attempts with exponential backoff. Claude Code turns that off - it passes `maxRetries: 0` to the SDK client and reimplements retry with the subscription branch bolted on. This is not SDK behavior leaking through. It is a decision in the client.

## The defense, and where it breaks

The branch has a real defense, and it deserves to be made well. A 429 on a subscription is often a **usage-window** limit - you have burned your 5-hour quota, and it will not reset for minutes to hours. Retrying that in-process is pointless. Worse, a client that hammers its own quota ceiling is misbehaving, and a vendor is right not to ship that. If every Max client retried usage-window 429s on a tight loop, the limit would stop meaning anything. All of it is true. For the window-quota case, not retrying is the correct call.

Then look at what the branch actually does. It does not distinguish the two kinds of 429. Anthropic's limits come in two shapes: the long usage window, and the short per-minute request and token ceilings. The per-minute one clears in **seconds**. It is the textbook case for backoff - wait two seconds, retry, succeed. The classifier treats both the same, because `status === 429` is `status === 429`. The sound reasoning about the window-quota case ends up justifying an exception that also kills the trivially-retryable per-minute case - the exact case where backoff is the right answer, and the one every other tier gets for free.

That is what does not survive the steelman. The metered tiers retry the per-minute 429 and recover. The flat-rate tier takes it as a dead session.

## Mechanism, not motive

I am showing you a mechanism, not a motive. I read a branch in a binary. I cannot tell you from that whether this is deliberate tiering, a conservative default that overreaches, or an oversight nobody revisited, and anyone claiming to know which from the same evidence is guessing. I will be blunt about why I am careful here: I published a teardown of this same vendor on June 15 and corrected it the next day, because I asserted intent the evidence did not carry. Once is a lesson. Twice is a pattern I would rather not start.

What the evidence does carry is the **effect**. Today, in this client, the flat-rate tier runs on a less forgiving error path than the metered one. By design or by neglect, the people paying a fixed monthly price absorb failures the people paying per token do not.

## Reliability isn't on the pricing page

Reliability is part of what you are buying, and it is not on the pricing page. You choose a tooling tier on price and quota, and you assume the failure handling underneath is the same - that only the limits move. Here is a concrete case where that assumption breaks. The retry behavior itself changes with your billing relationship, silently, in a branch you will never see unless you go decompile it.

If you are building agentic workflows on a subscription tier and trusting them to ride out transient limits, that trust is load-bearing and untested. A staff engineer who picks Max for the team because the quota math works has also, without knowing it, picked the tier that turns a recoverable two-second blip into a failed run.

This is one binary version, 2.1.179, June 2026, and a future release can rewrite that branch and retire this finding - pin the version when you cite it. The subscription-versus-metered split also has at least one legitimate driver, the window-quota case above, so do not read a conspiracy into a branch. Read it as what it is: a place where your tooling's reliability quietly depends on how you pay, and nobody told you.

## Check it yourself

Do not take my word for it - watch it on your own tier. Every API response carries an `anthropic-ratelimit-unified-status` header, `allowed` or `rejected`, and the client emits `tengu_api_retry` telemetry every time a retry fires. Run a workload until you hit a 429 and look: does the client back off and recover, or does the turn die? On a metered key it retries. On Max, watch what happens. The whole finding is reproducible in your own logs.

I will pin the bet. This is v2.1.179. If a later release retries 429s for subscriptions too, good - that is the right fix, and you will have watched it land in your own telemetry instead of trusting a teardown. Until then, the tier that costs a flat rate is the tier that gives up first.
