---
title: ⚙️ Configure an agent
excerpt: Edit an agent's persona, runtime behavior, placement, workspace, access, memory, tools and API.
hidden: false
---

Open any agent from **Agents** to reach its page: status, meta chips (model, daemon, integrations, session count), a **Playground** button, and tabs — **Integrations**, **Configuration**, **Workspace**, **Memory**, **API**, and **Tools & Skills**.

![An agent's Configuration tab](https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/agent-detail.png)

## Configuration

The Configuration tab groups **Basics**, **Runtime**, **Description**, **Access**, **Variables**, and **Secrets**. **Edit** lets you change the display name, daemon, runtime, model, effort/reasoning, fast mode, permission mode and sandbox setting. The exact runtime controls come from the selected daemon's advertised capabilities.

**Output mode** controls what reaches connected chat platforms; the full transcript remains available in [Sessions](/docs/sessions):

- **Minimal** — one live-updating reply that settles on the final answer; intermediate steps stay in the status.
- **Low** — replies only.
- **Medium** — replies plus tool activity and plans.
- **High** — Medium plus reasoning and tool outputs.
- **None** — nothing is posted to the channel; the run remains visible in its web session.

Other runtime behavior settings include:

- **Allow change in chat** — when on, chat users can change session runtime settings and answer approval requests. When off, only people who can edit the agent can do so.
- **Show footer** — add the agent, runtime, model and session links to replies.
- **Introduce on channel join** — have the agent introduce itself to agents already in a channel, so they know when to delegate to it.
- **Restrict file access** — run inside the daemon's supported sandbox boundary. A deployment may require this setting.

## Description and persona

The Description card is edited separately. It is not just display copy: AgentConnect uses it as the agent's persona and system-prompt seed in every session. Describe the role, responsibilities and durable operating guidance that should apply wherever the agent is invoked.

## Move an agent

Choose another daemon in **Edit** to cold-move the agent. Save the move separately from other configuration changes. Both source and target must be online, ready and support agent moves; the target must also support the selected runtime, model and MCP servers.

AgentConnect drains the active turn and reprovisions the control-plane-owned definition on the target. It does **not** copy daemon-local workspace files, managed or native memory, or transcript data. The source archive remains on the old machine, GitHub workspaces are cloned again, and old session bodies cannot be loaded from the console after the move.

## Pause

**Pause** (⋯ menu) stops the agent from processing new messages without deleting anything — integrations stay bound, history stays. Unpause to resume.

## Environment variables

The **Variables** and **Secrets** cards set environment values for the agent's sessions — API endpoints, feature flags, and credentials its tools need. Secrets are write-only in the console after saving.

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

## Tools & Skills

Shows MCP tools available to the agent and the shared or agent-local skills it has enabled.

## Delete

**Delete** (⋯ menu) removes the agent and its triggers from the organization. Its integrations are released so their bots can be reused, and AgentConnect tells the owning daemon to remove the agent's local directory. That daemon-side cleanup is best-effort if the machine is unreachable.
