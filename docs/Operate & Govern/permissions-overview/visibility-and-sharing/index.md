---
title: 👁️ Visibility & sharing
excerpt: Choose who can discover and use an agent, daemon, schedule, MCP provider, or shared skill source.
hidden: false
---

Team visibility controls the audience for a resource. New resources are visible to the whole organization by default, but you can restrict sensitive or experimental resources to selected members.

## Setting visibility

Supported create and edit surfaces have a **Visibility** or **Team visibility** field:

- **Everyone** means every organization member may see the resource.
- **Selected** means exactly the current organization members you select may see it.

Selected must always retain at least one current organization member. The organization Owner role does not bypass a Selected audience. A member's [role](/docs/members-and-roles) still decides whether allowed access is read-only or editable.

Anyone who can edit a resource can also change its audience. A selected Collaborator may therefore share it onward; a selected Viewer remains read-only.

![Everyone and Selected team visibility](https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/agent-access.png)

## When a member leaves

AgentConnect removes a departing member from every Selected audience. Resources remain Selected, and AgentConnect ensures that at least one current member retains access.

## Resources with their own visibility

The following resources have independent visibility:

- **Agents**
- **Daemons**
- **Schedules**
- [**MCP providers and OpenConnector connections**](/docs/tools-and-skills)
- [**Shared skill sources**](/docs/tools-and-skills)

Agent and daemon visibility are independent. A member may be allowed to see an agent without being allowed to see its hosting daemon. They cannot place or move an agent onto a daemon they cannot see.

Other resources derive access from a parent. Integrations, webhooks, workspace operations, Analytics, session metadata, and transcript reads are gated by their agent; [session visibility](/docs/session-visibility) can narrow a transcript further. Schedule configuration and run history follow the schedule. Daemon keys follow the daemon. Bots are organization-wide infrastructure and do not have their own Selected audience.

## What a restricted agent changes

A restricted agent disappears from lists, pickers, Analytics, session metadata, and live session events for members outside its audience.

Its chat integrations are also conversation-gated. Newly discovered channels and direct messages start **Off**. An editor must enable each conversation from the agent's integration card before the agent responds there. Enabling a channel trusts that channel's current and future membership; it is not a per-person allowlist.

Existing channels keep their configured trigger when an agent is changed from Everyone to Selected. Known direct messages switch Off, so review the integration card after tightening visibility.

## What visibility does not control

Team visibility is separate from:

- [Roles](/docs/members-and-roles), which decide what a person may do;
- [Session visibility](/docs/session-visibility), which can make one transcript private;
- [Agent visibility](/docs/agent-visibility), which controls agent-to-agent calls; and
- runtime permission mode, repository access, and provider app scopes.
