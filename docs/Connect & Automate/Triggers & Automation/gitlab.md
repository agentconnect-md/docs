---
title: 🦊 GitLab
excerpt: Connect GitLab.com or your own instance, give each agent its own bot account, and trigger from issues and merge requests.
hidden: false
---

A GitLab integration makes an agent **watch a project**: issues, merge requests and comments become sessions, and the agent writes back as merge-request notes and reviews. It works the same on **GitLab.com** and on a **self-managed instance** — a deployment connects to one or the other, never both at once.

Where the GitHub integration acts through one App installed on an organization, GitLab gives **each agent its own user**: a group service account, created when you first set up a project for that agent. Everything the agent does on GitLab — clone, push, comment, review — is attributed to that account, and revoking it revokes exactly one agent.

## Connect GitLab

An administrator connects the deployment once, in **Integrations → Code hosts → Connect GitLab**. The browser completes an OAuth authorization, and the connected account becomes the deployment's **administration identity**: AgentConnect uses it to discover projects, create the agents' service accounts, and manage project webhooks. It is not the identity agents act as.

Connect an account with **Maintainer or Owner** access to the projects you intend to use. On a self-managed instance, the deployment has to be pointed at that instance in Setup before this button does anything — see [Self-managed instances](#self-managed-instances), which also covers who is allowed to connect there.

The connection is per organization, and one deployment addresses one instance. Once GitLab state exists, the instance address cannot be changed: connections, tokens and numeric project IDs carry no instance provenance, so retargeting would send one instance's credentials to another.

## Give an agent a project

There is no separate "install on this project" step. A project is set up the moment you use it — when you pick it as an agent's [workspace](/docs/workspaces-and-repos), authorize it as an additional repository, or add a GitLab trigger. Setting it up does three things:

1. creates that agent's **service account** in the project's top-level group, if it does not have one yet;
2. adds the account to the project as a **Developer**; and
3. reconciles the project **webhook** AgentConnect delivers events through.

The project must live in a **group**. A project in a personal namespace cannot be set up, because service accounts are group-owned — AgentConnect reports `personal_namespace_unsupported` and nothing is created.

**Integrations → Code hosts** lists the projects that are set up, with two actions per project: **Repair** re-runs the provisioning above (use it after someone deletes the bot or the webhook by hand), and **Remove** deletes the webhook and the project's bots and stops agents answering there. Nothing in the project's code or history changes either way.

On GitLab Free and Community Edition a top-level group may hold **100 service accounts**, and the population is agents-with-projects. A refused creation is reported as a quota failure and leaves existing accounts untouched.

## Watch a project

On the agent: **Integrations → Add integration → GitLab**.

Choose the project, what to listen for — issues, merge requests, or both — and how eagerly the agent wakes up:

- **created** — when an issue or merge request is opened, plus later explicit mentions in that family.
- **updated** — openings plus new revisions, labels and replies.
- **mention only** — when the agent is @-mentioned.

## Who may trigger an agent

AgentConnect checks the **current project membership** of whoever wrote the content, through the GitLab API, at the moment of the event. Webhook-carried labels are never treated as authority.

Only a member with **Developer or higher** on the target project can start an agent. Membership that is awaiting, expired, lower, missing or simply unavailable fails closed — the agent does not run. Direct, ancestor-group and invited-group membership all count, at the highest effective level.

> This is stricter than the GitHub integration, which accepts the triage role. GitLab's Reporter role carries no merge-request authority, so the bar sits at Developer.

A merge request from outside the project does not start an agent on its own. A current Developer-or-higher member can request the first turn by mentioning the agent explicitly. Trigger permission is separate from what the agent may do afterwards: comments, reviews and pushes still require the repository authorization you gave the agent.

## What the agent does

Each qualifying event starts a session on the agent's daemon with the event as context, and the sessions appear in [Sessions](/docs/sessions) linked back to GitLab.

- **Ordinary reply** — one note from the agent's service account.
- **Reviews** — inline comments are drafted and published as one review. **Approve** is a published review plus an approval call fenced to the reviewed commit. **Request changes** blocks merging on Premium and above; on Free it is visible but advisory. AgentConnect never edits the reviewer list.
- **Run state** — a single note on the merge request, updated as the run progresses, linking back to the session in the console. GitLab Free has no external status checks, so this note is the run's status surface rather than a pipeline entry.

To run an agent again on a thread, re-request its service account as a reviewer, mention it, or re-run the session from the console.

Git access uses short-lived tokens served to the agent's sandbox over a local socket: **no GitLab credential is written to disk**, and each agent can only reach what its own account may reach.

## Self-managed instances

Everything above applies unchanged. What differs is what the instance itself must provide:

| Requirement               | Why                                                                                                                                                                              |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **GitLab 18.11 or later** | Group service accounts reached every tier, Community Edition included, at 18.11. Below that AgentConnect refuses to provision rather than guess.                                 |
| **HTTPS, one address**    | Clone URLs, OAuth redirects and GitLab's own `web_url` values only agree if there is a single address. Split internal/external addressing belongs in DNS.                        |
| **A trusted certificate** | There is no skip-verify option at any layer. A private authority is supported by installing its bundle where every process and sandbox can read it.                              |
| **Reachable ingress**     | GitLab refuses to deliver webhooks to the local network by default; if your AgentConnect ingress resolves to a private address, the integration looks installed and stays quiet. |

### Point the deployment at your instance

The instance and its OAuth application are deployment settings, so they are entered in **Setup**, not in the console. Setup is loopback-only: on Kubernetes reach it with a [port-forward](/docs/kubernetes-deployment#4-configure-sign-in-before-publishing-the-route), on Compose it is already on `localhost`.

1. In Setup, open **GitLab** and put your instance in **Instance base URL** (empty means GitLab.com). A path prefix and a non-default port are both supported and preserved everywhere. Setup probes what you typed: only an unusable URL blocks the save — an unreachable host, an untrusted certificate or a response that is not a GitLab API root are reported as warnings, because Setup and the Control Plane need not sit in the same network position.
2. Setup then displays the exact **Redirect URI** and **Scopes** to register. GitLab has no API for creating OAuth applications, so this part happens on the instance: in **User settings → Applications**, a group's **Settings → Applications**, or **Admin → Applications** for an instance-wide one, add an application whose redirect URI is _exactly_ that value, keep **Confidential** selected, and grant those scopes. GitLab shows the secret once.
3. Paste the **Application ID** and **Secret** back into Setup and choose **Save GitLab application**.
4. Restart the services that read deployment settings at startup — the Control Plane first, then the console and relay, which cache what it serves.
5. In the console, **Integrations → Code hosts → Connect GitLab**, and authorize with an account that has the authority below.

Until GitLab state exists you can change all of this freely, including **Clear configuration**. Once projects, tokens or connections exist, the instance address is fixed.

### Who may connect

Creating the agents' service accounts needs authority no GitLab API reports, so it is checked the first time you set up a project, not in advance. Either is enough:

- **Premium or Ultimate** — turn on **Allow top-level group Owners to create service accounts** under **Admin → Settings → General**, and connect a top-level group Owner.
- **Any tier, including Community Edition** — connect an account that is an **instance administrator**.

  On an instance with **Admin Mode** enabled, administrator API actions need a token scope AgentConnect does not request, so the delegation setting above is the only path there.

Nothing about the instance address has to be configured on your daemons: a daemon learns it from the agent it is serving, and clones from it on that basis.
