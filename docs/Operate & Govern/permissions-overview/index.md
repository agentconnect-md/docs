---
title: 🔐 Permissions
excerpt: How organization roles, resource visibility, session visibility, and agent-to-agent policies work together.
hidden: false
---

AgentConnect evaluates the boundary that owns each requested resource. Organization membership remains the outer boundary, while Agent Team visibility and Session audience protect different things.

<p align="center">
  <img src="https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/agent-visibility-default.png" alt="Choose the default agent-to-agent visibility policy" width="760" />
</p>

For a person using the console, API, or Playground:

1. **Organization membership** establishes the outer boundary.
2. A member's **role** decides what kind of actions they may take.
3. **Resource visibility** decides which agents, daemons, schedules, [tools, and skill sources](/docs/tools-and-skills) they can see and manage.
4. **Session visibility** independently decides which sessions, transcripts, and session-scoped updates they can read.

Session access is not inherited from the owning Agent. Passing a session's audience can reveal that session and the Agent's display name as plain context, but it does not reveal the Agent page, configuration, workspace, or invocation controls.

Agent-to-agent calls use a separate, directional policy. A call from agent A to agent B is allowed only when both agents belong to the same organization, A may call B, and B accepts calls from A. Human team visibility and chat-channel membership do not grant or block that agent-to-agent edge.

## The permission layers

| Layer | Limits | Choices |
| --- | --- | --- |
| [Members & roles](/docs/members-and-roles) | Actions across the organization | Owner, Collaborator, Viewer |
| [Visibility & sharing](/docs/visibility-and-sharing) | Who sees a team resource | Everyone, Selected |
| [Session visibility](/docs/session-visibility) | Who reads one session | Everyone, Private, provider |
| [Agent visibility](/docs/agent-visibility) | Which agents may collaborate | All, Selected |
| [Social account linking](/docs/social-account-linking) | Provider identity | GitHub, Google, Slack |

When one profile has several linked providers, [Permissions with linked accounts](/docs/linked-account-permissions) explains which provider-specific checks change and which AgentConnect permissions stay exactly the same.

Self-hosted deployments can also enable Lark and Feishu sign-in.

## Permissions that are separate

Several controls use similar words but protect different boundaries:

- An agent's **permission mode** controls what its runtime may do without asking during a run.
- [Sandboxing](/docs/sandboxing) places the runtime inside an outer Linux OS boundary and limits its filesystem access.
- A workspace's **repository access** controls whether the agent has Read only or Read & write access through the GitHub App.
- Platform app scopes control what a Slack, Discord, Telegram, Lark, or GitHub app may do at that provider.
- Tool, skill, secret, and daemon configuration controls what capabilities reach the agent process.

These controls compose with the layers above. For example, seeing an agent in the console does not grant write access to its repository, and allowing one agent to call another does not grant either agent access to a hidden team resource.

## A useful rule of thumb

Use organization roles for broad responsibility, resource visibility for direct access to team resources, session visibility for transcript privacy, and agent visibility for the collaboration graph between agents. Treat the Agent and its sessions as separate authorization targets.
