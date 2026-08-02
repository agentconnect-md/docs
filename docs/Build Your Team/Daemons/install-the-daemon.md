---
title: 📥 Install the daemon
excerpt: Put the AgentConnect daemon on any machine — one command to try it, one more to make it permanent.
hidden: false
---

The daemon is the machine-side half of AgentConnect: it hosts your agents, drives their runtimes over ACP, and holds every platform connection. This page covers getting it onto a machine and keeping it there.

## Requirements

- **macOS or Linux** (launchd and systemd are supported for background service mode).
- **Node.js 24 or newer** — use [`@agentconnect.md/cli`](https://www.npmjs.com/package/@agentconnect.md/cli), the stable entry point that installs, launches and upgrades the daemon for you.
- At least one agent runtime installed and authenticated on the machine — e.g. Claude Code (`claude`) or Codex (`codex`). The daemon **detects runtimes automatically** (from the machine's installed launchers, via the [ACP registry](https://agentclientprotocol.com)) and reports what it finds — runtimes, versions, models — to the console.
- **Outbound network only.** The daemon dials out to your configured Control Plane and to the chat platforms. It never listens on a public port, so it runs fine on a laptop behind NAT.
- **Optional Linux sandboxing** requires `bubblewrap`, `ripgrep`, `socat`, and unprivileged user namespaces. The daemon runs a live capability probe at startup; macOS currently runs agents without this OS sandbox. See [Sandboxing](/docs/sandboxing).

## Connect a machine

In the console, open **Daemons → Add daemon**. The modal mints a one-time key and shows the exact command to run on the target machine:

```bash
npx -y @agentconnect.md/cli run --api-url <your-control-plane-ws-url> --api-key <one-time-key>
```

Copy it from the console (the key is **shown only once**), run it, and watch the modal flip to **Daemon connected**. The **Run** command starts the daemon in the foreground using the supplied credentials. The CLI downloads the appropriate daemon release on first use, then registers it and starts heartbeating.

![Add daemon — copy the one-command install, the console waits for the daemon to appear](https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/add-daemon.png)

If you close the modal without ever connecting, use **Cancel** — it discards the unclaimed daemon and its key.

## Run it permanently

`agentconnect run` stays in the foreground — good for a first try, wrong for a machine that should serve your team. Switch the Add daemon modal to **Install as service** and copy its `login` command instead:

```bash
# Verifies the key and saves it, then offers to install and start the service.
npx -y @agentconnect.md/cli login --api-url <your-control-plane-ws-url> --api-key <one-time-key>
```

If you have already authenticated with `login`, you can install and start the service separately:

```bash
npx -y @agentconnect.md/cli install-service   # register launchd / systemd service
npx -y @agentconnect.md/cli up                # start it
```

Install and authenticate agent runtimes as the OS user who owns the service, then restart the daemon after changing that user's runtime installation or `PATH`.

Manage it with:

| Command | What it does |
| --- | --- |
| `npx -y @agentconnect.md/cli status` | Show service state, PID and the log file path |
| `npx -y @agentconnect.md/cli up` / `down` / `restart` | Start / stop / restart the background service |
| `npx -y @agentconnect.md/cli uninstall-service` | Stop and remove the service |
| `npx -y @agentconnect.md/cli run` | Run in the foreground (ignores the service) |
| `npx -y @agentconnect.md/cli upgrade --restart` | Upgrade, restart, health-check and roll back on failure |

## What lands on disk

Everything the daemon owns lives under one root, `~/.agentconnect` by default:

```
~/.agentconnect/
├── config.json          # control-plane URL + key, daemon identity
├── agents/              # one directory per agent: config + workspace
├── state/local.sqlite   # local state (sessions, queues)
├── logs/daemon.log      # daemon log
├── run/                 # runtime sockets
├── versions/            # installed daemon releases
├── current              # active daemon release
└── versions.json        # release channel and upgrade history
```

Useful CLI and daemon-run flags:

| Flag | Meaning |
| --- | --- |
| `--root <dir>` | Change the root (`AGENTCONNECT_ROOT`) |
| `--config <path>` | Use another `config.json` |
| `--api-url <url>` / `--api-key <key>` | Set Control Plane credentials for `run` or `login` |
| `--agents-dir <dir>` | Change the agents directory |
| `--max-agents <n>` | Cap how many agents this daemon will host |
| `--log-level <level>` | `trace` `debug` `info` `warn` `error` |
| `--require-sandbox` | Fail startup unless every agent can be sandboxed |
| `--no-cp` | Run fully local without a control plane (advanced) |
| `--dry-run` | Validate config, print the reconcile plan, exit |

One daemon per root: a lock file prevents a second copy from starting against the same root (two daemons sharing one Slack connection would silently split events).

## Good to know

- **Updates:** the CLI keeps installed daemon releases under the daemon root. Run `npx -y @agentconnect.md/cli upgrade --restart`, or use **Upgrade** in the console, to switch releases with a health check and automatic rollback on failure.
- **Sandboxing:** a supported Linux daemon can confine selected agents, or require the boundary for every agent and fail closed. See [Sandboxing](/docs/sandboxing) before using it as a production guarantee.
- **Offline control plane ≠ dead agents.** Established sessions and platform connections keep working while the control plane is unreachable; the daemon reconnects with backoff and re-registers.
- **Multiple machines:** add as many daemons as you like — a beefy workstation for heavy agents, a laptop for experiments. You can later move an agent between compatible online daemons; see [Manage daemons](/docs/manage-daemons).
