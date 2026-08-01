---
title: 🔐 Permissions with linked accounts
excerpt: Understand exactly what changes—and what does not—when one profile links GitHub, Google, and Slack.
hidden: false
---

One AgentConnect profile can use GitHub, Google, and Slack as sign-in methods. Linking another provider gives the same profile another way to sign in and, where supported, a provider-specific identity for a narrowly defined permission check.

It does **not** combine the providers into one pool of permissions. A GitHub identity is used only for GitHub checks, a Slack identity is used only for Slack session checks, and Google currently adds no provider-specific AgentConnect authorization.

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

Two optional GitHub policies use the linked identity for different decisions:

- **Per-user repository authorization** checks the signed-in person during repository setup. A linked GitHub identity is always required. For a public repository, `read` and AgentConnect `comment` setup can pass even when GitHub reports no effective permission for that user. For a private repository, those levels require effective repository access; `write` requires `write` or `admin`.
- **Follow GitHub repository access** controls who may read GitHub-triggered sessions. Public-repository sessions require no linked identity; private-repository sessions require a linked GitHub profile with current repository access.

Both policies still require the deployment's GitHub App to cover the repository. Neither linking nor either policy grants repository access by itself.

GitHub webhook authorization is separate again: AgentConnect checks the current repository permission of the issue, pull-request, or comment author. The signed-in console user's linked GitHub account does not grant another GitHub author permission to trigger an agent. See [GitHub](/docs/github).

## Linked-account state matrix

The matrix assumes all three providers are enabled. The GitHub column assumes both optional GitHub policies are on. A check uses only the identity in its own provider.

| Linked methods | GitHub setup and private sessions | Slack DMs and shared sessions | Unlinking |
| --- | --- | --- | --- |
| **GitHub** | Uses GitHub identity | No match | Link another method first |
| **Google** | No match | No match | Link another method first |
| **Slack** | No match | Uses workspace identity | Link another method first |
| **GitHub + Google** | Uses GitHub identity | No match | Either method |
| **GitHub + Slack** | Uses GitHub identity | Uses workspace identity | Either method |
| **All three** | Uses GitHub identity | Uses workspace identity | Any one method |

Public GitHub sessions remain available to anyone who can see the agent. Linking still does not change the profile, organization role, resource grants, App installations, or provider access.

## Unlinking a provider

Unlinking removes only that sign-in method and its provider-specific identity:

- Removing **GitHub** does not uninstall the GitHub App or delete existing agents and repository grants. The profile can no longer pass the per-user setup gate or read synchronized private-repository sessions until GitHub is linked again. Public-repository sessions are unaffected.
- Removing **Google** removes a sign-in option and no provider-specific permission.
- Removing **Slack** removes the workspace identity from authorization immediately. Existing Slack session records are not deleted, but private DMs and Slack-scoped shared sessions that depended on the match are no longer visible. Relinking the same workspace identity can make them visible again without rewriting the sessions.

The final linked sign-in method cannot be removed. See [Social account linking](/docs/social-account-linking) for the link and unlink workflow.

## Current behavior, not a permission union

Linked Slack identity support for private DM ownership and Slack conversation access is implemented today. Linked GitHub identity checks for repository setup and private-repository session access are also implemented. See [Session visibility](/docs/session-visibility) for the exact audience checks and failure behavior.

AgentConnect does not currently create a broader identity union across providers or Slack workspaces. Do not assume that:

- GitHub or Google can prove ownership of a Slack session;
- Slack or Google can satisfy a GitHub repository gate;
- one Slack identity represents the same user in every workspace; or
- linking any provider widens organization access or resource visibility.
