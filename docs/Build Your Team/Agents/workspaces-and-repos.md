---
title: 📁 Workspaces & repositories
excerpt: Scratch vs GitHub workspaces, the GitHub app, credential-free git, and granting an agent extra repositories.
hidden: false
---

Every agent has a **workspace** — its working directory on the daemon. You chose its mode when creating the agent.

## From scratch

A fresh directory on the daemon. Files the agent creates live only on that machine and aren't version-controlled. Good for reporting agents, chat-ops, and anything that doesn't start from existing code.

## From GitHub

The daemon clones a repository and branch (optionally scoping the agent to a subdirectory), and the agent works inside that checkout.

To pick repositories from a list, install the **AgentConnect GitHub app**:

1. In **Add agent → From GitHub**, click **Install GitHub app** (or go to **Settings → GitHub → Install on GitHub**).
2. On GitHub, choose the account and which repositories to grant.
3. Back in the dialog, pick the **repository** and **branch**, set the **agent directory** if the agent should live in a subfolder, and choose **push access**:
   - **Read only** — the agent can pull but not push.
   - **Read & write** — the agent can push to the repo.

On AgentConnect OSS, the deployment operator must [configure the GitHub App first](/docs/deployment-and-configuration#optional-github-app). Public repositories can still be cloned read-only without the App.

### Credential-free git

With an app-installed repository the daemon never stores a git credential. Each git or `gh` operation gets a **short-lived, single-repo token minted on demand** through the AgentConnect GitHub app — scoped to exactly that repository and the access tier you chose. Tokens never touch disk, and revoking is instant (uninstall the app or drop the grant).

## The Workspace tab

The agent page's **Workspace** tab is a live view into the working tree on the daemon — no upload involved:

- the repo card with current branch and a **Pull latest** button (github mode) and **View on GitHub**;
- a file tree with change badges and file preview;
- a summary like *"128 items · 3 changed"*.

If the daemon is offline the tab can't load — the files exist only there.

## Additional authorized repositories

Sometimes one repo isn't enough — a reviewer agent may need to read a shared library, or comment on a sibling repo. On the agent's **Configuration** tab, the Workspace card lists **Additional authorized repos**:

- **Authorize repository** adds a grant with a tier: **read** (clone/fetch), **comment** (read + issue/PR comments), or **write** (push).
- Grants are per-agent and revocable with one click.
- The same on-demand token minting applies — the agent's credentials stop at exactly the repos you listed.

By default an agent's GitHub credentials stop at its own workspace repository.
