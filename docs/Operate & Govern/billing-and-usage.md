---
title: 💳 Billing & usage
excerpt: Read your credit balance, see where model spend went, and add credits.
hidden: false
---

Two console pages answer "what did this cost, and who spent it".

**Analytics** charts metered tokens and cost, and is always available — including on a self-hosted stack with no billing service, where it reports what your own daemons metered. **Billing** holds the prepaid credit balance and the ledger behind it, and appears only on deployments that run a billing service.

The two do not cover the same money. Analytics reports everything metered, and agents on daemons you connect yourself use the provider subscriptions or API keys on those machines — that traffic is counted but never billed. Only metered Cloud work draws down the balance. See [Cloud pricing](/docs/manage-daemons#pricing) for the rates and what running out of credits does.

## Billing

### Balance

The balance card is the number Cloud work draws down, with the state of the organization beside it:

- **Serving** — placements are taking model traffic normally.
- **Suspended** — the balance is exhausted and Cloud placements have stopped taking new model traffic. Adding credits resumes them.
- **Unconfirmed** — a change to the organization's access has not been confirmed upstream yet, so AgentConnect does not claim either way. This is not a payment state and it resolves on its own.

### Add credits

Owners see **Add credits**, which opens a Stripe checkout for the amount entered. Every member can read the balance and the ledger; only owners can top it up. When a purchase completes, its row in the ledger carries a **View receipt** link.

If you leave the Stripe page without paying, nothing is charged. A payment that is still settling shows as pending rather than failed — it resolves on its own, and has its own banner separate from the balance state above.

### Activity

The Activity chart buckets the ledger over the last **24h**, **7d**, **30d**, or **90d**, in your own time zone, and switches between **Usage** and **Top-ups**. Use it to see when spend happened rather than what it was for; Analytics answers what.

### Transactions

The Transactions table lists the ledger newest first, filtered to **Usage** or **Top-ups**, and loads more as you page through it. Credit rows carry a kind — **Credit purchase**, **Adjustment**, **Promotional credit**, or **Refund** — and an adjustment may include a note from whoever recorded it.

Usage rows name the agents that spent the money, as chips with each one's share. What gets named follows your own view of the fleet: an agent is named when it appears in your Analytics view for that charge's period, and ids outside that fold into a single unnamed rollup. That rollup carries no agent count — the fact that spend exists is not a way to enumerate agents you cannot otherwise see — and it is appended after the chip cap, so a row with many agents never hides it behind a `+N`.

## Analytics

**Analytics** charts tokens and cost over the last **24 hours**, **7 days**, **30 days**, or **90 days**, grouped **By agent**, **By runtime**, or **By model**. On a narrow screen the 90-day range is not offered. Selecting a series in the legend hides it and selecting it again brings it back, so you can take noisy series out of the picture.

Where the deployment runs a daemon pool, a **source** filter picks which ingress metered the session:

- **All** — everything, billed or not.
- **Cloud** (**Cluster** on a self-hosted deployment) — sessions metered by the pool. These are the ones that draw down credits.
- **Daemons** — sessions metered by a daemon you connect. Counted here, never billed.

Source is recorded when the session runs, so moving an agent between a daemon and the pool changes where its *future* usage lands without rewriting its history.

## Who sees what

| Capability | Owner | Other members |
| --- | --- | --- |
| Read the balance, Activity, and Transactions | ✅ | ✅ |
| See an agent named on a usage row | Only for agents they may see | Only for agents they may see |
| Add credits | ✅ | ❌ |

Attribution follows the same visibility rules as the rest of the console, and the Owner role is not an override: it does not bypass a Selected audience under [Team visibility](/docs/team-visibility), nor a private [session audience](/docs/session-visibility).
