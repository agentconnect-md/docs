---
title: 🔑 Variables & secrets
excerpt: Set runtime environment values once for an organization or directly on one agent.
hidden: false
---

Variables and secrets become environment variables in an agent's runtime. Define a shared value once at the organization level, or keep it local to one agent.

| Scope | Manage from | Applies to |
| --- | --- | --- |
| Organization | **Settings → Variables & secrets** | All or selected agents |
| Agent | Agent → **Configuration** | One agent |

Use variables for ordinary configuration such as endpoints and feature flags. Use secrets for credentials and other values that should never be shown again after saving.

## Share a value across agents

Only organization Owners can manage the organization registry:

1. Open **Settings** and find **Variables & secrets**.
2. Select **Add**, then choose **Variable** or **Secret**.
3. Enter a standard environment-variable name such as `SERVICE_URL` or `SERVICE_API_KEY` and its value.
4. Choose **All agents** or **Selected agents**.
5. Save the entry.

Names may contain letters, digits, and underscores, and cannot start with a digit.

**All agents** assigns the entry to every agent you can manage and automatically applies it to agents you configure later. **Selected agents** applies it only to the agents you choose. The picker lists only agents you can manage; editing that selection does not remove existing assignments to other private agents.

An assigned entry appears on the agent's Variables or Secrets card with an **Organization** label. It is read-only there. Owners edit or rotate it from **Settings**; other agent editors can still manage that agent's local entries.

## Set a value on one agent

Open the agent's **Configuration** tab, then edit its **Variables** or **Secrets** card. These entries belong only to that agent.

When creating an agent, the final **Variables and Secrets** step adds the same agent-local values. Organization entries set to **All agents** are applied when the agent is created.

## Precedence

An assigned organization entry normally wins when the agent also has the same name:

| Organization entry | Agent entry | Effective value |
| --- | --- | --- |
| Variable | Variable | Organization variable |
| Secret | Variable or secret | Organization secret |
| Variable | Secret | Rejected |

The last case is rejected because a readable variable must not replace a write-only secret. An overridden agent entry is retained as a fallback and becomes effective again if the organization assignment is removed or deleted.

Organization names are unique across variables and secrets. Names and types cannot be changed after creation; delete and recreate an entry to rename it or change its type.

## Secret handling

Secret values are write-only. After saving, AgentConnect shows the name and a mask; editing offers **Replace value** instead of reading the current value. Variable values remain visible to people who can view the assigned agent, so do not store credentials as variables.

Secrets are available to the agent runtime and its tools. AgentConnect attempts to mask known literal secret values if they appear in agent output, but masking is not a security boundary. Give each agent only the secrets it needs and use appropriate [permissions](/docs/permissions-overview) and [sandboxing](/docs/sandboxing).

Variables and secrets are injected only into the runtime environment. They do not expand placeholders in agent descriptions, schedules, integration settings, or other configuration.

## Updates and removal

Rotating, retargeting, or deleting an organization entry updates the affected agents. A process that is already running may keep the old value until its runtime reaches a safe restart point, so a rotation is not instantaneous revocation from an active process.

Removing an assignment restores a same-name agent-local fallback. If there is no fallback, the value disappears from future runtime processes.
