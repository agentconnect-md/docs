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

> ⚠️ **Public repositories:** anyone can open an issue on a public repo — with _created_/_updated_ triggers that means untrusted strangers can start your agent. Prefer **mention**, a conservative [permission mode](/docs/create-an-agent), and read-only credentials there.

## What the agent does

Each qualifying event starts a session on the agent's daemon with the event as context (title, body, diff excerpt as applicable). The agent's replies post back to the thread as comments, subject to its repo authorization tier (**comment** or **write** — see [Workspaces & repositories](/docs/workspaces-and-repos)).

Sessions triggered from GitHub appear in [Sessions](/docs/sessions) with the repo/thread as their channel, linked back to GitHub.

## PR reviews

For pull-request watches, expand **PR review** and choose:

- **None** — run the agent and post its final reply as an ordinary PR comment, without a formal review or Check.
- **Brief** — allow a formal `COMMENT` review and inline comments.
- **Details** — also allow `REQUEST_CHANGES` and `APPROVE`, and publish an informational **AgentConnect PR Review** Check.

Formal reviews require agent repository **write** access and effective GitHub App `pull_requests:write` permission. Informational Checks additionally require `checks:write`.

Several agents may watch the same repository. In a PR conversation, `@<agent-name>` targets one matching agent, while `@<github-app-name>` broadcasts to every matching reviewer. Both forms still respect event-family, label, installation, collaborator, and bot-sender safety checks.

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
