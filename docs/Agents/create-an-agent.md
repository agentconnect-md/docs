---
title: Create an agent
excerpt: Every field in the Add agent dialog — runtimes, models, effort, permission modes, memory, MCP servers and workspace.
hidden: false
---

An **agent** is a named, configured instance of an AI coding runtime — *"Claude Code, on my build box, in this repo, allowed to edit files"* — that you can then wire into channels, schedules and webhooks.

Open **Agents → Add agent**:

![The Add agent dialog](https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/add-agent.png)

## Identity

- **Name** — a slug (`deploy-bot`); lowercase letters, digits and dashes. It's the stable identifier.
- **Display name** — optional pretty name ("Deploy Bot") shown across the console.
- **Description** — optional; shows on the agent page.

## Placement & runtime

- **Daemon** — the machine this agent runs on. Online daemons are listed first. Placement is fixed at creation; the daemon owns the agent's workspace and transcripts.
- **Runtime** — which AI coding tool drives the agent: **Claude Code**, **Codex**, or anything else your daemon detected (opencode, Gemini, …). The list is exactly what the daemon reported — if a runtime is missing, install it on that machine first.
- **Model** — the models the runtime itself reports, or **Default** to let the runtime decide.

## Behavior (runtime-dependent)

These appear for runtimes that support them:

- **Effort** (Claude Code) — **Low / Medium / High / Extra / Max / Ultracode**, controlling how much thinking the agent puts in. On Codex the field is **Reasoning**: **Light / Medium / High / Extra High**.
- **Fast mode** — **On / Off**; the runtime's faster-output mode where available.
- **Permission mode** — how much the agent may do without asking:
  - Claude Code: **Default / Accept Edits / Auto / Don't Ask / Plan / Bypass**
  - Codex: **Default / Ask** (read-only) **/ Auto Approve** (full access)

  Start conservative for agents on shared channels — you can change this per agent later, and per session in the Playground.
- **Memory** — **Managed** (a memory directory AgentConnect keeps for the agent) or **Native** (the runtime's own memory, isolated under the agent's root).
- **MCP servers** — attach any MCP servers configured on the daemon; the agent gets their tools in every session.

## Workspace

Where the agent's files live on the daemon:

- **From scratch** — a fresh working directory. Files the agent creates live only on that machine.
- **From GitHub** — clone a repository and branch, optionally scoped to a subdirectory, with read-only or read-write credentials. Details in [Workspaces & repositories](/docs/workspaces-and-repos).

The workspace mode is **immutable after creation** — pick scratch now and you'd recreate the agent to attach a repo later.

## Visibility

**Everyone** (all org members see the agent) or **Selected** (only people you pick; you and org owners always keep access). See [Visibility & sharing](/docs/visibility-and-sharing).

---

Click **Create**. You'll land on the agent page — next steps:

- [Try it in the Playground](/docs/playground)
- [Add an integration](/docs/integrations-overview) so it answers in a channel
- [Fine-tune its configuration](/docs/configure-an-agent)
