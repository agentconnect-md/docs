---
title: 🧵 Session visibility
excerpt: Keep a transcript available to the organization or private to the person who started it.
hidden: false
---

Every session has its own visibility in addition to the visibility of its agent:

- **Everyone** makes the session available to everyone in the organization who can see the agent.
- **Private** makes the session available only to its matched owner.

Session visibility can only narrow access. Choosing Everyone does not reveal a session to someone who cannot see the owning agent.

## Default visibility

AgentConnect classifies a new session from where it started:

| Session origin                         | Default             |
| -------------------------------------- | ------------------- |
| Playground, webchat, or Web API launch | Private             |
| One-to-one IM direct message           | Private             |
| IM channel or group direct message     | Everyone            |
| Schedule, webhook, or other automation | Everyone            |
| Agent-to-agent child session           | Inherits its parent |

Older sessions are not retroactively reclassified.

## Who can see a private session

A private session is visible only when its stored owner identity matches one of the signed-in person's recognized identities. There is deliberately no Owner override for private transcripts.

This differs from restricted team resources, where organization Owners retain governance access. A private session is treated like a direct-message transcript, not an organization asset.

Sessions do not currently support a Selected member list or a public share link.

## Changing visibility

When permitted, the session header shows an **Everyone / Private** control:

- The matched session owner may publish their session to the organization or make it private.
- Ownership, rather than organization role, controls this choice. A Viewer can change a session they own; an Owner cannot change someone else's session visibility.

Making a session private hides its transcript immediately and applies the same tightening to agent-to-agent descendants. The daemon then acknowledges the memory-capture change.

### Memory caveat

For AgentConnect-managed or supported external memory, making a session private stops future shared memory capture after the daemon acknowledges the change. It does not remove information already captured while the session audience was Everyone.

Runtime-native memory has no per-session AgentConnect gate. A private transcript can therefore still influence what that runtime recalls in another session.

## Matching linked Slack identities

Slack direct-message sessions store a workspace-scoped owner identity: the Slack workspace ID plus the Slack user ID. On deployments with OIDC sign-in and the Logto Management API configured, AgentConnect adds a profile's linked, verified Slack identity to the viewer identity set.

This makes existing matching Slack DM sessions visible to that profile without rewriting the session records. GitHub and Google links do not match Slack session ownership.

In local no-auth mode, with a personal API key, or when Logto identity lookup is not configured or fails, authorization uses only the console identity and does not infer a Slack match. See [Social account linking](/docs/social-account-linking).
