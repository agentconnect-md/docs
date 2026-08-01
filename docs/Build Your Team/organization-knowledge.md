---
title: 📚 Organization knowledge
excerpt: Share reviewed team knowledge and managed skills that agents can discover and use.
hidden: false
---

Organization knowledge gives your agent team reviewed, shared context without copying the whole library into every prompt. It is separate from an individual agent's [memory](/docs/configure-an-agent#memory).

The console separates accepted content from the queue that produced it:

- **Knowledge → Organization** contains revisioned Markdown such as runbooks, architecture decisions, product facts, and team practices. Agents search it on demand.
- **Knowledge → Suggestions** is where Owners review Dream candidates for both organization knowledge and managed skills.
- **Tools & Skills → Skills library** contains accepted managed skills alongside Git-backed skill sources. Managed skills are immutable, owner-approved Agent Skills bundles that must still be enabled explicitly for each agent that should use them.

All organization members can read accepted knowledge and managed-skill metadata. Organization Owners publish and revise knowledge, archive or restore approved artifacts from their respective libraries, and accept or reject Dream suggestions.

## Publish knowledge

1. Open **Knowledge → Organization**.
2. Choose **Publish knowledge** and add the title, Markdown content, and optional summary and tags.
3. Publish the entry.

Editing an entry creates a new immutable revision instead of overwriting its history. Archive an entry when agents should stop finding it; turn on **Include archived** to inspect or restore archived content.

## Review Dream suggestions

[Dreaming](/docs/configure-an-agent#dreaming) can turn patterns from an agent's recent work into proposed organization knowledge or managed skills. A proposal never publishes itself:

1. Open **Knowledge → Suggestions** as an organization Owner.
2. Filter **Pending**, **Accepted**, or **Rejected** suggestions.
3. Inspect the proposed Markdown or complete skill file tree and its source sessions.
4. **Accept** it to create an approved immutable revision, or **Reject** it and keep the decision in review history.

Pending proposal bodies remain on the source daemon until review. If that daemon is offline, the suggestion metadata remains visible, but its content cannot be opened or accepted until the daemon returns. Accepted organization knowledge and managed-skill revisions are stored centrally so the team can use them independently of the proposing daemon.

## Enable a managed skill for an agent

Accepting a skill makes it available under **Tools & Skills → Skills library**; it does not enable the skill automatically. Owners can inspect its immutable revision history and archive or restore it from that library.

1. Open the agent.
2. Go to its **Tools & Skills** tab.
3. Under **Managed organization skills**, enable the approved skill.

The agent receives the current approved, immutable revision. When an Owner accepts a newer revision, AgentConnect refreshes agents that have that managed skill enabled. On the organization Tools & Skills page, managed bundles and Git-backed sources share the Skills library but remain clearly labeled as different source types.

## How agents use organization knowledge

Agents receive a read-only `findKnowledge` tool. They can search by text and tags when the task calls for shared context. AgentConnect does not inject the full library into every session, so irrelevant organization content does not consume the standing context window.

If the Control Plane is temporarily unavailable, `findKnowledge` returns a tool error without failing the rest of the agent turn. Agents cannot publish or approve organization content through this tool.

## Dreaming

Dreaming is available with **Managed** memory. Open an agent's **Memory** tab, edit its memory settings, and enable **Dreaming**. You can run **Dream now**, schedule recurring runs, and optionally enable **Also mine reusable skills from repeated procedures**.

Dreams also stage proposed changes to the agent's own memory and agent-local skills. Those stay distinct from organization suggestions: accepting or discarding the agent-memory result never auto-accepts an organization proposal, and organization Owners still review each shared proposal under **Knowledge → Suggestions**.
