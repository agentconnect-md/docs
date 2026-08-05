---
title: 🚀 Get started
excerpt: Connect a daemon, set up your built-in agent, and bring your team into the tools where work already happens.
hidden: false
---

AgentConnect opens a guided setup when you enter a new organization. Connecting a daemon is the only required step; the rest stays in a **Getting started** checklist that follows you into the console.

## Before you start

You need:

- A machine for your agents — macOS, Linux, or WSL with **Node.js 24.12+**.
- At least one AI agent runtime installed and authenticated on that machine, such as [Claude Code](https://docs.anthropic.com/en/docs/claude-code), Codex, Gemini CLI, or another ACP-compatible runtime.
- Access to AgentConnect Cloud or an [AgentConnect OSS](/docs/oss-get-started) deployment.

## 1. Sign in

Open [AgentConnect Cloud](https://app.agentconnect.md), or the Web URL for your self-hosted deployment.

Cloud supports GitHub, Google, and Slack sign-in. A self-hosted deployment can choose its own providers through Logto. The default local OSS stack runs without authentication and opens the console directly.

![The AgentConnect sign-in page](https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/login.png)

## 2. Connect your daemon

A daemon runs agents in the environment you operate. It detects the runtimes installed on that machine, keeps workspaces and credentials there, and connects outward to AgentConnect.

The onboarding page creates a one-time connection command for you. Copy the exact command, run it on the target machine, and leave it running. The page waits for that daemon and continues automatically when it comes online.

![Connect your daemon — the screenshot uses example values in place of a real URL, key, and daemon ID](https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/add-daemon.png)

The foreground command is best for a first run. To keep the daemon running after logout or restart, see [Install the daemon](/docs/install-the-daemon).

## 3. Set up the built-in agent

Every new organization includes a built-in **AgentConnect** agent. Once the daemon is online:

1. Choose one of the runtimes detected on that daemon.
2. Pick a model when the runtime offers model selection.
3. Select **Save and continue**.

The daemon is already selected. You can skip this step and return to it from the checklist or the agent's settings.

## 4. Finish the team setup

After the daemon connects, onboarding reveals the same **Getting started** checklist used by the console. It helps you:

- connect the built-in agent to Slack;
- connect GitHub and assign a repository;
- link your GitHub profile when your sign-in method does not already provide it;
- start a conversation; and
- invite teammates when authentication is enabled.

The checklist reflects the current organization state, so work completed elsewhere is checked automatically.

![The completed Getting started checklist with the built-in AgentConnect agent expanded](https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/onboarding-checklist.png)

## 5. Start working

Use **Start your first conversation** to open Home, or start from Slack, GitHub, or another connected platform. Choose the agent or agents for the job and send a prompt. The resulting work appears under **Sessions**, subject to its visibility and your permissions.

## If you skipped onboarding

Open **Getting started** from the console to resume the same checklist. You can also use **Daemons → Add daemon** and the built-in AgentConnect agent's settings to complete the first two steps manually.

## What's next

- [Connect platforms](/docs/integrations-overview) — link agents to Slack, Telegram, Discord, Lark / Feishu, GitHub, and other triggers.
- [Create agents](/docs/create-an-agent) — add specialists with different roles, runtimes, models, and workspaces.
- [Permissions](/docs/permissions-overview) — control agent, session, repository, and agent-to-agent access.
- [How it works](/docs/how-it-works) — understand the daemon, optional Relay, and Control Plane.
- [AgentConnect OSS](/docs/oss-get-started) — run the open-source stack with Docker Compose.
