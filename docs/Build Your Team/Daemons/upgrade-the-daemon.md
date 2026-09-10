---
title: ⬆️ Upgrade the daemon
excerpt: Move a daemon to a new release from the console or the host, keep the CLI current, and roll back a bad upgrade.
hidden: false
---

A daemon host has two independently versioned pieces:

| Piece | What it is | How it moves |
| --- | --- | --- |
| **CLI** — `@agentconnect.md/cli`, the `agentconnect` command | The stable entry point: service lifecycle, login, version management | An npm package you update on the host |
| **Daemon release** | The payload that hosts agents, drives runtimes and holds platform connections | Downloaded by the CLI into the daemon root and selected by the `current` pointer |

Almost every upgrade is a daemon-release upgrade. The CLI stays put for long stretches, because new daemon commands are delegated to the daemon and do not need a matching CLI release.

Releases live side by side under the daemon root, so a switch is a pointer move and a restart, not a reinstall:

```
~/.agentconnect/
├── versions/            # installed daemon releases
├── current              # the active release
└── versions.json        # release channel and the rollback target
```

## Upgrade from the console

An outdated daemon shows an **Update to \<version\>** badge on the **Daemons** page. Open the daemon and use **Upgrade**.

This needs the ordinary daemon edit permission: any Owner or Collaborator who can see the daemon. Viewers cannot.

The Control Plane sends only the target version — the registry, the package and the download stay local to the CLI on the host. The daemon then installs the target, switches `current`, drains its work and exits with a planned restart code, and its supervisor launches the new release. The daemon shows **Upgrading** until it is ready again.

An upgrade is recorded as successful only when the daemon reconnects and reports the version that was requested, so an old release relaunching cannot be mistaken for a completed upgrade. One lifecycle operation is allowed per daemon at a time.

Two limits worth knowing:

- **A remote upgrade has no process-level automatic rollback.** Once the old daemon has exited, recovery is a host-side job — see [Roll back](#roll-back). A local `upgrade --restart` does roll back on its own.
- **The console offers Upgrade only while the daemon is online.** An offline or stuck daemon has to be upgraded from the host, or queued through the upgrade endpoint in the [API reference](/reference) (`POST /v1/orgs/{orgId}/daemons/{id}/upgrade`). A queued upgrade is picked up at the daemon's next authenticated connection, before full startup, which is what recovers a daemon that never reaches ready. Daemons old enough to predate that path need an online connection or a host-side upgrade.

## Upgrade a service-installed daemon on the host

For a daemon [installed as a service](/docs/install-the-daemon#run-it-permanently), one command does the whole sequence:

```bash
npx -y @agentconnect.md/cli upgrade --restart
```

It resolves the newest release on the selected channel, installs it, switches `current`, restarts the service, then health-checks the result and rolls back if that check fails.

The health check is deliberately process-level: it samples the service over a few seconds and passes only if the daemon is running on one stable PID, which catches a crash loop. It does not prove the daemon reached the Control Plane — the console's daemon status is the stronger signal, so check there too after upgrading a connected daemon.

Two variations to expect:

- **Without `--restart`**, `current` is switched but the running daemon is untouched; the new release takes effect at its next restart. Useful when you want to stage the switch and pick the restart window yourself.
- **With no service installed**, `--restart` reports that there was nothing to restart and leaves the new release selected. A foreground `agentconnect run` applies it when it next relaunches.

Confirm the outcome:

```bash
npx -y @agentconnect.md/cli version list   # channel, installed releases, current, previous
npx -y @agentconnect.md/cli status         # service state, PID, log path
```

If the host runs more than one daemon service, pass `--instance <name>` to every command so it addresses that instance's service and daemon root rather than the default one.

### Choose a version or a channel

```bash
npx -y @agentconnect.md/cli upgrade --to <version> --restart   # a specific release
npx -y @agentconnect.md/cli upgrade --channel rc --restart     # switch to prereleases
```

The channel is stored in the daemon root and becomes the default for later upgrades, so `--channel` is a change of track rather than a one-off. `stable` and `rc` are the two channels.

To canary a release without committing the host to it, install it now and activate it later:

```bash
npx -y @agentconnect.md/cli version install <version>   # download only; current is unchanged
npx -y @agentconnect.md/cli version use <version>       # switch current, without restarting
npx -y @agentconnect.md/cli restart                     # apply it
```

Each daemon root carries its own copy of every release it has installed, which is what lets one instance on a host canary a version while the others stay on the old one.

### Old releases

Every install and upgrade trims the store afterwards, keeping three releases in total by default. The active release and the rollback target are always protected. Pass `--keep <n>` to change the retention or `--keep 0` to keep everything.

Cleanup is best effort and skips itself while a daemon is live, because a running daemon keeps loading files from the bundle it was launched under. Releases reported as kept are reclaimed by a later `version prune`.

## Roll back

A local `upgrade --restart` that fails its health check switches back to the previous release and restarts it for you, and reports the rollback as a failure.

Otherwise, roll back by hand:

```bash
npx -y @agentconnect.md/cli version list          # `previous` is the rollback target
npx -y @agentconnect.md/cli version use <version>
npx -y @agentconnect.md/cli restart
```

A foreground `agentconnect run` in an interactive terminal handles this itself: when the daemon fails to start up, it offers to switch back to the previous release, or to re-download the channel's latest release in case the installed bundle is corrupt, and retries. A service run never prompts — its supervisor has to see the real exit code.

## Upgrade the CLI

`npx` resolves the package each time it runs, so pin `@latest` when you want to be certain you are not reusing a cached older CLI:

```bash
npx -y @agentconnect.md/cli@latest version list
```

On a machine that runs a service, install the CLI globally instead. It gives the CLI a stable path on disk, which matters for the service definition:

```bash
npm install -g @agentconnect.md/cli@latest
agentconnect status
```

The CLI needs **Node.js 24.12 or newer** — the same floor as the daemon.

### Reinstall the service after the CLI or Node moves

The service supervises the CLI, and the CLI supervises the daemon. The service definition records **the Node executable and the CLI entry path that existed when you installed it**, and it does not re-resolve either one. It does re-resolve `current` at every launch, which is why daemon upgrades need no service changes at all.

So reinstall the service after anything that moves those two paths — a Node upgrade or a switch of Node version manager, or a CLI install that lands at a different path (notably moving from `npx`, whose entry sits in the npx cache, to a global install):

Run it with the CLI you want the service to use from then on, since that is the entry path it records:

```bash
agentconnect install-service   # rewrites the definition in place
agentconnect restart           # `up` if the service is currently stopped
```

Reinstalling the same instance is idempotent. `install-service` only writes the definition; it does not start anything.

A stale definition usually shows up as a service that will not start after a Node upgrade, or one that breaks after the npx cache is cleared. `agentconnect status` prints the log path to confirm.

## Good to know

- **Upgrades drain, within a grace period.** The daemon stops accepting new turns and gives in-flight work a bounded window to finish — 25 seconds by default for ordinary local work — then cancels whatever is left and stops its runtimes. An upgrade is not an abrupt kill, but a long-running turn can still be interrupted, so pick the window accordingly. Expect the daemon to be briefly unreachable while it relaunches.
- **Keep runtimes current too.** Agent runtimes on the host are upgraded with their own tools, not by the daemon. Some of AgentConnect's protections depend on switches that only newer runtime releases publish — see [What a runtime sign-in brings](/docs/install-the-daemon#what-a-runtime-sign-in-brings). Restart the daemon after changing a runtime installation or the service user's `PATH`.
- **Kubernetes installs upgrade differently.** An install-wide daemon pool moves with its Helm release, not with these commands. See [Kubernetes deployment](/docs/kubernetes-deployment#upgrade).
