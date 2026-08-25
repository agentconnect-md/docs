---
title: 🏗️ Deployment and configuration
excerpt: Configure AgentConnect OSS topology, secrets, authentication, provider apps, and optional external memory.
hidden: false
---

This page covers the Docker Compose topology. For the official Helm chart, cluster daemon pool, agent sandboxes, Gateway API routing, and Kubernetes operations, use [Kubernetes deployment](/docs/kubernetes-deployment).

The default Docker Compose stack needs no configuration and stays on loopback. Use `compose.env` only for deployment topology and bootstrap secrets, then use Setup Server for authentication, provider apps, and deployment options.

## What is configured where

| Surface              | Owns                                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------- |
| `compose.env`        | Images, ports, public URLs, database secrets, Vault, connectors, and Logto endpoints         |
| Setup Server         | Logto browser auth, GitHub, Slack, Google, Lark / Feishu tenant apps, and deployment options |
| AgentConnect console | Organizations, agents, integrations, environments, tools, and skills                         |

Setup Server is the supported configuration surface for browser authentication, provider apps, displayed sign-in methods, and preset-agent behavior. It saves deployment settings and write-only provider secrets in PostgreSQL.

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

| Variable                              | Default                   |
| ------------------------------------- | ------------------------- |
| `AGENTCONNECT_VERSION`                | `latest`                  |
| `AGENTCONNECT_IMAGE_REGISTRY`         | `ghcr.io/agentconnect-md` |
| `AGENTCONNECT_PRISMA_CLI_VERSION`     | `7.8.0-node24-r1`         |
| `AGENTCONNECT_OPEN_CONNECTOR_VERSION` | `latest`                  |

For reproducible deployments, pin an AgentConnect release:

```dotenv
AGENTCONNECT_VERSION=vX.Y.Z
```

Published application and migration images currently target `linux/amd64`.

## Local ports

| Service           | Variable                           | Default |
| ----------------- | ---------------------------------- | ------- |
| Web               | `AGENTCONNECT_WEB_PORT`            | `3000`  |
| Control Plane     | `AGENTCONNECT_CP_PORT`             | `8080`  |
| Relay             | `AGENTCONNECT_RELAY_PORT`          | `8090`  |
| PostgreSQL        | `AGENTCONNECT_POSTGRES_PORT`       | `5432`  |
| Connector gateway | `AGENTCONNECT_OPEN_CONNECTOR_PORT` | `3100`  |
| Setup Server      | Fixed, loopback only               | `8091`  |
| Logto sign-in     | Optional overlay                   | `3001`  |
| Logto Console     | Optional overlay                   | `3002`  |

`AGENTCONNECT_BIND_ADDRESS` defaults to `127.0.0.1` for Web, Control Plane, and Relay. PostgreSQL, the connector gateway, Setup Server, and the local Logto overlay remain loopback-only in the supplied Compose files.

## Network and public URLs

Containers use Docker service names internally. Browsers, daemons, provider callbacks, and links use these public origins:

| Variable                        | Local default           |
| ------------------------------- | ----------------------- |
| `AGENTCONNECT_PUBLIC_WEB_URL`   | `http://localhost:3000` |
| `AGENTCONNECT_PUBLIC_CP_URL`    | `http://localhost:8080` |
| `AGENTCONNECT_PUBLIC_RELAY_URL` | `http://localhost:8090` |
| `AGENTCONNECT_RELAY_DAEMON_URL` | `ws://localhost:8090`   |

Do not add a trailing slash.

For a remote daemon or network deployment, replace these defaults with reachable origins. Use HTTPS for browser and callback origins, and `wss://` for the daemon-facing Relay URL. A reverse proxy must preserve WebSocket upgrades for both Control Plane and Relay connections.

Set the final public URLs before creating GitHub or Slack Apps. Setup derives their callback manifests from these values. If the URLs change later, recreate Setup Server with the same environment and Compose overrides before updating the provider Apps. For the base stack:

```bash
docker compose --env-file compose.env up -d --force-recreate setup-server
```

After updating the provider Apps, recreate the runtime services with the same environment and Compose overrides:

```bash
docker compose --env-file compose.env up -d --force-recreate control-plane relay web
```

> Do not publish a no-auth stack or its default secrets. Compose is a single-host topology, not an HA deployment.

## Setup Server

Setup Server provides the browser-based AgentConnect Setup surface at [http://localhost:8091](http://localhost:8091). It is included in the base stack and always binds to loopback.

Use it to:

- bootstrap Logto sign-in;
- create, adopt, check, or clear provider Apps;
- store provider credentials without returning saved secret values; and
- enable or disable the preset `agentconnect` agent.

Saved changes are loaded when services start. Apply them with:

```bash
docker compose restart control-plane relay web
```

If Compose runs on another host, forward Setup Server instead of exposing it publicly:

```bash
ssh -L 8091:127.0.0.1:8091 operator@host.example
```

Then open `http://localhost:8091` locally.

For the initial administrator and Logto Cloud or external Logto OSS setup, continue with [Logto authentication](/docs/logto-authentication).

### Preset agent

New organizations receive a built-in `agentconnect` agent by default. In Setup, open **Options**, clear **Enable preset Agents**, and save. This prevents future provisioning and backfills; it does not delete agents that already exist.

## Database and bootstrap secrets

PostgreSQL 18 stores data in the `agentconnect_postgres-data` volume. `docker compose down` preserves it; `docker compose down --volumes` deletes it.

Replace these defaults before any network exposure:

| Variable                         | Requirement                       |
| -------------------------------- | --------------------------------- |
| `AGENTCONNECT_POSTGRES_PASSWORD` | URL-safe characters               |
| `AGENTCONNECT_API_KEY_PEPPER`    | At least 32 characters and stable |
| `AGENTCONNECT_RELAY_TOKEN`       | At least 32 characters            |

Generate a separate value for each secret:

```bash
openssl rand -hex 32
```

Rotating `AGENTCONNECT_API_KEY_PEPPER` invalidates existing daemon and personal API keys. Back up PostgreSQL before non-throwaway use.

## Secret storage

Secrets shown as write-only in AgentConnect or Setup still need encryption at rest. The default `SECRET_CIPHER=none` stores them as plaintext in PostgreSQL. Use HashiCorp Vault Transit for a production or network-exposed deployment.

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

Pass the Vault settings to both Control Plane and Setup Server so they use the same cipher root:

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
  setup-server:
    environment: *vault
```

Use a policy-scoped token rather than a Vault root token, then recreate both services:

```bash
docker compose --env-file compose.env -f compose.yaml -f compose.vault.yaml \
  up -d --force-recreate control-plane setup-server
```

After taking a database backup, encrypt values that were previously stored as plaintext:

```bash
docker compose --env-file compose.env -f compose.yaml -f compose.vault.yaml \
  exec control-plane node dist/secrets/rewrap-cli.js
```

The command is resumable and can also be rerun after rotating the Transit key. Vault workload identity is supported through `VAULT_JWT_ROLE`, `VAULT_JWT_PATH`, and `VAULT_AUTH_MOUNT` instead of `VAULT_TOKEN`.

## Connectors

The stack includes a connector gateway that backs **Add connectors** in [Tools & Skills](/docs/tools-and-skills). It needs no configuration to browse the catalog and connect any service that authorizes with an API key, a custom credential, or no credential at all. Because its own console and admin API are unauthenticated, it stays on loopback and is never published beyond the Docker host.

Do not set `OOMOL_CONNECT_ADMIN_TOKEN`. AgentConnect calls the gateway without a bearer token, so setting one stops the connector catalog from loading.

To require a bearer on the gateway's action API, set `OOMOL_CONNECT_RUNTIME_TOKEN`. One value configures both the gateway and the Relay that calls it, so runtime authentication is on at both ends or off at both.

These settings are Compose environment values, and `docker compose restart` reuses a container's existing environment. Recreate both services so the new value takes effect:

```bash
docker compose --env-file compose.env up -d --force-recreate open-connector relay
```

### Encrypt stored connector credentials

The gateway keeps connector credentials and OAuth client secrets in its own SQLite volume, `agentconnect_open-connector-data`. This is a second credential store: `SECRET_CIPHER` and Vault Transit do not reach it. Give it a key of its own before connecting anything real, and set the key before you create the first connection:

```dotenv
OOMOL_CONNECT_ENCRYPTION_KEY=replace-with-a-stable-random-32-char-secret
```

Generate it like the other stack secrets:

```bash
openssl rand -hex 32
```

Adding the key to a stack that is already running takes effect only once the gateway is recreated:

```bash
docker compose --env-file compose.env up -d --force-recreate open-connector
```

Back up that volume alongside PostgreSQL. `docker compose down` preserves it; `docker compose down --volumes` deletes it with the database.

### OAuth providers

Filtering happens per authorization method, not per service. Until a service's OAuth client is configured in the gateway, only its OAuth method is withheld: a service that also accepts an API key, a custom credential, or no authentication stays in the catalog and offers those methods instead. Services that authorize solely through OAuth are the ones absent from a default stack.

To offer OAuth, configure its client in the gateway and make the provider's redirect reach the gateway from the browser.

1. Give the gateway a browser-reachable origin and point AgentConnect at it:

   ```dotenv
   AGENTCONNECT_PUBLIC_OPEN_CONNECTOR_URL=https://connectors.example.test
   ```

2. Recreate the gateway so it builds redirect URIs from the new origin. A gateway left running keeps the old one, and its authorization requests will not match the callback you register next:

   ```bash
   docker compose --env-file compose.env up -d --force-recreate open-connector
   ```

3. Route **only** `/oauth/callback` on that origin to the gateway. The provider redirects the browser there to complete authorization, and that is the only path that has to be public.
4. Register the OAuth client with the provider using `<origin>/oauth/callback` as its redirect URI.
5. Open the gateway console on its local port, [http://localhost:3100](http://localhost:3100), and save the client ID and secret for that service.

> The gateway console and its `/api` surface have no authentication. Never route them through a public origin — publishing them hands anyone your stored connector credentials.

If the gateway runs on another host, forward the port instead of exposing it:

```bash
ssh -L 3100:127.0.0.1:3100 operator@host.example
```

### Narrow the catalog

| Variable                            | Default                                                   |
| ----------------------------------- | --------------------------------------------------------- |
| `OPEN_CONNECTOR_PROVIDER_WHITELIST` | Unset, meaning every service                              |
| `OPEN_CONNECTOR_PROVIDER_BLOCKLIST` | The services that overlap AgentConnect's own integrations |

Both accept comma-separated service ids, and the blocklist is applied after the whitelist. The default blocklist keeps GitHub, Slack, Telegram, Discord, and Lark / Feishu out of the connector catalog because AgentConnect integrates them directly. Override it only when you deliberately want both paths available.

Only Control Plane reads these two values, and it needs to be recreated rather than restarted to pick them up:

```bash
docker compose --env-file compose.env up -d --force-recreate control-plane
```

## GitHub App

Configure the deployment GitHub App when agents need private repositories, repository-scoped Git credentials, or GitHub issue and pull-request triggers.

1. Set the final Web, Control Plane, and Relay public URLs.
2. In Setup, open **GitHub** and choose **Create GitHub App**. The manifest flow fills the current callbacks, events, and permissions.
3. If you use an existing App, save its identity and secrets, then choose **Check match**.
4. Restart Control Plane and Relay.
5. In AgentConnect, open **Settings → GitHub**, install the App, and select its repositories.

The generated App requests:

| Scope                                                           | Access         |
| --------------------------------------------------------------- | -------------- |
| Metadata and email addresses                                    | Read           |
| Contents, issues, pull requests, Actions, Checks, and workflows | Read and write |

AgentConnect narrows each installation token to one authorized repository and the agent's repository grant. Installation owners still choose which repositories are available.

GitHub webhooks require a reachable HTTPS Relay. On the default local HTTP stack, Setup can create the App for sign-in and repository installation but leaves webhook delivery disabled until you provide HTTPS ingress.

See [GitHub](/docs/github) for triggers, reviews, and repository behavior.

## GitLab

Configure the deployment's GitLab OAuth application when agents need GitLab projects — on GitLab.com or on one self-managed instance; a deployment addresses one or the other, never both. The application is AgentConnect's **administration identity** on the instance: project discovery, the agents' service accounts, and webhook management. It is not the identity agents act as.

1. In Setup, open **GitLab**. For a self-managed instance, put its address in **Instance base URL** (empty means GitLab.com; a path prefix and a non-default port are both supported and preserved). Setup probes what you typed: only an unusable URL blocks the save — an unreachable host, an untrusted certificate, or a response that is not a GitLab API root are reported as warnings, because Setup and the Control Plane need not sit in the same network position.
2. Setup displays the exact **Redirect URI** and **Scopes** to register. GitLab has no API for creating OAuth applications, so this part happens on GitLab: in **User settings → Applications**, a group's **Settings → Applications**, or **Admin → Applications** for an instance-wide one, add an application whose redirect URI is _exactly_ that value, keep **Confidential** selected, and grant those scopes. GitLab shows the secret once.
3. Paste the **Application ID** and **Secret** into Setup and choose **Save GitLab application**.
4. Restart the Control Plane, then the console and Relay, which cache what it serves.
5. In the console, **Integrations → Code hosts → Connect GitLab**, and authorize an account with the authority below.

Until GitLab state exists you can change all of this freely, including **Clear configuration**. Once projects, tokens, or connections exist, the instance address is fixed: they carry no instance provenance, so retargeting would send one instance's credentials to another.

### Self-managed instance requirements

| Requirement               | Why                                                                                                                                                                              |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **GitLab 18.11 or later** | Group service accounts reached every tier, Community Edition included, at 18.11. Below that AgentConnect refuses to provision rather than guess.                                 |
| **HTTPS, one address**    | Clone URLs, OAuth redirects, and GitLab's own `web_url` values only agree if there is a single address. Split internal/external addressing belongs in DNS.                       |
| **A trusted certificate** | There is no skip-verify option at any layer. A private authority is supported by installing its bundle where every process and sandbox can read it.                              |
| **Reachable ingress**     | GitLab refuses to deliver webhooks to the local network by default; if your AgentConnect ingress resolves to a private address, the integration looks installed and stays quiet. |

Creating each agent's service account needs authority no GitLab API reports, so it is checked the first time a project is set up, not in advance. On GitLab.com that is a top-level-group **Owner**. On a self-managed instance, either is enough:

- **Any tier, including Community Edition** — connect an **instance administrator**. On an instance with **Admin Mode** enabled, administrator API actions need a token scope AgentConnect does not request, so the delegation setting below is the only path there.
- **Premium or Ultimate** — turn on **Allow top-level group Owners to create service accounts** under **Admin → Settings → General**, and connect a top-level group Owner.

Nothing about the instance has to be configured on your daemons: a daemon learns it from the agent it is serving, and clones from it on that basis.

## Slack deployment App

Setup can create one deployment Slack App for the built-in `agentconnect` agent and optional Slack sign-in. This does not replace the recommended per-agent bot integrations described in [Slack](/docs/slack).

1. Configure reachable HTTPS Logto, Web, Control Plane, and Relay origins.
2. Create a temporary Slack App configuration token when Setup prompts for one.
3. Open **Slack** in Setup and choose **Create Slack App**.
4. Restart Control Plane and Relay.

Setup builds and checks the current Slack manifest, including OAuth, Events API, and interactivity callbacks. Slack sign-in is unavailable on the default HTTP localhost topology; use Google for the local bootstrap.

## Google sign-in

Google is the simplest provider for local sign-in. The bundled topology uses bare `localhost`, which Google accepts for local Web OAuth clients.

1. Choose Google during Setup bootstrap, or open its **Google** card later.
2. Create a Web OAuth client in Google Auth Platform using the exact origins and redirect URIs shown by Setup.
3. Save the client ID and secret, then restart Control Plane and Web.

Setup creates or updates the matching Logto connector and can verify it. Compare the displayed Google origins and redirect URIs manually.

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
- Set a connector encryption key if you use connectors, and back up its volume.
- Put Web, Control Plane, Relay, and Logto behind HTTPS.
- Preserve WebSocket upgrades.
- Back up PostgreSQL and test restores.
- Keep Setup Server, PostgreSQL, and the connector gateway off the public network.
