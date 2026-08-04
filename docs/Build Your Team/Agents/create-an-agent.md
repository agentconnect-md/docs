---
title: ✨ Create an agent
excerpt: Create an agent with the right runtime, workspace, access, memory, tools, variables, and secrets.
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

- **Effort** (Claude Code) or **Reasoning** (Codex) — how much thinking the agent puts in. The levels come from the runtime itself, so read them off the picker rather than from a list here; they change as the runtime does.
- **Fast mode** — **On / Off**; the runtime's faster-output mode where available.
- **Permission mode** — how much the runtime may do without asking. Available modes, including **Auto**, are runtime-defined and can vary by runtime and version. Use the picker descriptions as the source of truth, and start conservative for agents on shared channels; you can change the mode later per agent or Playground session.
- **Run in sandbox** — place the runtime inside AgentConnect's Linux OS sandbox when the selected daemon supports it. This outer OS boundary is separate from the runtime's permission mode. See [Sandboxing](/docs/sandboxing).
- **Memory** — **Managed** (an AgentConnect-managed directory), **Native** (the runtime's own isolated memory), **External** (a configured provider such as Mem0), or **Off**. See [the guide to using Mem0 OSS as external memory](/docs/external-memory) for setup.

MCP servers are not part of this dialog. Create the agent first, then enable them from its **Tools & Skills** tab — the only place MCP access is granted. See [Tools & Skills](/docs/tools-and-skills).

## Workspace

Where the agent's files live on the daemon:

- **From scratch** — a fresh working directory. Files the agent creates live only on that machine.
- **From GitHub** — clone a repository and branch, optionally scoped to a subdirectory, with read-only or read-write credentials. New GitHub agents use an isolated worktree for each session by default. Details in [Workspaces & repositories](/docs/workspaces-and-repos).

You can change the workspace source later from the agent's **Workspace** tab. Changing source, repository or branch replaces daemon-local workspace files, so commit or back up anything you need first. See [Workspaces & repositories](/docs/workspaces-and-repos).

## Access

- **Team visibility** — **Everyone** lets all organization members see the agent. **Selected** limits it to exactly the current organization members you pick. You are selected initially for convenience, but you may replace yourself after selecting someone else. At least one member must remain selected, and the organization Owner role does not add access. See [Visibility & sharing](/docs/visibility-and-sharing).
- **Agent visibility** — independently choose which agents may call this agent and which agents it may call. New agents inherit the organization's creation default in both directions. That setting starts as **All agents**, while an Owner may choose **Isolated** for future agents. You can override either direction here before creating this agent. See [Agent visibility](/docs/agent-visibility).

## Variables and secrets

The final **Variables and Secrets** step adds environment values owned by this agent. Organization entries configured for **All agents** also apply when the agent is created and normally take precedence over same-name local values. See [Variables & secrets](/docs/variables-and-secrets) for organization sharing, precedence, and secret handling.

---

Click **Create**. You'll land on the agent page — next steps:

- [Try it in the Playground](/docs/playground)
- [Add an integration](/docs/integrations-overview) so it answers in a channel
- [Fine-tune its configuration](/docs/configure-an-agent)
