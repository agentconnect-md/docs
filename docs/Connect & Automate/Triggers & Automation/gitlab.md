---
title: 🦊 GitLab
excerpt: Connect GitLab.com or your own instance, give each agent its own bot account, and trigger from issues and merge requests.
hidden: false
---

A GitLab integration makes an agent **watch a project**: issues, merge requests and comments become sessions, and the agent writes back as merge-request notes and reviews. It works the same on **GitLab.com** and on a **self-managed instance** — a deployment connects to one or the other, never both at once.

Where the GitHub integration acts through one App installed on an organization, GitLab gives **each agent its own user**: a group service account, created when you first set up a project for that agent. Everything the agent does on GitLab — clone, push, comment, review — is attributed to that account, and revoking it revokes exactly one agent.

## Connect GitLab

An administrator connects the deployment once, in **Integrations → Code hosts → Connect GitLab**. The browser completes an OAuth authorization, and the connected account becomes the deployment's **administration identity**: AgentConnect uses it to discover projects, create the agents' service accounts, and manage project webhooks. It is not the identity agents act as.

On GitLab.com, connect an account that is an **Owner of the top-level group** holding your projects: creating each agent's service account requires it, and project-level Maintainer access is not enough. On AgentConnect OSS, the operator [configures the deployment's GitLab OAuth application](/docs/deployment-and-configuration#gitlab) first — and for a self-managed instance, that page also covers what the instance must provide and the two ways to hold the creation authority there.

The connection is per organization, and one deployment addresses one instance. Once GitLab state exists, the instance address cannot be changed: connections, tokens and numeric project IDs carry no instance provenance, so retargeting would send one instance's credentials to another.

## Give an agent a project

There is no separate "install on this project" step. A project is set up the moment you first give it to an agent — as its [workspace](/docs/workspaces-and-repos), or as an authorized additional repository. Setting it up does three things:

1. creates that agent's **service account** in the project's top-level group, if it does not have one yet;
2. adds the account to the project as a **Developer**; and
3. reconciles the project **webhook** AgentConnect delivers events through.

The project must live in a **group**. A project in a personal namespace cannot be set up, because service accounts are group-owned — AgentConnect reports `personal_namespace_unsupported` and nothing is created.

**Integrations → Code hosts** lists the projects that are set up, with two actions per project: **Repair** re-runs the provisioning above (use it after someone deletes the bot or the webhook by hand), and **Remove** deletes the webhook and the project's bots and stops agents answering there. Nothing in the project's code or history changes either way.

GitLab.com Free allows **100 service accounts per top-level group**; a self-managed Free or Community Edition instance allows 100 across the **entire instance**. The population is agents-with-projects, and a refused creation is reported as a quota failure that leaves existing accounts untouched.

## Watch a project

On the agent: **Integrations → Add integration → GitLab**.

A trigger rides an existing authorization and never creates one: the project must already be the agent's workspace or one of its authorized additional repositories, or adding the watch is refused.

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

Everything above works the same on your own instance. What differs is operator work, done once per deployment: pointing the deployment at the instance, registering the OAuth application, and satisfying what the instance must provide (GitLab 18.11+, one HTTPS address, a trusted certificate, ingress GitLab will deliver to). All of it lives in [GitLab on AgentConnect OSS](/docs/deployment-and-configuration#gitlab).

Nothing about the instance has to be configured on your daemons: a daemon learns it from the agent it is serving.
