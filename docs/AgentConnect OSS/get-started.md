---
title: 🏁 Get started
excerpt: Start the open-source AgentConnect stack locally with Docker Compose, while agents and workspaces stay on your own machines.
hidden: false
---

AgentConnect OSS is the open-source, self-hosted AgentConnect stack. It gives you control over the Web console, Control Plane, Relay, and PostgreSQL, while agent execution remains in daemons on the machines that own the workspaces. The source is available in the [AgentConnect repository](https://github.com/agentconnect-md/agentconnect).

## Before you start

You need:

- Docker Desktop, OrbStack, or Docker Engine;
- Docker Compose v2 (`docker compose version`); and
- Git.

Published AgentConnect application and migration images currently target `linux/amd64`, and the Compose file pins that platform. Docker Desktop and OrbStack can run the stack with emulation on Apple Silicon.

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

If the daemon runs on another machine, `localhost` points at that machine instead of the Docker host. Configure host-reachable public URLs first; see [Network and public URLs](/docs/deployment-and-configuration#network-and-public-urls).

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

The migration job is idempotent and runs before the updated Control Plane starts. If you created `compose.env`, add `--env-file compose.env` to both commands. To keep a reproducible deployment, pin `AGENTCONNECT_VERSION` to a release tag in that file; see [Image versions](/docs/deployment-and-configuration#image-versions).

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

## What AgentConnect OSS includes

| Component     | Where it runs                | Purpose                                                                                              |
| ------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| Web console   | Docker                       | Configure agents, integrations, schedules, and inspect activity                                      |
| Control Plane | Docker                       | Store control metadata, authenticate users and coordinate daemons                                    |
| Relay         | Docker                       | Accept webchat, webhook, GitHub, and shared-bot ingress and forward it directly to the owning daemon |
| PostgreSQL    | Docker by default            | Persist Control Plane metadata                                                                       |
| Daemon        | Your host or another machine | Run agents, own workspaces and conversations, and connect directly to supported chat platforms       |

The Compose stack also runs a short-lived migration job. It applies the selected Control Plane image's database migrations. When sign-in is disabled, Control Plane startup initializes only the fixed local organization required by no-auth mode; it does not add sample data.

## Relay and direct connections

The Relay is optional in the AgentConnect architecture, but it is included in the bundled Compose topology so every integration works without changing the stack.

| Connection path   | Used for                                                                                        | Public ingress required?                                          |
| ----------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Daemon direct     | Daemon-owned platform connections such as Slack Socket Mode, Telegram, Discord, and Feishu/Lark | No. The daemon opens outbound connections from the agent host     |
| Through the Relay | GitHub App events, generic webhooks, webchat and Agent API traffic, and shared Slack HTTP bots  | Yes. The Relay accepts the callback and forwards it to the daemon |

Relay-delivered messages go directly from the Relay to the owning daemon. The Control Plane distributes routing metadata, but it does not carry or persist the message body.

If you operate only daemon-direct integrations, the Relay is not on their message path. However, the provided Compose file always starts one Relay, and the Web service declares it as a dependency. There is currently no bundled no-Relay Compose profile. Stopping the Relay disables the Relay-backed features in the table even though established daemon-local sessions and direct platform connections can continue.

## Choose the right deployment

The included Docker Compose setup is designed for **local evaluation and single-host development**:

- it binds published ports to `127.0.0.1`;
- it starts one Relay and one Control Plane;
- it uses local-only default credentials; and
- it enables no-auth mode unless you configure an OIDC provider.

It is not an HA production topology. Before exposing AgentConnect to a network, configure real sign-in, replace every default secret, use TLS, operate PostgreSQL backups, and provide a production ingress that supports WebSockets.

## Data boundaries stay the same

AgentConnect OSS does not move agent execution into the central stack. Message bodies, attachment bytes, workspaces, and live agent-session streams remain daemon-local. The Control Plane stores coordination metadata. Relay-delivered content goes from the Relay to the owning daemon rather than through the Control Plane.

## Next

- [Deployment and configuration](/docs/deployment-and-configuration)
- [Configure optional Mem0 memory](/docs/deployment-and-configuration#optional-mem0)
- [Install the daemon as a service](/docs/install-the-daemon)
- [Learn how AgentConnect keeps execution daemon-local](/docs/how-it-works)
