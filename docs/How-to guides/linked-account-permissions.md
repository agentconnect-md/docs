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

| Provider   | What linking adds                                                                                                                                                                    | What it does not add                                                                                                               |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **GitHub** | Another sign-in method. When per-user GitHub authorization is enabled, AgentConnect uses this GitHub identity for repository checks during setup, including the public-repository read exception described below. | It does not install the GitHub App, add repositories to an installation, grant repository access, or authorize Slack sessions.     |
| **Google** | Another sign-in method.                                                                                                                                                              | Google currently adds no provider-specific AgentConnect authorization.                                                             |
| **Slack**  | Another sign-in method plus one verified, workspace-scoped `teamId + userId` identity for private Slack DM ownership and optional Slack conversation-membership checks.              | It does not install a Slack bot, widen AgentConnect resource visibility, or identify the same person in another Slack workspace.    |

The GitHub check is optional deployment policy. When it is enabled, the GitHub App must already cover the repository and a linked GitHub identity is always required. For a public repository, `read` and AgentConnect `comment` setup can pass even when GitHub reports no effective permission for that user. For a private repository, those levels require effective repository access; `write` always requires effective `write` or `admin` permission. When the check is disabled, repository authorization follows the AgentConnect organization and GitHub App installation boundary; linking GitHub does not widen that boundary.

GitHub webhook authorization is separate again: AgentConnect checks the current repository permission of the issue, pull-request, or comment author. The signed-in console user's linked GitHub account does not grant another GitHub author permission to trigger an agent. See [GitHub](/docs/github).

## Linked-account state matrix

The matrix assumes the deployment offers all three providers; an operator can enable a smaller set. The **GitHub repository** column assumes the optional per-user GitHub authorization gate is enabled. The **Private IM** column describes provider-specific identity matching; today, linked-account matching is implemented for Slack.

| Linked-account state                                      | Available sign-in methods    | Organization, role, and resource effect | GitHub repository effect                                                                                 | Private IM session effect                                                                                     | Limitation or next action                                                                                       |
| --------------------------------------------------------- | ---------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **GitHub only**                                           | GitHub                       | None; the same profile and grants apply | Public `read`/`comment` can pass without effective permission; private access needs repository permission, and `write` needs `write`/`admin` | No linked Slack identity, so private Slack DMs cannot match this profile                                          | Linking provides an identity, not repository access; link another provider before unlinking GitHub                |
| **Google only**                                           | Google                       | None                                    | No GitHub identity; gated repository setup requires linking GitHub                                       | No linked Slack identity                                                                                        | Link GitHub or Slack for those provider-specific capabilities; link another provider before unlinking Google     |
| **Slack only**                                            | Slack                        | None                                    | No GitHub identity; gated repository setup requires linking GitHub                                       | Matches the linked workspace's private Slack DMs and, when enabled, current Slack conversation membership        | Link another provider before unlinking Slack                                                                     |
| **GitHub + Google**                                       | GitHub, Google               | None                                    | The same public `read`/`comment` exception applies; private access needs repository permission, and `write` needs `write`/`admin` | No linked Slack identity                                                                                        | Either method can be used to sign in; either one may be unlinked                                                  |
| **GitHub + Slack**                                        | GitHub, Slack                | None                                    | The same public `read`/`comment` exception applies; private access needs repository permission, and `write` needs `write`/`admin` | Uses only the linked Slack workspace identity                                                                   | Each identity affects only its own provider checks                                                               |
| **GitHub + Google + Slack**                               | GitHub, Google, Slack        | None                                    | The same public `read`/`comment` exception applies; private access needs repository permission, and `write` needs `write`/`admin` | Uses only the linked Slack workspace identity                                                                   | Any one method may be unlinked; only that provider's capability is removed                                        |
| **One provider unlinked from a multi-provider profile**   | All remaining linked methods | None                                    | Removing GitHub removes the identity used by the per-user gate; removing Google or Slack has no effect    | Removing Slack immediately removes its DM and conversation match; removing GitHub or Google has no effect        | Existing organizations, grants, App installations, and session records remain                                    |
| **Attempt to unlink the final provider**                  | The final method remains     | None; the request is refused            | Unchanged                                                                                                | Unchanged                                                                                                        | Link another sign-in method first                                                                                 |
| **Attempt to link an identity owned by another profile**  | Existing methods remain      | None; profiles are not merged           | No GitHub identity or permission is copied                                                               | No Slack identity or session ownership is copied                                                                | Sign in to the profile that already owns the identity, or use a different provider account                        |

## Unlinking a provider

Unlinking removes only that sign-in method and its provider-specific identity:

- Removing **GitHub** does not uninstall the GitHub App or delete existing agents and repository grants. When the per-user gate is enabled, the profile can no longer pass new GitHub identity checks until GitHub is linked again.
- Removing **Google** removes a sign-in option and no provider-specific permission.
- Removing **Slack** removes the workspace identity from authorization immediately. Existing Slack session records are not deleted, but private DMs and Slack-scoped shared sessions that depended on the match are no longer visible. Relinking the same workspace identity can make them visible again without rewriting the sessions.

The final linked sign-in method cannot be removed. See [Social account linking](/docs/social-account-linking) for the link and unlink workflow.

## Current behavior, not a permission union

Linked Slack identity support for private DM ownership and Slack conversation access is implemented today; older plans that described that behavior as future work are outdated. See [Session visibility](/docs/session-visibility) for the exact audience checks and failure behavior.

AgentConnect does not currently create a broader identity union across providers or Slack workspaces. Do not assume that:

- GitHub or Google can prove ownership of a Slack session;
- Slack or Google can satisfy a GitHub repository gate;
- one Slack identity represents the same user in every workspace; or
- linking any provider widens organization access or resource visibility.
