---
title: 🛡️ Sandboxing
excerpt: Confine agent runtimes on Linux, choose per-agent or daemon-wide enforcement, and understand the boundary.
hidden: false
---

**Run in sandbox** starts an agent runtime inside an OS-enforced boundary on its daemon. It gives the runtime a private home and temporary directory, limits where it can write, and hides AgentConnect state, other agents, and the daemon user's home by default.

Sandboxing is currently available on **Linux only**. The daemon uses [`@anthropic-ai/sandbox-runtime`](https://www.npmjs.com/package/@anthropic-ai/sandbox-runtime), backed by `bubblewrap`, and runs a live capability probe when it starts.

## Sandboxing and permissions are different

These controls compose; none replaces another:

- A runtime's **Permission mode** controls what the runtime attempts without asking. For example, Codex **Read Only** is a runtime-level policy.
- Agent and session [permissions and visibility](/docs/permissions-overview) control which people and agents can reach or inspect the work.
- **Run in sandbox** is an outer, kernel-enforced boundary around the runtime process. Even a runtime set to **Full Access** remains inside this boundary when sandboxing is on.

Use permission modes to shape normal agent behavior. Use sandboxing to limit the effect of a runtime, tool, or prompt that behaves unexpectedly.

## Runtime sandbox support

AgentConnect can place any ACP runtime inside the outer Linux OS sandbox when its daemon supports **Run in sandbox**. Some runtimes can also add a second, runtime-native boundary around model-authored tool processes. That inner layer is runtime-specific and does not replace the outer sandbox.

| Runtime | Inner tool sandbox | Effective boundary |
| --- | --- | --- |
| **Claude Code** | Available | Outer OS + native Bash sandbox |
| **Codex** | Pending | Outer OS only |
| **Other ACP runtimes** | Not integrated | Outer OS only |

For Claude Code, AgentConnect automatically enables the native Bash sandbox inside the outer boundary. Model-authored Bash and its child processes cannot read the Claude credentials retained by the trusted parent. In-process file tools and trusted stdio MCP servers stay outside the inner sandbox, but remain inside the outer AgentConnect boundary.

Codex permission modes still control normal approval and access policy; AgentConnect does not yet add a second credential-isolating boundary. For other runtimes, the outer OS sandbox is the documented isolation boundary. The table describes AgentConnect integration, not every feature a runtime may offer on its own.

## Prepare a Linux daemon

The host must provide:

- `bwrap` (`bubblewrap`), `socat`, and `rg` (`ripgrep`)
- Linux support for unprivileged user namespaces
- Node.js 24 or newer, as required by the daemon itself

For example, on Ubuntu or Debian:

```bash
sudo apt-get update
sudo apt-get install --yes bubblewrap ripgrep socat
```

Restart the daemon after installing the dependencies. It does not trust the presence of binaries alone: it launches a short sandboxed process to verify that the required mechanism can start. When the probe succeeds, the daemon reports the **sandbox** capability to the console.

macOS and Windows daemons report sandboxing as unavailable. They can still run agents, but the AgentConnect OS sandbox described on this page is not active.

## Enable it for one agent

When adding or editing an agent, select a compatible Linux daemon and turn on **Run in sandbox**. The control reports one of four states:

| State | Meaning |
| --- | --- |
| **On** | Requested and supported |
| **Off** | Supported but not requested |
| **Unavailable** | Probe failed; cannot be enabled |
| **Required** | Daemon policy locks it on |

If you move an agent to another computer, save the computer change before adjusting sandboxing. Availability always comes from the newly selected daemon rather than from the agent's previous machine.

## Require it for every agent

Per-agent sandboxing is optional by default. For a foreground daemon that must never run an unconfined agent, add `--require-sandbox` to the command you copy from **Daemons → Add daemon**:

```bash
npx -y @agentconnect.md/cli run --require-sandbox \
  --api-url <your-control-plane-ws-url> \
  --api-key <your-daemon-key>
```

The flag applies to that daemon process and does not modify `config.json`.

For an installed background daemon, make the requirement persistent in its `config.json` (under `~/.agentconnect` by default):

```json
{
  "security": {
    "requireSandbox": true
  }
}
```

Merge this into the existing file rather than replacing its other settings, then restart the daemon:

```bash
npx -y @agentconnect.md/cli restart
```

Required mode is fail-closed: if the host is unsupported or the live probe fails, the daemon refuses to start. When it succeeds, the console shows **Run in sandbox: Required** for every agent placed there.

## What the boundary allows

Each sandboxed runtime gets an isolated Linux environment, private `HOME`, and private temporary storage.

The runtime can write to:

- its workspace
- its private runtime home
- its AgentConnect-managed memory directory
- narrowly scoped credential storage needed for supported login refreshes

The runtime can read the workspace, its private home and memory, AgentConnect-materialized configuration secrets such as `KUBECONFIG` or Docker config, and the trusted runtime and MCP code needed to start its tools. Those materialized configuration files are read-only. AgentConnect also protects Git control files such as hooks and repository configuration from sandboxed writes.

The sandbox hides the daemon configuration and state, other agents' directories, the daemon user's home and runtime-state directories, and shared temporary directories. A process cannot make host-filesystem changes outside the allowed write roots even if the same path appears writable inside its private mount namespace.

The trusted parent process for Claude Code, Codex, Qoder CLI, and Qoder CN CLI keeps using the login of the OS user that runs the daemon through narrowly exposed credential storage, so token refreshes can persist. The rest of each runtime's state lives in its private home. When Claude Code's inner tool sandbox is active, model-authored Bash cannot read the Claude credentials retained by that trusted parent. Treat model-provider identity as daemon-user scoped: use separate daemon users or machines when agents must use different provider accounts.

## Current limits

Sandboxing is a strong runtime write boundary, but it is not every security control at once:

- **Network egress is not restricted by AgentConnect policy yet.** Proxy-aware HTTP and HTTPS clients retain outbound access, and Unix sockets remain allowed for compatibility.
- The isolated network namespace can make an agent-started local server unreachable from the host, and clients that ignore proxy settings may not work.
- This is not a whole-host read allowlist. AgentConnect hides its own state, the daemon user's home, runtime state, other agents, and shared temporary storage, but unrelated host paths outside those protected roots may remain readable.
- Secrets, MCP servers, repository credentials, and other resources deliberately assigned to the agent remain available inside the sandbox. Use [permissions](/docs/permissions-overview), scoped credentials, and separate daemon users alongside sandboxing.

Implementation follow-ups for tighter host-read, network, socket, and non-Linux boundaries are tracked in [agentconnect#312](https://github.com/agentconnect-md/agentconnect/issues/312).

## Failure behavior

The guarantee depends on how the daemon is configured:

- **Optional mode:** if sandbox support disappears, the daemon reports it as unavailable. A previously requested agent may run without confinement and the daemon logs a warning. Do not rely on the per-agent toggle as a hard guarantee after host changes.
- **Required mode:** the daemon refuses startup unless the live Linux sandbox probe succeeds, so no agent on that daemon can silently fall back to an unconfined process.
- **Unsafe layout:** when sandboxing is effective but an agent's workspace or runtime home escapes its trusted agent directory, that agent fails to start rather than running unconfined.

Use required mode on production or shared machines where running unconfined is unacceptable.

## Troubleshooting

- **The console says Unavailable** — confirm the daemon runs on Linux, install `bubblewrap`, `ripgrep`, and `socat`, verify that unprivileged user namespaces are permitted, then restart the daemon.
- **The daemon refuses startup** — required mode is on and the live probe failed. Check the daemon log (`npx -y @agentconnect.md/cli status` prints its path) before disabling the policy.
- **One sandboxed agent will not start** — check for a manually configured workspace outside that agent's directory. AgentConnect refuses layouts it cannot confine safely.
- **Claude Code, Codex, or Qoder asks you to sign in** — authenticate that runtime as the same OS user that runs the daemon, then restart the agent host or daemon. For Qoder, a reported conflict between old per-agent and host authentication must be resolved before the daemon will choose either credential set.
- **A local development server is unreachable** — the runtime runs in an isolated network namespace. Use a platform message, committed output, or another explicitly exposed interface instead of assuming the host can reach the sandbox's loopback port.

For daemon installation and lifecycle commands, see [Install the daemon](/docs/install-the-daemon). To understand which files belong to an agent, see [Workspaces & repositories](/docs/workspaces-and-repos).
