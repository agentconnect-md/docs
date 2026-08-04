---
title: 🔒 Session visibility
excerpt: Control whether a transcript is available to Everyone, its owner, or people with access to its source conversation or repository.
hidden: false
---

Every session has its own audience in addition to the visibility of its agent:

- **Everyone** makes the session available to everyone in the organization who can see the agent.
- **Private** makes the session available only to its matched owner.
- **Slack members** means access follows the source Slack conversation and the viewer's current Slack access.
- **Feishu / Lark members** means access follows the source chat and the viewer's current membership.
- **GitHub members** means access follows the current visibility and permissions of the source GitHub repository.

Session visibility can only narrow access. It never reveals a session to someone who cannot see the owning agent, even when that person has access to the source conversation or repository.

## Default visibility

AgentConnect classifies a new session from where it started:

| Session origin                           | Default                                                              |
| ---------------------------------------- | -------------------------------------------------------------------- |
| Playground, webchat, or Web API launch   | Private                                                              |
| One-to-one IM direct message             | Private — except a Lark or Feishu DM once chat access is enabled      |
| Slack channel or group direct message    | Everyone, or Slack members when Slack access is enabled               |
| Lark or Feishu chat, including one-to-one | Everyone, or Feishu / Lark members when chat access is enabled       |
| GitHub issue, pull request, or comment   | Everyone, or GitHub members when repository access is enabled          |
| Telegram or Discord shared conversation  | Everyone                                                              |
| Schedule, webhook, or other automation   | Everyone, or the destination audience for Slack, Lark, or Feishu                    |
| Agent-to-agent child session             | Inherits its parent's audience                                       |

## Follow Slack access

An organization Owner can open **Settings → Session access** and enable **Follow Slack access**. It is disabled by default.

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

## Follow Feishu / Lark access

The Lark and Feishu bot integrations are available on Cloud, but this audience currently requires a self-hosted deployment with the matching regional social sign-in configured. AgentConnect Cloud does not offer Lark / Feishu permission sync or sign-in yet.

An organization Owner can enable **Settings → Session access → Follow Feishu / Lark access**. Sessions then require a linked profile with current membership in the source chat.

Even while Follow access is off, a configured regional permission app can use live membership to prove the owner of a Private one-to-one session created by another bot app. This fallback remains owner-only; it does not synchronize or widen shared chats.

Unlike Slack, this covers one-to-one chats as well. A Lark or Feishu DM session that was **Private** moves to the **Feishu members** / **Lark members** audience when you enable the setting: the gate becomes live chat membership rather than the stored owner identity, and the participant can no longer switch it back themselves. In practice the audience is still just that chat's members, but the label and the mechanism change.

A self-hosted deployment can use one regional permission app to check chats served by multiple bot apps; their App IDs do not need to match. The Logto connector must support storing the linked person's provider token. See [Logto authentication](/docs/logto-authentication#lark-and-feishu-permission-sync) for setup and connector requirements.

Turning the setting off affects new sessions only; sessions already synchronized keep following their source chat.

## Follow GitHub access

An organization Owner can also enable **Settings → Session access → Follow GitHub access**. It is disabled by default.

When enabled, a GitHub-triggered session remains gated by its owning agent and follows the source repository:

- A session from a public repository is available to everyone who can see the agent; no linked GitHub profile is required.
- A session from a private repository requires a linked GitHub profile that currently has access to that repository.

AgentConnect stores the repository's numeric ID and asks GitHub for its current visibility and, for a private repository, the viewer's current permission. It does not copy repository collaborators into its database. Organization roles, including Owner, do not override this check.

A provider failure or historical session without a trusted repository scope fails closed. Turning the setting off makes **new** GitHub sessions visible to Everyone who can see the agent; sessions already synchronized to GitHub access do not widen retroactively.

## Who can see a private session

A private session is visible only when its stored owner identity matches one of the signed-in person's recognized identities. There is deliberately no Owner override for private transcripts.

Organization roles do not bypass either boundary. A restricted team resource uses its complete explicit Selected audience, while a Private session uses a matched owner identity. Resource creators receive no implicit access, and neither boundary grants visibility merely because someone is an organization Owner. A private session is treated like a direct-message transcript, not an organization asset.

Sessions do not currently support a Selected member list or a public share link.

## Changing visibility

For directly managed sessions, the matched owner may switch between **Everyone** and **Private** in the session header:

- The owner may publish their session to the organization or make it private.
- Ownership, rather than organization role, controls this choice. A Viewer can change a session they own; an Owner cannot change someone else's session visibility.
- Making a parent session private also tightens its agent-to-agent descendants. Widening it later does not automatically widen those child sessions.

A session bound to a Slack, Lark, or Feishu conversation or a GitHub repository keeps that source binding whether provider access sync is enabled or disabled. While the corresponding setting is disabled, a new session shows **Everyone**, but an individual participant cannot reclassify it. Once synchronized, it shows the provider's read-only audience label and follows its source audience.

### Memory caveat

For AgentConnect-managed or supported external memory, making an Everyone session private stops future shared-memory capture after the daemon acknowledges the change. It does not remove information already captured while the session audience was Everyone.

Sessions tied to a provider-scoped conversation or GitHub repository are always excluded from AgentConnect-managed and supported external shared-memory capture and recall, even while the corresponding provider access setting is disabled. This prevents provider-scoped content from entering a broader organization memory namespace.

Runtime-native memory has no per-session AgentConnect gate. A private or provider-scoped transcript can therefore still influence what that runtime recalls in another session.

## Matching linked provider identities

Slack direct-message sessions store a workspace-scoped owner identity: the Slack workspace ID plus the Slack user ID. A linked, verified Slack identity lets AgentConnect match that private DM owner and evaluate current access for Slack-scoped shared sessions.

A private GitHub repository session is not owned by one GitHub user. Instead, AgentConnect uses the viewer's linked GitHub profile to check that repository's current access. Public repository sessions do not require a linked GitHub profile.

Lark and Feishu direct messages first use their app-scoped owner identity. A configured permission app can fall back to live membership for a Private direct message from another bot app. When the organization enables the corresponding access setting, direct messages and group sessions use live chat membership as their synchronized audience.

Linking can make existing matching provider sessions available without rewriting them. Unlinking removes that provider match immediately. A Google identity does not satisfy these checks, and identities from one provider never substitute for another.

A personal API key or console identity does not stand in for a linked provider profile. See [Social account linking](/docs/social-account-linking).

For the effect of linking several providers, see [Permissions with linked accounts](/docs/linked-account-permissions).

## AgentConnect OSS requirements

Provider-based session access requires optional OIDC sign-in, linked identities, and working Logto identity lookup. Slack access also needs conversation checks; Lark and Feishu need a token-storing regional connector, a permission app, and chat-membership checks; GitHub needs repository checks. Local no-auth mode does not infer a linked provider profile.

See [Logto authentication](/docs/logto-authentication) for sign-in, account linking, and regional provider setup.
