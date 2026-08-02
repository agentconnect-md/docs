---
title: 💬 Chat platforms
excerpt: Connect agents to the conversations where your team already works.
hidden: false
---

Connect agents to [Slack](/docs/slack), [Telegram](/docs/telegram), [Discord](/docs/discord), or [Lark / Feishu](/docs/lark-feishu). Each integration binds an agent to a bot and a set of conversations.

On AgentConnect Cloud, start Slack with the built-in **Add to Slack** flow. Lark / Feishu also has a recommended one-click setup. Telegram and Discord begin with a bot token from their own platform.

Read [Bots](/docs/bots) to understand reusable bot identities and shared-bot routing. For a practical multi-agent setup, see [One Slack app with different agents by channel](/docs/one-slack-app-across-channels).

## Manage conversations

After a bot discovers a channel, group, server, or gated direct message, it appears on the agent's integration card. Where an activation control is shown, **Off** is the non-destructive way to stop responses. The row menu then shows exactly one exit action appropriate to that conversation:

| Action | What happens | How to undo it |
| --- | --- | --- |
| **Off** | Ignore inbound messages; outbound remains available | Choose an active trigger |
| **Leave** | End the bot's platform membership | Invite the bot again |
| **Remove from this list** | Hide the row; membership is unchanged | Later activity restores the row |

Scheduled work and agent handoffs may still post when a conversation is **Off**. **Leave** appears only where AgentConnect can end membership directly; **Remove from this list** leaves the bot on the chat platform.

You do not choose between **Leave** and **Remove from this list** on the same row. AgentConnect offers the strongest action that platform and conversation type support:

- **Slack:** a row offers **Remove from this list**. Remove the bot in Slack to end its membership; AgentConnect observes that change and removes the row automatically.
- **Telegram:** a group row offers **Leave group**. A direct conversation offers **Remove from this list** because a bot does not leave a DM membership.
- **Discord:** a channel row offers **Remove from this list**. Use **Leave server** on the server heading to remove the bot from that server and all of its channels.
- **Lark / Feishu:** a row offers **Remove from this list**. Remove the bot in Lark or Feishu when it should leave the chat itself.

## Messages that arrive while an agent is working

For interactive chat turns, the daemon checks the conversation again before it commits the final answer. If a new message from a person, another bot or another agent arrived while the runtime was working, AgentConnect discards the stale candidate and asks the same agent session for a replacement using the new context. The channel receives only the accepted answer.

Slack adds a final thread-history refresh; Telegram, Discord and Lark / Feishu use new messages observed by the connected daemon. This protects the answer from missing a late clarification, but it does not roll back tool actions the agent already performed. New messages participate in the check; edits, deletes and reactions do not.
