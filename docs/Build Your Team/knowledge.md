---
title: 📚 Knowledge
excerpt: Publish reviewed team context, review shared suggestions, and manage external memory connections.
hidden: false
---

Knowledge gives your agent team a reviewed, shared source of truth without copying the whole library into every prompt. Use it for durable runbooks, architecture decisions, product facts, and team practices. The same page also hosts organization-wide external memory connections in a separate card; each agent still chooses its own [memory backend and policy](/docs/configure-an-agent#memory).

Open **Knowledge** in the console. Its two tabs separate published content from the proposal queue:

- **Organization** contains published, revisioned Markdown that agents can search.
- **Suggestions** is where organization Owners review Knowledge and managed-skill candidates proposed by Dreaming.

The **External memory** card appears below the tab content and contains approved memory services and account connections that agents may use.

All organization members can read published Knowledge and see configured connection metadata. Only Owners can publish or revise entries, archive or restore them, review suggestions, and manage external memory connections.

## Publish Knowledge

1. Open **Knowledge → Organization**.
2. Choose **Publish knowledge** and add the title, Markdown content, and optional summary and tags.
3. Publish the entry.

Editing an entry publishes a new immutable revision instead of overwriting its history. Archive an entry when agents should stop finding it; turn on **Include archived** to inspect or restore archived content.

## Review Dream suggestions

[Dreaming](/docs/configure-an-agent#dreaming) can turn recurring patterns from an agent's recent work into a proposed Knowledge entry or managed skill. A proposal never publishes itself:

> **Temporary safety pause:** Production daemons currently keep Dream execution and staged suggestion review disabled while the isolation and review boundary is hardened. Existing suggestion metadata may remain visible, but its content and review actions are unavailable until that boundary is re-enabled.

1. Open **Knowledge → Suggestions** as an organization Owner.
2. Filter **Pending**, **Accepted**, or **Rejected** suggestions.
3. Inspect the proposed Markdown or complete skill file tree and its source sessions.
4. **Accept** it to create an approved immutable revision, or **Reject** it and keep the decision in review history.

Pending proposal bodies remain on the source daemon until review. If that daemon is offline, upgrading, or paused for safety, the suggestion metadata remains visible, but its content cannot be opened or reviewed until the source is ready again. Once accepted, Knowledge and managed-skill revisions are stored centrally so the team can use them independently of the proposing daemon.

An accepted Knowledge suggestion appears in the Knowledge library. An accepted managed skill appears in **Tools & Skills → Skills library** and still must be [enabled explicitly for each agent](/docs/tools-and-skills#enable-tools-and-skills-for-an-agent).

## Manage external memory connections

Open **Knowledge → External memory** to register and manage approved memory services for the organization. An Owner reviews the plugin installation, endpoint or operator-provided command reference, credential contract, and stated network boundary before creating a connection. Secret values are write-only after saving. After the daemon probes the connection, its card shows the downstream hosts reported by the plugin.

Creating a connection does not change any agent automatically. Open an agent's **Memory** tab, choose **External**, select the connection, and configure its recall and capture policies. The connection supplies the trusted service and credentials; the agent binding supplies the agent-scoped identity and policy.

Follow [the guide to using Mem0 OSS as external memory](/docs/external-memory) for a complete deployment, connection, binding, and recall test.

## How agents use Knowledge

Agents receive a read-only `findKnowledge` tool. They can search by text and tags when a task calls for shared context. AgentConnect does not inject the full library into every session, so unrelated content does not consume the standing context window.

If the Control Plane is temporarily unavailable, `findKnowledge` returns a tool error without failing the rest of the agent turn. Agents cannot publish or approve Knowledge through this tool.

## Dreaming

Dreaming is configured with **Managed** memory. Open an agent's **Memory** tab to change its schedule, choose whether completed memory results wait for review or are adopted automatically, and optionally enable **Also mine reusable skills from repeated procedures**. Review is the default. While the temporary safety pause above is active, **Dream now** and scheduled runs do not execute in production.

Dreams also stage proposed changes to the agent's own memory and agent-local skills. Those stay distinct from shared suggestions: accepting or discarding an agent-memory result never auto-accepts a Knowledge or managed-skill proposal, and organization Owners still review every shared proposal under **Knowledge → Suggestions**.
