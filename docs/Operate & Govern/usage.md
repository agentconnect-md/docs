---
title: 📈 Usage & costs
excerpt: Track tokens, estimated spend and session counts across your organization, with a breakdown for each agent.
hidden: false
---

**Usage & costs** answers "what are my agents costing me?" — token consumption and estimated spend across the organization, metered by the daemons as sessions run and reported per session.

## Review usage

Choose a time range to compare total sessions, tokens, and estimated spend across the organization. The per-agent breakdown helps identify which agents account for most activity and cost.

## Where the numbers come from

- Runtimes report token usage per session (input, output, thought, cache); the daemon forwards the totals as metadata — this is the same breakdown you see on a [session page](/docs/sessions).
- Spend is estimated from tokens and the model in use. If you run agents on subscription plans (e.g. a Claude subscription on your machine), treat spend as an *equivalent-cost* indicator rather than a bill — AgentConnect isn't charging you for tokens; your own provider relationship is.
