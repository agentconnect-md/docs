---
title: 🧵 Session visibility
excerpt: Control whether a transcript is available to Everyone, its owner, or current Slack conversation members.
hidden: false
---

Every session has its own audience in addition to the visibility of its agent:

- **Everyone** makes the session available to everyone in the organization who can see the agent.
- **Private** makes the session available only to its matched owner.
- **Slack members** means access follows the current membership of the Slack channel or group direct message where the session started.

Session visibility can only narrow access. Choosing Everyone or matching a Slack conversation does not reveal a session to someone who cannot see the owning agent.

## Default visibility

AgentConnect classifies a new session from where it started:

| Session origin                                | Default                                                                 |
| --------------------------------------------- | ----------------------------------------------------------------------- |
| Playground, webchat, or Web API launch        | Private                                                                 |
| One-to-one IM direct message                  | Private                                                                 |
| Slack channel or group direct message         | Everyone, or Slack members when Slack conversation access is enabled    |
| Other IM channel or group direct message      | Everyone                                                                |
| Schedule, webhook, or other automation        | Everyone, unless it starts in a trusted Slack conversation              |
| Agent-to-agent child session                  | Inherits its parent's audience                                          |

## Follow Slack conversation access

An organization Owner can open **Settings → Session access** and enable **Follow Slack conversation access**. It is disabled by default.

When enabled, sessions from a Slack channel or group direct message are visible only to people who:

1. can see the owning agent;
2. have linked the matching verified Slack workspace identity to their AgentConnect profile; and
3. are currently members of the source Slack conversation.

AgentConnect asks Slack for current membership when access is evaluated. It stores the immutable workspace and conversation reference with the session, but does not copy Slack's member list into its database. Organization roles, including Owner, do not override the Slack audience.

The setting requires OIDC sign-in, linked identities, and a working Logto identity lookup. Missing identity data, a Slack lookup failure, or a historical session without a trusted source scope fails closed: the session stays hidden rather than falling back to Everyone. Settings reports unresolved historical sessions and a degraded provider state.

Turning the setting off makes **new** shared Slack sessions visible to Everyone who can see the agent. Sessions that were already synchronized keep following Slack; disabling the setting does not widen them retroactively.

## Who can see a private session

A private session is visible only when its stored owner identity matches one of the signed-in person's recognized identities. There is deliberately no Owner override for private transcripts.

This differs from restricted team resources, where organization Owners retain governance access. A private session is treated like a direct-message transcript, not an organization asset.

Sessions do not currently support a Selected member list or a public share link.

## Changing visibility

For directly managed sessions, the matched owner may switch between **Everyone** and **Private** in the session header:

- The owner may publish their session to the organization or make it private.
- Ownership, rather than organization role, controls this choice. A Viewer can change a session they own; an Owner cannot change someone else's session visibility.
- Making a parent session private also tightens its agent-to-agent descendants. Widening it later does not automatically widen those child sessions.

A shared Slack session keeps its source-conversation binding in either policy state. While Slack conversation access is disabled, a new one shows **Everyone** without a Slack members badge, but no individual participant may reclassify it. Once synchronized under **Follow Slack conversation access**, it shows read-only **Slack members** and follows the current source-conversation audience.

### Memory caveat

For AgentConnect-managed or supported external memory, making an Everyone session private stops future shared-memory capture after the daemon acknowledges the change. It does not remove information already captured while the session audience was Everyone.

Sessions tied to a shared Slack conversation are always excluded from AgentConnect-managed and supported external shared-memory capture and recall, even while the Slack conversation access setting is disabled. This prevents provider-scoped content from entering a broader organization memory namespace.

Runtime-native memory has no per-session AgentConnect gate. A private or Slack-scoped transcript can therefore still influence what that runtime recalls in another session.

## Matching linked Slack identities

Slack direct-message sessions store a workspace-scoped owner identity: the Slack workspace ID plus the Slack user ID. A linked, verified Slack identity lets AgentConnect match that private DM owner and evaluate current membership for Slack-scoped shared sessions.

Linking makes existing matching sessions available without rewriting them; unlinking removes that match immediately. GitHub and Google links do not match Slack session ownership or conversation membership.

In local no-auth mode, with a personal API key, or when Logto identity lookup is not configured or fails, authorization uses only the console identity and does not infer a Slack match. See [Social account linking](/docs/social-account-linking).

For the effect of every GitHub, Google, and Slack account combination, see [Permissions with linked accounts](/docs/linked-account-permissions).
