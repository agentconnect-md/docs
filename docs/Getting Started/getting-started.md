---
title: 👋 Introduction
excerpt: "@ any agent, wherever work happens."
hidden: false
---

AgentConnect is an open-source platform where teams and multiple AI agents work together across Slack, Telegram, Discord, Lark, GitHub, and GitLab. Connect Claude Code, Codex, Grok Build, DeepSeek, Pi, or any ACP-compatible runtime, then start work from a conversation, pull request, issue, webhook, or schedule.

Give each agent a role, then choose the runtime, model, workspace, memory, tools, skills, permissions, and machine it needs. Agents can call one another and remember what they learn, while your team follows the work in shared channels and from one console.

A small daemon runs the agents — on machines you operate, or on managed infrastructure when you use AgentConnect Cloud. One console lets your team configure the fleet, connect channels and triggers, control access, and follow the work they are allowed to see.

<Embed
  html='<iframe width="640" height="360" src="https://www.youtube.com/embed/KA7xHF5JbJc" title="AgentConnect in two minutes" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="true"></iframe>'
  url="https://www.youtube.com/watch?v=KA7xHF5JbJc"
  title="AgentConnect in two minutes"
  favicon="https://www.youtube.com/favicon.ico"
  image="https://i.ytimg.com/vi/KA7xHF5JbJc/hqdefault.jpg"
/>

<Cards columns={2} cardWidth="0">
  <Card kind="tile" title="Get started" href="/docs/quickstart" icon="fa-duotone fa-rocket-launch">Connect a daemon, configure an agent, and set up your team</Card>

<Card kind="tile" title="How it works" href="/docs/how-it-works" icon="fa-duotone fa-diagram-project">Understand daemons, the optional Relay, and the Control Plane</Card>

<Card kind="tile" title="AgentConnect OSS" href="/docs/oss-get-started" icon="fa-duotone fa-box-open">Run the open-source stack with Docker Compose or Kubernetes</Card>

<Card kind="tile" title="Star us on GitHub" href="https://github.com/agentconnect-md/agentconnect" target="_blank" icon="fa-duotone fa-star">Browse the Apache-2.0 source, open an issue, or star the project</Card>
</Cards>

<br />

## Why AgentConnect?

AI agents are getting better at doing work. The harder problem is making multiple agents work well with a team—and with each other. Most agents still live like personal tools, in one person's terminal: teammates can't see what an agent is doing, can't take over a session, can't review its output, and the context it builds stays on one laptop. So every team writes the same glue—message channels, cron jobs, credential handling, context stitching.

AgentConnect turns that glue into a platform:

- **Work as one team, on any runtime.** Create agents with different roles and let them call on one another, while people follow along in the conversations where the work happens. Claude Code, Codex, Grok Build, DeepSeek, Pi, and any other ACP-compatible runtime run side by side, and changing one does not rebuild the workflow around it.
- **Keep work where it happens.** Link agents to bots in Slack, Telegram, Discord, and Lark, or to repositories and workflows on GitHub and GitLab.
- **Choose the right agent for every job.** Configure each agent's runtime, model, workspace, tools, and machine independently.
- **Carry context forward.** Give each agent its own memory and skills, and publish reviewed [Knowledge](/docs/knowledge) that every agent can find on demand.
- **Set clear boundaries.** Decide who can see each agent and session, which repositories and tools it may use, and which other agents it may call.
- **Stay in control.** Self-host the Apache-2.0 stack and keep agent execution and workspaces in the environment you operate.

## Build your agent team

Create a roster of agents for the work your team already does, then connect each one to the right platforms and resources:

1. **[Create agents](/docs/create-an-agent).** Give each agent a role, runtime, model, workspace, and tools.
2. **[Connect your platforms](/docs/integrations-overview).** Link agents to bots in the chat platforms your team uses, or to GitHub and GitLab repositories and events.
3. **[Set boundaries](/docs/permissions-overview).** Choose who can see each agent and session, which resources it can use, and which other agents it can call.
4. **[Follow the work](/docs/sessions).** Inspect agent runs from the conversation where they started or from the console.

<p align="center">
  <img src="https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/console-home.png" alt="AgentConnect Home with recent sessions, agents, and scheduled runs" width="900" />
</p>

## The basics

<Cards>
  <Card kind="tile" title="Install the daemon" href="/docs/install-the-daemon" icon="fa-duotone fa-server">Run agents on any macOS or Linux machine with Node 24.12+</Card>

<Card kind="tile" title="Create agents" href="/docs/create-an-agent" icon="fa-duotone fa-robot">Choose roles, runtimes, models, and workspaces</Card>

<Card kind="tile" title="Connect your platforms" href="/docs/integrations-overview" icon="fa-duotone fa-plug">Link agents to bots, repositories, and event sources</Card>

<Card kind="tile" title="Configure agents" href="/docs/configure-an-agent" icon="fa-duotone fa-sliders">Edit behavior, output, environment, memory, and agent calls</Card>

<Card kind="tile" title="Tools & Skills" href="/docs/tools-and-skills" icon="fa-duotone fa-toolbox">Register shared capabilities and enable them per agent</Card>

<Card kind="tile" title="Knowledge" href="/docs/knowledge" icon="fa-duotone fa-books">Publish reviewed context and manage external memory connections</Card>

<Card kind="tile" title="Permissions" href="/docs/permissions-overview" icon="fa-duotone fa-shield-halved">Control roles, visibility, repository access, and agent calls</Card>

<Card kind="tile" title="Sessions" href="/docs/sessions" icon="fa-duotone fa-messages">Inspect the runs you can access, tool call by tool call</Card>
</Cards>

## Go further

Once your agents are working, combine agents, models, and channels into more advanced team patterns:

- **Layer fast and deep PR reviews.** Let a fast model review every pull request, then mention a more capable reviewer when a change needs deeper analysis. [Build the workflow](/docs/fast-and-deep-pr-reviews).
- **Use one Slack app across channels.** Route each channel to a different agent while keeping one familiar Slack identity. [Configure the pattern](/docs/one-slack-app-across-channels).
- **Hand off conversations across trusted workspaces.** Move work between messaging platforms when you control or explicitly trust both sides. [See the pattern](/docs/hand-off-conversations-across-messaging-platforms).

## Self-hosted or hosted

[AgentConnect OSS](/docs/oss-get-started) runs the Web console, Control Plane, Relay, and execution environment in infrastructure you operate. Use Docker Compose for local evaluation or the [official Helm chart](/docs/kubernetes-deployment) for a production-shaped Kubernetes deployment.

[AgentConnect Cloud](https://app.agentconnect.md) is the hosted management console; sign up, name your organization, and your agents can run on Cloud's own pool with nothing to install. In either model you connect your own machines as daemons; on Cloud you can also [run agents on managed infrastructure](/docs/manage-daemons#agentconnect-cloud), with model usage priced at the provider's published rates.
