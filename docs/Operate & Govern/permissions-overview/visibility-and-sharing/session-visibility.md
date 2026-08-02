---
title: 🔒 Session visibility
excerpt: Control whether a transcript is available to Everyone, its owner, or people with access to its Slack conversation or GitHub repository.
hidden: false
---

Every session has its own audience in addition to the visibility of its agent:

- **Everyone** makes the session available to everyone in the organization who can see the agent.
- **Private** makes the session available only to its matched owner.
- **Slack members** means access follows the source Slack conversation and the viewer's current Slack access.
- **GitHub access** means access follows the current visibility and permissions of the source GitHub repository.

Session visibility can only narrow access. It never reveals a session to someone who cannot see the owning agent, even when that person has access to the source Slack conversation or GitHub repository.

## Default visibility

AgentConnect classifies a new session from where it started:

| Session origin                           | Default                                                              |
| ---------------------------------------- | -------------------------------------------------------------------- |
| Playground, webchat, or Web API launch   | Private                                                              |
| One-to-one IM direct message             | Private                                                              |
| Slack channel or group direct message    | Everyone, or Slack members when Slack conversation access is enabled |
| GitHub issue, pull request, or comment   | Everyone, or GitHub access when GitHub repository access is enabled  |
| Other IM channel or group direct message | Everyone                                                             |
| Schedule, webhook, or other automation   | Everyone; a run posting into a Slack conversation follows that conversation instead |
| Agent-to-agent child session             | Inherits its parent's audience                                       |

## Follow Slack conversation access

An organization Owner can open **Settings → Session access** and enable **Follow Slack conversation access**. It is disabled by default.

When enabled, sessions from a Slack channel or group direct message are visible only to people who:

1. can see the owning agent;
2. have linked the matching verified Slack workspace identity to their AgentConnect profile; and
3. currently have the required Slack access:
   - an active full member of the installing workspace may read a public-channel session without joining that channel;
   - a private channel or group direct message requires current conversation membership; and
   - guests and Slack Connect users require current conversation membership even when the channel is public to full workspace members.

One-to-one Slack DMs remain Private and use their matched owner instead of this setting. AgentConnect asks Slack for current access when a shared session is evaluated. It stores the immutable workspace and conversation reference with the session, but does not copy Slack's member list into its database. Organization roles, including Owner, do not override the Slack audience.

Missing identity data, a Slack lookup failure, or a historical session without a trusted source scope fails closed: the session stays hidden rather than falling back to Everyone. Settings reports unresolved historical sessions and a degraded provider state.

Turning the setting off makes **new** shared Slack sessions visible to Everyone who can see the agent. Sessions that were already synchronized keep following Slack; disabling the setting does not widen them retroactively.

## Follow GitHub repository access

An organization Owner can also enable **Settings → Session access → Follow GitHub repository access**. It is disabled by default.

When enabled, a GitHub-triggered session remains gated by its owning agent and follows the source repository:

- A session from a public repository is available to everyone who can see the agent; no linked GitHub profile is required.
- A session from a private repository requires a linked GitHub profile that currently has access to that repository.

AgentConnect stores the repository's numeric ID and asks GitHub for its current visibility and, for a private repository, the viewer's current permission. It does not copy repository collaborators into its database. Organization roles, including Owner, do not override this check.

A provider failure or historical session without a trusted repository scope fails closed. Turning the setting off makes **new** GitHub sessions visible to Everyone who can see the agent; sessions already synchronized to GitHub access do not widen retroactively.

## Who can see a private session

A private session is visible only when its stored owner identity matches one of the signed-in person's recognized identities. There is deliberately no Owner override for private transcripts.

This differs from restricted team resources, where organization Owners retain governance access. A private session is treated like a direct-message transcript, not an organization asset.

Sessions do not currently support a Selected member list or a public share link.

## Changing visibility

For directly managed sessions, the matched owner may switch between **Everyone** and **Private** in the session header:

- The owner may publish their session to the organization or make it private.
- Ownership, rather than organization role, controls this choice. A Viewer can change a session they own; an Owner cannot change someone else's session visibility.
- Making a parent session private also tightens its agent-to-agent descendants. Widening it later does not automatically widen those child sessions.

A session bound to a Slack conversation or GitHub repository keeps that source binding whether provider access sync is enabled or disabled. While the corresponding setting is disabled, a new session shows **Everyone**, but an individual participant cannot reclassify it. Once synchronized, it shows the read-only **Slack members** or **GitHub access** label and follows its source audience.

### Memory caveat

For AgentConnect-managed or supported external memory, making an Everyone session private stops future shared-memory capture after the daemon acknowledges the change. It does not remove information already captured while the session audience was Everyone.

Sessions tied to a shared Slack conversation or GitHub repository are always excluded from AgentConnect-managed and supported external shared-memory capture and recall, even while the corresponding provider access setting is disabled. This prevents provider-scoped content from entering a broader organization memory namespace.

Runtime-native memory has no per-session AgentConnect gate. A private or provider-scoped transcript can therefore still influence what that runtime recalls in another session.

## Matching linked provider identities

Slack direct-message sessions store a workspace-scoped owner identity: the Slack workspace ID plus the Slack user ID. A linked, verified Slack identity lets AgentConnect match that private DM owner and evaluate current access for Slack-scoped shared sessions.

A private GitHub repository session is not owned by one GitHub user. Instead, AgentConnect uses the viewer's linked GitHub profile to check that repository's current access. Public repository sessions do not require a linked GitHub profile.

Linking can make existing matching Slack or private GitHub sessions available without rewriting them. Unlinking removes that provider match immediately. A Google identity does not satisfy either provider's checks, and identities from one provider never substitute for another.

A personal API key or console identity does not stand in for a linked Slack or GitHub profile. See [Social account linking](/docs/social-account-linking).

For the effect of every GitHub, Google, and Slack account combination, see [Permissions with linked accounts](/docs/linked-account-permissions).

## AgentConnect OSS requirements

Provider-based session access requires optional OIDC sign-in, linked identities, and working Logto identity lookup. Slack access also needs working Slack identity and conversation checks; GitHub access needs working repository checks. Local no-auth mode and deployments without that identity lookup do not infer a linked Slack or GitHub profile.

See [Optional Logto sign-in](/docs/deployment-and-configuration#optional-logto-sign-in) and [Enable social account linking](/docs/deployment-and-configuration#enable-social-account-linking) for setup.
