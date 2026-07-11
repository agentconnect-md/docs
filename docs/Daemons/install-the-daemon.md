---
title: Install the daemon
excerpt: Put the AgentConnect daemon on any machine — one command to try it, one more to make it permanent.
hidden: false
---

The daemon is the machine-side half of AgentConnect: it hosts your agents, drives their runtimes over ACP, and holds every platform connection. This page covers getting it onto a machine and keeping it there.

## Requirements

- **macOS or Linux** (launchd and systemd are supported for background service mode).
- **Node.js 24 or newer** — the daemon is published to npm as [`@agentconnect.md/daemon`](https://www.npmjs.com/package/@agentconnect.md/daemon).
- At least one agent runtime installed and authenticated on the machine — e.g. Claude Code (`claude`) or Codex (`codex`). The daemon **detects runtimes automatically** (from the machine's installed launchers, via the [ACP registry](https://agentclientprotocol.com)) and reports what it finds — runtimes, versions, models — to the console.
- **Outbound network only.** The daemon dials out to the control plane (`wss://api.agentconnect.md`) and to the chat platforms. It never listens on a public port, so it runs fine on a laptop behind NAT.

## Connect a machine

In the console, open **Daemons → Add daemon**. The modal mints a one-time key and shows the exact command to run on the target machine:

```bash
npx -y @agentconnect.md/daemon run --cp-url wss://api.agentconnect.md/daemon/ws --cp-key <one-time-key>
```

Copy it from the console (the key is **shown only once**), run it, and watch the modal flip to **Daemon connected**. That's it — the daemon saves its credentials on first connect, registers, and starts heartbeating.

![Add daemon — copy the one-command install, the console waits for the daemon to appear](https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/add-daemon.png)

If you close the modal without ever connecting, use **Cancel** — it discards the unclaimed daemon and its key.

## Run it permanently

`agentconnect run` stays in the foreground — good for a first try, wrong for a machine that should serve your team. Install it as a system service instead:

```bash
# interactive onboarding: verifies the key, saves config,
# then offers to install + start the service
npx -y @agentconnect.md/daemon login --cp-url wss://api.agentconnect.md/daemon/ws --cp-key <one-time-key>
```

Or, if the daemon has connected once already (credentials are saved):

```bash
npx -y @agentconnect.md/daemon install-service   # register launchd / systemd service
npx -y @agentconnect.md/daemon up                # start it
```

Manage it with:

| Command | What it does |
| --- | --- |
| `agentconnect status` | Show service state, PID and the log file path |
| `agentconnect up` / `down` / `restart` | Start / stop / restart the background service |
| `agentconnect uninstall-service` | Stop and remove the service |
| `agentconnect run` | Run in the foreground (ignores the service) |

## What lands on disk

Everything the daemon owns lives under one root, `~/.agentconnect` by default:

```
~/.agentconnect/
├── config.json          # control-plane URL + key, daemon identity
├── agents/              # one directory per agent: config + workspace
├── state/local.sqlite   # local state (sessions, queues)
├── logs/daemon.log      # daemon log
└── run/                 # runtime sockets
```

Useful global flags (they work on every subcommand and override `config.json`):

| Flag | Meaning |
| --- | --- |
| `--root <dir>` | Use a different root than `~/.agentconnect` (env: `AGENTCONNECT_ROOT`) |
| `--cp-url <url>` / `--cp-key <key>` | Control-plane endpoint and API key |
| `--agents-dir <dir>` | Override where agent directories live |
| `--max-agents <n>` | Cap how many agents this daemon will host |
| `--log-level <level>` | `trace` `debug` `info` `warn` `error` |
| `--no-cp` | Run fully local without a control plane (advanced) |
| `--dry-run` | Validate config, print the reconcile plan, exit |

One daemon per root: a lock file prevents a second copy from starting against the same root (two daemons sharing one Slack connection would silently split events).

## Good to know

- **Updates:** `npx` with `-y` fetches the current release each cold start. If you pinned a version, rerun the install command to move.
- **Offline control plane ≠ dead agents.** Established sessions and platform connections keep working while the control plane is unreachable; the daemon reconnects with backoff and re-registers.
- **Multiple machines:** add as many daemons as you like — a beefy workstation for heavy agents, a laptop for experiments. Each agent is pinned to one daemon; see [Manage daemons](/docs/manage-daemons).
