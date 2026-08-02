---
title: 🕸️ Agent visibility
excerpt: Control both sides of the agent-to-agent collaboration graph.
hidden: false
---

Agents can delegate work to other agents. **Agent visibility** controls which direct calls are allowed. It is enforced during discovery and again at delivery.

This is different from [team visibility](/docs/visibility-and-sharing), which controls which people can see an agent.

## Two directions

Every agent has two independent policies:

| Direction | Console question                      | Meaning                                             |
| --------- | ------------------------------------- | --------------------------------------------------- |
| Inbound   | **Which agents can call this agent?** | Protects this agent from unwanted callers           |
| Outbound  | **Which agents can this agent call?** | Limits what this agent may discover and delegate to |

Each direction can be:

- **All agents**, the default; or
- **Selected**, with an explicit list of peer agents.

An empty Selected list allows no peers in that direction.

## Defaults for new agents

By default, an organization creates new agents with **All agents** in both directions, so they can discover and call any otherwise-callable peer in the organization.

An organization Owner can open **Settings → Organization → Edit** and change **Default agent visibility**:

- **All agents** starts future agents open to every agent in the organization in both directions.
- **Isolated** starts future agents with **Selected** and an empty list in both directions. They discover no peers and accept no peer calls until configured.

This setting applies only to agents created after the change. It never rewrites an existing agent's policies, and the **Add agent → Access** section can override either direction before creation.

## How a call is decided

For agent A to call agent B, all of the following must be true:

1. A and B belong to the same organization.
2. A's outbound policy allows B.
3. B's inbound policy allows A.

The two policies are an intersection. Adding B to A's outbound list does not bypass B's inbound restriction, and adding A to B's inbound list does not expand A's outbound scope.

For example, a planner can be allowed to call `frontend` and `backend`, while `payments` accepts calls only from a separate incident coordinator. The planner cannot discover or call `payments` unless both sides are changed.

## Organization-scoped discovery

An agent can discover its policy-approved peers across the organization and delegate work to them. The agents do not need to share a Slack channel, another chat integration, or even the same daemon. An agent with no chat integration can still be discovered and called.

Team visibility for people is a separate boundary. Hiding an agent from some organization members does not change the directional agent-to-agent graph, and allowing an agent call does not expose either agent's console resources to more people.

When a call explicitly addresses a known channel, AgentConnect still validates that channel coordinate instead of treating the tool input as authority. This protects routing integrity; it is not a general shared-channel requirement for agent calls.

An agent that was validly invoked may reply to the exact originating session even when the independently configured reverse A → B edge is closed. That narrow return path does not allow a new direct wake; a new call still requires both directional policies.

## Configure it

Set both policies under an agent's **Access → Agent visibility** section when creating or editing the agent. The agent detail page shows policy-approved inbound and outbound peers, and the Agents page visualizes the configured graph. AgentConnect checks both policies again when the call is delivered.

See [Multi-agent work modes](/docs/multi-agent-work-modes#agent-to-agent-delegation) for delegation in context with routing, layered specialists, and fan-out.
