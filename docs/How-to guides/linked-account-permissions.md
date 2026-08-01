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

| Provider   | What linking adds                                                                                                                                                                                                                                                  | What it does not add                                                                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **GitHub** | Another sign-in method and a verified GitHub identity. AgentConnect can use it for optional repository setup authorization and, when GitHub session access is enabled, current access to sessions from private repositories.                                        | It does not install the GitHub App, add repositories to an installation, grant repository access, or authorize Slack sessions.  |
| **Google** | Another sign-in method.                                                                                                                                                                                                                                            | Google currently adds no provider-specific AgentConnect authorization.                                                          |
| **Slack**  | Another sign-in method plus one verified, workspace-scoped `teamId + userId` identity for private Slack DM ownership and optional access checks for shared Slack sessions.                                                                          | It does not install a Slack bot, widen AgentConnect resource visibility, or identify the same person in another Slack workspace. |

Two optional GitHub policies use the linked identity for different decisions:

- **Per-user repository authorization** checks the signed-in person during repository setup. A linked GitHub identity is always required. For a public repository, `read` and AgentConnect `comment` setup can pass even when GitHub reports no effective permission for that user. For a private repository, those levels require effective repository access; `write` requires `write` or `admin`.
- **Follow GitHub repository access** controls who may read GitHub-triggered sessions. Public-repository sessions require no linked identity; private-repository sessions require a linked GitHub profile with current repository access.

Both policies still require the deployment's GitHub App to cover the repository. Neither linking nor either policy grants repository access by itself.

GitHub webhook authorization is separate again: AgentConnect checks the current repository permission of the issue, pull-request, or comment author. The signed-in console user's linked GitHub account does not grant another GitHub author permission to trigger an agent. See [GitHub](/docs/github).

## Linked-account state matrix

The matrix assumes the deployment offers all three providers; an operator can enable a smaller set. The **GitHub** column assumes both optional GitHub policies are enabled. Public GitHub sessions remain available to anyone who can see the agent, with or without a linked GitHub profile.

| Linked-account state                                     | Available sign-in methods    | Organization, role, and resource effect | GitHub setup and session effect                                                                                                                          | Slack session effect                                                                                       | Limitation or next action                                                                                    |
| -------------------------------------------------------- | ---------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **GitHub only**                                          | GitHub                       | None; the same profile and grants apply | Can satisfy the setup gate; private-repository sessions follow this identity's current access                                                             | No linked Slack identity, so private Slack DMs and restricted Slack sessions cannot match                  | Linking provides an identity, not repository access; link another provider before unlinking GitHub          |
| **Google only**                                          | Google                       | None                                    | Cannot satisfy the setup gate; private-repository sessions cannot match                                                                                   | No linked Slack identity                                                                                   | Link GitHub or Slack for those provider-specific capabilities; link another provider before unlinking Google |
| **Slack only**                                           | Slack                        | None                                    | Cannot satisfy the setup gate; private-repository sessions cannot match                                                                                   | Matches private DMs and, when enabled, the linked identity's current Slack access                          | Link another provider before unlinking Slack                                                                 |
| **GitHub + Google**                                      | GitHub, Google               | None                                    | Same as GitHub only                                                                                                                                       | No linked Slack identity                                                                                   | Either method can be used to sign in; either one may be unlinked                                             |
| **GitHub + Slack**                                       | GitHub, Slack                | None                                    | Same as GitHub only                                                                                                                                       | Uses only the linked Slack workspace identity                                                              | Each identity affects only its own provider checks                                                          |
| **GitHub + Google + Slack**                              | GitHub, Google, Slack        | None                                    | Same as GitHub only                                                                                                                                       | Uses only the linked Slack workspace identity                                                              | Any one method may be unlinked; only that provider's capability is removed                                   |
| **One provider unlinked from a multi-provider profile**  | All remaining linked methods | None                                    | Removing GitHub removes the setup identity and private-repository session match; removing Google or Slack has no GitHub effect                             | Removing Slack immediately removes its DM and shared-session match; removing GitHub or Google has no effect | Existing organizations, grants, App installations, and session records remain                               |
| **Attempt to unlink the final provider**                 | The final method remains     | None; the request is refused            | Unchanged                                                                                                                                                | Unchanged                                                                                                  | Link another sign-in method first                                                                            |
| **Attempt to link an identity owned by another profile** | Existing methods remain      | None; profiles are not merged           | No GitHub identity or permission is copied                                                                                                                | No Slack identity or session ownership is copied                                                           | Sign in to the profile that already owns the identity, or use a different provider account                   |

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
