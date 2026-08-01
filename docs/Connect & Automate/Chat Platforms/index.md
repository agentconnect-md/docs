---
title: 💬 Chat platforms
excerpt: Connect agents to the conversations where your team already works.
hidden: false
---

Connect agents to [Slack](/docs/slack), [Telegram](/docs/telegram), [Discord](/docs/discord), or [Lark / Feishu](/docs/lark-feishu). Each integration binds an agent to a bot and a set of conversations.

On AgentConnect Cloud, start Slack with the built-in **Add to Slack** flow. Lark / Feishu also has a recommended one-click setup. Telegram and Discord begin with a bot token from their own platform.

Read [Bots](/docs/bots) to understand reusable bot identities and shared-bot routing. For a practical multi-agent setup, see [One Slack app with different agents by channel](/docs/one-slack-app-across-channels).

## Manage conversations

After a bot discovers a channel, group, server, or gated direct message, it appears on the agent's integration card. The row's trigger and menu offer three different outcomes:

| Action | What happens | How to undo it |
| --- | --- | --- |
| **Off** | The bot stays in the conversation but ignores inbound messages there. Scheduled work and agent handoffs may still post to it. | Choose **@-mentions** or **any message** again. |
| **Leave** | The bot leaves on the chat platform and the conversation stops being listed. This appears only where the provider supports that action. | Invite the bot again. |
| **Forget this conversation** | AgentConnect removes the row without changing anything on the chat platform. Use it after the bot has already left. | If the bot is still present, a later listing or message makes the row return. |

The available Leave action depends on the platform:

- **Slack:** remove the bot in Slack; AgentConnect sees the membership change and removes the row automatically.
- **Telegram:** open the group's row menu and choose **Leave group**.
- **Discord:** use the server-level leave action. A Discord bot joins a server rather than one channel, so leaving removes it from every channel in that server.
- **Lark / Feishu:** remove the bot in Lark or Feishu, then use **Forget this conversation** if the old row remains listed.
