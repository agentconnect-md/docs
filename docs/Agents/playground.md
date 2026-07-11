---
title: Playground
excerpt: A live browser session with any agent — try prompts, switch models and permission modes, no channel required.
hidden: false
---

The **Playground** button on an agent page opens a live conversation with that agent, straight from the browser. It's the fastest way to check that a new agent works, iterate on prompts, or debug behavior — before (or without) wiring the agent into a channel.

![A Playground session](https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/playground.png)

## What you get

- A real session on the agent's daemon — same runtime, same workspace, same tools as a channel conversation.
- Streaming output: replies, thinking, tool calls and file edits appear as they happen, exactly like the [session transcript view](/docs/sessions).
- **In-session switches** in the bar above the composer: **model**, **reasoning effort**, **permission mode**, **fast mode** — they apply to your next turn, without touching the agent's saved configuration. Live token count, context usage and cost sit alongside.
- **Cancel** interrupts the agent mid-turn.

## Sandbox vs. saved conversations

A Playground opened from the agent button is a **sandbox**: it exists while you have it open and isn't kept as history. Conversations started through the web chat surface (and any Playground session that has been persisted) appear in **Sessions** like every other run, labeled **Playground**, with you as the sender ("You") — and you can reopen one later and continue typing where you left off.

## Tips

- Test **permission modes** here before unleashing an agent on a shared channel — try *Plan* or *Ask* first, watch what it wants to do, then relax.
- The Playground respects the agent's workspace: an agent cloned from GitHub will answer questions about that repo out of the box.
- If the composer reports the agent as unreachable, check its daemon is online — Playground sessions run on the daemon, not in the cloud.
