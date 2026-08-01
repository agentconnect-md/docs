---
title: 💬 Slack
excerpt: Install the built-in AgentConnect Slack app in one click, or connect a custom app when an agent needs its own identity.
hidden: false
---

On **AgentConnect Cloud**, the recommended path is the built-in **Add to Slack** app. You approve the workspace installation; AgentConnect completes the OAuth flow and connects it without asking for an App manifest, token, signing secret, or callback URL.

## Add AgentConnect to Slack on Cloud

The built-in Slack app belongs to the built-in `agentconnect` agent. Place that agent on a daemon and choose its runtime and model first, then use either entry point:

- open the **Getting started** card and choose **Add to Slack**; or
- open the `agentconnect` agent, then **Integrations → Add integration → Slack**.

Click **Add to Slack**, choose the workspace, and approve the requested permissions. The console waits for Slack and closes the setup automatically when the bot is ready. AgentConnect recommends one bot identity per agent, so the installation initially serves only the built-in agent.

## Use it

Invite the bot to a channel:

```text
/invite @your-bot
```

Mention it to start a conversation; unmentioned follow-ups stay in the thread the agent already joined. The bot also answers direct messages.

Each discovered channel appears on the agent's Integrations card. Choose **@-mentions** (the default), **any message**, or **Off** for inbound activation. Off does not uninstall the app or block scheduled and delegated outbound posts. `!stop` interrupts the current turn and `!queue <message>` waits until the agent is idle.

The row menu offers **Remove from this list**, which hides the row but does not remove the bot from Slack. If the conversation is still active, a later listing or message can make the row return. To end channel membership, remove the bot in Slack; AgentConnect observes that change and removes the row automatically.

## Give an agent a custom Slack identity

On the built-in agent, choose **Use a custom bot identity instead** when it needs a dedicated Slack App. Other agents open the custom-identity flow directly. This is also the normal path when a self-hosted deployment does not publish a built-in app.

### Configuration-token install

This is the recommended custom-app path. If you have not saved a Slack configuration token yet, AgentConnect links to [Slack's configuration-token page](https://api.slack.com/authentication/config-tokens). Paste the access token (`xoxe.xoxp-…`) and its refresh token (`xoxe-…`) so AgentConnect can rotate it; an access token saved alone expires after roughly 12 hours. Slack scopes the pair to one user and workspace. AgentConnect saves it for that signed-in user, who can replace or clear it under **Your profile → Slack config token**.

Name the App, click **Create & install**, and approve it in Slack. With **HTTP (Events API)** delivery, AgentConnect captures the bot token and signing secret and finishes without credential copy-and-paste. With **Socket Mode**, Slack still requires you to generate one App-Level token with `connections:write` and paste the resulting `xapp-…` token.

### Manifest install

Use the manual fallback when you cannot create Slack configuration tokens:

1. Choose **Copy manifest & open Slack**, then create and install the App from the copied manifest.
2. For **HTTP**, paste the Bot User OAuth token (`xoxb-…`) and signing secret.
3. For **Socket Mode**, paste the Bot User OAuth token and an App-Level token (`xapp-…`) with `connections:write`.

If Slack reports changed scopes, reinstall the App once before copying the Bot User OAuth token.

## Delivery modes and self-hosting

- **HTTP (Events API)** is the Cloud default. Inbound callbacks enter through the AgentConnect Relay and go directly to the owning daemon. HTTP is required for a sharable bot.
- **Socket Mode** is a daemon-owned outbound connection. It needs no Relay or public callback URL and is limited to one agent per bot.

Self-hosted deployments show the built-in **Add to Slack** path only after the operator configures the [deployment-wide Slack App](/docs/deployment-and-configuration#optional-deployment-wide-add-to-slack-app). Otherwise, use a custom App. HTTP is available only when the deployment has a public, connected Relay; without one, use Socket Mode.

## Use one Slack app with multiple agents

AgentConnect generally recommends one bot identity per agent. If your team deliberately wants one Slack identity to behave differently across channels, make the bot sharable and dispatch each channel to a different agent:

1. Open **Settings → Bots → Slack** and turn on **Sharable** for the bot.
2. On each additional agent, choose **Integrations → Add integration → Slack → Use an existing bot** and select it.
3. Back in **Settings → Bots**, expand the bot and choose each channel's **Default dispatch** agent.

See [One Slack app with different agents by channel](/docs/one-slack-app-across-channels) for the full pattern.

## Managing Slack bots

**Settings → Bots → Slack** lists every Slack bot in the organization: its workspace, transport, sharable state, connected agents and channels, a **Configure on Slack** link, refresh/reauthorization actions, and deletion for bots no agent is using.
