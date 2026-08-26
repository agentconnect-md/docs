---
title: 🔍 Layered PR reviews
excerpt: Review every PR revision with a fast model, then summon a stronger reviewer only when a change needs deeper analysis.
hidden: false
---

Use two agents to create a layered review workflow: a fast reviewer covers every pull-request revision, while a more capable model stays idle until a maintainer explicitly asks for a deeper review.

<p align="center">
  <img src="https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/github-integration.png" alt="Configure a pull-request reviewer and its trigger" width="640" />
</p>

Both agents watch the same repository through one AgentConnect GitHub App. Each has its own runtime, model, instructions, session, and review settings.

This is the layered-specialist pattern from [Multi-agent work modes](/docs/multi-agent-work-modes#layered-or-on-demand-specialists). Compare it with trigger fan-out and direct delegation before configuring the reviewers.

| Agent | Model profile | Trigger | PR review | Role |
| --- | --- | --- | --- | --- |
| `quick-review` | Fast and efficient | **updated** | **Brief** | Baseline correctness and regressions |
| `deep-review` | Strong reasoning | **mention only** | **Details** | Architecture, security, migrations, operations |

## Before you start

You need:

- two online agents with the runtimes and models you want to compare;
- the AgentConnect GitHub App installed for the repository;
- **write** repository access for both agents; and
- effective GitHub App `pull_requests:write` permission. The deep reviewer also needs `checks:write` for its informational Check.

See [GitHub](/docs/github) for integration behavior and [Workspaces & repositories](/docs/workspaces-and-repos) for repository authorization.

## 1. Configure the reviewers

Create two agents and give each one a narrow review role.

For `quick-review`, use a fast model and instructions such as:

```text
Review each pull-request revision for correctness, missing tests, obvious security
issues, and compatibility regressions. Keep findings concise and actionable. Do not
claim approval or request changes; leave deeper architectural analysis to deep-review.
```

For `deep-review`, use the stronger model and instructions such as:

```text
Perform a deep pull-request review. Prioritize architecture, concurrency, security,
data migrations, failure recovery, and operational risk. Verify findings against the
current diff and avoid repeating comments that are already resolved.
```

Keep the agent names stable. The deep reviewer's name becomes its targeted GitHub handle, such as `@deep-review`.

## 2. Watch the repository with both agents

On `quick-review`, open **Integrations → Add integration → GitHub**:

1. Select the repository.
2. Under **Listen for**, select **Pull requests**.
3. Set **Trigger when** to **updated**.
4. Set **PR review** to **Brief**.

Repeat on `deep-review`, but choose:

1. **Pull requests**;
2. **mention only**; and
3. **Details**.

The **updated** cadence covers opened PRs, new revisions, and supported PR conversation events. Only revision-bearing events open an automatic review generation. If you only want the baseline review when a PR is first opened, choose **created** instead; later commits will then require an explicit mention.

## 3. Run the workflow

Opening a PR or pushing a new revision automatically runs `quick-review`.

When a change needs deeper analysis, an authorized maintainer adds a PR comment that names only the second agent:

```text
@deep-review Please review the concurrency, migration, and rollback risks in this revision.
```

The agent handle narrows the repository fan-out, so this comment runs `deep-review` without rerunning `quick-review`. Handle matching is case-insensitive and requires the complete agent name.

Mentioning the GitHub App instead — for example, `@your-agentconnect-app` — is the broadcast form and runs every matching reviewer for the repository.

## What appears on GitHub

Each agent keeps a separate PR session. A reviewer with informational Check reporting enabled appears as:

```text
AgentConnect PR Review: <agent-name>
```

Both agents still write as the same installation-level GitHub App identity. For that reason, this pattern keeps the baseline reviewer on **Brief**, which can submit a formal `COMMENT` review but cannot `APPROVE` or `REQUEST_CHANGES`. The deep reviewer uses **Details** for the decisive verdict, inline comments, and informational Check.

AgentConnect Checks are currently informational rather than required branch-protection gates.

## Important behavior

- The visible mention must come from a current repository maintainer with `write` or `admin` permission. A comment authored by the GitHub App is rejected as a trigger, even if its text contains `@deep-review`; this prevents bot-to-bot loops. GitHub's native **Request review** control can also request the App, but it runs every matching reviewer rather than only `deep-review`.
- A targeted `@deep-review` mention wins over the baseline reviewer's broader **updated** cadence for that delivery.
- Nobody has to remember the exact name. An organization team named `deep-review` makes `@<organization>/deep-review` autocomplete in the comment box and summon the same agent — see [Make the agent name autocomplete](/docs/github#make-the-agent-name-autocomplete).
- **Re-run all checks** reruns the current AgentConnect review Checks in the App's suite. Use the individual Check action when you want only one reviewer.
- PR bodies, diffs, and comments are untrusted input. Use conservative agent permissions, especially on public repositories.

For automatic model escalation without a maintainer mention, use trusted agent-to-agent orchestration instead of trying to trigger another agent through a visible GitHub bot comment.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| `@deep-review` does nothing | Exact agent name; `write`/`admin` author; **mention only** trigger |
| Both reviewers run | Mention the agent, not the GitHub App |
| No inline comments or verdict | **Details**; repository **write**; App `pull_requests:write` |
| No informational Check | Check reporting and App `checks:write` |
