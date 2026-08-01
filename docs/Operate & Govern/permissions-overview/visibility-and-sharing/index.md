---
title: 👁️ Visibility & sharing
excerpt: Choose who can discover and use an agent, daemon, schedule, MCP provider, or shared skill source.
hidden: false
---

Team visibility controls the audience for a resource. New resources are visible to the whole organization by default, but you can restrict sensitive or experimental resources to selected members.

## Setting visibility

Supported create and edit surfaces have a **Visibility** or **Team visibility** field:

- **Everyone** means every organization member may see the resource.
- **Selected** means the creator, the selected members, and every organization Owner may see it.

The creator cannot be removed from the audience. Owners retain a governance override so they can audit and recover restricted resources. A member's [role](/docs/members-and-roles) still decides whether access is read-only or editable.

Anyone who can edit a resource can also change its audience. A selected Collaborator may therefore share it onward; a selected Viewer remains read-only.

## Resources with their own visibility

The following resources have independent visibility:

- **Agents**
- **Daemons**
- **Schedules**
- **MCP providers and OpenConnector connections**
- **Shared skill sources**

Agent and daemon visibility are independent. A member may be allowed to see an agent without being allowed to see its hosting daemon. They cannot place or move an agent onto a daemon they cannot see.

Other resources derive access from a parent. Integrations, webhooks, workspace operations, session metadata, usage, and transcript reads are gated by their agent; [session visibility](/docs/session-visibility) can narrow them to an owner or current Slack conversation members. Schedule configuration and run history are gated by the schedule. Daemon keys are gated by the daemon. Bots are organization-wide infrastructure and do not have their own Selected audience.

## What a restricted agent changes

A restricted agent disappears from lists, pickers, usage, session metadata, and live session events for members outside its audience. Requests for it return the same result as an unknown resource.

Its chat integrations are also conversation-gated. Newly discovered channels and direct messages start **Off**. An editor must enable each conversation from the agent's integration card before the agent responds there. Enabling a channel trusts that channel's current and future membership; it is not a per-person allowlist.

Existing conversations keep their configured trigger when an agent is changed from Everyone to Selected, so review the integration card after tightening visibility.

## What visibility does not control

Team visibility is separate from:

- [Roles](/docs/members-and-roles), which decide what a person may do;
- [Session visibility](/docs/session-visibility), which can make one transcript private;
- [Agent visibility](/docs/agent-visibility), which controls agent-to-agent calls; and
- runtime permission mode, repository access, and provider app scopes.
