---
title: 🤖 Create an agent
excerpt: Every field in the Add agent dialog — runtimes, models, effort, permission modes, memory, MCP servers and workspace.
hidden: false
---

An **agent** is a named, configured instance of an AI coding runtime — *"Claude Code, on my build box, in this repo, allowed to edit files"* — that you can then wire into channels, schedules and webhooks.

Open **Agents → Add agent**:

![The Add agent dialog](https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/add-agent.png)

## Identity

- **Name** — a slug (`deploy-bot`); lowercase letters, digits and dashes. It's the stable identifier.
- **Display name** — optional pretty name ("Deploy Bot") shown across the console.
- **Description** — the agent's persona and standing responsibilities. AgentConnect includes it in the agent's system context for every session and also shows it on the agent page.

## Placement & runtime

- **Daemon** — the machine this agent runs on. Online daemons are listed first. You can move the agent later, but daemon-local workspace, memory and transcript data are not copied to the new machine.
- **Runtime** — which AI coding tool drives the agent: **Claude Code**, **Codex**, or anything else your daemon detected (opencode, Gemini, …). The list is exactly what the daemon reported — if a runtime is missing, install it on that machine first.
- **Model** — the models the runtime reports. AgentConnect preselects the runtime's advertised default, or its first advertised model; it does not invent a separate Default model.

## Behavior (runtime-dependent)

These appear when the selected daemon and runtime advertise support. Exact choices and descriptions can change with the runtime version:

- **Effort** (Claude Code) — **Low / Medium / High / Extra / Max / Ultracode**, controlling how much thinking the agent puts in. On Codex the field is **Reasoning**: **Light / Medium / High / Extra High**.
- **Fast mode** — **On / Off**; the runtime's faster-output mode where available.
- **Permission mode** — how much the agent may do without asking. Current Codex modes are:
  - **Read Only** — asks when needed and runs in a read-only sandbox.
  - **Ask for approval** — the default; can write inside the workspace and asks before actions that require approval.
  - **Full Access** — full-access mode, including network and locations outside the workspace where the runtime and host allow it.

  Claude Code commonly reports **Default / Accept Edits / Auto / Don't Ask / Plan / Bypass**. Use the descriptions shown in the picker as the source of truth for the runtime installed on that daemon.

  Start conservative for agents on shared channels — you can change this per agent later, and per session in the Playground.
- **Memory** — **Managed** (an AgentConnect-managed directory), **Native** (the runtime's own isolated memory), **External** (a configured provider such as Mem0), or **Off**. See [External memory with Mem0 OSS](/docs/external-memory).
- **MCP servers** — attach any MCP servers configured on the daemon; the agent gets their tools in every session.

## Workspace

Where the agent's files live on the daemon:

- **From scratch** — a fresh working directory. Files the agent creates live only on that machine.
- **From GitHub** — clone a repository and branch, optionally scoped to a subdirectory, with read-only or read-write credentials. Details in [Workspaces & repositories](/docs/workspaces-and-repos).

You can change the workspace source later from the agent's **Workspace** tab. Changing source, repository or branch replaces daemon-local workspace files, so commit or back up anything you need first. See [Workspaces & repositories](/docs/workspaces-and-repos).

## Visibility

**Everyone** (all org members see the agent) or **Selected** (only people you pick; you and org owners always keep access). See [Visibility & sharing](/docs/visibility-and-sharing).

---

Click **Create**. You'll land on the agent page — next steps:

- [Try it in the Playground](/docs/playground)
- [Add an integration](/docs/integrations-overview) so it answers in a channel
- [Fine-tune its configuration](/docs/configure-an-agent)
