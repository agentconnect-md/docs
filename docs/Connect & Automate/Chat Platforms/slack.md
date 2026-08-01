---
title: 💬 Slack
excerpt: Connect Slack through the Events API or Socket Mode, including one App shared across channel-specific agents.
hidden: false
---

AgentConnect supports two Slack delivery modes:

- **HTTP (Events API)** receives Slack callbacks through the AgentConnect Relay. It is the default when a Relay is available and is required for one App to serve multiple agents.
- **Socket Mode** is daemon-owned and needs no public callback URL. It is limited to one agent per bot.

On the agent, open **Integrations → Add integration → Slack**.

## Built-in Add to Slack

If the deployment operator configured a [deployment-wide Slack App](/docs/deployment-and-configuration#optional-deployment-wide-add-to-slack-app), the built-in `agentconnect` agent starts with an **Add to Slack** button. Approve the installation in Slack; AgentConnect receives the workspace token in the OAuth callback and binds the bot without asking you to copy credentials.

This path is HTTP-only and uses the Relay. Choose **Use a custom bot identity instead** when the workspace needs its own Slack App or you are connecting another agent.

## Custom app option A — configuration-token install

Available once your org has a saved **Slack configuration token** (see below).

1. Choose the delivery mode, **name the bot**, and click **Create & install**. Slack opens in a new tab — approve the install into your workspace.
2. For **HTTP**, AgentConnect captures the signing secret and finishes automatically. For **Socket Mode**, follow **Generate the App-Level token**, create a token with `connections:write`, and paste it (`xapp-…`).

### The configuration token

Under **Settings → Bots → Slack**, paste a Slack **config token pair** (access `xoxe.xoxp-…` + refresh `xoxe-…`, from [Slack's app config token page](https://api.slack.com/authentication/config-tokens)). With it saved, every future Slack bot in your org is a one-click install. Tokens auto-refresh; **Replace** or **Clear** them there anytime.

## Custom app option B — manifest install

1. **Name the bot**, then click **Add to Slack with manifest** — it opens Slack's app-creation page prefilled with the right scopes and settings (or **Copy manifest JSON** and paste it yourself).
2. Install the app to your workspace, then copy the required credentials back into AgentConnect:
   - **Bot token** (`xoxb-…`) — required for both delivery modes.
   - **Signing secret** — required for HTTP, from _Basic Information → App Credentials_.
   - **App-Level token** (`xapp-…`) — required for Socket Mode, with `connections:write`.

## Use it

**Invite the bot to any channel** (`/invite @your-bot`) — it starts listening there; no channel picker in the console. Mention it to start a conversation; replies thread neatly under your message. It also answers DMs.

Each channel the bot joins appears on the agent's Integrations card, with a **per-channel trigger**: respond only to **@-mentions** (the default), respond to **any message**, or switch the channel **Off**. Off mutes inbound activation without removing the Slack App or preventing scheduled and delegated outbound posts. See [Integrations overview](/docs/integrations-overview#binding-channels).

Handy in-channel commands (handled by the daemon, see [Integrations overview](/docs/integrations-overview)): `!stop` interrupts the current turn, `!queue <message>` delivers a message once the agent is idle.

## Shared Slack bots

When creating the bot you can tick **Shared bot** — one Slack app that serves **multiple agents**, routed per channel. Manage the routing under **Settings → Bots**: expand the bot's channel roster and set the **Default dispatch** agent for each channel. Inbound messages for shared bots arrive through AgentConnect's relay; replies still come straight from your daemon.

For the complete setup, see [One Slack app with different agents by channel](/docs/one-slack-app-across-channels).

## Managing Slack bots

**Settings → Bots → Slack** lists every Slack bot in the org: which agent uses it, its channels, a **Configure on Slack** deep link into Slack's app settings, a sync/refresh action, and deletion for bots no agent is using.
