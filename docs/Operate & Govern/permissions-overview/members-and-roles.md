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
| Run agents from Playground or **Run now**                                         | ✓         | ✓                | —          |
| Change sharing on resources they can edit                                         | ✓         | ✓                | —          |
| Install or sync the GitHub App and manage organization bots                       | ✓         | ✓                | —          |
| Uninstall a GitHub App installation                                               | ✓         | —                | —          |
| Manage members, roles, and organization settings                                  | ✓         | —                | —          |
| See and recover every restricted team resource                                    | ✓         | —                | —          |

Owners have a governance override for restricted team resources, but not for [private sessions](/docs/session-visibility). A private transcript is visible only to its matched owner, regardless of organization role.

Collaborators can change the audience of any resource they are allowed to edit. This includes sharing it with more members or switching it back to **Everyone**. Share sensitive resources only with collaborators you trust to manage that audience.

Viewers are read-only for team resources. One ownership-based exception is intentional: a Viewer may still change the visibility of a session they own.

## Your profile

The avatar menu → **Your profile** shows your name, email, role, and membership date. You can edit your display name there. It also hosts [personal API keys](/docs/api-keys) and any [social sign-in methods](/docs/social-account-linking) available on your deployment.
