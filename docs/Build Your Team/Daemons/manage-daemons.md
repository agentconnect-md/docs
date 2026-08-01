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
| **Online** | Connected; agents are reachable |
| **Offline** | Disconnected; agents are unavailable |

Transcripts owned by an offline daemon cannot be fetched until it reconnects.

A daemon that never finished onboarding remains unconnected while the Add daemon flow waits for its first connection.

An Owner-triggered restart or upgrade appears as a temporary **Restarting** or **Upgrading** operation. AgentConnect considers it successful only after the daemon re-registers; a timeout or failed health check is reported as failed rather than being inferred from a lost connection.

## Daemon detail

Click a daemon to open it:

- **Runtimes** — what the daemon detected on the machine: each runtime (Claude Code, Codex, …) with its version, the models it reports, its MCP servers, and how many of your agents use it. This card is the ground truth for what the agent-creation pickers offer.
- **Resources** — live CPU and memory.
- **Agents** — the agents hosted here, with model and status.
- **Capabilities** — what the daemon reported on register: ACP support, platform adapters (Slack, Telegram, Discord, Lark / Feishu), and features such as the Linux **sandbox** capability or the daemon-wide **sandbox-required** policy.
- **Details** — version, last seen, created/modified, and [visibility](/docs/visibility-and-sharing).

## Actions

- **Rename** — daemons get a generated name on first connect; double-click the name (or use the ⋯ menu) to give it a human one. Names like `build-box` or `dev-laptop` pay off once you have several.
- **Restart** (online daemons, Owners) — drains work and asks the service supervisor to relaunch the same version.
- **Upgrade** (online daemons, Owners) — installs a selected release, drains and relaunches, then health-checks the result. A failed upgrade rolls back when possible.
- **Reconnect** (offline daemons) — mints a fresh one-time token and shows a command to run on that host. Its identity and agent placements are preserved.
- **Delete** (offline daemons) — removes the daemon, revokes its keys and automatically leaves its agents unplaced. The local process and files remain on the machine until you stop or remove them there.

## Placement

Every placed agent runs on one daemon — that machine owns its workspace, runtime processes and transcripts. You can move an agent from its **Configuration** tab when both daemons are online, ready and compatible with its runtime, model and MCP servers.

A move cold-reprovisions the saved agent definition; it does not migrate daemon-local workspace, memory or transcript bytes. Commit or back up local work first, and expect GitHub workspaces to be cloned again on the target.

## Troubleshooting

- **Stuck “Waiting for daemon…” in Add daemon** — the command probably failed in your terminal. Check that Node is ≥ 24 (`node -v`) and that the machine can reach your control-plane URL over HTTPS/WSS.
- **Daemon shows offline but the process is running** — check the log (`npx -y @agentconnect.md/cli status` prints its path, default `~/.agentconnect/logs/daemon.log`). Repeated `connect/handshake failed` usually means the key was revoked — use **Reconnect** for that daemon, or onboard a new one if it was deleted.
- **Runtime missing from the pickers** — the runtime isn't installed (or not on `PATH`) on that machine. Install it, then restart the daemon; it re-probes on start.
- **Run in sandbox is unavailable** — the selected daemon did not pass the live Linux sandbox probe. Check its OS, `bubblewrap` / `ripgrep` / `socat` dependencies, user-namespace policy and logs, then restart it. See [Sandboxing](/docs/sandboxing).
