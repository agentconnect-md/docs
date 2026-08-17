---
title: 🛡️ Sandboxing
excerpt: Confine agent runtimes on supported Linux daemons, per agent or as a daemon-wide requirement.
hidden: false
---

**Run in sandbox** places an agent runtime inside an OS-enforced boundary on its daemon. It gives the runtime a private home and temporary directory, limits where it can write, and hides AgentConnect state, other agents, and the daemon user's home by default.

AgentConnect sandboxing is available on supported **Linux** daemons. macOS daemons can run agents, but do not provide this OS boundary.

## Sandboxing and permissions are different

These controls work together:

- A runtime's **Permission mode** controls what the runtime attempts without asking.
- Agent and session [permissions](/docs/permissions-overview) control who may reach or inspect the work.
- **Run in sandbox** limits what the runtime process can access on its host.

Even a runtime using its most permissive permission mode remains inside the AgentConnect sandbox when the sandbox is on.

## Runtime support

AgentConnect can place any ACP runtime inside its Linux OS sandbox. Claude Code and Codex also provide a runtime-native tool boundary that AgentConnect enables inside it.

| Runtime | AgentConnect OS sandbox | Native tool sandbox |
| --- | --- | --- |
| Claude Code | Available | Available |
| Codex | Available | Available |
| Other ACP runtimes | Available | Not integrated |

The native layer is additional protection for model-authored tool work. The AgentConnect OS sandbox remains the main host boundary.

## Prepare a Linux daemon

Install:

- `bubblewrap` (`bwrap`)
- `ripgrep` (`rg`)
- `socat`

The host must also allow unprivileged user namespaces. On Ubuntu or Debian:

```bash
sudo apt-get update
sudo apt-get install --yes bubblewrap ripgrep socat
```

Restart the daemon after installing the dependencies. The daemon runs a live probe and reports sandboxing as available only when the boundary can actually start.

## Enable it for one agent

When adding or editing an agent, select a compatible Linux daemon and turn on **Run in sandbox**.

| State | Meaning |
| --- | --- |
| **On** | Enabled for this agent |
| **Off** | Available but not enabled |
| **Unavailable** | The selected daemon cannot enforce it |
| **Required** | The daemon requires it for every agent |

<p align="center">
  <img src="https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/agent-runtime.png" alt="The sandbox control in agent runtime settings" width="560" />
</p>

## Require it for every agent

For a foreground daemon that must never run an agent without this boundary, add `--require-sandbox` to the connection command:

```bash
npx -y @agentconnect.md/cli run --require-sandbox \
  --api-url <your-control-plane-ws-url> \
  --api-key <your-daemon-key>
```

Required mode is fail-closed: the daemon refuses to start if the sandbox probe fails.

For an installed service, set the same policy in the daemon's existing `config.json`, then restart it:

```json
{
  "security": {
    "requireSandbox": true
  }
}
```

```bash
npx -y @agentconnect.md/cli restart
```

## What the boundary allows

A sandboxed runtime can work in the locations assigned to that agent, including its workspace, private runtime home, and configured memory. It can use secrets, repository credentials, and MCP tools that you deliberately give the agent.

The boundary hides AgentConnect's daemon state, other agents, the daemon user's home, and shared temporary storage. It also prevents writes outside the approved roots and protects Git control files such as hooks and repository configuration.

## Current limits

- AgentConnect does not yet apply a product-level outbound network allowlist.
- A server started inside the isolated network namespace may not be reachable from the host.
- This is not a complete read allowlist for every unrelated path on the machine.
- Resources deliberately assigned to the agent remain available inside the boundary.
- Tools attached to the cloud account a runtime is signed in as sit outside any OS boundary. AgentConnect disables them separately — see [What a runtime sign-in brings](/docs/install-the-daemon#what-a-runtime-sign-in-brings).

Use narrowly scoped credentials and [permissions](/docs/permissions-overview) alongside sandboxing. Use separate OS users or machines when agents require stronger separation from one another or different model-provider accounts.

## Troubleshooting

- **Unavailable** — confirm the daemon runs on Linux, install the required packages, allow unprivileged user namespaces, and restart the daemon.
- **The daemon refuses to start** — required mode is on and the live probe failed. Check the daemon log with `npx -y @agentconnect.md/cli status`.
- **A sandboxed agent cannot start** — verify that its workspace stays inside the agent directory and that the runtime is authenticated as the daemon service user.
- **A local server is unreachable** — use another explicit output path instead of assuming the host can reach the sandbox's loopback interface.

For daemon installation and lifecycle commands, see [Install the daemon](/docs/install-the-daemon). For workspace boundaries, see [Workspaces & repositories](/docs/workspaces-and-repos).
