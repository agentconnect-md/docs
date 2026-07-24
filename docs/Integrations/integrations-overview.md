---
title: 🔌 Integrations overview
excerpt: How agents meet channels — bots, integrations, shared bots, and the commands that work in any conversation.
hidden: false
---

An **integration** binds one agent to one way of reaching it. Five kinds are supported:

| Platform | The agent responds to | You provide |
| --- | --- | --- |
| [Slack](/docs/slack) | Mentions & messages in channels the bot is in | A Slack app (two-step install) |
| [Telegram](/docs/telegram) | DMs and group messages | A bot token from @BotFather |
| [Discord](/docs/discord) | Mentions & threads in your server | A bot token + invite |
| [GitHub](/docs/github) | Issues, PRs, comments on watched repos | The AgentConnect GitHub app |
| [Webhooks](/docs/webhooks) | Anything that can POST JSON | Nothing — we mint the endpoint |

Add one from the agent page (**Integrations → Add integration**) or from the Agents list.

![Add integration — pick a platform](https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/add-integration.png)

## Bots are identities, integrations are bindings

For the chat platforms, the thing that lives in your Slack workspace / Telegram / Discord server is a **bot** — a durable identity with its own tokens. An integration binds *that bot* to *one agent*.

- Deleting an integration **frees the bot** rather than destroying it — reuse it for another agent from the **Use an existing bot** picker.
- Bots are managed org-wide under **Settings → Bots**: see [Bots](/docs/bots).

Platform tiles are enabled based on what your agent's daemon supports; the daemon is what actually connects to the platform, always outbound — no webhooks into your network, no public URLs.

## Binding channels

There's no channel picker: **invite the bot to a channel and it starts listening there.** Each joined channel then shows up on the agent's Integrations card with a per-channel trigger — answer **@-mentions only** or **any message**. The org-wide channel roster for each bot lives in **Settings → Bots**.

### Shared bots

Normally one bot ↔ one agent. A **shared bot** (Slack) can serve **multiple agents through a single bot identity** — inbound messages arrive through AgentConnect's relay and route by channel: in **Settings → Bots**, expand the shared bot and pick the **Active agent** per channel. One "@Assistant" in Slack, different specialists behind it per channel.

## In-conversation commands

In any channel conversation, a couple of commands are handled by the daemon itself (never sent to the agent) — they work even if the control plane is down:

| Command | On Slack | Effect |
| --- | --- | --- |
| `/stop` or `/cancel` | `!stop` | Interrupt the agent's current turn |
| `/queue <message>` | `!queue <message>` | Hold a message; deliver it when the agent goes idle |

Slack reserves `/…` for its own slash commands, hence the `!` alias there.

## How chatty should an agent be?

The agent's **Output mode** (Low / Medium / High) controls how much of its activity gets posted to the platform — final answers only, or a narrated play-by-play. Whatever you choose, the complete transcript is always in [Sessions](/docs/sessions).
