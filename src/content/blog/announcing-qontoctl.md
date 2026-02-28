---
title: "Announcing QontoCtl: CLI and MCP Server for Qonto Banking"
slug: announcing-qontoctl
date: "2026-02-28"
excerpt: "Qonto has an API but no tooling around it. No CLI, no SDK, no AI integration. QontoCtl bridges that gap with a full CLI and MCP server in one package."
pillar: problem-solving-expertise
tags:
  - Open Source
  - CLI
  - MCP
  - Banking
  - TypeScript
---

## The Problem

Qonto is a European business banking platform used by hundreds of thousands of companies. They provide a REST API for programmatic access to your accounts, transactions, statements, and more.

What they don't provide is any tooling around it. No CLI. No SDK. No way to check your account balance from the terminal or script your banking operations. If you want to pull last month's transactions into a spreadsheet, you're either clicking through the web UI or hand-rolling HTTP requests with curl.

And in a world where AI assistants are becoming the default interface for developer workflows, there's no way for Claude, Cursor, or any MCP-compatible tool to interact with your Qonto account. The API exists. The bridge doesn't.

I needed both. Neither existed. So I built them.

## What QontoCtl Does

QontoCtl is two tools in one package:

**A CLI** for direct terminal access:

```sh
# List your bank accounts
qontoctl account list

# Show recent transactions over 1000 EUR
qontoctl transaction list --side debit --sort-by settled_at:desc

# Download a bank statement as PDF
qontoctl statement download stmt_abc123 --output january-2026.pdf

# Output as JSON for scripting
qontoctl transaction list --output json | jq '.[] | .amount'
```

**An MCP server** that lets AI assistants interact with Qonto through natural language:

```
"Show my Qonto account balances"
"List recent transactions over 1000 EUR"
"What were last month's card payments?"
"Download January 2026 bank statements"
```

One `npx qontoctl mcp` command, and your AI assistant has read access to your banking data. Works with Claude Desktop, Claude Code, Cursor, and Windsurf out of the box.

## Why Both

The CLI covers the automation and scripting use case. Cron jobs, CI pipelines, financial reporting scripts, quick terminal lookups. Anything where you want structured, repeatable access to your banking data.

The MCP server covers the conversational use case. Ask your AI assistant to summarize this week's expenses. Have it cross-reference transactions against invoices. Use natural language instead of memorizing command flags.

These aren't two separate products forced into one package. They share a core library that handles authentication, API communication, and data modeling. The CLI and MCP server are thin layers on top. Same code paths, same behavior, different interfaces.

## Getting Started

### CLI

```sh
# Install globally
npm install -g qontoctl

# Create a profile with your Qonto API credentials
qontoctl profile add mycompany

# Test the connection
qontoctl profile test --profile mycompany

# Start using it
qontoctl account list --profile mycompany
```

### MCP (Claude Code)

```sh
claude mcp add qontoctl -- npx qontoctl mcp
```

That's it. Your AI assistant can now interact with Qonto.

For Claude Desktop, Cursor, and Windsurf, add the server to your MCP configuration file:

```json
{
    "mcpServers": {
        "qontoctl": {
            "command": "npx",
            "args": ["qontoctl", "mcp"]
        }
    }
}
```

## What's Covered

The current release (v0.1.0) covers the core Qonto API surface:

- **Organizations** - details and settings
- **Bank accounts** - list and inspect
- **Transactions** - list, search, and filter by status, date range, side, operation type
- **Bank statements** - list, view, and download PDFs
- **Labels** - transaction categorization
- **Memberships** - team members and permissions

Output formats: table (human-readable), JSON, YAML, CSV. Named profiles for multi-organization support. Shell completions for bash, zsh, and fish.

## Security

Banking tools need to be careful with credentials. QontoCtl stores API keys in YAML files with restrictive file permissions (user-only readable). Environment variables take priority over files, so you can inject credentials in CI without touching disk. Debug mode automatically redacts known sensitive fields like IBAN, BIC, and balance values.

The MCP server uses stdio transport only. No network listener. No exposed ports. The trust boundary is at the process level.

## Open Source

QontoCtl is licensed under AGPL-3.0. Using it as a CLI tool or MCP server carries no license obligations. If you import `@qontoctl/core` as a library in your own code, standard AGPL terms apply. Commercial licensing is available if AGPL doesn't fit your use case.

The project is not affiliated with Qonto SAS.

## What's Next

This is v0.1.0. The API surface is covered, the tooling works, and the release pipeline is automated. From here, I'm watching for what people actually need. More API coverage as Qonto expands their endpoints, better filtering, and whatever use cases emerge from the MCP integration.

If you use Qonto for business banking and have been wanting scriptable access or AI integration, give it a try:

[https://github.com/alexey-pelykh/qontoctl](https://github.com/alexey-pelykh/qontoctl)
