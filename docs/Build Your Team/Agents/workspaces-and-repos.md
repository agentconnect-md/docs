---
title: 📁 Workspaces & repositories
excerpt: Scratch vs GitHub workspaces, the GitHub app, credential-free git, and granting an agent extra repositories.
hidden: false
---

Every agent has a **workspace** — its working directory on the daemon. Choose its source when creating the agent, or change it later from the **Workspace** tab.

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

- an editable workspace card with the source, current branch, access level, a **Pull latest** button (GitHub mode), and **View on GitHub**;
- a file tree with change badges and file preview;
- a summary like *"128 items · 3 changed"*.

If the daemon is offline the tab can't load — the files exist only there.

## Change the workspace source

Use **Edit workspace** on the Workspace card to switch between Scratch and GitHub, select another repository or branch, change the working directory, or change read/write access.

Changing the source type, repository, or branch **replaces all daemon-local workspace files**. Commit, push, copy or otherwise back up anything you need before confirming. A GitHub target is cloned before the old workspace is replaced; if cloning or authorization fails, the existing workspace is left intact.

Changing only the working directory or access level preserves the checkout. Every workspace edit still drains active work, restarts the agent against the resulting directory, and clears cached repository credentials. An enabled GitHub review or Check can block a change that removes the write access it requires.

## Additional authorized repositories

Sometimes one repo isn't enough — a reviewer agent may need to read a shared library, or comment on a sibling repo. On the agent's **Workspace** tab, the Workspace card lists **Authorized repos**:

- **Authorize repository** adds a grant with a tier: **read** (clone/fetch), **comment** (read + issue/PR comments), or **write** (push).
- Grants are per-agent and revocable with one click.
- The same on-demand token minting applies — the agent's credentials stop at exactly the repos you listed.

By default an agent's GitHub credentials stop at its own workspace repository.
