---
title: 🛡️ Sandboxing
excerpt: Choose a sandbox backend and control which resources agents can access.
hidden: false
---

**Kubernetes:** the official Helm deployment uses [Agent Sandbox](https://github.com/kubernetes-sigs/agent-sandbox) by default to manage agent pods and persistent workspaces. See [Kubernetes deployment](/docs/kubernetes-deployment) for setup and configuration.

**Linux host daemons:** enable **Run in sandbox** to limit an agent's access to the machine. Each sandbox gets a private runtime home and its assigned workspace. Share additional host directories through [mounts](/docs/sandbox-mounts).

## Choose an execution environment

| Option                     | Best for                                    | Environment                                                  |
| -------------------------- | ------------------------------------------- | ------------------------------------------------------------ |
| No sandbox                 | Trusted tasks that need full host access    | Runs directly on the host with the daemon user's permissions |
| SRT                        | Trusted internal development and automation | Host tools with filesystem and network restrictions          |
| microsandbox               | General-purpose tasks and less-trusted code | A separate VM per session                                    |
| Kubernetes (Agent Sandbox) | Teams running many agents across machines   | Centrally managed agent pods and persistent workspaces       |

### Compare Linux daemon backends

| What you use       | SRT (default)                                       | microsandbox                                  |
| ------------------ | --------------------------------------------------- | --------------------------------------------- |
| Tools and packages | Host tools; install in writable paths               | Image tools; install inside the session VM    |
| Host files         | Protected paths hidden; other paths may be readable | Only assigned host mounts                     |
| Shared caches      | Shared read-only or writable mounts                 | Shared mounts or private overlays             |
| Internet           | Through a proxy (tools must support it)             | Public internet (private networks restricted) |
| Local servers      | Not published to the host                           | Not published to the host                     |
| CPU and memory     | No per-session limits configured                    | Configurable per VM                           |
| OAuth credentials  | Tool rules (Claude/Codex); otherwise unshielded     | Same as SRT                                   |
| Saved API keys     | Tool rules (Claude/Codex); otherwise unshielded     | Host proxy (supported saved keys)             |

Both backends write to the assigned workspace. Shared workspaces and writable host mounts remain shared; microsandbox keeps other VM files separate for each session.

Tool rules restrict credential access by the runtime's tools. The host proxy keeps real API keys outside the VM. See [Credential protection](/docs/credential-protection) for supported runtimes, login methods, and limitations.

Technical background: [SRT isolation](https://github.com/anthropics/sandbox-runtime#how-it-works) and [microsandbox](https://github.com/superradcompany/microsandbox).

## Configure the daemon

Add the settings to the daemon's existing `config.json` (normally `~/.agentconnect/config.json`). Keep its existing connection and identity settings.

### SRT

SRT is the default. To select it explicitly:

```json
{
  "sandbox": {
    "backend": "srt"
  }
}
```

On Ubuntu or Debian, install its dependencies:

```bash
sudo apt-get update
sudo apt-get install --yes bubblewrap ripgrep socat
```

The host must allow unprivileged user namespaces. The daemon checks that the sandbox can start.

### microsandbox

```json
{
  "sandbox": {
    "backend": "microsandbox",
    "microsandbox": {
      "cpus": 2,
      "memoryMiB": 2048,
      "diskGiB": 10
    }
  }
}
```

These resource values are defaults. CPU and memory limits apply per VM. `diskGiB` sets the capacity of each writable disk (root, Docker data, and an additional disk when using overlays). Disk files grow as data is written.

microsandbox requires a Linux amd64 host. The daemon user needs access to `/dev/kvm` and `/dev/vhost-vsock`. Virtual hosts need nested virtualization. The daemon installs the microsandbox SDK and prepares the image automatically. An uncached image makes the first startup slower.

### Enable sandboxing

Turn on **Run in sandbox** when adding or editing an agent. To require sandboxing for every agent on the daemon, add:

```json
{
  "security": {
    "requireSandbox": true
  }
}
```

Required mode locks the agent setting on and refuses daemon startup if the selected backend is unavailable. Selecting a backend alone does not enable sandboxing for agents that have it turned off.

Restart after editing the configuration:

```bash
npx -y @agentconnect.md/cli restart
```

For a named instance, add `--instance <name>`. For a foreground daemon, relaunch its existing command (add `--require-sandbox` to enforce sandboxing). See [Upgrade the daemon](/docs/upgrade-the-daemon) for instance commands.

## Runtime image

microsandbox uses the `ghcr.io/agentconnect-md/runtime-sandbox-full` image selected by the installed daemon release. To use a compatible custom image:

```json
{
  "sandbox": {
    "backend": "microsandbox",
    "microsandbox": {
      "image": "registry.example.com/agentconnect/runtime-sandbox-full:build-tag"
    }
  }
}
```

Delete the `image` property to return to the default. Development builds require an explicit image.

Changing the image content, VM resources, mounts, or credential layout rebuilds affected VMs on refresh or next use. Host-mounted workspace, home, and memory files are kept. VM-local files, Docker data, and overlay writes are reset. Keep durable data in host mounts. A new image tag with identical contents reuses the existing VM.

The full image includes Claude Code, Codex, DeepSeek Harness, OpenCode, pi, Oh My Pi, Grok Build, Qwen Code, Cline, Devin, Antigravity ACP, GitHub Copilot, Qoder CLI, and Qoder CN CLI. Antigravity requires AVX support. Amp requires a custom image.

Docker Engine, Buildx, and Compose are also included. Agents can start Docker inside their VM when their runtime permissions allow it. Docker data survives stop/start, but resets when the VM is rebuilt. Codex's tool restrictions currently block the image's sudo-based Docker startup.

## Network access

microsandbox sessions can reach public APIs and package registries. Each VM has its own network environment, so sessions can use the same local port. VM ports are not published to the host.

The policy restricts private-network access, but does not guarantee that every public IP or DNS name leading back to the host is blocked. SRT allows outbound web access through its proxy; tools that ignore proxy settings may fail to connect.

## Troubleshooting

| Message                       | What to check                                                                          |
| ----------------------------- | -------------------------------------------------------------------------------------- |
| Sandbox unavailable           | Backend requirements and daemon logs                                                   |
| Binary not installed in image | The selected image contains the runtime                                                |
| Login required                | The runtime is signed in as the daemon user                                            |
| Mount rejected                | Existing source, valid target, and supported mode (see [Mounts](/docs/sandbox-mounts)) |
| VM replacement failed         | Check image availability and mount access, then retry                                  |

The standalone `chat` command supports SRT. Use daemon-hosted sessions for microsandbox.
