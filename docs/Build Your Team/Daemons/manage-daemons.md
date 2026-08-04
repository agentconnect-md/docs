---
title: 🛠️ Manage daemons
excerpt: Monitor daemon health, maintain services, and move agents safely between machines.
hidden: false
---

**Daemons** lists the machines connected to your organization. Open one to inspect its health, available runtimes, resources, hosted agents, capabilities, and visibility.

![The Daemons list](https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/daemons.png)

## Status

| Status | Meaning |
| --- | --- |
| **Online** | Connected; agents are reachable |
| **Offline** | Disconnected; agents are unavailable |

Transcripts owned by an offline daemon cannot be fetched until it reconnects.

An Owner-triggered restart or upgrade appears as a temporary **Restarting** or **Upgrading** operation. AgentConnect considers it successful only after the daemon re-registers; a timeout or failed health check is reported as failed rather than being inferred from a lost connection.

## Actions

- **Restart** (online daemons, Owners) — drains work and asks the service supervisor to relaunch the same version.
- **Upgrade** (online daemons, Owners) — installs a selected release, drains and relaunches, then health-checks the result. A failed upgrade rolls back when possible.
- **Reconnect** (offline daemons) — mints a fresh one-time token and shows a command to run on that host. Its identity and agent placements are preserved.
- **Delete** (offline daemons) — removes the daemon, revokes its keys and automatically leaves its agents unplaced. The local process and files remain on the machine until you stop or remove them there.

## Placement

Every placed agent runs on one daemon — that machine owns its workspace, runtime processes and transcripts. You can move an agent from its **Configuration** tab when both daemons are online, ready and compatible with its runtime, model and MCP servers.

A move cold-reprovisions the saved agent definition; it does not migrate daemon-local workspace, memory or transcript bytes. Commit or back up local work first, and expect GitHub workspaces to be cloned again on the target.

## Session retention

Each daemon has an **Expire sessions** setting: 7 days by default, 30 days, 90 days, or Never. It controls how long that daemon keeps finished transcripts and session worktrees. The Control Plane keeps the session metadata after the content expires. See [Session retention and cleanup](/docs/sessions#retention-and-cleanup) for the cleanup safeguards and what remains visible.

## Troubleshooting

- **Stuck “Waiting for daemon…” in Add daemon** — the command probably failed in your terminal. Check that Node is ≥ 24.12 (`node -v`) and that the machine can reach your control-plane URL over HTTPS/WSS.
- **Daemon shows offline but the process is running** — check the log (`npx -y @agentconnect.md/cli status` prints its path, default `~/.agentconnect/logs/daemon.log`). Repeated `connect/handshake failed` usually means the key was revoked — use **Reconnect** for that daemon, or onboard a new one if it was deleted.
- **Runtime missing from the pickers** — make sure the runtime is installed, authenticated, and on `PATH` for the OS user that owns the daemon service. Restart the daemon, then check its log if the runtime is still missing.
- **Run in sandbox is unavailable** — the selected daemon did not pass the live Linux sandbox probe. Check its OS, `bubblewrap` / `ripgrep` / `socat` dependencies, user-namespace policy and logs, then restart it. See [Sandboxing](/docs/sandboxing).
