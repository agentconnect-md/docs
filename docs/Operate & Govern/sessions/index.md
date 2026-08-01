---
title: 🧵 Sessions
excerpt: Every agent run, replayable — filters, the transcript anatomy, tool call detail, and live sessions.
hidden: false
---

**Sessions** is the flight recorder for every agent run from Slack threads, GitHub events, webhooks, schedules, or the Playground. The list contains only sessions allowed by both the owning agent's team visibility and its [session audience: Everyone, Private, or Slack members](/docs/session-visibility).

![A session transcript](https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/session-detail.png)

## The list

Each row shows the session title, when it ran and what triggered it, the agent, the integration + channel, status, and tokens. Filter by **agent**, **integration**, **channel**, or **trigger** — triggers group into **People** (who wrote), **Webhooks** and **Schedules**. Sessions triggered by a schedule link back to it.

## Inside a session

The header carries the facts: agent, integration and channel (with a link to the original thread — e.g. the Slack permalink), daemon, runtime + model, participants, and a **Copy link** button. Stat cards summarize **Duration**, **Tokens**, **Cost**, **Tool calls**, and a **Token usage** card breaks tokens down: **Input / Output / Thought / Cache read / Cache write / Context** (how full the context window is) — whatever the runtime reports.

Sessions snapshot their execution config: the header reflects what the run _actually used_, even if you've reconfigured the agent since.

### The transcript

User turns show the sender and the source (e.g. a `SLACK` chip). Agent turns are broken into steps, each tagged with a lane:

| Lane      | Meaning                                      |
| --------- | -------------------------------------------- |
| **MSG**   | A message posted to the conversation         |
| **THINK** | The agent's reasoning                        |
| **PLAN**  | A plan it laid out                           |
| **TOOL**  | A tool call — command, API call, file read   |
| **EDIT**  | A file edit, with the touched files as chips |

Tool steps expand (**View detail**) into the raw **input / output / content / locations**, with diffs rendered and big payloads truncated behind **View full**.

## Where transcripts live

The Control Plane stores session metadata such as title, status, timestamps, and token totals. Transcript messages and tool bodies remain on the daemon that ran the session.

When an authorized person opens a transcript, the console requests a bounded live read through the Control Plane BFF. The response is proxied from the daemon and is not persisted by the Control Plane. That is why metadata can remain visible while a daemon is offline, but its transcript cannot load.

For a directly managed session, the header shows **Everyone / Private** when its matched owner may change the audience. A session synchronized under **Follow Slack conversation access** instead shows read-only **Slack members** and follows current access to its source conversation. A shared Slack session created while that setting is disabled remains **Everyone** and shows no Slack members badge. Making a session private hides the transcript immediately and can also change future memory capture; review the [session visibility and memory caveats](/docs/session-visibility) before tightening it.

## Sessions across messaging platforms

A cross-platform handoff keeps one session on the source platform and starts a linked session on the destination. The two transcripts remain separate: replies stay in the platform thread where they were written unless the agent deliberately reports a result back to the parent session.

See [Hand off conversations between trusted workspaces](/docs/hand-off-conversations-across-messaging-platforms) for a Telegram-to-Slack example and a reusable agent instruction.

## Live sessions

A session that's still running streams in place — typing indicators, new steps appearing as they happen. Playground/web sessions add a composer plus in-session switches (model, effort, permission mode, fast mode) and a **Cancel** button; see [Playground](/docs/playground).
