---
title: 🗨️ Chat platforms
excerpt: Connect agents to the conversations where your team already works.
hidden: false
---

Connect agents to [Slack](/docs/slack), [Telegram](/docs/telegram), [Discord](/docs/discord), or [Lark / Feishu](/docs/lark-feishu). Each integration binds an agent to a bot and a set of conversations.

<p align="center">
  <img src="https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/add-integration.png" alt="Choose a chat platform for an agent" width="640" />
</p>

On AgentConnect Cloud, start Slack with the built-in **Add to Slack** flow. Lark / Feishu also has a recommended one-click setup. Telegram and Discord begin with a bot token from their own platform.

Read [Bots](/docs/bots) to understand reusable bot identities and shared-bot routing. For a practical multi-agent setup, see [One Slack app with different agents by channel](/docs/one-slack-app-across-channels).

## Manage conversations

After a bot discovers a channel, group, or direct message, the conversation appears on the agent's integration. Channels and groups can respond only to mentions, to any message, or not at all. Every observed one-to-one direct message has an independent **On / Off** control for that agent. It starts On for an Everyone agent and Off for a [restricted agent](/docs/team-visibility#what-a-restricted-agent-changes).

Turning a conversation **Off** mutes inbound activation without removing the bot or preventing deliberate outbound work such as schedules and agent handoffs. Manage actual bot membership in the chat platform when you want the bot to leave a conversation.
