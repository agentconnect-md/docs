---
title: 🛠️ Manage daemons
excerpt: What the Daemons pages tell you — status, detected runtimes, resources — and the actions you can take.
hidden: false
---

**Daemons** in the console lists every machine connected to your organization. Each card shows the daemon's name, version, status, live CPU and memory utilization, how many agents it hosts, and when it was last seen.

![The Daemons list](https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/daemons.png)

## Status

| Status | Meaning |
| --- | --- |
| **Online** | Connected and heartbeating. Its agents are reachable. |
| **Offline** | Not connected. Every agent on it shows as offline too, and transcripts it owns can't be fetched until it returns. |
| **Paused** | Registered but not taking new work. |

A daemon that never finished onboarding (key minted, command never run) shows as pending until it first connects.

## Daemon detail

Click a daemon to open it:

- **Runtimes** — what the daemon detected on the machine: each runtime (Claude Code, Codex, …) with its version, the models it reports, its MCP servers, and how many of your agents use it. This card is the ground truth for what the agent-creation pickers offer.
- **Resources** — live CPU and memory.
- **Agents** — the agents hosted here, with model and status.
- **Capabilities** — what the daemon reported on register: ACP support, platform adapters (Slack/Telegram/Discord), features.
- **Details** — version, last seen, created/modified, and [visibility](/docs/visibility-and-sharing).

## Actions

- **Rename** — daemons get a generated name on first connect; double-click the name (or use the ⋯ menu) to give it a human one. Names like `build-box` or `dev-laptop` pay off once you have several.
- **Reconnect** (offline daemons) — asks the daemon to re-establish its connection the next time it checks in.
- **Delete** (offline daemons) — removes the daemon from the org. Agents pinned to it must be moved or deleted first; the machine itself just stops being authorized (its key is revoked).

## Placement

Every agent is **pinned to one daemon** — that machine owns its workspace, its runtime processes and its transcripts. You pick the daemon when creating the agent. To move an agent to a different machine, recreate it there (workspaces are machine-local by design).

## Troubleshooting

- **Stuck “Waiting for daemon…” in Add daemon** — the command probably failed in your terminal. Check that Node is ≥ 24 (`node -v`) and that the machine can reach `api.agentconnect.md` over HTTPS/WSS.
- **Daemon shows offline but the process is running** — check the log (`agentconnect status` prints its path, default `~/.agentconnect/logs/daemon.log`). Repeated `connect/handshake failed` usually means the key was revoked (deleted daemon) — re-onboard with a fresh **Add daemon**.
- **Runtime missing from the pickers** — the runtime isn't installed (or not on `PATH`) on that machine. Install it, then restart the daemon; it re-probes on start.
