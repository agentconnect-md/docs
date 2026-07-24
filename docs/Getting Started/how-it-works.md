---
title: 🧭 How it works
excerpt: Daemon-centric architecture — agents, credentials and conversations live on your machines; the control plane only orchestrates.
hidden: false
---

AgentConnect is built around one architectural rule: **the control plane is never on the message path.** Everything that touches your code or your conversations happens on machines you control.

## The three pieces

```
 Slack / Telegram / Discord / GitHub
              │  (bot connections opened outbound by your daemon)
              ▼
 ┌─────────────────────────────┐        control signaling only        ┌──────────────────┐
 │   Daemon (your machine)     │ ◄──────────── WebSocket ───────────► │  Control plane   │
 │   · platform connections    │      (register, heartbeat, config)   │  (AgentConnect   │
 │   · agent runtimes over ACP │                                      │   cloud)         │
 │   · workspaces & git        │                                      └──────────────────┘
 └─────────────────────────────┘                                               ▲
                                                                                │ REST
                                                                       Console / API
                                                                    app.agentconnect.md
```

**The daemon** is a small process you run on any machine — a laptop, a workstation, a VM. It:

- connects **outbound** to the chat platforms (Slack Socket Mode, Telegram, Discord) — no inbound ports, no public URL, works behind NAT;
- launches and drives the agent runtimes installed on that machine (Claude Code, Codex, …) over [ACP](https://agentclientprotocol.com), locally;
- owns the agents' working directories, git checkouts and transcripts.

**The control plane** is AgentConnect's cloud service. It keeps the registry (organizations, agents, daemons, integrations, schedules), routes configuration to daemons, and serves the console. The daemon talks to it over a single WebSocket that carries **control signaling only** — registration, heartbeats, orchestration commands, telemetry.

**The console** at [app.agentconnect.md](https://app.agentconnect.md) is where you configure and observe everything. When you open a session transcript, the console fetches it **live from the daemon that owns it** — it was never uploaded anywhere.

## What lives where

| Data | Where it lives |
| --- | --- |
| Message bodies, session transcripts | **Your machine.** Streamed to the console on demand; never stored by the control plane. |
| Agent workspaces (code, files) | **Your machine.** The console's workspace browser reads them live from the daemon. |
| AI credentials (Claude / Codex auth) | **Your machine.** AgentConnect never sees them — agents use the runtime login already on the box. |
| Platform bot tokens | Encrypted in the control plane, delivered to your daemon, used only from your daemon. |
| Control-plane metadata | AgentConnect cloud: org/agent/daemon registry, session *metadata* (title, status, token counts), usage totals. |

## Built to degrade gracefully

Because the daemon holds the platform connections and the agents, **established sessions keep working even if the control plane is unreachable**. Your Slack bot keeps answering; scheduled runs on that daemon keep firing. What you lose temporarily is orchestration — the console, config changes, new placements — until the daemon reconnects and re-registers.

The flip side: if your **daemon** is offline, its agents are offline. The console shows them as such, and transcripts owned by that daemon can't be fetched until it's back.

## Organizations and access

Everything you create belongs to an **organization**. Members hold one of three roles — **Owner**, **Collaborator** or **Viewer** — and individual agents, daemons and schedules can additionally be restricted to selected members. See [Members & roles](/docs/members-and-roles) and [Visibility & sharing](/docs/visibility-and-sharing).

Sign-in is single sign-on only (GitHub or Google) — AgentConnect never stores a password.
