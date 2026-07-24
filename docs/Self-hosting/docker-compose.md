---
title: Docker Compose quickstart
excerpt: Start the Web console, Control Plane, Relay, and PostgreSQL locally, then connect a daemon from your machine.
hidden: false
---

This guide starts a complete local AgentConnect coordination stack. Your agent daemon remains on the host, where it can use local workspaces and your already-authenticated Claude, Codex, or other ACP runtime.

## Before you start

You need:

- Docker Desktop, OrbStack, or Docker Engine;
- Docker Compose v2 (`docker compose version`); and
- Git.

Published AgentConnect images currently target `linux/amd64`. Docker Desktop and OrbStack can run them with emulation on Apple Silicon. See [Build natively on ARM](#build-natively-on-arm) if you prefer a local ARM build.

## 1. Start the stack

Clone the AgentConnect repository and start Compose:

```bash
git clone https://github.com/agentconnect-md/agentconnect.git
cd agentconnect
docker compose up -d --pull always
```

The first run downloads the images, starts PostgreSQL 18, applies all database migrations, creates the fixed local organization required by no-auth mode, and then starts the three long-running services. It does not add sample data.

Check the result:

```bash
docker compose ps --all
```

`postgres`, `control-plane`, `relay`, and `web` should be running and healthy. `migration-files` and `migrate` should show `Exited (0)`; they are successful one-shot initialization jobs.

## 2. Open AgentConnect

Open:

```text
http://localhost:3000
```

The default stack has no sign-in provider. Clicking the continue button enters the single local organization. This mode admits every local request and is safe only while the stack remains bound to `127.0.0.1`.

You can inspect the service probes directly:

```bash
curl http://localhost:8080/readyz
curl http://localhost:8090/readyz
```

## 3. Connect a daemon

The Compose stack does not put the daemon in a container. Keeping it on the host lets it access your local repositories, runtime launchers, and existing Claude or Codex authentication.

In the Web console:

1. Open **Daemons** and choose **Add daemon**.
2. Copy the one-time command shown by the console.
3. Run that exact command in a host terminal.

The generated command points at the local Control Plane. After the daemon connects, it also receives the local Relay address and opens an outbound Relay connection automatically.

If the daemon runs on another machine, `localhost` points at that machine instead of the Docker host. Configure host-reachable public URLs first; see [Network and public URLs](/docs/self-hosting-configuration#network-and-public-urls).

## Logs and status

Follow every service:

```bash
docker compose logs -f
```

Or narrow the output:

```bash
docker compose logs -f control-plane relay web
```

## Update

Pull current images and reconcile the stack:

```bash
docker compose pull
docker compose up -d
```

The migration job is idempotent and runs before the updated Control Plane starts. If you created `compose.env`, add `--env-file compose.env` to both commands. To keep a reproducible deployment, pin `AGENTCONNECT_VERSION` to a release tag in that file; see [Image version and platform](/docs/self-hosting-configuration#image-version-and-platform).

## Stop or reset

Stop the services without deleting the database:

```bash
docker compose down
```

Start them again with `docker compose up -d`; the `agentconnect_postgres-data` volume preserves your configuration.

To permanently delete the local database and start from an empty installation:

```bash
docker compose down --volumes
```

> This deletes all Control Plane metadata in the Compose database. It cannot be undone. Daemon-local workspaces and transcripts are outside this volume and are not deleted by this command.

## Build natively on ARM

To build the four required images from the checked-out source for `linux/arm64`:

```bash
AGENTCONNECT_PLATFORM=linux/arm64 docker compose build
AGENTCONNECT_PLATFORM=linux/arm64 docker compose up -d --pull never
```

Use the same `AGENTCONNECT_PLATFORM` value for subsequent Compose commands so every service selects the locally built ARM image.

## Next

- [Configure the stack](/docs/self-hosting-configuration)
- [Install the daemon as a service](/docs/install-the-daemon)
- [Learn how AgentConnect keeps execution daemon-local](/docs/how-it-works)
