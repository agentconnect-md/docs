---
title: 📁 Workspaces & repositories
excerpt: Scratch and GitHub workspaces, isolated session worktrees, and repository access.
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
3. Back in the dialog, pick the **repository** and **branch**, set the **Working subdirectory** if the agent should live in a subfolder, and choose **push access**:
   - **Read only** — the agent can pull but not push.
   - **Read & write** — the agent can push to the repo.

On AgentConnect OSS, the deployment operator must [configure the GitHub App first](/docs/deployment-and-configuration#optional-github-app). Public repositories can still be cloned read-only without the App.

### Worktrees for concurrent sessions

New GitHub agents enable **Worktree** by default. Each session receives its own stable checkout, so concurrent sessions do not share branch or file state. Later turns in the same session return to that worktree. Turn Worktree off when every session should deliberately use the primary checkout instead.

The **Workspace** tab can switch between the primary checkout and worktrees belonging to sessions you are allowed to read. Session worktrees are browse-only in the console and follow the daemon's [session retention policy](/docs/sessions#retention-and-cleanup).

### Credential-free git

With an app-installed repository the daemon never stores a git credential. Each git or `gh` operation gets a **short-lived, single-repo token minted on demand** through the AgentConnect GitHub app — scoped to exactly that repository and the access tier you chose. Tokens never touch disk.

Uninstalling the GitHub App invalidates its installation access. Removing one AgentConnect repository grant stops new tokens from being issued, while a token already issued for that grant can remain valid until its one-hour expiry.

## The Workspace tab

The agent's **Workspace** tab reads files directly from its daemon. Authorized users can inspect the primary workspace and visible session worktrees, edit files in a scratch workspace, or pull updates for a primary GitHub workspace. The view is unavailable while that daemon is offline because the files exist only on that machine.

## Change the workspace source

Use the edit control on the Workspace card (its tooltip reads **Edit workspace**) to switch between Scratch and GitHub, select another repository or branch, change the working directory, or change read/write access.

Changing the source type, repository, or branch **replaces all daemon-local workspace files**. Commit, push, copy or otherwise back up anything you need before confirming. A GitHub target is cloned before the old workspace is replaced; if cloning or authorization fails, the existing workspace is left intact.

Changing only the working directory or access level preserves the checkout. Every workspace edit still drains active work, restarts the agent against the resulting directory, and clears cached repository credentials. An enabled GitHub review or Check can block a change that removes the write access it requires.

## Additional authorized repositories

Sometimes one repo isn't enough — a reviewer agent may need to read a shared library or work in a sibling repo. On the agent's **Workspace** tab, the Workspace card lists **Authorized repos**:

- **Authorize repository** adds either **Read only** access or **Read & write** access.
- Grants are per-agent and revocable with one click.
- The same on-demand token minting applies — the agent's credentials stop at exactly the repos you listed.

By default an agent's GitHub credentials stop at its own workspace repository.
