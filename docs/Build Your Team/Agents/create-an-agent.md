---
title: 🤖 Create an agent
excerpt: Every field in the Add agent dialog — runtimes, models, effort, permission modes, memory, MCP servers and workspace.
hidden: false
---

An **agent** is a named, configured instance of an AI coding runtime — *"Claude Code, on my build box, in this repo, allowed to edit files"* — that you can then wire into channels, schedules and webhooks.

Open **Agents → Add agent**:

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
- **Run in sandbox** — place the runtime inside AgentConnect's Linux OS sandbox when the selected daemon supports it. This outer OS boundary is separate from the runtime's permission mode. See [Sandboxing](/docs/sandboxing).
- **Memory** — **Managed** (an AgentConnect-managed directory), **Native** (the runtime's own isolated memory), **External** (a configured provider such as Mem0), or **Off**. See [External memory with Mem0 OSS](/docs/external-memory).
- **MCP servers** — attach any MCP servers configured on the daemon; the agent gets their tools in every session.

## Workspace

Where the agent's files live on the daemon:

- **From scratch** — a fresh working directory. Files the agent creates live only on that machine.
- **From GitHub** — clone a repository and branch, optionally scoped to a subdirectory, with read-only or read-write credentials. Details in [Workspaces & repositories](/docs/workspaces-and-repos).

You can change the workspace source later from the agent's **Workspace** tab. Changing source, repository or branch replaces daemon-local workspace files, so commit or back up anything you need first. See [Workspaces & repositories](/docs/workspaces-and-repos).

## Access

- **Team visibility** — **Everyone** lets all organization members see the agent. **Selected** limits it to the people you pick; you and organization Owners always keep access. See [Visibility & sharing](/docs/visibility-and-sharing).
- **Agent visibility** — independently choose which agents may call this agent and which agents it may call. New agents inherit the organization's creation default in both directions. That setting starts as **All agents**, while an Owner may choose **Isolated** for future agents. You can override either direction here before creating this agent. See [Agent visibility](/docs/agent-visibility).

---

Click **Create**. You'll land on the agent page — next steps:

- [Try it in the Playground](/docs/playground)
- [Add an integration](/docs/integrations-overview) so it answers in a channel
- [Fine-tune its configuration](/docs/configure-an-agent)
