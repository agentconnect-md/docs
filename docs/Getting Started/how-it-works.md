---
title: 🧭 How it works
excerpt: Agent execution stays on the daemons you operate while the Control Plane coordinates the fleet.
hidden: false
---

AgentConnect is built around one architectural rule: **the Control Plane is not on the live message path.** Agent execution happens inside a daemon in the environment you operate. Platform ingress reaches that daemon directly or through the optional Relay.

<p align="center">
  <img src="https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/how-agentconnect-works.svg" alt="AgentConnect channels and events reach agents running on a daemon, while the Control Plane coordinates over a separate control path" width="920" />
</p>

## The four pieces

**The daemon** is a small process you run on a laptop, workstation, VM, or other machine. It:

- opens outbound connections to the Control Plane, the Relay when used, and direct chat transports such as Slack Socket Mode, Telegram, Discord, and Lark / Feishu Long Connection;
- launches and drives installed agent runtimes such as Claude Code and Codex over [ACP](https://agentclientprotocol.com);
- owns the agents' working directories, git checkouts and transcripts.

**The Relay** is optional public ingress. It terminates callback-based Slack and Lark / Feishu traffic, GitHub and generic webhooks, and webchat (the browser transport behind the [Playground](/docs/playground)), then forwards the request to the owning daemon. It does not durably store message content.

**The Control Plane** manages authentication, organizations, permissions, placement, integrations, schedules, and control metadata. It also stores explicitly approved [Knowledge and managed skills](/docs/knowledge) and coordinates the daemon fleet.

**The console** is the configuration and observation surface. When you open a transcript, tool result, memory view, or workspace file, it reads that content from the owning daemon without persisting the body in the Control Plane.

## What lives where

| Data | Stored by |
| --- | --- |
| Live messages and agent activity | Daemon; Relay forwards callbacks |
| Transcripts and tool results | Owning daemon |
| Workspaces and git checkouts | Owning daemon |
| Runtime credentials | Daemon machine |
| Bot tokens and tenant secrets | Control Plane secret store |
| Control metadata | Control Plane |
| Approved Knowledge and skills | Control Plane |

Authorized transcript, tool-result, memory, and workspace reads come from the owning daemon on demand. The Control Plane does not persist those responses. Secret protection at rest depends on the deployment's secret-storage configuration.

## Built to degrade gracefully

Because the daemon owns execution and local session state, established sessions and local schedules can continue during a temporary Control Plane outage. New assignments, configuration changes, and console reads resume after reconnection.

If a daemon is offline, its agents are offline. The Control Plane can still show stored session metadata, but transcripts and workspace content owned by that daemon cannot be fetched until it returns.

## Organizations and access

Everything belongs to an organization. Membership and role establish the outer boundary, then AgentConnect evaluates the target resource: Team visibility protects resources such as Agents, while each Session has an independent audience for its metadata and transcript. Agent-to-agent calls use separate inbound and outbound policies. Start with the [Permissions overview](/docs/permissions-overview).

A person can [link several sign-in methods](/docs/linked-accounts) to one profile when those providers are available. AgentConnect Cloud currently offers GitHub, Google, and Slack. Self-hosted deployments can also add Lark and Feishu as sign-in methods. Their linked identities can then take part in the matching session access checks.

## Hosting choices

The same architecture supports [AgentConnect OSS](/docs/oss-get-started), where you operate the full stack, and AgentConnect Cloud, where the management console is hosted. In both cases, daemons run the agents and workspaces — on machines you connect, or on [managed Cloud infrastructure](/docs/manage-daemons#agentconnect-cloud) when you place an agent there.

AgentConnect OSS keeps authentication optional and uses local no-auth mode by default. Before exposing it beyond localhost, configure [production sign-in with Logto](/docs/logto-authentication).
