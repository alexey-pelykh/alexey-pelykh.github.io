---
title: "QontoCtl and Qonto's Official MCP: Different Tools, Different Jobs"
slug: qontoctl-and-the-official-qonto-mcp
date: "2026-07-15"
excerpt: "Qonto shipped an official MCP server. Does QontoCtl still make sense? Yes - they do different jobs: one talks to your bank, the other automates it."
pillar: problem-solving-expertise
tags:
  - Open Source
  - CLI
  - MCP
  - Banking
  - TypeScript
---

## Qonto shipped an MCP server

When I started QontoCtl, Qonto had an API and nothing around it - no CLI, no SDK, no AI integration. That gap was the whole reason the project existed.

Part of that gap has closed. Qonto ships an [official MCP server](https://docs.qonto.com/mcp/overview): hosted, free on every plan, and connectable in a tap from Claude, ChatGPT, Cursor, VS Code, and more. It's genuinely good. You log in with your Qonto account, and your assistant can read your transactions, draft invoices, manage cards and team members - all with a human approving anything sensitive in the Qonto app.

So the obvious question, which I got within a day of it launching: **does QontoCtl still make sense?**

Yes. Because we're building for different jobs.

## Talk to your bank, or automate it

Back when I [announced QontoCtl](/blog/announcing-qontoctl/), I split it down the middle: the CLI is for automation and scripting, the MCP server is for conversation. Qonto's official MCP is a first-class version of that second half - the conversational one. If what you want is to *talk to* your finances inside an AI chat, use it. It's official, it's hosted, and it's a tap to set up. QontoCtl doesn't compete on that.

QontoCtl is the other half: **the programmable one.**

The official MCP is a hosted assistant you log into as a person. QontoCtl is a local, open-source toolkit - a CLI, an MCP server, and a library - that runs on your machine, with your credentials, *including with no human in the loop at all.*

That last part is the whole difference, and it's structural:

- **It runs headless.** Authenticate with an API key as a service account and QontoCtl runs in CI, in cron, in a Makefile, in a TypeScript app - no chat window, no LLM required. The official MCP is OAuth-per-user: a human logs in. You can't put that in an unattended pipeline. This isn't a knock on it; it's a different shape.
- **It moves money.** QontoCtl executes real transfers - SEPA, internal, recurring, bulk, international - and handles the PSD2 Strong Customer Authentication handshake so scripted flows actually complete. (Paying a *new* payee still needs your explicit SCA approval, as it must - but reconciling and paying trusted beneficiaries or sweeping between your own accounts can run on a schedule.) The official MCP, by design, currently doesn't execute transfers; it prepares a request for you to approve by hand. That's the right call for a hosted assistant. It's also exactly the thing automation needs.
- **It's yours to run and to read.** Local-first, self-hosted, AGPL-3.0. Your banking credentials never touch anyone's server but Qonto's, and you can audit every line that handles them. A hosted service, by definition, can't offer that.
- **It covers far more of the API.** 31 tool families - including domains the official MCP doesn't (yet) reach: beneficiaries, webhooks, terminals, international transfers.
- **It's multi-org.** Named profiles for anyone juggling more than one Qonto organization - accountants, holdcos, anyone running the books for several entities at once.

## Use both

This isn't a competition I'm interested in picking. Qonto building official AI tooling is good for everyone who uses Qonto, and it's good for QontoCtl - it makes "your bank, in your AI tools" normal.

If you want to ask your assistant about last month's spend, the official MCP is right there. If you want to *build* on Qonto - reconcile receipts nightly, run a payout batch, wire it into your own app, manage a dozen organizations from one place - that's what QontoCtl is for.

The official MCP talks to Qonto. QontoCtl automates it. Plenty of people will want both.

---

*QontoCtl is open source ([GitHub](https://github.com/alexey-pelykh/qontoctl), `npm install -g qontoctl`, `brew install qontoctl/tap/qontoctl`). It's a CLI, an MCP server, and a library for the Qonto Business API.*

*QontoCtl is an independent, open-source project and is not affiliated with, endorsed by, or supported by Qonto. "Qonto" is a trademark of Olinda SAS.*
