---
title: 🧩 Daemon groups (experimental)
excerpt: Let several of your daemons share agents, so an agent keeps running when one machine goes down and its sessions can run on more than one machine.
hidden: false
---

> 🧪 **Experimental:** Daemon groups are an experimental feature. Behavior, configuration and limits may change between releases, and some edges are still rough. Try them on agents where a lost conversation or an interrupted turn is acceptable.

> ☸️ **Kubernetes is the recommended way to run agents at scale.** The [Kubernetes deployment](/docs/kubernetes-deployment) is the production-shaped one: its install-wide daemon pool keeps an agent running across replaceable members, and every session runs in its own sandbox pod against one shared store, with no per-machine setup. Reach for daemon groups when the agents run on machines you operate yourself.

A **daemon group** is a named set of daemons you connected to your organization. Placing an agent on a group, instead of on one daemon, gives you two separate features:

| Feature | What it does | How you turn it on |
| --- | --- | --- |
| [**Failover**](#failover) | One member serves the agent at a time. When that member stops, another member takes the agent over. | Create a group with two or more daemons and place the agent on it. |
| [**Parallel sessions**](#parallel-sessions) | The agent's isolated sessions can run on other members of the group, not only on the member serving it. | Turn on **Spread sessions across the group** for the group, and `sandbox.share` on each machine that should run them. |

Failover works without parallel sessions. Parallel sessions build on failover: they apply only to agents placed on a group.

## Before you start

**Create a group.** Open **Infra**, go to **Daemon groups**, and choose **New group**. Give it a name, pick its daemons, and leave **Spread sessions across the group** off unless you are setting up [parallel sessions](#parallel-sessions). A daemon belongs to one group at a time. You can also add or remove a daemon from its own page with **Join \<group\>** and **Leave \<group\>**.

Joining a group does not move anything. Agents already placed directly on that daemon keep running there, and the group's page lists them as **pinned**. Leaving a group hands the group's agents to its remaining members.

The group's page shows its members, which one is **serving**, the agents on the group and its active sessions. **Runtimes** lists only what every serving member offers, because an agent on the group runs on whichever member is serving it.

<p align="center">
  <img src="https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/daemon-group.png" alt="A daemon group's page: two serving members, their load and pinned agents, and the runtimes every serving member offers" width="820" />
</p>

## Failover

### What it does

An agent placed on a group is served by one member at a time. That member runs its turns, holds its chat platform connections, and runs its schedules and triggers. If the member stops serving, another member takes the agent over, installs it if needed, and continues:

- **A restart or upgrade** drains the member first, so another member takes over as soon as the drain finishes.
- **A member that disappears** without draining (a crash, a power loss, a lost network) keeps the agent until its lease expires, about two minutes. Then another member takes it over.

The agent stays with the member that took it over. It does not return to the previous member when that one comes back, and agents are not rebalanced across members.

### Set it up

1. Connect two or more daemons and [create a group](#before-you-start) with them.
2. Make sure every member can run the agent: the agent's runtime installed and signed in, its MCP servers available, and its [execution strategy](/docs/sandboxing#pick-an-execution-strategy) available, on each member. The group's **Runtimes** list shows what every serving member offers. The **Execution strategy** picker is broader: it lists every strategy at least one serving member offers. A session that would run on a member without the agent's strategy is refused there; it never falls back to a weaker boundary.
3. Place the agent on the group: in the agent's **Configuration**, choose the group in **Runs on**. The picker reads "Any daemon in the group can serve this agent."

You can also create an agent directly on a group.

<p align="center">
  <img src="https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/runs-on-group.png" alt="The Runs on picker, listing a daemon group beside single daemons" width="560" />
</p>

### What carries over and what doesn't

| Carries over to the new member | Stays on the member that ran it |
| --- | --- |
| The agent's saved definition, integrations, schedules and triggers | Conversation transcripts and each session's runtime state |
| Managed memory, which agents on a group keep in AgentConnect | The runtime's own native memory |
| GitHub, GitLab and Gitea workspaces, cloned again on the new member | A scratch workspace, and uncommitted work in any workspace |

In practice, a conversation that continues after a failover starts a fresh runtime session on the new member. A webchat conversation that ran on the previous member says so rather than answering without its history. Commit and push work you want to survive a failover.

An agent on a group with managed memory always keeps it in AgentConnect rather than on one daemon, so every member sees the same memory.

### Optional: share session history

By default each member keeps its sessions in its own store. Members can instead share one PostgreSQL database, so session records and transcripts are visible whichever member serves the agent. Put the connection in a file in the daemon's root directory, next to its `config.json`:

```json
{ "version": 1, "databaseUrl": "postgresql://agentconnect:<password>@db.example.test:5432/agentconnect", "maxConnections": 4 }
```

and point the daemon at it in `config.json`:

```json
{ "store": { "backend": "postgres", "configFile": "data-plane.json" } }
```

Set this on every member, against the same database, and restart each daemon. Keep the connection file readable by the daemon's user only.

- The store is per machine, so it applies to every agent on that daemon, not only to group agents.
- It needs the control plane. Agents defined in the machine's own agents directory are not served on it.
- Nothing is migrated: a daemon switched to PostgreSQL starts without its previous local history.
- A shared store carries records, not a runtime's own state. A session whose runtime ran on the previous member still starts fresh there, unless it ran on another member through [parallel sessions](#parallel-sessions).

## Parallel sessions

### What it does

Without parallel sessions, every session of an agent runs on the member serving it. With parallel sessions, each new **isolated** session is placed on the member that would be least full with it, measured against each machine's [session capacity](#size-each-machine). A member already at its capacity is skipped, and a tie stays on the serving member. With every machine at the same capacity, as by default, this is simply the member running the fewest isolated sessions. A session keeps the machine it started on for its whole life, and the serving member keeps handling the conversation and relays it to the machine running the session.

How a session runs on the other machine follows the agent's **Execution strategy**:

| Execution strategy | Session on another member |
| --- | --- |
| `host` | A process on that machine, in its own session directory. Linux only. |
| `microsandbox` | A microsandbox VM on that machine. Needs microsandbox available there. |
| `srt` | An SRT sandbox on that machine. Needs `srt` available there. |

### Requirements

- The agent is on a group ([failover](#set-it-up) set up).
- Each session has its own workspace: **Worktree** is on (labelled **Session isolation** when the agent's execution strategy is a sandbox). Sessions that share one workspace always stay on the serving member.
- Each member that lends capacity offers the agent's execution strategy and has the agent's runtime signed in, with the agent's model available. Other members are skipped.
- The members can reach each other directly over TCP. A member that lends capacity listens on one port, on every interface. The port is chosen when the daemon starts, and other members reach it at the address the daemon uses to connect to AgentConnect, so allow inbound connections between members.

### Turn it on

Parallel sessions need two consents, each set in its own place:

1. **The group.** Open the group's **Edit group** and turn on **Spread sessions across the group**. Off, no session of any agent in the group moves.

   <p align="center">
     <img src="https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/daemon-group-edit.png" alt="Edit group with two daemons selected and Spread sessions across the group turned on" width="420" />
   </p>

2. **Each machine that lends capacity.** On every member that should run other members' sessions, add this to its `config.json` and restart that daemon:

   ```json
   { "sandbox": { "share": true } }
   ```

   This is the machine owner's decision, so it lives only in the machine's own config file, is read when the daemon starts, and cannot be set from the console. It is off by default.

A member without `sandbox.share` still serves agents and runs its own sessions; it just does not run anyone else's.

### Size each machine

Each member's session capacity is `limits.maxConcurrentSessions` in its `config.json`, 32 by default. It is the most sessions the machine runs for its group, counting its own isolated sessions, and it decides each machine's share of new sessions. When the members are different sizes, give each one a capacity in proportion to what it can run and restart that daemon. For example, a large workstation and two smaller machines could use:

| Machine | `config.json` |
| --- | --- |
| 128 GB workstation | `{ "limits": { "maxConcurrentSessions": 8 } }` |
| 32 GB machine | `{ "limits": { "maxConcurrentSessions": 2 } }` |
| 16 GB machine | `{ "limits": { "maxConcurrentSessions": 1 } }` |

The workstation then takes the larger share of new sessions. Like `sandbox.share`, capacity is the machine owner's setting and cannot be set from the console. Only other members' sessions are refused at capacity: a member's own sessions still run on it.

### What sharing a machine lends

- **Its runtime sign-in.** A session that runs on a lending machine uses that machine's runtime login or API-key setup (for example its Codex or Claude sign-in) and its sandbox settings. The agent's provider credentials, secrets and repository credentials still come from the serving member, over an encrypted connection. Share only machines whose runtime accounts you are willing to have the group's agents use.
- **CPU, memory and disk**, up to the machine's [session capacity](#size-each-machine).
- **One network port**, as described in [Requirements](#requirements).

### See where a session runs

A session's **Details** show **Runs on** with the machine running it. A session that stayed on the serving member says why:

<p align="center">
  <img src="https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/session-runs-on.png" alt="A session's Details, with Runs on showing the serving member and the reason least loaded" width="300" />
</p>

| Reason | Meaning |
| --- | --- |
| **not on a group** | The agent is placed on one daemon, not on a group. |
| **spreading off** | The group's **Spread sessions across the group** switch is off. |
| **shared workspace** | The session uses the agent's shared workspace instead of its own. |
| **least loaded** | The serving member was the least full for its capacity. |
| **no member could run it** | No lending member offers what the session needs. |
| **every member full** | Every lending member is at its session capacity. |
| **control plane unreachable** | Placement could not be decided at the time. |

### If a lending machine goes away

A session that ran on another machine keeps that machine for its whole life. While that machine is briefly offline, the session's turns fail with a retryable error. If it stays offline for more than about 10 minutes, the session is started again on another member, without the uncommitted work that was on the lost machine.

## Limitations

- Agents are not rebalanced after a failover, and a returning member does not take its agents back.
- Without a shared store, conversation history does not follow an agent to a new member.
- Machines that lend capacity must be Linux, reach each other directly, and allow the lending port through their firewalls. The port is not fixed.
- A multi-homed machine advertises the address it uses to reach AgentConnect. There is no override yet.
