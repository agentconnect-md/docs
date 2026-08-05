---
title: 🔒 Session visibility
excerpt: Control whether a transcript is available to Everyone, its owner, or people with access to its source conversation or repository.
hidden: false
---

Every session has its own audience in addition to the visibility of its agent:

- **Everyone** — every organization member who can see the agent.
- **Private** — only the person matched as the session owner.
- **Slack members** — people whose linked Slack identity has access to the source conversation.
- **Feishu / Lark members** — people whose linked regional identity belongs to the source chat.
- **GitHub members** — people with access to the source repository.

Session visibility can only narrow access. It never reveals a session to someone who cannot see the owning agent.

![A session audience control](https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/session-visibility.png)

## Default audience

| Session origin | Default |
| --- | --- |
| Playground, webchat, or Web API | Private |
| One-to-one direct message | Private |
| Shared chat conversation | Everyone |
| GitHub issue or pull request | Everyone |
| Schedule, webhook, or other automation | Everyone |
| Delegated agent work | Inherits the source session |

When an organization enables provider-based access, new sessions from that provider use the matching read-only provider audience instead of Everyone. Lark and Feishu access sync also covers one-to-one chats.

## Follow Slack access

An organization Owner can enable **Settings → Session access → Follow Slack access**.

When enabled, a Slack channel or group-DM session requires:

1. access to the owning agent;
2. a linked identity from the same Slack workspace; and
3. current Slack access to the source conversation.

An active full member can read a public-channel session without joining that channel. Private channels and group DMs require current membership. Guests and Slack Connect users also require current conversation membership. One-to-one Slack DMs remain Private.

## Follow Lark / Feishu access

Lark and Feishu bot integrations are available on AgentConnect Cloud. Social sign-in and **Follow Feishu / Lark access** currently require a self-hosted deployment with a matching regional permission app.

When enabled, the session audience follows current membership in the source chat, including one-to-one chats. One regional permission app can check chats served by multiple AgentConnect bot apps; those bot App IDs do not need to match.

See [Logto authentication](/docs/logto-authentication#lark-and-feishu-permission-sync) for the self-hosted setup.

## Follow GitHub access

An organization Owner can enable **Settings → Session access → Follow GitHub access**.

- A public-repository session remains available to everyone who can see the agent.
- A private-repository session requires a linked GitHub profile with current access to that repository.

Linking GitHub does not install the GitHub App or grant repository access. It only supplies the identity used for the check.

## Private sessions

A Private session is visible only to its matched owner. There is no organization Owner override.

For directly managed sessions, that owner may switch between **Everyone** and **Private** in the session header. A Viewer may change a session they own; an Owner cannot change someone else's session audience. Making a source session Private also tightens any delegated work started from it.

Provider-bound sessions show a read-only audience. Change the organization's provider access setting rather than trying to reclassify one participant's copy.

Sessions do not currently support a Selected member list or a public share link.

## Memory caveat

For AgentConnect-managed or supported external memory, making an Everyone session Private stops future shared-memory capture after the daemon applies the change. It does not remove information already captured while the session was visible to Everyone.

Provider-scoped sessions are excluded from shared-memory capture and recall. Runtime-native memory has no per-session AgentConnect gate, so a private transcript can still influence what that runtime recalls later.

## Linked identities and AgentConnect OSS

Provider audiences depend on a matching [linked social account](/docs/social-account-linking). Organization membership, the Owner role, a personal API key, or a different provider identity does not substitute for it.

AgentConnect OSS requires optional OIDC sign-in and provider identity lookup for these checks. Slack additionally needs workspace and conversation access checks; Lark and Feishu need a token-storing regional connector plus a permission app; GitHub needs repository checks. See [Logto authentication](/docs/logto-authentication).
