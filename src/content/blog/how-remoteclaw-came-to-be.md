---
title: "How RemoteClaw Came to Be"
slug: how-remoteclaw-came-to-be
date: "2026-03-10"
excerpt: "I wanted to message Claude Code from my phone. That simple requirement led to 334 analysis batches of a 250K-star codebase, a rejected 14,757-line PR by someone else, and ~800 lines of middleware that connect any CLI agent to 22+ messaging channels."
pillar: builders-journal
tags:
  - Open Source
  - Claude Code
  - Architecture
  - CLI
  - Messaging
---

It started with a simple problem: I wanted to message Claude Code from my phone.

Not a new agent. Not a chatbot. The actual Claude Code running on my machine, with my configuration, my CLAUDE.md files, my MCP servers. I wanted to send it a message from WhatsApp while I was away from my laptop and get the result back in the same thread.

That's it. That was the entire product requirement.

## Mapping the Landscape

Before building anything, I mapped the space. What I found was 115+ projects, all solving variations of the same problem: getting AI agents to talk to humans through messaging channels.

The surprising part wasn't the quantity. It was the shape. Nearly every project fell into one of two categories:

**New agents.** Projects that build their own AI agent from scratch and connect it to one or two channels. OpenClaw, NanoClaw, Nanobot, dozens of smaller ones. Different architectures, different philosophies, same approach: own the agent, own the channel, own everything in between.

**Single-channel bridges.** One developer, one weekend, one script that connects Claude Code to Telegram. I found at least ten independent Telegram bridges. Each one built without knowing the others existed.

When ten developers independently build the same Telegram bridge without knowing about each other, that's not a trend. It's a product category announcing itself.

The category almost nobody was filling: middleware that connects the CLI agent you already have to any messaging channel. Not a new agent. Not a single bridge. A layer between.

## The Rejected PR

I wasn't the first person to see this gap.

A contributor named [`dgarson`](https://github.com/dgarson) submitted a 14,757-line pull request to OpenClaw on January 29, 2026. [PR #3823](https://github.com/openclaw/openclaw/pull/3823): "Claude Code SDK Support / AgentRuntime abstraction." He'd built a complete runtime abstraction - a formal interface, a registry, a factory, session adapters, the whole architecture. 105 files changed.

The maintainer closed it the same day. "Large PRs (1000+ lines) require prior alignment."

`dgarson` filed [an RFC discussion](https://github.com/openclaw/openclaw/discussions/5536). Another contributor built on it with a detailed error handling proposal. The maintainer response, eleven days later, was seven words: "Not planned. Would just greatly increase complexity." Discussion closed. A [related issue](https://github.com/openclaw/openclaw/issues/10149) about Agent SDK integration was bulk-closed: "~30 new issues per hour, can't review."

Multiple contributors independently hit the same architectural insight and the same wall. The insight: ~93% of OpenClaw's codebase is engine-independent. The channel infrastructure - adapters, routing, sessions, scheduling - doesn't care which AI engine produces the response. The wall: OpenClaw's maintainers were overwhelmed by volume - thousands of open issues and PRs, a low merge rate.

`dgarson`'s approach was top-down: define a formal interface at the top of the hierarchy and make everything conform. 14,757 lines because the abstraction cascaded through 105 files. Technically solid. Practically impossible to review.

## The Fork Decision

I could have built from scratch. A messaging bridge isn't that complicated. But OpenClaw has something that took years to build: 22+ channel adapters. Telegram, WhatsApp, Slack, Discord, email, SMS, voice - all battle-tested by a project with 250,000 stars.

That infrastructure isn't something you replicate in a weekend. Or a month.

The question wasn't whether to use OpenClaw's channel infrastructure. It was whether to fork the whole thing or extract just the parts I needed.

I forked. 5,605 files. The first job was understanding what I was looking at.

## 334 Analysis Batches

I went through the codebase systematically. 334 batches of analysis across every subsystem, every module, every dependency chain. The goal: figure out where "channel infrastructure" ends and "AI platform" begins.

OpenClaw is a full platform. It orchestrates LLM calls, manages model catalogs, runs a skills marketplace, handles memory and context, does billing, manages team permissions. That's the platform layer. It's also the part responsible for most of the security surface that Karpathy and others have criticized.

Underneath that platform layer sits the channel infrastructure. Adapters, routing, session management, cron scheduling, configuration. This is the battle-tested part. It doesn't know or care what AI engine is producing responses. It just delivers messages.

The finding: 93% of the codebase is engine-independent. The platform layer - the part I wanted to replace - is a relatively thin skin over a much larger body of channel infrastructure.

## ~800 Lines of Middleware

Where `dgarson` went top-down with 14,757 lines across 105 files, I went bottom-up with ~800 lines in a clean middleware layer.

The approach: strip the platform layer entirely. No LLM orchestration, no model catalog, no skills marketplace, no memory system. Replace all of it with a single `AgentRuntime` interface that spawns CLI agents as subprocesses.

The interface is 30 lines. `dgarson`'s was 209 lines with a 50+ field parameter type because he needed to accommodate both OpenClaw's existing engine and the new one. I only needed to accommodate CLI agents, so the interface is minimal.

Four CLI runtimes ship today: Claude Code, Gemini CLI, Codex, and OpenCode. Each extends a shared base class. Adding a new CLI agent backend is about 50 lines of code.

The architectural insight that makes this work: CLI agents manage their own configuration, their own context, their own tools. Claude Code reads `~/.claude`. Gemini reads its settings. Your existing setup stays untouched. RemoteClaw doesn't need to know what's in your config. It just spawns the process, routes messages to it, and delivers the responses through whatever channel you configured.

Your `~/.claude`, remotely. That's the product.

## 160+ Commits Later

The fork grew to 160+ commits. Most of it was removal - stripping the platform layer, removing ClawHub integration, eliminating untrusted code execution paths. Some of it was new - the middleware layer, an MCP server that exposes platform capabilities (sessions, cron, messaging) to CLI agents, runtime lifecycle hooks.

The security model simplified dramatically. OpenClaw defaults to shared sessions where all users in a channel share context. RemoteClaw keys sessions by `channelId:userId:threadId` - per-user isolation by construction. The skills marketplace is gone. There's no dynamic code loading. Your CLI agent runs in its own subprocess with its own credentials. Keys stay with your agent, not with the gateway.

## The Name, the Crab, and AGPL

RemoteClaw. Your CLI agent, remotely, through the claw (channel) infrastructure. The crab came naturally - it's a claw, after all.

AGPL-3.0 was deliberate. The value of this project is the middleware pattern - the insight that you can strip a platform down to channel infrastructure and replace the engine with a subprocess bridge. AGPL prevents someone from taking the fork, adding a hosted service on top, and competing with a proprietary version. The middleware must stay open.

## What's Next

RemoteClaw v0.0.1 shipped today on npm. `npm install -g remoteclaw` and you're running.

Four runtimes, 22+ channels, ~800 lines of middleware on top of OpenClaw's inherited channel infrastructure. Self-hosted only. No cloud dependency. Your machine, your agent, your config.

The immediate priority is documentation and community. The longer-term question is whether "agent middleware" becomes a recognized category or stays a niche. Based on those ten independent Telegram bridges, I'm betting on the former.

If you have a CLI agent and want to reach it from your phone, this is what I built it for.

GitHub: [github.com/remoteclaw/remoteclaw](https://github.com/remoteclaw/remoteclaw)
Docs: [docs.remoteclaw.org](https://docs.remoteclaw.org)
