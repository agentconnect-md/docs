---
title: 🧪 Playground
excerpt: Start a private browser conversation with one or several agents, without connecting a channel.
hidden: false
---

Playground is a private browser conversation with agents running on your daemons. Open it from an agent page for a single-agent session, or use the Home composer to bring several agents into the same conversation.

![A Playground session](https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/playground.png)

## What you get

Playground creates a real session on the agent's daemon, using the same runtime, workspace, and tools as a channel conversation. Its output streams into the same kind of [session transcript](/docs/sessions).

You can change supported runtime settings for the next turn without altering the agent's saved configuration, and interrupt a turn when needed.

## Work with several agents

Add agents before the first message from the Home composer, or add them to an existing Playground conversation.

- A message without an `@AgentName` goes to every participant. Each agent may answer or stay silent.
- An explicit `@AgentName` narrows that turn to the named participant or participants.
- Every agent keeps its own configuration while the browser combines their activity into one conversation.

## When the session is saved

Opening Playground starts with an empty, temporary view. Your first message saves the private conversation under **Sessions**, where you can reopen it later.

## Tips

- Test **permission modes** here before using an agent in a shared channel — try *Plan* or *Ask for approval* first, watch what it wants to do, then relax.
- The Playground respects the agent's workspace. For a new single-agent conversation backed by GitHub, choose whether its first turn uses an isolated worktree without changing the agent's saved default.
- If the composer reports an agent as unreachable, check its daemon is online — Playground sessions run on the participating daemons, not in the cloud.
