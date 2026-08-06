---
title: 🏗️ Deployment and configuration
excerpt: Configure AgentConnect OSS topology, secrets, authentication, provider apps, and optional external memory.
hidden: false
---

The default Docker Compose stack needs no configuration and stays on loopback. Use `compose.env` only for deployment topology and bootstrap secrets, then use Tenant Admin for authentication, provider apps, and deployment options.

## What is configured where

| Surface | Owns |
| --- | --- |
| `compose.env` | Images, ports, public URLs, database secrets, Vault, and Logto endpoints |
| Tenant Admin | Logto browser auth, GitHub, Slack, Google, Lark / Feishu tenant apps, and deployment options |
| AgentConnect console | Organizations, agents, integrations, environments, tools, and skills |

Tenant Admin is the supported configuration surface for browser authentication, provider apps, displayed sign-in methods, and preset-agent behavior. It saves deployment settings and write-only provider secrets in PostgreSQL.

## Compose environment

Copy the template only when you need overrides:

```bash
cp compose.env.example compose.env
```

Include it in every Compose command:

```bash
docker compose --env-file compose.env up -d
```

`compose.env` is gitignored. Keep it out of source control and unapproved backups.

## Image versions

| Variable | Default |
| --- | --- |
| `AGENTCONNECT_VERSION` | `latest` |
| `AGENTCONNECT_IMAGE_REGISTRY` | `ghcr.io/agentconnect-md` |
| `AGENTCONNECT_PRISMA_CLI_VERSION` | `7.8.0-node24-r1` |

For reproducible deployments, pin an AgentConnect release:

```dotenv
AGENTCONNECT_VERSION=vX.Y.Z
```

Published application and migration images currently target `linux/amd64`.

## Local ports

| Service | Variable | Default |
| --- | --- | --- |
| Web | `AGENTCONNECT_WEB_PORT` | `3000` |
| Control Plane | `AGENTCONNECT_CP_PORT` | `8080` |
| Relay | `AGENTCONNECT_RELAY_PORT` | `8090` |
| PostgreSQL | `AGENTCONNECT_POSTGRES_PORT` | `5432` |
| Tenant Admin | Fixed, loopback only | `8091` |
| Logto sign-in | Optional overlay | `3001` |
| Logto Console | Optional overlay | `3002` |

`AGENTCONNECT_BIND_ADDRESS` defaults to `127.0.0.1` for Web, Control Plane, and Relay. PostgreSQL, Tenant Admin, and the local Logto overlay remain loopback-only in the supplied Compose files.

## Network and public URLs

Containers use Docker service names internally. Browsers, daemons, provider callbacks, and links use these public origins:

| Variable | Local default |
| --- | --- |
| `AGENTCONNECT_PUBLIC_WEB_URL` | `http://localhost:3000` |
| `AGENTCONNECT_PUBLIC_CP_URL` | `http://localhost:8080` |
| `AGENTCONNECT_PUBLIC_RELAY_URL` | `http://localhost:8090` |
| `AGENTCONNECT_RELAY_DAEMON_URL` | `ws://localhost:8090` |

Do not add a trailing slash.

For a remote daemon or network deployment, replace these defaults with reachable origins. Use HTTPS for browser and callback origins, and `wss://` for the daemon-facing Relay URL. A reverse proxy must preserve WebSocket upgrades for both Control Plane and Relay connections.

Set the final public URLs before creating GitHub or Slack Apps. Tenant Admin derives their callback manifests from these values. If the URLs change later, recreate Tenant Admin with the same environment and Compose overrides before updating the provider Apps. For the base stack:

```bash
docker compose --env-file compose.env up -d --force-recreate tenant-admin
```

After updating the provider Apps, recreate the runtime services with the same environment and Compose overrides:

```bash
docker compose --env-file compose.env up -d --force-recreate control-plane relay web
```

> Do not publish a no-auth stack or its default secrets. Compose is a single-host topology, not an HA deployment.

## Tenant Admin

Tenant Admin is the browser-based deployment configuration surface at [http://localhost:8091](http://localhost:8091). It is included in the base stack and always binds to loopback.

Use it to:

- bootstrap Logto sign-in;
- create, adopt, check, or clear provider Apps;
- store provider credentials without returning saved secret values; and
- enable or disable the preset `agentconnect` agent.

Saved changes are loaded when services start. Apply them with:

```bash
docker compose restart control-plane relay web
```

If Compose runs on another host, forward Tenant Admin instead of exposing it publicly:

```bash
ssh -L 8091:127.0.0.1:8091 operator@host.example
```

Then open `http://localhost:8091` locally.

For the initial administrator and Logto Cloud or external Logto OSS setup, continue with [Logto authentication](/docs/logto-authentication).

### Preset agent

New organizations receive a built-in `agentconnect` agent by default. In Tenant Admin, open **Options**, clear **Enable preset Agents**, and save. This prevents future provisioning and backfills; it does not delete agents that already exist.

## Database and bootstrap secrets

PostgreSQL 18 stores data in the `agentconnect_postgres-data` volume. `docker compose down` preserves it; `docker compose down --volumes` deletes it.

Replace these defaults before any network exposure:

| Variable | Requirement |
| --- | --- |
| `AGENTCONNECT_POSTGRES_PASSWORD` | URL-safe characters |
| `AGENTCONNECT_API_KEY_PEPPER` | At least 32 characters and stable |
| `AGENTCONNECT_RELAY_TOKEN` | At least 32 characters |

Generate a separate value for each secret:

```bash
openssl rand -hex 32
```

Rotating `AGENTCONNECT_API_KEY_PEPPER` invalidates existing daemon and personal API keys. Back up PostgreSQL before non-throwaway use.

## Secret storage

Secrets shown as write-only in AgentConnect or Tenant Admin still need encryption at rest. The default `SECRET_CIPHER=none` stores them as plaintext in PostgreSQL. Use HashiCorp Vault Transit for a production or network-exposed deployment.

Create a Transit key and a policy that can encrypt and decrypt with it:

```bash
vault secrets enable transit
vault write -f transit/keys/agentconnect-cp
```

```hcl
path "transit/encrypt/agentconnect-cp" {
  capabilities = ["update"]
}

path "transit/decrypt/agentconnect-cp" {
  capabilities = ["update"]
}
```

Pass the Vault settings to both Control Plane and Tenant Admin so they use the same cipher root:

```yaml
# compose.vault.yaml
services:
  control-plane:
    environment: &vault
      SECRET_CIPHER: vault-transit
      VAULT_ADDR: ${VAULT_ADDR}
      VAULT_TRANSIT_KEY: ${VAULT_TRANSIT_KEY:-agentconnect-cp}
      VAULT_TRANSIT_MOUNT: ${VAULT_TRANSIT_MOUNT:-transit}
      VAULT_TOKEN: ${VAULT_TOKEN}
  tenant-admin:
    environment: *vault
```

Use a policy-scoped token rather than a Vault root token, then recreate both services:

```bash
docker compose --env-file compose.env -f compose.yaml -f compose.vault.yaml \
  up -d --force-recreate control-plane tenant-admin
```

After taking a database backup, encrypt values that were previously stored as plaintext:

```bash
docker compose --env-file compose.env -f compose.yaml -f compose.vault.yaml \
  exec control-plane node dist/secrets/rewrap-cli.js
```

The command is resumable and can also be rerun after rotating the Transit key. Vault workload identity is supported through `VAULT_JWT_ROLE`, `VAULT_JWT_PATH`, and `VAULT_AUTH_MOUNT` instead of `VAULT_TOKEN`.

## GitHub App

Configure the deployment GitHub App when agents need private repositories, repository-scoped Git credentials, or GitHub issue and pull-request triggers.

1. Set the final Web, Control Plane, and Relay public URLs.
2. In Tenant Admin, open **GitHub** and choose **Create GitHub App**. The manifest flow fills the current callbacks, events, and permissions.
3. If you use an existing App, save its identity and secrets, then choose **Check match**.
4. Restart Control Plane and Relay.
5. In AgentConnect, open **Settings → GitHub**, install the App, and select its repositories.

The generated App requests:

| Scope | Access |
| --- | --- |
| Metadata and email addresses | Read |
| Contents, issues, pull requests, Actions, Checks, and workflows | Read and write |

AgentConnect narrows each installation token to one authorized repository and the agent's repository grant. Installation owners still choose which repositories are available.

GitHub webhooks require a reachable HTTPS Relay. On the default local HTTP stack, Tenant Admin can create the App for sign-in and repository installation but leaves webhook delivery disabled until you provide HTTPS ingress.

See [GitHub](/docs/github) for triggers, reviews, and repository behavior.

## Slack deployment App

Tenant Admin can create one deployment Slack App for the built-in `agentconnect` agent and optional Slack sign-in. This does not replace the recommended per-agent bot integrations described in [Slack](/docs/slack).

1. Configure reachable HTTPS Logto, Web, Control Plane, and Relay origins.
2. Create a temporary Slack App configuration token when Tenant Admin prompts for one.
3. Open **Slack** in Tenant Admin and choose **Create Slack App**.
4. Restart Control Plane and Relay.

Tenant Admin builds and checks the current Slack manifest, including OAuth, Events API, and interactivity callbacks. Slack sign-in is unavailable on the default HTTP localhost topology; use Google for the local bootstrap.

## Google sign-in

Google is the simplest provider for local sign-in. The bundled topology uses bare `localhost`, which Google accepts for local Web OAuth clients.

1. Choose Google during Tenant Admin bootstrap, or open its **Google** card later.
2. Create a Web OAuth client in Google Auth Platform using the exact origins and redirect URIs shown by Tenant Admin.
3. Save the client ID and secret, then restart Control Plane and Web.

Tenant Admin creates or updates the matching Logto connector and can verify it. Compare the displayed Google origins and redirect URIs manually.

## Lark and Feishu tenant Apps

The **Lark** and **Feishu** cards configure one regional Login App as the deployment's tenant anchor. AgentConnect uses it to accept multiple bot Apps only when they belong to the same trusted workspace; the Login App is not an AgentConnect chat bot.

Choose **Create Lark App** / **Create Feishu App**, or save existing credentials. For an existing App, enable and publish the provider permission named **Obtain tenant information** (`tenant:tenant:readonly`). Restart Control Plane after saving.

Bot setup and delivery modes are documented in [Lark / Feishu](/docs/lark-feishu).

## Optional Mem0

Mem0 is not part of the AgentConnect Compose stack. AgentConnect works without it. Deploy Mem0 only when agents should use durable external memory that you operate.

1. Start [Mem0 OSS](https://docs.mem0.ai/open-source/setup) and make its API reachable from each participating daemon.
2. On each participating daemon machine, check out the matching AgentConnect release and build the first-party wrapper. This example keeps the source at `/opt/agentconnect`, matching the configuration below:

```bash
git clone https://github.com/agentconnect-md/agentconnect.git /opt/agentconnect
cd /opt/agentconnect
git checkout vX.Y.Z
corepack enable
pnpm install --frozen-lockfile
pnpm --filter @agentconnect.md/memory-plugin-mem0 build
```

3. Allowlist the wrapper in each daemon's `~/.agentconnect/config.json`:

```json
{
  "version": 1,
  "memoryPlugins": {
    "mem0-oss": {
      "command": "node",
      "args": ["/opt/agentconnect/packages/memory-plugin-mem0/dist/cli.js"],
      "env": [
        { "name": "MEM0_DIALECT", "value": "oss" },
        { "name": "MCP_TRANSPORT", "value": "stdio" },
        { "name": "MEM0_OSS_BASE_URL", "value": "http://127.0.0.1:8888" }
      ],
      "secretEnv": { "apiKey": "MEM0_API_KEY" }
    }
  }
}
```

Adjust the wrapper path and Mem0 address for your deployment, then restart the daemon:

```bash
npx -y @agentconnect.md/cli restart
```

Continue with [Use Mem0 OSS as external memory](/docs/external-memory) to create the organization connection and bind it to agents.

## Production checklist

- Pin release images.
- Configure OIDC sign-in and an API Resource.
- Replace every default secret and enable encrypted secret storage.
- Put Web, Control Plane, Relay, and Logto behind HTTPS.
- Preserve WebSocket upgrades.
- Back up PostgreSQL and test restores.
- Keep Tenant Admin and PostgreSQL off the public network.
