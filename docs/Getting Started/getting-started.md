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

## Why AgentConnect?

AI agents are taking on work across the team, but most still live in individual terminals. AgentConnect brings them into the team's shared workflows:

- **Work as one team.** Create agents with different roles and let them call on one another, while people follow along in the conversations where the work happens.
- **Keep work where it happens.** Link agents to bots in Slack, Telegram, and Discord, or to repositories and workflows on GitHub.
- **Choose the right agent for every job.** Configure each agent's runtime, model, workspace, tools, and machine independently.
- **Carry context forward.** Give each agent the memory and reusable skills it needs to build on earlier work.
- **Set clear boundaries.** Decide who can see each agent and session, which repositories and tools it may use, and which other agents it may call.
- **Stay in control.** Self-host the Apache-2.0 stack, run agents in your environment, and change runtimes without locking the team to one vendor.

## Build your agent team

Create agents for the roles your team needs, give each one the runtime, model, workspace, and tools that fit the job, then connect them to the places where your team already works.

- **Create a roster of agents.** Run reviewers, support agents, release agents, and other specialists side by side.
- **Connect them to your platforms.** Link agents to bots in Slack, Telegram, or Discord, or let them work from GitHub repositories and events.
- **Put each agent in the right place.** Choose the channels, repositories, webhooks, and schedules where each agent should respond.
- **Work with them as a team.** Mention the right agent from a conversation or GitHub thread, and follow its work there or from the console.

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

## Go further

Once your agents are working, combine agents, models, and channels into more advanced team patterns:

- **Layer fast and deep PR reviews.** Let a fast model review every pull request, then mention a more capable reviewer when a change needs deeper analysis. [Build the workflow](/docs/fast-and-deep-pr-reviews).
- **Use one Slack app across channels.** Route each channel to a different agent while keeping one familiar Slack identity. [Configure the pattern](/docs/one-slack-app-across-channels).
- **Hand off conversations across trusted workspaces.** Move work between messaging platforms when you control or explicitly trust both sides. [See the pattern](/docs/hand-off-conversations-across-messaging-platforms).

## Self-hosted or hosted

[AgentConnect OSS](/docs/get-started) runs the Web console, Control Plane, Relay, and PostgreSQL in your environment. The default Docker Compose stack is intended for local evaluation and is available now.

[AgentConnect Cloud](https://app.agentconnect.md/waitlist) is planned as the hosted management console and is currently accepting early-access sign-ups. In either model, agent processes and workspaces run in the environment you operate.
