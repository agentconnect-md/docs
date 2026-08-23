---
title: 🏁 Get started
excerpt: Choose Docker Compose for a local evaluation or Helm for a production-shaped Kubernetes deployment.
hidden: false
---

AgentConnect OSS is the open-source, self-hosted AgentConnect stack. Choose Docker Compose for a local evaluation with daemons on your own machines, or the official Helm chart for a production-shaped deployment with agents running in isolated Kubernetes sandboxes.

The source is available in the [AgentConnect repository](https://github.com/agentconnect-md/agentconnect).

This page follows the Docker Compose path. For a cluster deployment, go to [Kubernetes deployment](/docs/kubernetes-deployment).

## Before you start

You need:

- Docker Desktop, OrbStack, or Docker Engine;
- Docker Compose v2 (`docker compose version`); and
- Git.

Published AgentConnect images currently target `linux/amd64`. Docker Desktop and OrbStack can run them with emulation on Apple Silicon.

## 1. Start the stack

```bash
git clone https://github.com/agentconnect-md/agentconnect.git
cd agentconnect
docker compose up -d --pull always
```

To build the images from the checkout instead of pulling the published ones, run `docker compose up -d --build`. Every service in `compose.yaml` carries a build definition, and the built images take the tags the stack already references. The build targets `linux/amd64` like the published images, so it is emulated and slow on Apple Silicon.

The first run starts PostgreSQL 18, applies the database migrations, initializes the local no-auth organization, and starts the application services. It adds no sample data. The built-in `agentconnect` agent is enabled by default and can be disabled in [Setup](/docs/deployment-and-configuration#setup-server).

Check the stack:

```bash
docker compose ps --all
```

`postgres`, `control-plane`, `relay`, `setup-server`, and `web` should be running. `migration-files` and `migrate` should show `Exited (0)`; they are successful one-shot jobs.

## 2. Open AgentConnect

Open [http://localhost:3000](http://localhost:3000).

The default stack binds its ports to `127.0.0.1`, and sign-in is disabled. Keep this mode local.

You can check the service probes directly:

```bash
curl http://localhost:8080/readyz
curl http://localhost:8090/readyz
```

## 3. Connect a daemon

The Compose stack deliberately does not run the daemon in a container. Keeping it on the host gives agents access to local repositories, runtime launchers, and existing Claude or Codex authentication.

In the Web console:

1. Open **Daemons** and choose **Add daemon**.
2. Copy the one-time command.
3. Run that exact command on the machine that should host the agents.

The daemon connects to the Control Plane and Relay with outbound connections. If it runs on another machine, configure host-reachable URLs first; see [Network and public URLs](/docs/deployment-and-configuration#network-and-public-urls).

## Guided setup

Past the local stack — sign-in, public URLs, provider apps, and production hardening — a guided path helps. The repository ships a setup skill for Claude Code at `.claude/skills/agentconnect-setup`: open Claude Code in the checkout and ask it to set up AgentConnect, and it runs this page and the deployment pages as an interactive tutorial, verifying each checkpoint before continuing. It never asks you to paste secrets into chat.

The sections below cover the same ground by hand, and stay the reference whether or not you use the skill.

## Optional: add local sign-in

The repository includes a Logto OSS overlay for evaluating real sign-in without setting up DNS or TLS:

```bash
docker compose -f compose.yaml -f compose.logto.yaml up -d
```

Then open:

- Setup: [http://localhost:8091](http://localhost:8091)
- Logto Console: [http://localhost:3002](http://localhost:3002)
- AgentConnect: [http://localhost:3000](http://localhost:3000)

Continue with [Logto authentication](/docs/logto-authentication) and use Google for the shortest local sign-in path. The local overlay uses a separate Logto database in the same PostgreSQL service and remains bound to loopback.

When you use the overlay, keep both `-f` arguments in later `up`, `pull`, and `down` commands.

For hosted production sign-in, skip the overlay and connect a [Logto Cloud tenant](/docs/logto-authentication#logto-cloud) instead.

## Logs and updates

Follow the stack:

```bash
docker compose logs -f
```

Pull current images and apply migrations:

```bash
docker compose pull
docker compose up -d
```

If you created `compose.env`, add `--env-file compose.env` to each command. Pin `AGENTCONNECT_VERSION` to a release tag for reproducible deployments.

## Stop or reset

Stop the stack while preserving its database:

```bash
docker compose down
```

Delete the database and return to an empty installation:

```bash
docker compose down --volumes
```

> This permanently deletes Control Plane and Setup Server data in the Compose database. Daemon-local workspaces and transcripts are outside this volume and are not deleted.

## What the stack includes

| Component | Location | Purpose |
| --- | --- | --- |
| Web console | Docker | Configure and follow work |
| Control Plane | Docker | Auth and coordination data |
| Relay | Docker | Public callback ingress |
| Setup Server | Docker, loopback only | Configure deployment auth and providers |
| PostgreSQL | Docker | Persist deployment and Control Plane data |
| Logto OSS | Optional overlay | Local sign-in |
| Daemon | Host or another machine | Run agents and hold local data |

The Relay is included so GitHub, webhooks, webchat, and HTTP bot callbacks work without changing the stack. Direct Slack Socket Mode, Telegram, Discord, and Lark / Feishu connections continue to run between the daemon and their providers.

## Deployment boundary

The bundled Compose topology is intended for local evaluation and single-host deployment. Before publishing it to a network, configure real sign-in, replace the default secrets, use TLS, back up PostgreSQL, and provide reverse-proxy support for WebSockets.

Agent execution remains daemon-local. The Control Plane stores coordination data rather than message bodies, attachment bytes, workspaces, or live agent-session streams. See [How it works](/docs/how-it-works).

## Next

- [Deploy AgentConnect on Kubernetes](/docs/kubernetes-deployment)
- [Deployment and configuration](/docs/deployment-and-configuration)
- [Configure authentication with Logto](/docs/logto-authentication)
- [Install the daemon as a service](/docs/install-the-daemon)
