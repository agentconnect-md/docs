---
title: 🧪 Playground
excerpt: A live browser session with any agent — try prompts, switch models and permission modes, no channel required.
hidden: false
---

The **Playground** button on an agent page opens a live conversation with that agent, straight from the browser. It's the fastest way to check that a new agent works, iterate on prompts, or debug behavior — before (or without) wiring the agent into a channel.

![A Playground session](https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/playground.png)

## What you get

Playground creates a real session on the agent's daemon, using the same runtime, workspace, and tools as a channel conversation. Its output streams into the same kind of [session transcript](/docs/sessions).

You can change supported runtime settings for the next turn without altering the agent's saved configuration, and interrupt a turn when needed.

## When the session is saved

Opening Playground starts with an empty, temporary view. Your first message creates a real private session on the agent's daemon. It appears in **Sessions**, labeled **Playground** with you as the sender ("You"), and you can reopen it later and continue where you left off.

## Tips

- Test **permission modes** here before using an agent in a shared channel — try *Plan* or *Ask for approval* first, watch what it wants to do, then relax.
- The Playground respects the agent's workspace: an agent cloned from GitHub will answer questions about that repo out of the box.
- If the composer reports the agent as unreachable, check its daemon is online — Playground sessions run on the daemon, not in the cloud.
