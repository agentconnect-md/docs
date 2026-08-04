---
title: 👤 Linked-account permissions
excerpt: Understand what changes—and what does not—when one profile links several providers.
hidden: false
---

AgentConnect Cloud offers GitHub, Google, and Slack as sign-in methods. A self-hosted deployment can also enable Lark and Feishu. Linking another provider gives the same profile another way to sign in and, where supported, a provider-specific identity for a narrowly defined permission check.

It does **not** combine the providers into one pool of permissions. Each provider identity is used only for checks against that provider; Google currently adds no provider-specific AgentConnect authorization.

## What never changes

Linking or unlinking a provider does not change:

- the AgentConnect profile ID;
- organization membership or role;
- agent, daemon, schedule, tool, or skill visibility;
- existing resource-sharing grants; or
- another provider's permissions.

Linking also does not merge two AgentConnect profiles. If a provider identity already belongs to another profile, AgentConnect refuses the link and leaves both profiles unchanged.

See [Permissions](/docs/permissions-overview) for the organization, role, resource, and session layers that still apply.

## What each provider adds

| Provider | Adds | Does not add |
| --- | --- | --- |
| **GitHub** | Sign-in and a GitHub identity for setup and session checks | App installation or repository access |
| **Google** | Sign-in | Provider-specific authorization |
| **Slack** | Sign-in and one workspace identity for session checks | Bot installation or cross-workspace identity |
| **Lark** | Sign-in and a regional identity for supported session checks | Bot installation or Feishu identity |
| **Feishu** | Sign-in and a regional identity for supported session checks | Bot installation or Lark identity |

Two optional GitHub policies use the linked identity for different decisions:

- **Per-user repository authorization** checks the signed-in person during repository setup. Public repositories can be selected read-only without a linked GitHub identity. Private repositories require a linked identity with access, and **Read & write** always requires the linked GitHub user to have `write` or `admin` permission.
- **Follow GitHub access** controls who may read GitHub-triggered sessions. Public-repository sessions require no linked identity; private-repository sessions require a linked GitHub profile with current repository access.

The repository picker and GitHub event integrations still require the deployment's GitHub App to cover the repository. A public repository can also be used as an anonymous read-only workspace without the App. Neither linking nor either policy grants repository access by itself.

GitHub webhook authorization is separate again: AgentConnect checks the current repository permission of the issue, pull-request, or comment author. The signed-in console user's linked GitHub account does not grant another GitHub author permission to trigger an agent. See [GitHub](/docs/github).

## Checks stay provider-specific

| Permission check | Identity AgentConnect uses |
| --- | --- |
| GitHub setup or a private-repository session | Linked GitHub profile |
| Slack direct message or shared conversation | Linked Slack workspace profile |
| Lark private message with sync off | Linked Lark profile for the same bot app |
| Feishu private message with sync off | Linked Feishu profile for the same bot app |
| Lark or Feishu conversation with sync on | Linked regional profile with current chat membership |

Linking several methods lets one AgentConnect profile satisfy several independent checks. It does not let one provider substitute for another. Public GitHub sessions remain available to anyone who can see the agent.

## Unlinking a provider

Unlinking removes only that sign-in method and its provider-specific identity:

- Removing **GitHub** does not uninstall the GitHub App or delete existing agents and repository grants. The profile can still select public repositories read-only, but cannot verify private-repository or write access or read synchronized private-repository sessions until GitHub is linked again. Public-repository sessions are unaffected.
- Removing **Google** removes a sign-in option and no provider-specific permission.
- Removing **Slack** removes the workspace identity from authorization immediately. Existing Slack session records are not deleted, but private DMs and Slack-scoped shared sessions that depended on the match are no longer visible. Relinking the same workspace identity can make them visible again without rewriting the sessions.
- Removing **Lark** or **Feishu** removes only that regional identity. Matching private DMs and membership-scoped sessions are no longer visible until the same identity is linked again.

The final linked sign-in method cannot be removed. See [Social account linking](/docs/social-account-linking) for the link and unlink workflow.

## Current behavior, not a permission union

Linked Slack, Lark, and Feishu identities can participate in their matching session checks. A linked GitHub identity proves private-repository and write access during setup, and private-repository access when reading synchronized sessions. See [Session visibility](/docs/session-visibility) for the audience model.

AgentConnect does not create a broader permission union across providers or provider workspaces. Do not assume that:

- one social account can prove ownership of another provider's session;
- one provider can satisfy another provider's repository or conversation gate;
- one Slack identity represents the same user in every workspace, or one app-scoped Lark or Feishu identity directly matches every bot app; or
- linking any provider widens organization access or resource visibility.
