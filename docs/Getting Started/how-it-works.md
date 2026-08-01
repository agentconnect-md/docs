---
title: 🧭 How it works
excerpt: Daemon-centric architecture keeps execution at the edge while the Control Plane coordinates the fleet.
hidden: false
---

AgentConnect is built around one architectural rule: **the Control Plane is not on the live message path.** Agent execution happens inside a daemon in the environment you operate. Platform ingress reaches that daemon directly or through the optional Relay.

## The four pieces

```
 Direct platform connections                 Callback-based ingress
 Slack Socket Mode / Telegram / Discord      Slack HTTP / GitHub / webhooks / webchat
                 │                                         │
                 ▼                                         ▼
 ┌─────────────────────────────┐              ┌────────────────────────┐
 │   Daemon                    │ ◄────────────│   Relay (optional)     │
 │   · agent runtimes over ACP │              │   · verify callbacks   │
 │   · workspaces and git      │              │   · forward to daemon  │
 │   · sessions and routing    │              └────────────────────────┘
 └─────────────────────────────┘
                 ⇅ WebSocket: registry, config, telemetry,
                   and bounded authorized read requests
 ┌─────────────────────────────┐              ┌────────────────────────┐
 │   Control Plane             │ ◄───────────►│   Console / REST API   │
 │   · auth and permissions    │     BFF      │                        │
 │   · registry and placement  │              └────────────────────────┘
 │   · control metadata        │
 └─────────────────────────────┘
```

**The daemon** is a small process you run on a laptop, workstation, VM, or other machine. It:

- opens outbound connections to the Control Plane, the Relay when used, and direct chat transports such as Slack Socket Mode, Telegram, and Discord;
- launches and drives installed agent runtimes such as Claude Code and Codex over [ACP](https://agentclientprotocol.com);
- owns the agents' working directories, git checkouts and transcripts.

**The Relay** is optional public ingress. It terminates callback-based Slack and Lark traffic, GitHub and generic webhooks, and webchat, then forwards the request to the owning daemon. It does not durably store message content.

**The Control Plane** manages authentication, organizations, permissions, registry, placement, integrations, schedules, and control metadata. It also stores explicitly approved [Knowledge and managed-skill revisions](/docs/knowledge). Its daemon WebSocket is used primarily for registration, heartbeats, configuration, orchestration commands, and telemetry. It also carries scoped request and response frames for authorized, on-demand console reads.

**The console** is the configuration and observation surface. When you open a transcript, tool body, memory view, or workspace file, the BFF requests a bounded live read from the owning daemon. The Control Plane proxies that response without persisting the body.

## What lives where

| Data                                   | Where it lives                                                                                                                                       |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Live platform messages and ACP updates | The daemon and, for callback ingress, the Relay data path. They are not persisted by the Control Plane.                                              |
| Session transcripts and tool bodies    | The owning daemon. Authorized console reads are proxied on demand and are not persisted by the Control Plane.                                        |
| Agent workspaces and git checkouts     | The owning daemon. Workspace browser reads are bounded and on demand.                                                                                |
| Runtime credentials                    | The daemon uses the runtime login or credentials already available on that machine; the Control Plane does not store them.                           |
| Platform bot tokens and tenant secrets | The Control Plane secret store, then only the component that needs them. At-rest protection depends on the deployment's secret-cipher configuration. |
| Control metadata                       | The Control Plane stores organizations, agents, daemons, permissions, configuration, session metadata, and usage totals.                             |
| Approved Knowledge and skills           | The Control Plane stores immutable, owner-approved Knowledge and managed-skill revisions. Pending Dream proposal bodies remain on their source daemon. |

## Built to degrade gracefully

Because the daemon owns execution and local session state, established sessions and daemon-local schedules can continue during a temporary Control Plane outage. Direct platform connections continue, and Relay-backed routes use their last applied routing state. New assignments, configuration changes, and console reads resume after reconnection.

If a daemon is offline, its agents are offline. The Control Plane can still show stored session metadata, but transcripts and workspace content owned by that daemon cannot be fetched until it returns.

## Organizations and access

Everything belongs to an organization. Human access composes membership, role, resource visibility, and session visibility. Agent-to-agent calls use independent inbound and outbound policies. Start with the [Permissions overview](/docs/permissions-overview).

With Logto-backed sign-in enabled, the console can offer GitHub, Google, and Slack sign-in, according to the deployment's configured provider list. A person may [link several sign-in methods](/docs/social-account-linking) to one profile. AgentConnect OSS leaves OIDC unset by default and runs in local no-auth mode, which must not be exposed publicly.

## Hosting choices

The same architecture supports [AgentConnect OSS](/docs/get-started), where you operate the full stack, and AgentConnect Cloud, where the management console is hosted. In both cases, daemons run the agents and workspaces in the environment you operate.
