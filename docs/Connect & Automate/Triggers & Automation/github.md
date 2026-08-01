---
title: 🐙 GitHub
excerpt: Trigger agents from issues, pull requests and comments — and let them reply as comments.
hidden: false
---

A GitHub integration makes an agent **watch a repository**: new issues, pull requests and comments become sessions, and the agent can write back as PR/issue comments. It rides the deployment's [AgentConnect GitHub app](/docs/workspaces-and-repos). Managed AgentConnect does not require a webhook per repository; an AgentConnect OSS operator configures one deployment-level GitHub App webhook on the Relay.

## Watch a repository

On the agent: **Integrations → Add integration → GitHub**.

1. **Repository** — pick from every repo the GitHub app can see (the agent's workspace repo and already-authorized repos sort first). Picking a repo the agent isn't authorized for opens the authorize step right there.
2. **Listen for** — the event families to subscribe to (issues, pull requests, …).
3. **Trigger when** — how eagerly the agent wakes up:
   - **created** — only when a PR or issue is opened.
   - **updated** — creations plus updates and replies.
   - **mention** — only when the assigned agent or GitHub App is @-mentioned.

## Who may trigger an agent

AgentConnect checks the content author's **current repository permission** through GitHub. Only people with `write` or `admin` permission can start an agent automatically; GitHub's webhook `author_association` label is not used as authority.

- An issue or pull request opened by someone without current `write` or `admin` permission does not start an agent, even if its body mentions the agent or GitHub App.
- A current `write` or `admin` maintainer can explicitly mention the agent or App in a comment to request the first turn on an externally authored thread. The same mention from a read-only user does nothing.
- An unmentioned follow-up follows the configured cadence only when both the commenter and the original issue or PR author still have `write` or `admin` permission.
- Native review requests and Check reruns use the same current-maintainer boundary.

AgentConnect checks the author of each comment, including edited content; the webhook sender is not substituted for the content author. Trigger permission is separate from what the agent may do afterward: comments, formal reviews, Checks, and repository writes still require the configured AgentConnect repository grant and GitHub App permissions.

> ⚠️ **Public repositories:** external issue bodies, pull requests, diffs, and comments remain untrusted input even though they cannot dispatch an agent without a maintainer request. Use a conservative [permission mode](/docs/create-an-agent) and narrowly scoped repository credentials.

A GitHub identity linked to a signed-in AgentConnect profile can participate in two separate console-user checks:

- optional per-user repository authorization uses it during repository setup; and
- **Settings → Session access → Follow GitHub repository access** uses it when deciding whether the viewer may read a session from a private repository.

Public-repository sessions do not require a linked GitHub profile. Linking GitHub does not install the GitHub App, grant a repository, or change the webhook-author rules above. See [Permissions with linked accounts](/docs/linked-account-permissions).

## What the agent does

Each qualifying event starts a session on the agent's daemon with the event as context (title, body, diff excerpt as applicable). The agent's replies post back to the thread as comments, subject to its repo authorization tier (**comment** or **write** — see [Workspaces & repositories](/docs/workspaces-and-repos)).

Sessions triggered from GitHub appear in [Sessions](/docs/sessions) with the repo/thread as their channel, linked back to GitHub. When repository access sync is enabled, their read-only **GitHub access** audience follows the source repository's current visibility and the viewer's access rather than an AgentConnect role override.

## PR reviews

For pull-request watches, expand **PR review** and choose:

- **None** — run the agent and post its final reply as an ordinary PR comment, without a formal review or Check.
- **Brief** — allow a formal `COMMENT` review and inline comments.
- **Details** — also allow `REQUEST_CHANGES` and `APPROVE`, and publish an informational **AgentConnect PR Review** Check.

Formal reviews require agent repository **write** access and effective GitHub App `pull_requests:write` permission. Informational Checks additionally require `checks:write`.

Several agents may watch the same repository. In a PR conversation, `@<agent-name>` targets one matching agent, while `@<github-app-name>` broadcasts to every matching reviewer. Both forms still respect event-family, label, installation, live maintainer authorization, and bot-sender safety checks.

For a complete two-model setup, see [Fast PR reviews with deep review on demand](/docs/fast-and-deep-pr-reviews).

## Manage watches

The agent page groups its GitHub integration as one card — one row per watched repository with:

- event toggles and the trigger cadence select (**when created / updated / mention**),
- recent deliveries (what fired, when, and the session it started),
- **Add repository** to watch more repos with the same agent.

## Requirements

- The **GitHub app** must be installed for your org (**Settings → GitHub → Install on GitHub**); the integration dialog offers the install button if it's missing, with an **I've installed it — sync** refresh.
- Ordinary write-back requires repository authorization. Formal reviews and Checks require **write**.
- On AgentConnect OSS, the operator must first [configure the deployment GitHub App and its Relay webhook](/docs/deployment-and-configuration#optional-github-app).
