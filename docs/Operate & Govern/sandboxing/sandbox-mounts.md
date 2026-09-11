---
title: Mounts
excerpt: Share host directories with sandboxed agents, read-only or writable.
hidden: false
---

Use `sandbox.mounts` to give sandboxed agents access to host directories such as reference data, caches, or toolchains. The daemon supplies the workspace and runtime home automatically.

## Mount options

| Field    | Meaning                                                              |
| -------- | -------------------------------------------------------------------- |
| `source` | Existing host path (`~` means the daemon user's home)                |
| `target` | Path inside the sandbox (`~` means the session home in microsandbox) |
| `mode`   | `readonly` (default), `writable`, or `overlay`                       |

| Mode       | Host files            | Session changes                         | Backends     |
| ---------- | --------------------- | --------------------------------------- | ------------ |
| `readonly` | Readable              | Not written through this mount          | Both         |
| `writable` | Readable and writable | Shared with the host and other sessions | Both         |
| `overlay`  | Readable              | Private to each session                 | microsandbox |

Paths must be absolute after `~` expansion. Sources must exist before the daemon starts. Writable mounts need host permissions that allow the runtime user to write (normally UID 10001 inside microsandbox).

## SRT: share a writable cache

SRT requires `source` and `target` to resolve to the same path:

```json
{
  "sandbox": {
    "backend": "srt",
    "mounts": [
      {
        "source": "/srv/agent-cache/pnpm",
        "target": "/srv/agent-cache/pnpm",
        "mode": "writable"
      }
    ],
    "env": {
      "PNPM_CONFIG_STORE_DIR": "/srv/agent-cache/pnpm"
    }
  }
}
```

SRT mounts add access. A `readonly` entry cannot remove write access already granted by a workspace or writable mount.

## microsandbox: map a host directory

microsandbox can expose the directory at a different path:

```json
{
  "sandbox": {
    "backend": "microsandbox",
    "mounts": [
      {
        "source": "/srv/reference-data",
        "target": "/reference",
        "mode": "readonly"
      }
    ]
  }
}
```

Mounts cannot replace protected runtime paths or map different sources to the same target. A nested mount applies its own read/write mode.

## microsandbox: share a cache with private writes

Use `overlay` to reuse a populated host cache while keeping session changes private:

```json
{
  "sandbox": {
    "backend": "microsandbox",
    "mounts": [
      {
        "source": "/srv/agent-cache/pnpm",
        "target": "~/.local/share/pnpm/store",
        "mode": "overlay"
      }
    ],
    "env": {
      "PNPM_CONFIG_STORE_DIR": "${HOME}/.local/share/pnpm/store"
    }
  }
}
```

The host directory stays read-only. Each session's additions and deletions survive VM stop/start and disappear when the VM is rebuilt or removed. New packages downloaded by one session are not added to the shared host cache.

Keep the host cache stable while sessions use it. Overlay sources must be directories, and overlay targets cannot overlap other mounts.

## Apply configuration changes

`sandbox.env` supplies environment defaults to sandboxed runtimes. Agent and runtime settings can override them, except daemon-controlled HOME, XDG, and security settings. Values are literal (pnpm itself expands `${HOME}` in the example above).

Restart the daemon after changing its configuration. Environment-only changes apply when the runtime restarts. Changes to mounts, VM resources, credential layout, or image content rebuild the affected VM on refresh or next use. Host-mounted files are kept; VM-local files, Docker data, and overlay writes are reset.

For older configurations, replace `security.sandboxReadRoots` with `readonly` mounts and `security.sandboxWriteRoots` with `writable` mounts. Keep `source` and `target` equal for SRT. Remove the old fields after converting them. Replace a mount's old `readOnly` field with `mode` as well.
