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

Selected must always retain at least one current organization member. When you switch an empty **Everyone** selection to **Selected**, AgentConnect initially selects you for convenience. You can remove yourself after selecting someone else, but you cannot remove the last selected member. The API also rejects a Selected audience that is empty after filtering out people who are no longer members.

The creator shown in a resource's history is audit information only; being the creator does not grant access by itself. Team resources do not have a separate owner who is automatically included. The organization Owner role also does not bypass Selected visibility. A member's [role](/docs/members-and-roles) still decides whether allowed access is read-only or editable.

Anyone who can edit a resource can also change its audience. A selected Collaborator may therefore share it onward; a selected Viewer remains read-only.

## When a member leaves

AgentConnect removes a departing member from every Selected audience. Resources that still have another selected member keep that audience unchanged. If removing the member would leave a resource with nobody selected, AgentConnect adds the acting Owner when they remove someone else, or the longest-standing remaining Owner when a member leaves on their own. The resource remains reachable without changing to **Everyone**, and its creator history does not change.

The removal confirmation identifies affected resources and tells you when this repair is needed.

## Resources with their own visibility

The following resources have independent visibility:

- **Agents**
- **Daemons**
- **Schedules**
- [**MCP providers and OpenConnector connections**](/docs/tools-and-skills)
- [**Shared skill sources**](/docs/tools-and-skills)

Agent and daemon visibility are independent. A member may be allowed to see an agent without being allowed to see its hosting daemon. They cannot place or move an agent onto a daemon they cannot see.

Other resources derive access from a parent. Integrations, webhooks, workspace operations, session metadata, usage, and transcript reads are gated by their agent; [session visibility](/docs/session-visibility) can narrow them to an owner or the current audience of a source conversation or repository. Schedule configuration and run history are gated by the schedule. Daemon keys are gated by the daemon. Bots are organization-wide infrastructure and do not have their own Selected audience.

## What a restricted agent changes

A restricted agent disappears from lists, pickers, usage, session metadata, and live session events for members outside its audience. Requests for it return the same result as an unknown resource.

Its chat integrations are also conversation-gated. Newly discovered channels and direct messages start **Off**. An editor must enable each conversation from the agent's integration card before the agent responds there. Enabling a channel trusts that channel's current and future membership; it is not a per-person allowlist.

Existing channels keep their configured trigger when an agent is changed from Everyone to Selected. Known direct messages switch Off, so review the integration card after tightening visibility.

## What visibility does not control

Team visibility is separate from:

- [Roles](/docs/members-and-roles), which decide what a person may do;
- [Session visibility](/docs/session-visibility), which can make one transcript private;
- [Agent visibility](/docs/agent-visibility), which controls agent-to-agent calls; and
- runtime permission mode, repository access, and provider app scopes.
