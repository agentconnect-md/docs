---
title: 🧵 Sessions
excerpt: Review agent runs, inspect transcripts, and understand where session data lives.
hidden: false
---

**Sessions** is the flight recorder for every agent run from Slack threads, GitHub events, webhooks, schedules, or the Playground. The list contains only work allowed by both the owning agent's team visibility and its [session audience](/docs/session-visibility).

<p align="center">
  <img src="https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/session-detail.png" alt="A session transcript with the agent's plan, file edits, and tool output expanded" width="900" />
</p>

## Find a session

Use the session list to find work by agent or source and follow scheduled runs back to the schedule that created them. When several agents participate in the same supported conversation, the list groups their sessions into one row.

<p align="center">
  <img src="https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/sessions-list.png" alt="The session list, filtered by agent, integration, channel, or trigger" width="900" />
</p>

## Review a run

Each session records its source, agent, participants, daemon, runtime and model, along with duration, token usage, cost when available, and tool activity. Where the provider supplies it, the session links back to the original conversation.

Sessions snapshot their execution config: the header reflects what the run _actually used_, even if you've reconfigured the agent since.

### The transcript

The transcript separates messages, reasoning, plans, tool calls, and file edits. Tool activity includes the available input and output, with diffs for file changes, so you can understand how the agent reached its result.

## When several agents share a conversation

Each agent still runs in its own session with its own configuration and permissions. In a multi-agent Playground or supported IM conversation, the console presents those participant sessions as one conversation with attributed activity and combined current usage. This applies to Slack, Telegram, Discord, Lark, and Feishu conversations.

This grouping is a view over the sessions, not a new permission boundary. You see only the participant work you are allowed to read. See [Multi-agent work modes](/docs/multi-agent-work-modes) for ways to bring agents together.

## Where transcripts live

The Control Plane stores session metadata such as title, status, timestamps, and token totals. Transcript messages and tool bodies remain on the daemon that ran the session.

When an authorized person opens a transcript, the console reads it from the owning daemon without persisting the body in the Control Plane. Metadata can remain visible while a daemon is offline, but its transcript cannot load until the daemon returns.

## Retention and cleanup

Each daemon keeps finished session content for **7 days** by default. When adding or editing a daemon, use **Expire sessions** to choose a common window, enter a custom number of days, or keep sessions indefinitely.

After the retention period, the daemon deletes the transcript, tool details and any Git worktree created for that session. Session metadata remains in the Control Plane, so the session stays in the list and clearly shows that its content was deleted by the retention policy.

Active sessions are not removed. AgentConnect also keeps a session worktree when it contains uncommitted work or commits that have not reached a remote.

## Session audience

For a directly managed session, the header shows **Everyone / Private** when its matched owner may change the audience. A provider-bound session can instead follow **Slack members**, **Feishu / Lark members**, or **GitHub members** after the organization enables the corresponding setting under **Settings → Session access**. Making a session private hides the transcript immediately and can also change future memory capture; review [Session visibility](/docs/session-visibility) before tightening it.

## Cross-platform handoffs stay separate

Conversation grouping does not merge different platforms or threads. A cross-platform handoff keeps one session on the source platform and starts a linked session on the destination. Replies stay where they were written unless the agent deliberately carries a result back.

See [Hand off conversations between trusted workspaces](/docs/hand-off-conversations-across-messaging-platforms) for a Telegram-to-Slack example and a reusable agent instruction.

## Live sessions

Running sessions update in place. Sessions started in the [Playground](/docs/playground) can also be continued from the browser.
