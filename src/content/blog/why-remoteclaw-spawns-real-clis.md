---
title: "Why RemoteClaw Spawns Real CLIs Instead of Proxying APIs"
slug: why-remoteclaw-spawns-real-clis
date: "2026-04-04"
excerpt: "When I designed RemoteClaw, I made an architectural bet: spawn the actual CLI binary as a subprocess instead of proxying API tokens. Today that decision got stress-tested when Anthropic cut off third-party subscription access. Here's the architecture and why it matters."
pillar: ai-architecture
tags:
  - RemoteClaw
  - Architecture
  - Claude Code
  - CLI
  - Open Source
---

When I started building [RemoteClaw](https://github.com/remoteclaw/remoteclaw), the first design decision was also the most consequential: how should middleware talk to AI agents?

The obvious answer was to proxy API calls. Every other tool in the space does it. You take the user's authentication token, forward requests to the provider, relay responses back. Simple. Well-understood. Plenty of prior art.

I went the other way. And today, that decision got stress-tested.

## The fragility nobody talks about

When middleware proxies API calls, it creates an invisible dependency: the tool's survival depends on the provider's willingness to let third-party tokens through.

Authentication policies, rate limits, token quotas, access rules. All controlled by the provider. A single policy update can break the middleware overnight. Not because of a bug in the code. Because a business decision changed the access rules the architecture depended on.

This is the fundamental fragility of the proxy model. The middleware's fate is coupled to provider policy, not to the quality of its own engineering.

I've seen this pattern enough times in other domains to know where it leads. If you build on someone else's access rules, you're one policy change away from a rewrite.

## Spawning the real CLI

RemoteClaw spawns the actual CLI binary as a subprocess on the gateway server. Claude Code, Gemini CLI, Codex, or OpenCode. The real binary, not a reimplementation.

The CLI handles its own authentication. Your subscription, your terminal session, your auth flow. RemoteClaw never sees your tokens.

```
┌─────────────────┐
│   RemoteClaw     │
│   (middleware)   │
│                  │
│  Sessions        │
│  Messaging       │──spawns──▶  claude --output-format stream-json
│  Cron            │──spawns──▶  gemini --output-format stream-json
│  Gateway         │──spawns──▶  codex exec --json
���                  │──spawns──▶  opencode run --format json
└────────┬────────┘
         │                              │
         │                              ▼
         │                    CLI authenticates itself
         ▼                    (your subscription, your auth)
  Messaging channels
  (WhatsApp, Telegram,
   Slack, Discord, ...)
```

Each runtime implements one interface:

```typescript
interface AgentRuntime {
  execute(params: AgentExecuteParams): AsyncIterable<AgentEvent>;
}
```

`execute()` spawns the CLI process with full stdio pipes, parses its NDJSON output stream, and yields a unified event stream back to the caller. Text deltas, tool invocations, tool results. The process lifecycle is clean: spawn, parse, yield, terminate.

That's the entire contract between RemoteClaw and the agent. The LLM, the tools, the MCP servers, the system prompts? Those belong to the CLI. I don't reimplement them, I don't wrap them, I don't touch them.

## Why four runtimes, not one

The decision to spawn real CLIs had a second-order consequence I didn't fully appreciate at design time: adding a new runtime is trivial.

| Runtime | CLI command | Auth |
|---------|------------|------|
| **Claude Code** | `claude --output-format stream-json` | CLI-managed (subscription or API key) |
| **Gemini CLI** | `gemini --output-format stream-json` | CLI-managed (Google auth) |
| **Codex** | `codex exec --json` | CLI-managed (OpenAI auth) |
| **OpenCode** | `opencode run --format json` | CLI-managed (configurable) |

All four extend a shared `CLIRuntimeBase` that handles subprocess lifecycle, NDJSON parsing, stdin prompt delivery, startup timeouts, and signal escalation. Each runtime only implements three methods: build the CLI arguments, build the environment variables, parse one line of output. That's it.

Each CLI authenticates itself using its own mechanism. RemoteClaw doesn't know or care which provider is running, how the subscription works, or what authentication scheme the CLI uses. It reads events from stdout.

The practical result: if a CLI works in your terminal, it works through RemoteClaw.

## The Middleware Boundary Principle

Early in development, I kept getting pulled toward adding features that didn't belong. Web search. Image generation. Browser automation. Every AI agent tool bundles these, so the instinct was to match them.

I resisted, and formalized why into what I call the Middleware Boundary Principle.

**The boundary test**: Does this capability need to route through RemoteClaw infrastructure to reach its target? If yes, build it. If no, the agent CLI already handles it.

What RemoteClaw provides, because only RemoteClaw has the state:

- **Sessions** — conversation continuity across messaging channels
- **Messaging** — bidirectional bridge between agents and channels
- **Cron** — scheduled agent invocations
- **Gateway** — node management, device routing, canvas

What RemoteClaw does *not* provide, because the agent CLI already handles it:

- Web search, file I/O, shell execution
- Image generation
- Generic browser automation
- Any MCP tool the agent can run locally

Bundling generic tools in middleware creates coupling. When providers update their CLIs with new capabilities, I don't have to update mine. Because mine don't exist.

## Your `~/.claude`, remotely

If you've invested time configuring your agent setup (custom skills, CLAUDE.md files, MCP servers, system prompts), RemoteClaw runs that exact configuration on a remote server, accessible via WhatsApp, Telegram, Slack, Discord, or any other supported channel.

No reconfiguration. No feature parity gap. No reimplementation of the agentic loop.

The CLI is the agent. RemoteClaw is the infrastructure. And today, that separation proved its worth.

---

Open source (AGPL-3.0): [github.com/remoteclaw/remoteclaw](https://github.com/remoteclaw/remoteclaw)
