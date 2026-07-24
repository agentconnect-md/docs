---
title: 💬 Slack
excerpt: Put an agent in your Slack workspace — one-click install with a config token, or the manifest flow. No public URL needed.
hidden: false
---

AgentConnect talks to Slack over **Socket Mode**: your daemon opens an outbound connection to Slack, so nothing needs to be exposed to the internet — it works from a laptop.

On the agent, open **Integrations → Add integration → Slack**. You can bind an **existing free bot** (from a deleted integration) or create a new one, in one of two ways:

## Option A — one-click install (recommended)

Available once your org has a saved **Slack configuration token** (see below).

1. **Name the bot** and click **Create & install**. Slack opens in a new tab — approve the install into your workspace. The bot and its token are created automatically.
2. Slack has no API for the App-Level token, so that one is manual: follow the **Generate the App-Level token** link, create a token with `connections:write`, and paste it (`xapp-…`).

### The configuration token

Under **Settings → Bots → Slack**, paste a Slack **config token pair** (access `xoxe.xoxp-…` + refresh `xoxe-…`, from [Slack's app config token page](https://api.slack.com/authentication/config-tokens)). With it saved, every future Slack bot in your org is a one-click install. Tokens auto-refresh; **Replace** or **Clear** them there anytime.

## Option B — manifest install (no config token)

1. **Name the bot**, then click **Add to Slack with manifest** — it opens Slack's app-creation page prefilled with the right scopes and settings (or **Copy manifest JSON** and paste it yourself).
2. Install the app to your workspace, then copy two tokens back into AgentConnect:
   - **Bot token** (`xoxb-…`) — from *OAuth & Permissions* after installing.
   - **App-Level token** (`xapp-…`) — from *Basic Information → App-Level Tokens*, with `connections:write`.

## Use it

**Invite the bot to any channel** (`/invite @your-bot`) — it starts listening there; no channel picker in the console. Mention it to start a conversation; replies thread neatly under your message. It also answers DMs.

Each channel the bot joins appears on the agent's Integrations card, with a **per-channel trigger**: respond only to **@-mentions** (default for busy channels) or to **any message**.

Handy in-channel commands (handled by the daemon, see [Integrations overview](/docs/integrations-overview)): `!stop` interrupts the current turn, `!queue <message>` delivers a message once the agent is idle.

## Shared Slack bots

When creating the bot you can tick **Shared bot** — one Slack app that serves **multiple agents**, routed per channel. Manage the routing under **Settings → Bots**: expand the bot's channel roster and set the **Active agent** for each channel. Inbound messages for shared bots arrive through AgentConnect's relay; replies still come straight from your daemon.

## Managing Slack bots

**Settings → Bots → Slack** lists every Slack bot in the org: which agent uses it, its channels, a **Configure on Slack** deep link into Slack's app settings, a sync/refresh action, and deletion for bots no agent is using.
