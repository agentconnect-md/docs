---
title: 🔗 MCP connector
excerpt: Add AgentConnect to Claude or any MCP client as a custom connector — ask about your agents, sessions, schedules and spend in plain language.
hidden: false
---

AgentConnect ships a hosted **MCP server** at:

```
https://mcp.agentconnect.md
```

Add it to Claude (or any client that speaks MCP over streamable HTTP) and your assistant can look into your organization for you:

> _"Which of our agents are online right now?"_
> _"What did we spend on tokens this week, per agent?"_
> _"Did the nightly report schedule run — and did it succeed?"_

## Connect from Claude

**Claude (claude.ai / desktop):** Settings → **Connectors** → **Add custom connector**, paste `https://mcp.agentconnect.md`, and finish in the browser: sign in with an enabled provider, **pick the organization** to bind, review the requested access (_View your agents, daemons, schedules, sessions, and usage_), and **Authorize**. No keys to copy — the flow is standard OAuth 2.1 with dynamic client registration.

**Claude Code:**

```bash
claude mcp add --transport http agentconnect https://mcp.agentconnect.md
```

then approve the browser sign-in when prompted (`/mcp` → authenticate). For headless environments (CI, servers) skip OAuth and attach an [API key](/docs/api-keys) instead:

```bash
claude mcp add --transport http agentconnect https://mcp.agentconnect.md \
  --header "Authorization: Bearer $AGENTCONNECT_API_KEY"
```

Any other MCP client works the same way: OAuth if it supports the authorization-code flow, otherwise a personal API key in the `Authorization: Bearer` header.

## What the connector can do

The current toolset is **read-only** — an assistant can inspect, never mutate:

| Area         | Tools                                                                                                       |
| ------------ | ----------------------------------------------------------------------------------------------------------- |
| Identity     | `whoami` — who you're acting as, which org this connection is bound to, your role                           |
| Agents       | `listAgents`, `getAgent`                                                                                    |
| Daemons      | `listDaemons`                                                                                               |
| Schedules    | `listCrons`, `getCron`, `listCronRuns`                                                                      |
| Sessions     | `listSessions`, `getSession` — metadata (status, usage, links), **not the transcript**                      |
| Usage        | `getUsage` — totals + per-agent breakdown over a window                                                     |
| Integrations | `listIntegrations`, `listBots` (bot metadata only — never token material), `listAgentHooks`, `listHookRuns` |
| Members      | `listMembers`                                                                                               |

Transcripts stay where they always are — [on your daemons](/docs/how-it-works). The connector sees the same metadata the console list views show, nothing more.

## Permissions & trust

- A connection acts **as you, in one organization** — the one you picked at consent (or the org your API key is bound to). Connect again to use another org.
- Your **role and per-resource visibility apply unchanged**: the tools call the same REST surface as the console, so a Viewer's connector can't see more than a Viewer, and [restricted resources](/docs/visibility-and-sharing) stay hidden.
- Every tool call is recorded in the organization's **audit trail**.
- Access tokens expire after **1 hour** and refresh automatically while the connector is in use (refresh stops after 30 days of inactivity). Disconnecting the connector in your AI client revokes its grant.
