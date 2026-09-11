---
title: 🛡️ Sandboxing
excerpt: Choose SRT or microsandbox, configure filesystem mounts, and require sandboxed execution on your daemon.
hidden: false
---

**Run in sandbox** confines an agent runtime on its daemon. The daemon operator chooses the backend and the host paths it may access; agent editors choose whether to enable sandboxing unless the daemon requires it.

This page covers **self-hosted Linux daemons**. AgentConnect Cloud and Kubernetes pool execution use their own deployment configuration. macOS support for these daemon sandbox backends is not implemented yet.

## Choose a backend

|                       | SRT (`srt`)                                                                                   | microsandbox (`microsandbox`)                                                         |
| --------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Default               | Yes                                                                                           | Opt in                                                                                |
| Execution             | Linux processes confined with Sandbox Runtime and bubblewrap; uses host runtime installations | Linux VM; uses runtime binaries installed in its OCI image                            |
| Host requirements     | `bwrap`, `rg`, `socat`, and working unprivileged user namespaces                              | Usable KVM and vsock devices; enough disk and memory for the VMs                      |
| Filesystem mappings   | Add access at the same host path                                                              | Map host paths to different guest paths; optional private writable overlays           |
| Session environment   | Private runtime HOME and temporary directory                                                  | New sessions get their own VM, HOME, network environment, and retained writable disks |
| Credential protection | Runtime-native restrictions for Claude Code and Codex                                         | The same native restrictions, plus host-side API key injection for supported runtimes |

Only `srt` and `microsandbox` are accepted backend values.

Both backends protect daemon state and resources belonging to other agents while providing the assigned workspace and runtime HOME. SRT limits writes and hides protected host paths, but is not a complete read allowlist for every unrelated path on the host. Shared workspaces and writable operator mounts remain shared by design.

A runtime's **Permission mode** controls which actions it attempts without asking. [Agent and session permissions](/docs/permissions-overview) control who may use or inspect the agent. The sandbox controls the runtime's access to its execution environment. These settings serve different purposes.

## Configure the daemon

Merge these settings into the daemon's existing `config.json`, normally `~/.agentconnect/config.json`. Keep its identity and connection settings. For another daemon instance or root, edit that instance's configuration.

### SRT

SRT remains the default when `sandbox.backend` is omitted:

```json
{
  "sandbox": {
    "backend": "srt"
  }
}
```

On Ubuntu or Debian, install its host dependencies:

```bash
sudo apt-get update
sudo apt-get install --yes bubblewrap ripgrep socat
```

The host must allow unprivileged user namespaces. The daemon runs a live sandbox probe; installing the packages alone does not establish availability.

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

The numbers shown are defaults, not workload sizing recommendations. CPU and memory limits apply per VM. `diskGiB` is the capacity of **each writable disk**, not a total per-session disk quota: a VM has root and Docker data disks, plus a disk when overlay mounts are used. Disks are sparse and consume host storage as they fill.

The daemon service user needs access to `/dev/kvm` and `/dev/vhost-vsock`. The current default image targets Linux amd64; Antigravity also needs AVX support. On a virtual host, usable nested virtualization is required. Startup prepares the image, boots a temporary VM, checks its runtime table, and verifies stop/start before admitting VM launches.

The daemon installs its pinned microsandbox SDK automatically. Host Docker Engine is not required for this backend.

### Require sandboxing

Selecting a backend does **not** enable sandboxing for agents that have it turned off. To require it for every agent on this daemon, add:

```json
{
  "security": {
    "requireSandbox": true
  }
}
```

Required mode refuses daemon startup if the selected backend cannot start. The console locks **Run in sandbox** on for every agent. For a foreground daemon, `--require-sandbox` applies the same requirement using the configured backend.

Without this requirement, editors can turn on **Run in sandbox** in an agent's configuration. An unavailable microsandbox backend refuses requested VM launches; it does not silently run them on the host or switch them to SRT. Use required mode when sandboxing must be mandatory, including with SRT.

Restart after editing the configuration:

```bash
npx -y @agentconnect.md/cli restart
```

For multiple installed instances, include `--instance <name>` as described in [Upgrade the daemon](/docs/upgrade-the-daemon). Relaunch a foreground daemon with its existing command instead.

## Filesystem mounts

Use the top-level **`sandbox.mounts`** list for both backends. It is outside `sandbox.microsandbox`. The daemon already provisions the workspace, private HOME, runtime state, and its tool channels; mounts add operator-selected resources such as package caches or toolchains.

| Field    | Meaning                                                                                                                                                              |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source` | Existing absolute host path. A leading `~` resolves against the daemon user's HOME.                                                                                  |
| `target` | Path visible to the runtime. SRT requires the same normalized path as `source`. microsandbox accepts an absolute guest path or `~/...` relative to the session HOME. |
| `mode`   | `readonly` by default; `writable` for direct host writes; `overlay` for private session writes in microsandbox.                                                      |

### Share a writable cache with SRT

Create the host directory with permissions suitable for the daemon user, then configure:

```json
{
  "sandbox": {
    "backend": "srt",
    "env": {
      "PNPM_CONFIG_STORE_DIR": "/srv/agent-cache/pnpm"
    },
    "mounts": [
      {
        "source": "/srv/agent-cache/pnpm",
        "target": "/srv/agent-cache/pnpm",
        "mode": "writable"
      }
    ]
  }
}
```

All sessions using this writable mount can change the same host contents. SRT access is additive: a `readonly` entry does not remove write access granted by a workspace or another writable entry.

### Map a host path into microsandbox

```json
{
  "sandbox": {
    "backend": "microsandbox",
    "mounts": [
      {
        "source": "/srv/reference-data",
        "target": "/reference",
        "mode": "readonly"
      },
      {
        "source": "/srv/agent-cache/pnpm",
        "target": "/cache/pnpm",
        "mode": "writable"
      }
    ],
    "env": {
      "PNPM_CONFIG_STORE_DIR": "/cache/pnpm"
    }
  }
}
```

microsandbox applies guest mount permissions. A read-only child can restrict part of a writable parent; a writable child can remain writable inside a read-only parent. Two different sources cannot map to the same target. Protected runtime paths and automatically provisioned VM paths cannot be replaced by operator mounts, although permitted children of the session HOME can be mounted.

The guest normally runs as user `agent` (UID 10001). A writable mount still needs compatible host filesystem permissions. A guest workspace path can match a host path without exposing the host's entire parent directory.

### Share a cache base with private session writes

For microsandbox, `overlay` lets sessions reuse a populated host directory while keeping their additions, edits, and deletions private:

```json
{
  "sandbox": {
    "backend": "microsandbox",
    "env": {
      "PNPM_CONFIG_STORE_DIR": "${HOME}/.local/share/pnpm/store"
    },
    "mounts": [
      {
        "source": "/srv/agent-cache/pnpm",
        "target": "~/.local/share/pnpm/store",
        "mode": "overlay"
      }
    ]
  }
}
```

The source must be an existing directory. Each session's writable layer survives VM stop/start and is removed when its VM is retired. It never writes back to the host base, and a cache miss in one session is not automatically shared with another. Keep the base stable while sessions use it. Overlay targets cannot overlap other configured mounts. SRT rejects `overlay` mode.

This shares package-store contents, not `node_modules` or every package-manager metadata cache. Check `pnpm store path` inside the actual session; a populated store alone does not guarantee fully offline installation.

### Environment defaults and configuration changes

`sandbox.env` supplies string values to sandboxed session runtimes. Runtime and agent variables override these defaults; daemon-owned HOME, XDG, and security settings remain authoritative. Unsandboxed agents and host compatibility probes do not receive these defaults.

Values are passed literally. AgentConnect does not expand `${HOME}`, `~`, or shell commands in environment values. In the example above, **pnpm** expands `${HOME}`. This is separate from the mount path expansion described earlier.

After a daemon restart, an environment-only change takes effect when the runtime restarts. Changing the backend, resource settings, or mount layout may make a retained VM incompatible; use a new session rather than assuming an existing VM is reconfigured. Retiring a VM does not delete operator-owned host mount contents. Preserve needed work before retiring a session.

### Migrate older configurations

Remove these old fields after converting them; they are no longer accepted:

| Old setting                                             | Replacement in `sandbox.mounts`                                                                |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `security.sandboxReadRoots: ["/opt/toolchain"]`         | `{ "source": "/opt/toolchain", "target": "/opt/toolchain", "mode": "readonly" }`               |
| `security.sandboxWriteRoots: ["/srv/agent-cache/pnpm"]` | `{ "source": "/srv/agent-cache/pnpm", "target": "/srv/agent-cache/pnpm", "mode": "writable" }` |
| Mount `readOnly: true` / `false`                        | Mount `mode: "readonly"` / `"writable"`                                                        |

Keep previously writable paths writable. There is no automatic migration of the removed fields.

## Runtime images

Published daemon releases carry their default **`ghcr.io/agentconnect-md/runtime-sandbox-full`** image reference. Leaving `sandbox.microsandbox.image` absent uses that release's default. The daemon does not discover its default image from a Kubernetes pool or automatically track `latest`.

To use a compatible custom image, set an explicit reference:

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

Delete the `image` property to return to the release default; an empty string is invalid. Source/development builds require an explicit image. A custom image must satisfy the daemon's runtime-image contract and pass its startup checks; an arbitrary Linux image is insufficient.

The pool's **`runtime-sandbox`** image and the daemon's **`runtime-sandbox-full`** image share a base. The full image adds more agent runtimes, bubblewrap, socat, and Docker tooling. An installed host runtime is not automatically installed in the image. See the [runtime inventory and validation table](/docs/sandbox-runtime-support).

New sessions use an updated default or override. Existing sessions keep their original image; restarting the daemon does not upgrade retained VM disks in place.

## Networking and Docker

microsandbox uses a fixed public-outbound network policy and configures no published host ports. New session VMs have separate network environments, even when their workspace files are shared. Public model APIs, Git, and package registries can be reached; guest-local services can communicate within their VM.

The intended boundary blocks peer VMs and host/private-network services. **Complete network-isolation acceptance remains open**, including access to the host through its public IP or DNS name. Do not treat the current policy as proof that every host address is blocked. SRT retains its existing proxy/network behavior and does not provide this VM network topology.

The full image includes Docker Engine, Buildx, and Compose. The agent starts Docker inside its VM when needed; there is no daemon `docker: true` setting, automatic startup, or Docker readiness gate. The backend does not mount the host Docker socket. Docker data stays on a retained VM disk.

Docker/Compose/Testcontainers acceptance through actual native agent tools is still pending. In particular, the current Codex native tool restriction prevents the image's sudo-based Docker startup from elevating. Image inclusion alone does not establish that this workflow works for every runtime.

Two VMs can use the same guest port without a host-port conflict. This does not create a host port mapping or a remote browser preview. There are no daemon network-mode or port-forwarding options in this implementation.

## Credential protection and runtime compatibility

A sandbox hides host resources that were not assigned to it. It does **not**, by itself, hide a credential deliberately mounted or copied into the same environment from that runtime's tools.

Claude Code and Codex use additional native tool restrictions. Supported microsandbox API logins instead receive placeholders while the real key stays with the host-side proxy. OAuth keeps native login and refresh; it is not sent through an OAuth credential proxy.

See [Sandbox runtime support](/docs/sandbox-runtime-support) for the tested combinations, exact credential sources, and differences between OAuth and API key protection. Explicit [agent secrets](/docs/variables-and-secrets), tools, and repository access remain capabilities you give the agent. Account-linked cloud tools are controlled separately by [runtime sign-in isolation](/docs/install-the-daemon#what-a-runtime-sign-in-brings).

## Troubleshooting

- **Sandbox unavailable:** check the selected backend's requirements as the daemon service user. SRT needs working user namespaces and its host tools; microsandbox needs working KVM/vsock access, a compatible image, and resources. Inspect the daemon log after restart.
- **Binary not installed in image:** use an image containing that runtime. Installing it on the host does not change the VM image.
- **Login required:** authenticate as the daemon service user and check that the runtime's credential format is supported. An existing directory or a successful model listing does not prove a valid login.
- **Mount rejected:** check source existence, normalized paths, target collisions, and protected paths. SRT requires `source` and `target` to match and cannot use overlays.
- **Retained VM configuration mismatch:** preserve existing work and start a new session with the new configuration. The daemon does not automatically discard incompatible VM data.
- **First startup takes longer:** an uncached image must be downloaded and prepared before the VM probe can run. Warm image reuse avoids that initial work.
- **Standalone `chat` command:** currently supports SRT, but refuses microsandbox configuration. Use daemon-hosted sessions for microsandbox.

Remaining workload, network, platform, and lifecycle work is tracked in [sandbox follow-ups](https://github.com/agentconnect-md/agentconnect/issues/1874).
