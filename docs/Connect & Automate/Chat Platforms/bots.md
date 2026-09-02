---
title: 🪪 Bots
excerpt: The organization-wide roster of Slack, Telegram, Discord, Lark / Feishu, and Linear identities.
hidden: false
---

A **bot** is the durable identity that lives in your chat platform: a Slack or Lark / Feishu app, Telegram bot, or Discord application. Integrations bind bots to agents; the bots themselves are managed in **Settings → Bots**, one card per platform.

A connected [Linear](/docs/linear) workspace has a row on the same page. There the identity is the workspace itself — every agent enabled on it is a member — so its row reads *workspace* rather than *bot*.

<p align="center">
  <img src="https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/slack-integration.png" alt="Create or reuse a bot identity for an agent" width="640" />
</p>

## The roster

The roster shows the bot identities registered with the organization and the agents currently using them. Deleting an integration frees its bot for reuse without uninstalling it from the chat platform.

## Channel roster & shared-bot routing

For a **shared** bot, one identity can serve several agents and route each channel to a different active agent. See [Integrations overview](/docs/integrations-overview) for the model and [One Slack app with different agents by channel](/docs/one-slack-app-across-channels) for the complete setup.

## Deleting a bot

Only **free** bots can be deleted — uninstall/delete its integration first if an agent still uses it. Deleting removes the stored tokens from AgentConnect; remove the app itself in Slack, BotFather, the Discord Developer Portal, or the Lark / Feishu developer console.

A Linear workspace is **disconnected** instead, from its own row action, and that does not wait for its agents to be unlinked: it removes the workspace for the whole organization — including agents you cannot see — and gives up the grant at Linear. The same row's **Reconnect** repairs a grant that expired or was revoked in Linear.
