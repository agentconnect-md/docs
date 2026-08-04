---
title: 🔌 Integrations overview
excerpt: How agents meet channels — bots, integrations, shared bots, and the commands that work in any conversation.
hidden: false
---

An **integration** binds one agent to one way of reaching it. Six kinds are supported:

| Platform                   | The agent responds to                         | You provide                               |
| -------------------------- | --------------------------------------------- | ----------------------------------------- |
| [Slack](/docs/slack)                 | Channels, threads, and DMs                    | Cloud Add to Slack or a custom Slack App  |
| [Telegram](/docs/telegram)           | DMs and group messages                        | A bot token from @BotFather               |
| [Discord](/docs/discord)             | Channels, threads, and DMs                    | A bot token; AgentConnect builds the invite |
| [Lark / Feishu](/docs/lark-feishu)   | Group mentions and one-to-one chats           | One-click app setup or an App ID + secret |
| [GitHub](/docs/github)               | Issues, PRs, comments on watched repos        | The AgentConnect GitHub app               |
| [Webhooks](/docs/webhooks)           | Anything that can POST JSON                   | Nothing — we mint the endpoint            |

Add one from the agent page (**Integrations → Add integration**) or from the Agents list.

![Add integration — pick a platform](https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/add-integration.png)

## Bots are identities, integrations are bindings

For the chat platforms, the thing that lives in your Slack workspace, Telegram group, Discord server, or Lark / Feishu tenant is a **bot** — a durable identity with its own tokens. An integration binds _that bot_ to _one agent_.

- Deleting an integration **frees the bot** rather than destroying it — reuse it for another agent from the **Use an existing bot** picker.
- Bots are managed org-wide under **Settings → Bots**: see [Bots](/docs/bots).

Platform tiles are enabled based on what your agent's daemon supports. On AgentConnect Cloud, the built-in Slack app hides the callback setup behind **Add to Slack**. Direct transports such as Slack Socket Mode, Telegram, Discord, and the Lark / Feishu long connection connect outbound from the daemon. Callback transports such as Slack and Lark / Feishu HTTP events, GitHub, generic webhooks, and webchat enter through the AgentConnect Relay and are forwarded to the daemon without passing through the Control Plane message path.

## Binding channels

There's no channel picker: **invite the bot to a channel and it appears in AgentConnect.** Each joined channel then shows up on the agent's Integrations card with a per-channel trigger:

- **@-mention** — the default; unmentioned follow-ups continue in a thread the agent already joined.
- **Any message** — run the channel's agent for every message.
- **Off** — do not respond in that channel, including to mentions, existing thread affinity, control commands, or shared-bot fallback.

Off keeps the bot in the channel, preserves past sessions, and only mutes inbound activation. A schedule or another agent's deliberate handoff can still post there. Manage the bot's actual channel or server membership on the chat platform.

### Direct messages

A direct message appears after someone writes to the bot, and each agent controls its own direct conversations. A one-to-one DM uses **On / Off** and starts On for an Everyone agent. A Slack group DM uses the same **@-mention / Any message / Off** trigger as a channel and starts on @-mention. Both kinds start Off for a restricted agent.

### Shared bots

Normally one bot ↔ one agent. A **shared bot** (Slack) can serve **multiple agents through a single bot identity** — inbound messages arrive through AgentConnect's relay and route by channel: in **Settings → Bots**, expand the shared bot and pick the **Default dispatch** agent per channel. One "@Assistant" in Slack, different specialists behind it per channel.

For a shared bot, the trigger belongs to the bot and channel rather than to one member agent. AgentConnect shows the same effective trigger on every connected agent's row. Switching it Off mutes all inbound routing through that shared bot in the channel, including fallback to a sibling or default agent.

### Cross-platform handoffs

Connect the same agent to more than one chat platform and it can send a deliberate handoff from one conversation to another. Use this only between two messaging workspaces you trust and have approved to exchange information. The destination starts its own linked session rather than merging both platform transcripts. See [Hand off conversations between trusted workspaces](/docs/hand-off-conversations-across-messaging-platforms).

### Restricted agents

When an agent's team visibility is **Selected**, its chat conversations are gated too. Newly discovered channels and direct messages start **Off** until an allowed editor enables each one from the integration card. Every agent can also choose Off later as an explicit mute. See [Visibility & sharing](/docs/visibility-and-sharing#what-a-restricted-agent-changes).

## In-conversation commands

In any channel conversation, a few commands are handled by the daemon itself (never sent to the agent) — they work even if the control plane is down:

| Command              | On Slack           | Effect                                              |
| -------------------- | ------------------ | --------------------------------------------------- |
| `/stop`              | `!stop`            | Stop the agent **and mute this thread** until you @-mention it again |
| `/cancel`            | `!cancel`          | Cancel the turn in flight; the session stays live and follow-ups still run |
| `/resume`            | `!resume`          | Unmute the conversation and reset loop protection    |
| `/queue <message>`   | `!queue <message>` | Hold a message; deliver it when the agent goes idle |
| `/status`            | `!status`          | Show the session's model, context, and token usage  |
| `/models`, `/effort`, `/permission` | `!models`, … | List or switch the session's model, reasoning effort, or permission mode |
| `/fast on` / `/fast off` | `!fast on` / `!fast off` | Toggle the session's fast mode                |

Slack reserves `/…` for its own slash commands, hence the `!` alias there.

`/stop` and `/cancel` are deliberately different. **`/stop` is a stand-down:** besides interrupting any turn in flight, it mutes the thread, so thread affinity and *any message* triggers stop waking the agent there until someone @-mentions it again — or runs `/resume`. **`/cancel` only interrupts the current turn** and leaves the conversation live.

The runtime-setting commands (`/models`, `/effort`, `/permission`, `/fast`) work only when the agent's **Allow change in chat** setting is on. On Telegram and Discord these commands appear in the native command menu, where the registered name is `/models` rather than `/model` (both are accepted when typed).

## How chatty should an agent be?

The agent's **Output mode** controls what reaches the platform: **Minimal** keeps one live-updating reply, **Low** posts replies, **Medium** adds tools and plans, **High** also includes reasoning and tool output, and **None** keeps the run in the web session only. The complete transcript is always in [Sessions](/docs/sessions).
