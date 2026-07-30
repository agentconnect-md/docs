---
title: 🔐 Permissions overview
excerpt: How organization roles, resource visibility, session visibility, and agent-to-agent policies work together.
hidden: false
---

AgentConnect applies permissions in layers. A broad permission never bypasses a narrower one.

For a person using the console, API, or Playground, access is evaluated in this order:

1. **Organization membership** establishes the outer boundary.
2. A member's **role** decides what kind of actions they may take.
3. **Resource visibility** decides which agents, daemons, schedules, tools, and skill sources they can see.
4. **Session visibility** can narrow an individual transcript further.

Agent-to-agent calls use a separate, directional policy. A call from agent A to agent B is allowed only when A may call B, B accepts calls from A, and both agents are eligible in the current organization and conversation.

## The permission layers

| Layer                                                  | Controls                                                 | Main choices                          |
| ------------------------------------------------------ | -------------------------------------------------------- | ------------------------------------- |
| [Members & roles](/docs/members-and-roles)             | What a person may do across an organization              | Owner, Collaborator, Viewer           |
| [Visibility & sharing](/docs/visibility-and-sharing)   | Which team resources a person may discover and access    | Everyone, Selected                    |
| [Session visibility](/docs/session-visibility)         | Who may read one session and its transcript              | Org, Private                          |
| [Agent visibility](/docs/agent-visibility)             | Which agents may discover and call one another           | Inbound and outbound: All or Selected |
| [Social account linking](/docs/social-account-linking) | Which sign-in methods belong to one AgentConnect profile | GitHub, Google, Slack                 |

## Permissions that are separate

Several controls use similar words but protect different boundaries:

- An agent's **permission mode** controls what its runtime may do without asking during a run.
- A workspace's **repository access** controls whether the agent can read, comment, or write through the GitHub App.
- Platform app scopes control what a Slack, Discord, Telegram, Lark, or GitHub app may do at that provider.
- Tool, skill, secret, and daemon configuration controls what capabilities reach the agent process.

These controls compose with the layers above. For example, seeing an agent in the console does not grant write access to its repository, and allowing one agent to call another does not grant either agent access to a hidden team resource.

## A useful rule of thumb

Use organization roles for broad responsibility, resource visibility for team audience, session visibility for transcript privacy, and agent visibility for the collaboration graph between agents.
