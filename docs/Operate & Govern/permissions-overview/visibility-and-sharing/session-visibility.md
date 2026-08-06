---
title: 🔒 Session visibility
excerpt: Control whether a transcript is available to Everyone, its owner, or people with access to its source conversation or repository.
hidden: false
---

Every session has its own audience, evaluated independently from the **Team visibility** of the Agent that ran it:

- **Everyone** — every organization member.
- **Private** — only the person matched as the session owner.
- **Slack members** — people whose linked Slack identity has access to the source conversation.
- **Feishu / Lark members** — people whose linked regional identity belongs to the source chat.
- **GitHub members** — people with access to the source repository.

Passing the session audience grants access only to that session's metadata, transcript, tool details, relationships, and live updates. It does not grant access to the owning Agent's page, configuration, workspace, or invocation controls. When a readable session belongs to an Agent outside your Team visibility, the console shows the Agent name as plain session context and a filter label, not as a link.

<p align="center">
  <img src="https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/session-visibility.png" alt="A session audience control" width="420" />
</p>

## Default audience

| Session origin | Default |
| --- | --- |
| Playground, webchat, or Web API | Private |
| One-to-one direct message | Private |
| Shared chat conversation | Everyone |
| GitHub issue or pull request | Everyone |
| Schedule, webhook, or other automation | Everyone |
| Delegated agent work | Inherits the source session |

When an organization enables provider-based access, new sessions from that provider override the normal default with the matching read-only provider audience. Lark and Feishu access sync also covers one-to-one chats.

## Follow Slack access

An organization Owner can enable **Settings → Session access → Follow Slack access**.

<p align="center">
  <img src="https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/session-access.png" alt="Settings → Session access, with a provider sync toggle per platform" width="760" />
</p>

When enabled, a Slack channel or group-DM session requires a linked identity from the same Slack workspace and current Slack access to the source conversation. The owning Agent's Team visibility is not part of this session check.

An active full member can read a public-channel session without joining that channel. Private channels and group DMs require current membership. Guests and Slack Connect users also require current conversation membership. One-to-one Slack DMs remain Private.

If your linked Slack identity passes those conversation rules, you can open the synchronized session even when the Agent itself is outside your Team visibility.

## Follow Lark / Feishu access

Lark and Feishu bot integrations are available on AgentConnect Cloud. Social sign-in and **Follow Feishu / Lark access** currently require a self-hosted deployment with a matching regional Login App and a linked identity that exposes the provider's `union_id`.

When enabled, the session audience follows current membership in the source chat, including one-to-one chats. AgentConnect checks membership with the installed bot App for that chat. The regional Login App limits admitted bot Apps to the same trusted workspace; their App IDs do not need to match.

See [Logto authentication](/docs/logto-authentication#lark-and-feishu-identities) for the self-hosted setup.

## Follow GitHub access

An organization Owner can enable **Settings → Session access → Follow GitHub access**.

- A public-repository session remains available to every organization member.
- A private-repository session requires a linked GitHub profile with current access to that repository.

Linking GitHub does not install the GitHub App or grant repository access. It only supplies the identity used for the check.

## Private sessions

A Private session is visible only to its matched owner. There is no organization Owner override.

For directly managed sessions, that owner may switch between **Everyone** and **Private** in the session header. A Viewer may change a session they own; an Owner cannot change someone else's session audience. Making a source session Private also tightens any delegated work started from it.

Provider-bound sessions show a read-only audience. Change the organization's provider access setting rather than trying to reclassify one participant's copy.

Sessions do not currently support a Selected member list or a public share link.

## Delegated and handoff sessions

An agent-to-agent child session inherits its parent session's audience because the handoff can carry source context into the child's transcript. Anyone who passes that inherited audience can follow the child session even when the target Agent is outside their Team visibility. The target Agent's name remains plain context; the Agent itself, its workspace, and its controls stay unavailable.

Tightening a source session to Private also tightens its descendants. Widening a source session does not automatically publish a child that was already narrowed.

## When a session link is unavailable

AgentConnect uses the same unavailable response when a session does not exist, was removed, or falls outside your session audience, so the response does not reveal protected session existence. For a provider audience, confirm that the matching social account is linked and still has access to the source conversation or repository. A hidden owning Agent by itself does not make an otherwise readable session unavailable.

## Memory caveat

For AgentConnect-managed or supported external memory, making an Everyone session Private stops future shared-memory capture after the daemon applies the change. It does not remove information already captured while the session was visible to Everyone.

Provider scope alone does not exclude a session from shared-memory capture or recall. A Private session can still recall existing agent-scoped memory. Runtime-native memory has no per-session AgentConnect gate, so a private transcript can still influence what that runtime recalls later.

## Linked identities and AgentConnect OSS

Provider audiences depend on a matching [linked social account](/docs/social-account-linking). Organization membership, the Owner role, a personal API key, or a different provider identity does not substitute for it.

AgentConnect OSS requires optional OIDC sign-in and provider identity lookup for these checks. Slack additionally needs workspace and conversation access checks; Lark and Feishu need a regional Login App, `union_id` in the linked identity, and bot membership permissions; GitHub needs repository checks. See [Logto authentication](/docs/logto-authentication).
