---
title: 👥 Members & roles
excerpt: Invite teammates and choose what Owners, Collaborators, and Viewers may do.
hidden: false
---

Everything in AgentConnect belongs to an **organization**. Membership is the outer authorization boundary: a person must belong to the organization before any role or visibility rule can grant access.

With ordinary sign-in, your first sign-in creates a personal organization. In a deployment with an admission gate, that organization is created when your account is activated instead. Use the organization switcher to create or move between organizations.

## Members

**Settings → Members & roles** lists everyone in the organization. Owners can:

- add a member by email and choose a role;
- generate or revoke the organization's collaborator invite link;
- change a member's role; and
- remove a member.

An organization must always have at least one Owner, so its last Owner cannot be demoted or removed.

## Roles

|                                                                                   | **Owner** | **Collaborator** | **Viewer** |
| --------------------------------------------------------------------------------- | --------- | ---------------- | ---------- |
| See resources allowed by [visibility](/docs/visibility-and-sharing) | ✓ | ✓ | ✓ |
| Read allowed sessions, usage, and transcripts                                     | ✓         | ✓                | ✓          |
| Create resources and edit resources they can see                                  | ✓         | ✓                | —          |
| Talk to an agent they can see in the [Playground](/docs/playground)               | ✓         | ✓                | ✓          |
| Start a scheduled run with **Run now**                                            | ✓         | ✓                | —          |
| Change sharing on resources they can edit                                         | ✓         | ✓                | —          |
| Install or sync the GitHub App and manage organization bots                       | ✓         | ✓                | —          |
| Uninstall a GitHub App installation                                               | ✓         | —                | —          |
| Manage members, roles, and organization settings                                  | ✓         | —                | —          |

Roles do not override a resource's audience. An organization Owner who is not explicitly selected cannot see a restricted team resource. Owners can manage membership and organization settings without receiving an automatic read override.

When a member leaves or is removed, AgentConnect removes them from every Selected audience. Existing selected members keep access. Only an audience that would otherwise become empty receives a deterministic current organization Owner; the resource stays Selected and its creator history does not change.

A [private session](/docs/session-visibility) likewise has no organization Owner override. Its transcript is visible only to its matched owner.

Collaborators can change the audience of any resource they are allowed to edit. This includes sharing it with more members or switching it back to **Everyone**. Share sensitive resources only with collaborators you trust to manage that audience.

Viewers are read-only for *configuration*: they cannot create, edit, or delete team resources. Two exceptions are intentional, and both matter when you choose who to make a Viewer:

- A Viewer may change the visibility of a session whose owner identity matches them.
- **A Viewer can talk to any agent they can see, from the [Playground](/docs/playground).** That starts a real run on the daemon with the agent's full configuration behind it — its tools, MCP servers, repository access, and secrets. The Viewer cannot change how the agent is configured, but they can use it. Restrict a sensitive agent with [team visibility](/docs/visibility-and-sharing) rather than relying on the Viewer role to keep people away from it.

## Your profile

The avatar menu → **Your profile** shows your name, email, role, and membership date. You can edit your display name there. It also hosts [personal API keys](/docs/api-keys) and any [social sign-in methods](/docs/social-account-linking) available on your deployment.
