---
title: ⚙️ Configure an agent
excerpt: The agent page — editing behavior, output verbosity, pausing, env vars, sub-agent policy, memory and the agent API.
hidden: false
---

Open any agent from **Agents** to reach its page: status, meta chips (model, daemon, integrations, session count), a **Playground** button, and tabs — **Configuration**, **Workspace**, **Memory**, **API**, **Knowledge & Tools**.

![An agent's Configuration tab](https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/agent-detail.png)

## General

**Edit** on the General card changes anything you set at creation (except workspace mode and daemon): display name, model, effort/reasoning, fast mode, permission mode — plus one field that only exists here:

- **Output mode** — **Low / Medium / High**: how much of the agent's activity is posted back to the platform. **Low** posts final answers; **High** narrates tool use and progress. Chat channels usually want Low or Medium; the full detail is always in [Sessions](/docs/sessions) regardless.

## Pause

**Pause** (⋯ menu) stops the agent from processing new messages without deleting anything — integrations stay bound, history stays. Unpause to resume.

## Environment variables

The **Environment** card sets env vars for the agent's sessions on the daemon — API endpoints, feature flags, anything its tools need. Values live with the agent config on your daemon.

## Agent visibility (sub-agent calls)

Agents can call each other as sub-agents. The **Agent visibility** card controls both sides of that relationship:

- **Inbound: Which agents can call this agent?**
- **Outbound: Which agents can this agent call?**

Each direction can allow **All agents** or a **Selected** list. A call is permitted only when the source's outbound policy and the target's inbound policy both allow it, and the agents are eligible in the current conversation.

See [Agent visibility](/docs/agent-visibility) for the full policy and examples. Who on the team can see the agent is controlled separately by [Visibility & sharing](/docs/visibility-and-sharing).

## Memory

The **Memory** tab shows the agent's persistent memory and is the one place to switch its backend: **Managed**, **Native**, **External**, or **None**. Managed memory can be edited as files; an external backend exposes capability-driven records instead. Switching does not migrate existing memory — the old store remains in place but is no longer loaded.

For a complete external-backend walkthrough, including recall/capture policies and a self-hosted Mem0 example, see [External memory with Mem0 OSS](/docs/external-memory).

## API

The **API** tab shows how to talk to this agent from your own code: you mint a short-lived conversation token over REST (authenticated with an [API key](/docs/api-keys)), then open a WebSocket to the returned relay URL and stream the run — `ready`, `ack`, `output`, `done`, `error` events. Message content flows between you, the relay and the daemon; it never passes through the control plane. The tab includes a copy-paste JavaScript snippet wired to this agent's IDs.

For the REST surface (agents, sessions, schedules — everything the console does), see the [API reference](/reference).

## Knowledge & Tools

Shows the MCP servers available from the daemon runtime and anything indexed from the workspace (loaded on first clone and on each pull).

## Delete

**Delete** (⋯ menu) removes the agent from the org. Its integrations are released (bots become reusable) and its workspace directory stays on the daemon's disk until cleaned up there.
