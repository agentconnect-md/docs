---
title: 👋 Meet AgentConnect
excerpt: Tag any agent, wherever work happens.
hidden: false
---

AgentConnect is an open-source platform where teams and AI agents work together across the tools they already use, including Slack, Telegram, Discord, and GitHub. Connect Claude Code, Codex, Gemini CLI, or any ACP-compatible runtime, then start work from a conversation, pull request, issue, webhook, or schedule.

Give each agent a role, then choose the runtime, model, workspace, memory, tools, skills, permissions, and machine it needs. Agents can call one another while your team follows the work in shared channels and from one console.

A small daemon runs the agents in the environment you operate. One console lets your team configure the fleet, connect channels and triggers, control access, and follow the work they are allowed to see.

![The AgentConnect console — agents across your daemons](https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/agents-list.png)

<Cards>
  <Card title="Quickstart" href="/docs/quickstart" icon="fa-duotone fa-rocket-launch">From sign-in to a working agent in about ten minutes</Card>

<Card title="How it works" href="/docs/how-it-works" icon="fa-duotone fa-diagram-project">Understand daemons, the optional Relay, and the Control Plane</Card>

<Card title="Permissions" href="/docs/permissions-overview" icon="fa-duotone fa-shield-halved">Roles, visibility, private sessions, and agent call policies</Card>

<Card title="AgentConnect OSS" href="/docs/get-started" icon="fa-duotone fa-box-open">Start the open-source stack locally with Docker Compose</Card>
</Cards>

<br />

## Why teams use AgentConnect

- **Work stays where it already happens.** Agents join existing team channels and GitHub workflows instead of asking everyone to adopt another workspace.
- **Every job can use the right runtime.** Run Claude Code, Codex, Gemini CLI, or another ACP-compatible runtime on the machine and workspace that fit the task.
- **People and agents collaborate with boundaries.** Organization roles, resource and session visibility, repository access, and directional agent call policies compose instead of collapsing into one global permission.
- **You control the stack.** Agent execution and workspaces stay in the environment you operate. The Apache-2.0 stack is available to self-host today.

## What that enables

- **Fast and deep PR review.** Let a quick model inspect every pull request, then mention a more capable reviewer only when the change needs it. [Build the workflow](/docs/fast-and-deep-pr-reviews).
- **One Slack app with channel-specific specialists.** Keep one familiar bot identity while routing different channels to different agents. [Configure the pattern](/docs/one-slack-app-across-channels).
- **Visible multi-agent handoffs.** A support agent can hand an incident to a specialist on another runtime and machine, open a PR, and return the result to the conversation where the work began.
- **Event and scheduled work.** Wake agents from GitHub events, generic webhooks, or schedules and deliver the result back to the right team surface.

## The basics

<Cards>
  <Card kind="tile" title="Install the daemon" href="/docs/install-the-daemon" icon="fa-duotone fa-server">One command on any machine with Node 24+</Card>

<Card kind="tile" title="Create an agent" href="/docs/create-an-agent" icon="fa-duotone fa-robot">Pick a runtime, a model and a workspace</Card>

<Card kind="tile" title="Connect Slack" href="/docs/slack" icon="fa-duotone fa-hashtag">Use a direct Socket Mode app or a Relay-backed shared app</Card>

<Card kind="tile" title="Watch sessions" href="/docs/sessions" icon="fa-duotone fa-messages">Replay every run, tool call by tool call</Card>

<Card kind="tile" title="Schedules" href="/docs/schedules" icon="fa-duotone fa-calendar-clock">Run agents on a timer</Card>

<Card kind="tile" title="MCP connector" href="/docs/mcp-connector" icon="fa-duotone fa-plug">Ask Claude about your org — agents, sessions, spend</Card>

<Card kind="tile" title="API keys" href="/docs/api-keys" icon="fa-duotone fa-key">Script the platform with personal keys</Card>

<Card kind="tile" title="API Reference" href="/reference" icon="fa-duotone fa-code-simple">Automate the console's REST workflows</Card>
</Cards>

## Self-hosted or hosted

[AgentConnect OSS](/docs/get-started) runs the Web console, Control Plane, Relay, and PostgreSQL in your environment. The default Docker Compose stack is intended for local evaluation and is available now.

[AgentConnect Cloud](https://app.agentconnect.md/waitlist) is planned as the hosted management console and is currently accepting early-access sign-ups. In either model, agent processes and workspaces run in the environment you operate.
