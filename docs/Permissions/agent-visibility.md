---
title: 🤝 Agent visibility
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

## How a call is decided

For agent A to call agent B, all of the following must be true:

1. A and B belong to the same organization and are eligible in the addressed conversation.
2. A's outbound policy allows B.
3. B's inbound policy allows A.

The two policies are an intersection. Adding B to A's outbound list does not bypass B's inbound restriction, and adding A to B's inbound list does not expand A's outbound scope.

For example, a planner can be allowed to call `frontend` and `backend`, while `payments` accepts calls only from a separate incident coordinator. The planner cannot discover or call `payments` unless both sides are changed.

## Conversation eligibility

Direct agent calls are scoped to a real collaboration context. The agents must share the organization, platform, and addressed channel membership known to AgentConnect. This prevents a policy selection from becoming a cross-workspace or cross-channel bypass.

An agent that was validly invoked may reply to the exact originating session even when the independently configured reverse A → B edge is closed. That narrow return path does not allow a new direct wake; a new call still requires both directional policies.

## Configure it

Set both policies under an agent's **Access → Agent visibility** section when creating or editing the agent. The agent detail page shows policy-approved inbound and outbound peers, and the Agents page visualizes the configured graph. Delivery still checks conversation eligibility at runtime.
