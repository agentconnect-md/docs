---
title: 🎭 One Slack app with different agents by channel
excerpt: Use one shared Slack identity while each channel dispatches to an agent with its own model, instructions, workspace, and trigger.
hidden: false
---

A shared Slack bot lets one Slack App serve several AgentConnect agents. People invite and mention one bot identity, while AgentConnect sends each channel to the agent configured as that channel's default dispatch.

This is useful when different channels need different models, repositories, tools, or behavior without installing a separate Slack App for every agent.

| Slack conversation | Default dispatch    | Trigger         | Example role                          |
| ------------------ | ------------------- | --------------- | ------------------------------------- |
| `#engineering`     | `engineering-agent` | **any message** | Implementation and repository work    |
| `#security`        | `security-agent`    | **@-mention**   | Threat analysis and sensitive reviews |
| `#support`         | `support-agent`     | **any message** | Product questions and issue triage    |

## Before you start

You need:

- two or more online agents;
- a live AgentConnect Relay with a public Slack callback URL; and
- permission to create or install a Slack App in the workspace.

Shared bots use Slack's **HTTP (Events API)** delivery through the Relay. A Socket Mode bot is daemon-owned and cannot be shared across agents.

AgentConnect OSS operators should configure [public Relay URLs](/docs/deployment-and-configuration#network-and-public-urls) before creating the App.

## 1. Create the channel-specific agents

Create one agent for each behavior you want. Configure its model, instructions, workspace, tools, and permissions on the agent page.

Keep the differences in the agents themselves. Avoid one large prompt that branches on channel names; the shared bot's channel routing should choose the already-specialized agent.

For example:

- `engineering-agent` uses a coding model with write access to the main repository;
- `security-agent` uses a stronger reasoning model with read-only access and a security-focused prompt; and
- `support-agent` uses a fast model with product documentation tools.

## 2. Create the shared Slack bot

On the first agent, open **Integrations → Add integration → Slack**:

1. Create a Slack App using a configuration token or the manifest flow.
2. Set **Delivery** to **HTTP (Events API)**.
3. Enable **Shared bot — let multiple agents use this one bot**.
4. Complete the Slack installation and connect it to the agent.

With the configuration-token flow, AgentConnect captures the signing secret automatically. With the manifest flow, paste the bot token and signing secret shown in the Slack App settings.

Invite the App to every channel it should serve:

```text
/invite @your-bot
```

The channels appear in AgentConnect after Slack reports the bot's membership.

## 3. Connect the same App to the other agents

For each remaining agent:

1. Open **Integrations → Add integration → Slack**.
2. Choose **Use an existing bot**.
3. Select the shared bot you created.
4. Connect it to the agent.

Do not create another Slack App. Every connected agent now uses the same Slack bot identity and credentials, while running on its own daemon placement.

## 4. Assign each channel

Open **Settings → Bots → Slack** and expand the shared bot. For each channel, choose its **Default dispatch** agent.

Then choose the channel trigger from the agent's Slack integration:

- **@-mention** — run only when the bot is mentioned; unmentioned follow-ups continue in a thread the agent already joined.
- **any message** — run the default agent for every message in that channel.
- **off** — available for restricted agents when the conversation has not been enabled.

Every active shared-bot channel has exactly one default dispatch agent. Changing the owner in the Console preserves the channel's trigger.

## How routing behaves

1. The channel's default dispatch and trigger select the agent for a new message.
2. Once a thread is assigned, unmentioned follow-ups stay with that agent.
3. Replies use the same Slack App identity. When the response footer is enabled, it identifies the actual AgentConnect agent, runtime, and model.
4. Messages authored by an AgentConnect-managed bot do not wake another agent through Slack, preventing bot-to-bot loops.

One inbound Slack message selects one agent. A shared bot is routing several channel-specific agents behind one identity; it is not a broadcast that makes every agent answer.

## Troubleshooting

| Symptom                                  | Check                                                                                                                  |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Shared bot** is unavailable            | Select **HTTP (Events API)** and confirm a live Relay is configured. Socket Mode bots cannot be shared.                |
| A channel is missing                     | Confirm the bot was invited, then wait for Slack's membership update to arrive; re-invite it if the event was missed.  |
| The wrong agent answers                  | Check **Settings → Bots → Default dispatch** for that channel, then verify its trigger.                                |
| Follow-ups keep using the previous agent | Start a new thread, or explicitly switch the thread's agent from its session controls. Thread affinity is intentional. |

See [Slack](/docs/slack) for installation details and [Configure an agent](/docs/configure-an-agent) for models, prompts, workspaces, and permissions.
