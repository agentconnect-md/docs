---
title: Sessions
excerpt: Every agent run, replayable — filters, the transcript anatomy, tool call detail, and live sessions.
hidden: false
---

**Sessions** is the flight recorder: every run of every agent — from Slack threads, GitHub events, webhooks, schedules or the Playground — with the full conversation, tool calls and token costs.

![A session transcript](https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/session-detail.png)

## The list

Each row shows the session title, when it ran and what triggered it, the agent, the integration + channel, status, and tokens. Filter by **agent**, **integration**, **channel**, or **trigger** — triggers group into **People** (who wrote), **Webhooks** and **Schedules**. Sessions triggered by a schedule link back to it.

## Inside a session

The header carries the facts: agent, integration and channel (with a link to the original thread — e.g. the Slack permalink), daemon, runtime + model, participants, and a **Copy link** button. Stat cards summarize **Duration**, **Tokens**, **Cost**, **Tool calls**, and a **Token usage** card breaks tokens down: **Input / Output / Thought / Cache read / Cache write / Context** (how full the context window is) — whatever the runtime reports.

Sessions snapshot their execution config: the header reflects what the run *actually used*, even if you've reconfigured the agent since.

### The transcript

User turns show the sender and the source (e.g. a `SLACK` chip). Agent turns are broken into steps, each tagged with a lane:

| Lane | Meaning |
| --- | --- |
| **MSG** | A message posted to the conversation |
| **THINK** | The agent's reasoning |
| **PLAN** | A plan it laid out |
| **TOOL** | A tool call — command, API call, file read |
| **EDIT** | A file edit, with the touched files as chips |

Tool steps expand (**View detail**) into the raw **input / output / content / locations**, with diffs rendered and big payloads truncated behind **View full**.

## Where transcripts live

Transcripts are **fetched live from the daemon that ran the session** — the control plane stores only metadata (title, status, token totals). That's why a transcript can't load while its daemon is offline, and why your conversations are never sitting in someone else's database.

## Live sessions

A session that's still running streams in place — typing indicators, new steps appearing as they happen. Playground/web sessions add a composer plus in-session switches (model, effort, permission mode, fast mode) and a **Cancel** button; see [Playground](/docs/playground).
