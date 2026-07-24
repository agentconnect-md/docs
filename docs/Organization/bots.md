---
title: 🤖 Bots
excerpt: The org-wide roster of Slack, Telegram and Discord bot identities — reuse, sharing, channel routing and cleanup.
hidden: false
---

A **bot** is the durable identity that lives in your chat platform — the Slack app, the Telegram bot, the Discord application — with its tokens stored encrypted and used only from your daemons. Integrations bind bots to agents; the bots themselves are managed in **Settings → Bots**, one card per platform.

## The roster

Each row is one bot: which agents it serves, who created it, whether it's **sharable**, and actions. **Show in use** filters the list. A bot whose integration was deleted becomes **free** — it stays installed on the platform and can be rebound to another agent instantly (the **Use an existing bot** option when adding an integration).

## Channel roster & shared-bot routing

Expand a bot to see every channel it's present in. For a **shared** bot (one bot serving several agents — see [Integrations overview](/docs/integrations-overview)), each channel row has an **Active agent** picker: that's where you decide which agent answers in which channel.

## Platform extras

- **Slack** — a **Configure on Slack** deep link into the app's settings page, a refresh/sync action, and the org's **configuration token** block (paste a config token pair to unlock [one-click Slack installs](/docs/slack); **Replace** / **Clear** anytime).
- **Discord** — an **Add to Discord** invite link, built for the app with the right scopes.
- **Telegram** — the bot list with its agents.

## Deleting a bot

Only **free** bots can be deleted — uninstall/delete its integration first if an agent still uses it. Deleting removes the stored tokens from AgentConnect; the app itself you remove on the platform's side (Slack app settings / BotFather / Discord Developer Portal).
