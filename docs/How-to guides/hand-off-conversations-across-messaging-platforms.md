---
title: 🌉 Hand off conversations between trusted workspaces
excerpt: Move work between two messaging workspaces you trust, while keeping each platform's session and audience boundaries explicit.
hidden: false
---

Use this pattern only when the source and destination are **two messaging workspaces you trust**. That means you control or explicitly approve both environments, know who can read the destination, and accept its security and retention rules.

> **Trust boundary:** Connecting an agent to two platforms gives it the ability to move content between them. It does not make an external, customer, partner, or community workspace trusted. Treat each as a separate boundary; if either side is not explicitly approved for this information, do not configure a routine handoff. Send a one-time, reviewed, and redacted message instead.

Here, _workspace_ means a Slack workspace, Discord server, Lark / Feishu tenant, or known Telegram group or chat — not the agent's code workspace.

Within that trust boundary, one AgentConnect agent can use more than one chat platform. A conversation can start in a Telegram DM, move to a trusted Slack incident channel for team input, and return a concise result to the original Telegram conversation.

This is a deliberate **handoff**, not a live mirror. Each platform keeps its own thread and AgentConnect session. The destination session is linked to the source so the agent can report back without merging the two transcripts.

| Start                    | Destination               | Useful for                                       |
| ------------------------ | ------------------------- | ------------------------------------------------ |
| Telegram DM              | Slack `#incidents`        | Escalating private investigation to a team       |
| Slack engineering thread | Discord release channel   | Publishing a decision where another team works   |
| Lark / Feishu project chat | Slack stakeholder channel | Sending an approved summary and collecting input |

## Before you start

You need:

- two trusted messaging workspaces that are approved to exchange the relevant information;
- one online agent connected to both the source and destination platforms;
- a bot that can post in the destination channel or chat; and
- a clear rule for what information may leave the source conversation.

The same agent owns both sides of this pattern. Connecting two different agents is [agent-to-agent delegation](/docs/multi-agent-work-modes#agent-to-agent-delegation), not a cross-platform handoff.

## 1. Connect both platforms to the agent

Open the agent and add each chat integration under **Integrations**. Connect only bots inside the approved trust boundary, then invite or add the destination bot wherever it should be allowed to post.

Use one bot per platform on this agent when possible. If several destination bots are connected, cross-platform sends use the first available one unless the agent is given a specific integration ID.

Before the first handoff, check **Settings → Bots** and verify the Slack workspace or Lark / Feishu tenant for the bot, and the Discord server or Telegram chat around the destination. A familiar channel name is not enough: two workspaces can both contain `#incidents`.

## 2. Confirm that the destination is reachable

Before sending anything, ask the agent to list the destinations it can reach:

```text
List the Slack channels you can post to through our approved internal
Slack bot. Do not send a message yet.
```

AgentConnect gives the agent built-in channel discovery across its connected platforms.

Telegram bots cannot enumerate every chat. AgentConnect can offer Telegram chats the agent has already observed, so start the bot in a DM or add it to the group before asking the agent to send there. On any platform, the bot still needs permission to view and post in the destination.

## 3. Start a handoff

Ask for a new top-level destination message and specify exactly what may be shared:

```text
Hand this incident off to Slack #incidents.

- Use only the approved internal Slack workspace. If you cannot verify it,
  stop and ask me.
- Post a new top-level message.
- Include the symptoms, what I already tried, and the open question.
- Do not copy names, credentials, or unrelated messages from this DM.
- Ask the team for a decision.
- When someone replies in the new Slack thread, send a concise result back here.
```

The agent discovers the target channel and posts through its Slack integration. The new top-level post starts a linked Slack session without automatically replying to the agent's own post. Human replies in its thread then continue the Slack-side session.

For a two-way handoff, use a **new top-level message**. Posting into an existing destination thread adds a message there, but it does not create a new linked session with a return path to the source.

## 4. Make the behavior reusable

Put a short policy in the agent's **Description** if cross-platform handoffs are a regular workflow. AgentConnect includes the Description in the agent's standing instructions:

```text
## Cross-platform handoffs

When I ask you to move work to another messaging platform:
1. Send only between messaging workspaces on the approved allowlist.
2. If you cannot verify the destination workspace, stop and ask.
3. Confirm the channel or chat when it is ambiguous.
4. Share a concise handoff, not the full source transcript.
5. Never copy secrets or private-message details without explicit approval.
6. Use a new top-level destination message when I ask for a result back.
7. When the destination session has a Parent session, send the requested
   result back to that parent before finishing.
8. Do not mirror every message in both directions.
```

The destination session receives the source as its **Parent session**. That lets the agent send a direct result back across platforms without needing a channel ID or bot token in its prompt.

## What stays separate

- **Trust boundaries:** connecting both platforms does not authorize data sharing with every workspace, server, tenant, channel, or participant the bots can reach.
- **Sessions and transcripts:** the source and destination appear as separate, linked sessions. Their message histories are not merged.
- **Platform access:** each bot can only reach conversations allowed by that platform and its permissions.
- **Threads:** replies remain in the platform thread where they were written unless the agent deliberately reports back.
- **Persistent memory:** memory is shared by the agent across its sessions, but it is not a transcript bridge. Include current task context in the handoff summary.
- **People and IDs:** a Slack member ID is not a Telegram or Discord identity. Cross-platform delivery targets a channel or chat, not an assumed matching user.

## Good handoff patterns

- Move an internal incident between your company's trusted Telegram and Slack workspaces.
- Escalate a DM into a team channel, then return only the decision.
- Publish a release or incident summary to another team's platform.
- Ask for feedback in one destination thread and report the outcome to the source.
- Send a one-way status update without asking the destination session to report back.

Do not use a routine handoff between workspaces with different trust levels, such as an internal Slack workspace and a customer's Discord server. Also avoid an automatic two-way mirror: it creates duplicate messages, unclear ownership, accidental disclosure, and response loops. Keep the approved workspaces, source, destination, and return condition explicit.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Destination missing | Connect it and add the bot to the channel or chat |
| Wrong workspace | Verify the bot under **Settings → Bots** |
| Telegram chat missing | Start or use the bot in that chat first |
| No result returns | Use a new top-level message and report to the Parent session |
| Wrong bot posts | Keep one bot or specify the integration ID |
| Messages bounce between platforms | Use one handoff and one defined return update |

See [Integrations overview](/docs/integrations-overview) to connect platforms and [Sessions](/docs/sessions) to inspect each side of the handoff.
