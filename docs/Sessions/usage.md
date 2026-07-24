---
title: 📈 Usage
excerpt: Tokens, spend and session counts across your org — metered by the daemons, broken down per agent.
hidden: false
---

**Usage** answers "what are my agents costing me?" — token consumption and estimated spend across the organization, metered by the daemons as sessions run and reported per session.

## Ranges & totals

Pick a window — **24 hours / 7 days / 30 days / 90 days** (30 days is the default). The stat cards show **Total tokens**, **Total spend** and **Sessions** for the range, including the average cost per session.

## By agent

The table breaks the range down per agent: **Sessions**, **Tokens**, **Spend**, and each agent's share of total tokens as a percentage bar. It's the quickest way to spot the one agent burning the budget.

## Where the numbers come from

- Runtimes report token usage per session (input, output, thought, cache); the daemon forwards the totals as metadata — this is the same breakdown you see on a [session page](/docs/sessions).
- Spend is estimated from tokens and the model in use. If you run agents on subscription plans (e.g. a Claude subscription on your machine), treat spend as an *equivalent-cost* indicator rather than a bill — AgentConnect isn't charging you for tokens; your own provider relationship is.
- Cross-agent stats also surface on the Agents list (Sessions / Tokens / Cost per agent, 24h) and each agent header.
