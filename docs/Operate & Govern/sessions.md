---
title: 🧵 Sessions
excerpt: Review agent runs, inspect transcripts, and understand where session data lives.
hidden: false
---

**Sessions** is the flight recorder for every agent run from Slack threads, GitHub events, webhooks, schedules, or the Playground. The list contains only sessions allowed by both the owning agent's team visibility and its [session audience: Everyone, Private, Slack members, or GitHub access](/docs/session-visibility).

![A session transcript](https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/session-detail.png)

## Find a session

Use the session list to find runs by agent or source and follow scheduled runs back to the schedule that created them.

## Review a run

Each session records its source, agent, participants, daemon, runtime and model, along with duration, token usage, estimated cost (the runtime's own report where available, otherwise derived from token usage and public list prices), and tool activity. Where the provider supplies it, the session links back to the original conversation.

Sessions snapshot their execution config: the header reflects what the run _actually used_, even if you've reconfigured the agent since.

### The transcript

The transcript separates messages, reasoning, plans, tool calls, and file edits. Tool activity includes the available input and output, with diffs for file changes, so you can understand how the agent reached its result.

## Where transcripts live

The Control Plane stores session metadata such as title, status, timestamps, and token totals. Transcript messages and tool bodies remain on the daemon that ran the session.

When an authorized person opens a transcript, the console requests a bounded live read through the Control Plane BFF. The response is proxied from the daemon and is not persisted by the Control Plane. That is why metadata can remain visible while a daemon is offline, but its transcript cannot load.

For a directly managed session, the header shows **Everyone / Private** when its matched owner may change the audience. A provider-bound session instead shows read-only **Slack members** or **GitHub access** after its organization enables the corresponding setting under **Settings → Session access**. A session created while that setting is disabled remains **Everyone** until provider access is synchronized. Making a session private hides the transcript immediately and can also change future memory capture; review the [session visibility and memory caveats](/docs/session-visibility) before tightening it.

## Sessions across messaging platforms

A cross-platform handoff keeps one session on the source platform and starts a linked session on the destination. The two transcripts remain separate: replies stay in the platform thread where they were written unless the agent deliberately reports a result back to the parent session.

See [Hand off conversations between trusted workspaces](/docs/hand-off-conversations-across-messaging-platforms) for a Telegram-to-Slack example and a reusable agent instruction.

## Live sessions

Running sessions update in place. Sessions started in the [Playground](/docs/playground) can also be continued from the browser.
