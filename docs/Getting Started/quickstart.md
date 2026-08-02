---
title: 🚀 Quickstart
excerpt: Sign in, connect a machine, create an agent and have your first conversation — in about ten minutes.
hidden: false
---

By the end of this guide you'll have an agent running on your own machine that you can talk to from the browser, ready to be wired into Slack, Telegram, Discord, Lark / Feishu, or GitHub.

## Before you start

You need:

- A machine to run agents on — your laptop is fine. **macOS or Linux with Node.js 24+** installed.
- An AI coding agent installed and authenticated on that machine — e.g. [Claude Code](https://docs.anthropic.com/en/docs/claude-code) (`claude`) or OpenAI Codex CLI (`codex`). AgentConnect drives the tools you already have; it doesn't ship API keys of its own.

## 1. Sign in

Open your AgentConnect console. If your organization already has Cloud access, use [app.agentconnect.md](https://app.agentconnect.md). For [AgentConnect OSS](/docs/oss-get-started), use the Web URL from your deployment.

When social sign-in is configured, continue with one of the deployment's enabled providers: **GitHub**, **Google**, **Slack**, **Lark**, or **Feishu**. There is no AgentConnect password. An ordinary first sign-in creates your profile and personal organization; an admission-gated deployment creates the organization when your account is activated. The default local OSS stack uses no-auth mode and opens the console directly.

![The AgentConnect sign-in page](https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/login.png)

## 2. Connect a daemon

A **daemon** is the AgentConnect process that runs on your machine. It hosts your agents, owns direct platform connections, and dials out to the Control Plane and optional Relay. Nothing needs to open an inbound connection to your machine.

1. In the console, open **Daemons** and click **Add daemon**.
2. Copy the command it shows and run it in a terminal on your machine:

```bash
npx -y @agentconnect.md/cli run --api-url <your-control-plane-ws-url> --api-key <your-one-time-key>
```

> 🔑 The key is minted for this daemon and **shown only once** — always copy the exact command from the console.

3. Leave the modal open. Within a few seconds it flips to **Daemon connected** and the daemon appears in the list, along with the agent runtimes it detected on your machine.

![Add daemon — the console shows the exact command to run and waits for the daemon to connect](https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/add-daemon.png)

The command above runs the daemon in the foreground, which is perfect for a first try. To keep it running permanently, install it as a system service — see [Install the daemon](/docs/install-the-daemon).

## 3. Create an agent

1. Open **Agents** and click **Add agent**.
2. Give it a name (e.g. `reviewer`), pick your daemon, and choose a **runtime** — the pickers only offer what your daemon actually detected (Claude Code, Codex, …) and the models each runtime reports.
3. Choose a **workspace**:
   - **From scratch** — a fresh, empty working directory on your machine.
   - **From GitHub** — clone a repository and run the agent from a branch. (Needs the GitHub app; you can start from scratch and set up GitHub later.)
4. Click **Create**.

## 4. Talk to it

Open your new agent and click **Playground**. This opens a live conversation with the agent running on your machine — ask it something:

> List the files in your workspace and tell me what kind of project this is.

Your first message creates a private session, which then appears under **Sessions** and can be reopened later. You'll see replies, reasoning and tool calls stream in, and you can switch model, reasoning effort or permission mode mid-conversation from the bar above the composer.

![A live Playground session](https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/playground.png)

## 5. Put it in a channel

The Playground is for trying things out — the point of AgentConnect is meeting your team where it chats:

- [Connect Slack](/docs/slack) — start with Cloud's built-in Add to Slack app, or use a custom identity.
- [Connect Telegram](/docs/telegram) — one token from @BotFather, with automatic privacy-status checks.
- [Connect Discord](/docs/discord) — paste a bot token; AgentConnect builds the invite and enables Message Content Intent.
- [Connect Lark / Feishu](/docs/lark-feishu) — one-click setup with a direct long connection or Relay-backed HTTP events.
- [Watch GitHub repos](/docs/github) — trigger the agent from issues, PRs and comments.
- [Add a webhook](/docs/webhooks) — trigger it from anything that can POST.

## What's next

- [How it works](/docs/how-it-works) — understand the daemon, optional Relay, and Control Plane.
- [Permissions](/docs/permissions-overview) — set roles, visibility, private sessions, and agent call policies.
- [Sandboxing](/docs/sandboxing) — confine agent runtimes on supported Linux daemons.
- [Sessions](/docs/sessions) — replay everything your agents did.
- [Schedules](/docs/schedules) — run agents on a timer.
- [MCP connector](/docs/mcp-connector) — add AgentConnect to Claude and ask about your agents, sessions and spend.
