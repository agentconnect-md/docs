---
title: 💳 Billing & usage
excerpt: Read your credit balance, see where model spend went, and add credits.
hidden: false
---

Two console pages answer "what did this cost, and who spent it": **Billing** holds the credit balance and the ledger behind it, and **Usage** breaks the same spend down by agent, runtime, or model. Both appear only on deployments that run a billing service — a self-hosted stack without one never shows them.

Only work that AgentConnect meters is billed. Agents on daemons you connect yourself use the provider subscriptions or API keys on those machines, so their model traffic never reaches your balance. See [Cloud pricing](/docs/manage-daemons#pricing) for the rates and what running out of credits does.

## Billing

### Balance

The balance card is the number Cloud work draws down, with the state of the organization beside it:

- **Serving** — placements are taking model traffic normally.
- **Suspended** — the balance is exhausted and Cloud placements have stopped taking new model traffic. Adding credits resumes them.
- **Unconfirmed** — a payment has not settled yet.

### Add credits

Owners see **Add credits**, which opens a Stripe checkout for the amount entered. Every member can read the balance and the ledger; only owners can top it up. When a purchase completes, its row in the ledger carries a **View receipt** link.

If you leave the Stripe page without paying, nothing is charged. A payment that is still settling shows as pending rather than failed — it resolves on its own.

### Activity

The Activity chart buckets the ledger over the last **24h**, **7d**, **30d**, or **90d**, in your own time zone, and switches between **Usage** and **Top-ups**. Use it to see when spend happened rather than what it was for; the Usage page answers what.

### Transactions

The Transactions table lists the ledger newest first, filtered to **Usage** or **Top-ups**, and loads more as you page through it. Credit rows carry a kind — **Credit purchase**, **Adjustment**, **Promotional credit**, or **Refund** — and may include a note from whoever recorded them, which is where an adjustment explains itself.

Usage rows name the agents that spent the money, as chips with each one's share. Two rules shape what you see:

- An agent is named only when you are allowed to see it. Everything else on that row folds into a single unnamed rollup, which carries no agent count — the fact that spend exists is not a way to enumerate agents you cannot otherwise see.
- A row with many agents shows the largest few and counts the rest. The unnamed rollup is always appended after that cap, so it never disappears behind it.

## Usage

**Usage** charts tokens and cost over the last 7, 30, or 90 days, grouped **By agent**, **By runtime**, or **By model**. Select a series in the legend to isolate it.

The **source** filter picks which ingress metered the session:

- **All** — everything.
- **Cloud** (**Cluster** on a self-hosted deployment) — sessions metered by the managed pool.
- **Daemons** — sessions metered by a daemon you connect.

Source is recorded when the session runs, so moving an agent between a daemon and the pool changes where its *future* usage lands without rewriting its history.

## Who sees what

| Capability | Owner | Other members |
| --- | --- | --- |
| Read the balance, Activity, and Transactions | ✅ | ✅ |
| See an agent named on a usage row | ✅ | Only for agents they may see |
| Add credits | ✅ | ❌ |

Agent names on usage rows follow the same rules as everywhere else in the console — see [Agent visibility](/docs/agent-visibility) and [Session visibility](/docs/session-visibility).
