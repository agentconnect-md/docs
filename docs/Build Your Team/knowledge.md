---
title: 📚 Knowledge
excerpt: Publish reviewed team context that every agent can discover on demand.
hidden: false
---

Knowledge gives your agent team a reviewed, shared source of truth without copying the whole library into every prompt. Use it for durable runbooks, architecture decisions, product facts, and team practices. It is separate from an individual agent's [memory](/docs/configure-an-agent#memory), which belongs to that agent.

Open **Knowledge** in the console. Its two tabs separate published content from the queue that produced it:

- **Organization** contains published, revisioned Markdown that agents can search.
- **Suggestions** is where organization Owners review Knowledge and managed-skill candidates proposed by Dreaming.

All organization members can read published Knowledge. Only Owners can publish or revise entries, archive or restore them, and review suggestions.

## Publish Knowledge

1. Open **Knowledge → Organization**.
2. Choose **Publish knowledge** and add the title, Markdown content, and optional summary and tags.
3. Publish the entry.

Editing an entry publishes a new immutable revision instead of overwriting its history. Archive an entry when agents should stop finding it; turn on **Include archived** to inspect or restore archived content.

## Review Dream suggestions

[Dreaming](/docs/configure-an-agent#dreaming) can turn recurring patterns from an agent's recent work into a proposed Knowledge entry or managed skill. A proposal never publishes itself:

1. Open **Knowledge → Suggestions** as an organization Owner.
2. Filter **Pending**, **Accepted**, or **Rejected** suggestions.
3. Inspect the proposed Markdown or complete skill file tree and its source sessions.
4. **Accept** it to create an approved immutable revision, or **Reject** it and keep the decision in review history.

Pending proposal bodies remain on the source daemon until review. If that daemon is offline, the suggestion metadata remains visible, but its content cannot be opened or accepted until the daemon returns. Once accepted, Knowledge and managed-skill revisions are stored centrally so the team can use them independently of the proposing daemon.

An accepted Knowledge suggestion appears in the Knowledge library. An accepted managed skill appears in **Tools & Skills → Skills library** and still must be [enabled explicitly for each agent](/docs/tools-and-skills#enable-tools-and-skills-for-an-agent).

## How agents use Knowledge

Agents receive a read-only `findKnowledge` tool. They can search by text and tags when a task calls for shared context. AgentConnect does not inject the full library into every session, so unrelated content does not consume the standing context window.

If the Control Plane is temporarily unavailable, `findKnowledge` returns a tool error without failing the rest of the agent turn. Agents cannot publish or approve Knowledge through this tool.

## Dreaming

Dreaming is available with **Managed** memory. Open an agent's **Memory** tab, edit its memory settings, and enable **Dreaming**. You can run **Dream now**, schedule recurring runs, and optionally enable **Also mine reusable skills from repeated procedures**.

Dreams also stage proposed changes to the agent's own memory and agent-local skills. Those stay distinct from shared suggestions: accepting or discarding an agent-memory result never auto-accepts a Knowledge or managed-skill proposal, and organization Owners still review every shared proposal under **Knowledge → Suggestions**.
