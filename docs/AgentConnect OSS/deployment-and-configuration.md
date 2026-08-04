---
title: 🏗️ Deployment and configuration
excerpt: Configure AgentConnect OSS versions, ports, secrets, public URLs, GitHub and Slack Apps, optional Mem0, and Logto-backed sign-in.
hidden: false
---

The default AgentConnect OSS Compose stack requires no configuration. It uses current stable images, local-only credentials, fixed localhost ports, and no-auth mode.

For overrides, copy the provided template:

```bash
cp compose.env.example compose.env
```

Uncomment and edit only the values you need, then include the file in every command:

```bash
docker compose --env-file compose.env up -d
```

`compose.env` is gitignored. Keep it out of source control and backups that are not approved for secrets.

## Image versions

| Variable                          | Default                   | Purpose                                              |
| --------------------------------- | ------------------------- | ---------------------------------------------------- |
| `AGENTCONNECT_VERSION`            | `latest`                  | Shared release tag for Web, Control Plane, and Relay |
| `AGENTCONNECT_IMAGE_REGISTRY`     | `ghcr.io/agentconnect-md` | Image registry and namespace                         |
| `AGENTCONNECT_PRISMA_CLI_VERSION` | `7.8.0-node24-r1`         | Version-matched migration runner toolchain           |

Published AgentConnect application and migration images currently target `linux/amd64`. The Compose file pins this platform; it is not a configurable stack option. Docker Desktop and OrbStack can run these images with emulation on Apple Silicon.

For a reproducible setup, use an exact AgentConnect release tag:

```dotenv
AGENTCONNECT_VERSION=vX.Y.Z
```

Every application image is published under every release tag, even when that component did not change in the release.

## Local ports

| Variable                    | Default     |
| --------------------------- | ----------- |
| `AGENTCONNECT_BIND_ADDRESS` | `127.0.0.1` |
| `AGENTCONNECT_WEB_PORT`     | `3000`      |
| `AGENTCONNECT_CP_PORT`      | `8080`      |
| `AGENTCONNECT_RELAY_PORT`   | `8090`      |

Changing a published port does not automatically change an explicitly configured public URL. Keep the values in the next section aligned.

## Network and public URLs

AgentConnect uses separate internal and public addresses:

- Relay-to-Control-Plane traffic uses Docker's private service network automatically.
- Browsers and host daemons need addresses reachable from outside the containers.
- The Relay's daemon address must use `ws://` or `wss://`; browser-facing Relay URLs use `http://` or `https://` and are upgraded to WebSockets by the client.

| Variable                        | Local default           | Used by                                 |
| ------------------------------- | ----------------------- | --------------------------------------- |
| `AGENTCONNECT_PUBLIC_WEB_URL`   | `http://localhost:3000` | Session links and browser redirects     |
| `AGENTCONNECT_PUBLIC_CP_URL`    | `http://localhost:8080` | Browser API calls and daemon onboarding |
| `AGENTCONNECT_PUBLIC_RELAY_URL` | `http://localhost:8090` | Webchat and public callback ingress     |
| `AGENTCONNECT_RELAY_DAEMON_URL` | `ws://localhost:8090`   | Daemon-to-Relay WebSocket               |

Do not add a trailing slash to these values.

To connect a daemon from another machine, replace `localhost` with a hostname that machine can resolve and reach. If you put the services behind a reverse proxy, it must preserve WebSocket upgrades for the Control Plane daemon path and the Relay paths.

> Do not set `AGENTCONNECT_BIND_ADDRESS=0.0.0.0` while no-auth mode or the bundled local-only secrets are active. Compose is a single-host evaluation topology, not an HA production deployment.

## Secrets and database

The default values are intentionally predictable because the stack listens only on loopback. Replace them before changing network exposure:

| Variable | Requirement |
| --- | --- |
| `AGENTCONNECT_POSTGRES_PASSWORD` | URL-safe characters |
| `AGENTCONNECT_API_KEY_PEPPER` | At least 32 characters; keep stable |
| `AGENTCONNECT_RELAY_TOKEN` | At least 32 characters |

The PostgreSQL password is embedded in a connection URL. The Relay token is shared only by the Control Plane and Relay.

Generate independent values, for example:

```bash
openssl rand -hex 32
```

Run the command separately for each secret. Rotating `AGENTCONNECT_API_KEY_PEPPER` invalidates existing daemon and personal API keys.

PostgreSQL 18 data lives in the `agentconnect_postgres-data` Docker volume. `docker compose down` preserves it; `docker compose down --volumes` permanently deletes it. Back up the database before any non-throwaway use.

## Secret storage

Secrets saved in AgentConnect are write-only in the console, but storage encryption is a separate deployment choice. The default `SECRET_CIPHER=none` stores their values as plaintext in PostgreSQL. For a production or network-exposed deployment, use HashiCorp Vault Transit so the Control Plane stores ciphertext instead.

The configured cipher covers organization and agent secrets together with integration credentials and other tenant secrets held by the Control Plane.

### Configure Vault Transit

Enable the Transit engine, create a key, and grant the Control Plane permission to encrypt and decrypt with that key:

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

Attach that policy to a dedicated Vault token or workload identity. Do not use a Vault root token.

Use a small Compose override to pass the Vault settings into the Control Plane. Add `compose.vault.yaml` next to `compose.yaml`:

```yaml
services:
  control-plane:
    environment:
      SECRET_CIPHER: vault-transit
      VAULT_ADDR: ${VAULT_ADDR}
      VAULT_TRANSIT_KEY: ${VAULT_TRANSIT_KEY:-agentconnect-cp}
      VAULT_TRANSIT_MOUNT: ${VAULT_TRANSIT_MOUNT:-transit}
      VAULT_TOKEN: ${VAULT_TOKEN}
```

Set the address and a policy-scoped token in `compose.env` or inject them through your deployment secret manager:

```dotenv
VAULT_ADDR=https://vault.example.com
VAULT_TOKEN=<vault-token>
```

Then recreate the Control Plane with both Compose files:

```bash
docker compose --env-file compose.env -f compose.yaml -f compose.vault.yaml up -d --force-recreate control-plane
```

For workload identity, replace the `VAULT_TOKEN` line in the override with:

```yaml
      VAULT_JWT_ROLE: ${VAULT_JWT_ROLE}
      VAULT_JWT_PATH: ${VAULT_JWT_PATH:-/var/run/secrets/kubernetes.io/serviceaccount/token}
      VAULT_AUTH_MOUNT: ${VAULT_AUTH_MOUNT:-kubernetes}
```

Set `VAULT_JWT_ROLE` in `compose.env` and mount the workload JWT at the configured path. Configure exactly one of token or JWT authentication. Vault Enterprise users can also add `VAULT_NAMESPACE: ${VAULT_NAMESPACE}` to the override.

### Encrypt existing values

Switching to Vault Transit is online: new and updated values are encrypted immediately, while existing plaintext values remain readable. After taking a database backup, encrypt all existing values with the bundled rewrap command:

```bash
docker compose --env-file compose.env -f compose.yaml -f compose.vault.yaml exec control-plane \
  node dist/secrets/rewrap-cli.js
```

The command is safe to resume. Run it again after rotating the Transit key to move stored values to the newest key version.

## Preset agent provisioning

By default, the Control Plane creates an `agentconnect` preset agent for every new organization and backfills it for existing organizations at startup. To disable future provisioning and backfills:

```dotenv
PRESET_AGENTS_ENABLED=false
```

The value must be the literal `true` or `false`. Turning provisioning off does not delete preset agents that already exist.

## Optional GitHub App

Configure an instance-level GitHub App when you want to:

- select private repositories for agent workspaces;
- give daemons short-lived, repository-scoped Git credentials; or
- trigger agents from GitHub issues, pull requests, and comments.

Public repositories can still be cloned read-only without a GitHub App. GitHub event integrations require the Relay because GitHub delivers them as signed webhooks.

### 1. Register the GitHub App

In GitHub, open **Settings → Developer settings → GitHub Apps → New GitHub App**. Configure:

| GitHub App field | Value                                                                     |
| ---------------- | ------------------------------------------------------------------------- |
| Homepage URL     | Your `AGENTCONNECT_PUBLIC_WEB_URL`                                        |
| Setup URL        | `<AGENTCONNECT_PUBLIC_CP_URL>/v1/github/setup/callback`                   |
| Webhook URL      | `<AGENTCONNECT_PUBLIC_RELAY_URL>/webhooks/github`                         |
| Webhook secret   | A new random secret that you will also set as `GITHUB_APP_WEBHOOK_SECRET` |

The Setup URL deliberately uses `/v1`, not `/api/v1`. Enable **Redirect on update** so returning from an installation or permission update refreshes the AgentConnect installation state.

The Setup URL must be reachable by the installer's browser. The Webhook URL must be reachable from GitHub over HTTPS and your reverse proxy must preserve the request body and headers used for signature verification.

Do not expose the complete no-auth Control Plane merely to make the Setup URL reachable. Either enable OIDC before publishing the Web and Control Plane, or route only the exact `/v1/github/setup/callback` path to the Control Plane while keeping its other routes private. The Relay webhook can be exposed separately.

GitHub documents these fields in [Registering a GitHub App](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app).

### 2. Choose permissions and events

The following repository permissions enable all GitHub features currently implemented by AgentConnect:

| Permission | Access | Used for |
| --- | --- | --- |
| Metadata | Read-only | Installation and repository identity |
| Contents | Read and write | Clone, inspect, and push |
| Issues | Read and write | Issue events and replies |
| Pull requests | Read and write | PR events, replies, and reviews |
| Actions | Read and write | Inspect and run Actions |
| Workflows | Read and write | Write `.github/workflows` |
| Checks | Read and write | PR review Checks |

GitHub grants **Metadata** automatically.

For repository selection and read-only cloning only, keep **Contents** read-only and omit the other optional permissions. Event subscriptions without write-back need read-only **Issues** or **Pull requests**; replies and formal reviews need write access. The AgentConnect `write` tier requires **Contents**, **Actions**, and **Workflows** at read and write. **Checks** is optional when you do not publish PR review Checks. AgentConnect cannot expand an installation beyond the permissions declared by the App.

Under **Subscribe to events**, select:

- `issues`;
- `pull_request`;
- `issue_comment`;
- `pull_request_review_comment`.

GitHub sends `installation` and `installation_repositories` events to GitHub Apps automatically; they are not manual subscription options.

When the App has **Checks: Read and write**, GitHub also subscribes it to `check_run` and `check_suite` automatically. AgentConnect handles check reruns and the **Request review** action from those events, so you do not need to add either event manually.

The App declaration is the maximum permission set. Each installation owner chooses the repositories and approves that set. AgentConnect then mints a short-lived token narrowed to one authorized repository and the agent's **Read only** or **Read & write** grant. Existing installation owners must approve permission increases before AgentConnect can use them.

See GitHub's [permission selection guide](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/choosing-permissions-for-a-github-app) and [webhook event reference](https://docs.github.com/en/webhooks/webhook-events-and-payloads).

### 3. Configure Compose

Generate a private key in the GitHub App settings. Convert the downloaded PEM to the single-line base64 value expected by the Control Plane:

```bash
base64 < github-app.private-key.pem | tr -d '\n'
```

Generate an independent webhook secret:

```bash
openssl rand -hex 32
```

Add the App identity and webhook secret to `compose.env`:

```dotenv
GITHUB_APP_ID=<app-id>
GITHUB_APP_PRIVATE_KEY_B64=<single-line-base64-pem>
GITHUB_APP_SLUG=<app-slug>
GITHUB_APP_CLIENT_ID=<client-id>
GITHUB_APP_WEBHOOK_SECRET=<webhook-secret>
```

`GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY_B64`, and `GITHUB_APP_SLUG` are a required group: set all three to enable the feature, or omit all three to disable it. `GITHUB_APP_CLIENT_ID` is optional; when omitted, AgentConnect uses the numeric App ID as the App JWT issuer. `GITHUB_APP_WEBHOOK_SECRET` is required for GitHub event ingress.

The private key is read only by the Control Plane. The webhook secret is read only by the Relay and must exactly match the value in GitHub.

Recreate the affected services:

```bash
docker compose --env-file compose.env up -d --force-recreate control-plane relay
```

Then open **Settings → GitHub** in AgentConnect, choose **Install on GitHub**, select the account and repositories, and return to the console. If GitHub says a permission update is pending, approve it as the installation owner and choose **Sync** in AgentConnect.

The `LOGTO_MGMT_*` variables in [Logto authentication](/docs/logto-authentication) are not required to enable the GitHub App. They add per-user GitHub authorization checks when Logto-backed sign-in is enabled; without them, repository authorization follows the AgentConnect organization and installation boundary.

## Optional deployment-wide Add to Slack app

A deployment-wide Slack App gives the built-in `agentconnect` agent an **Add to Slack** flow without asking each organization to create its own app. This is a chat bot integration and is separate from the `slack` social-login connector configured in Logto.

The app uses Slack's Events API and therefore requires:

- reachable HTTPS values for `AGENTCONNECT_PUBLIC_CP_URL` and `AGENTCONNECT_PUBLIC_RELAY_URL`;
- a running Relay connected to the Control Plane; and
- a Slack App configured from AgentConnect's current **HTTP** manifest.

You can obtain the current manifest from the ordinary Slack integration flow on any agent. Start **Integrations → Add integration → Slack**, switch from the automatic quick install to the manual option that copies a manifest, set the delivery mode to **HTTP (Events API)**, then choose **Copy manifest & open Slack** — one click both copies the manifest and opens Slack's app-creation page. Create a dedicated Slack App from that manifest and verify these public URLs in its settings:

| Slack App setting         | URL                                                                    |
| ------------------------- | ---------------------------------------------------------------------- |
| OAuth redirect URL        | `<AGENTCONNECT_PUBLIC_CP_URL>/v1/integrations/slack/platform/callback` |
| Event Subscriptions URL   | `<AGENTCONNECT_PUBLIC_RELAY_URL>/slack/events`                         |
| Interactivity request URL | `<AGENTCONNECT_PUBLIC_RELAY_URL>/slack/interactions`                   |

The OAuth redirect deliberately uses `/v1`, not `/api/v1`. Enable distribution if people will install the App into workspaces other than the one that owns it.

Copy the App ID, Client ID, Client Secret, and Signing Secret from Slack into `compose.env`:

```dotenv
SLACK_PLATFORM_APP_ID=<app-id>
SLACK_PLATFORM_CLIENT_ID=<client-id>
SLACK_PLATFORM_CLIENT_SECRET=<client-secret>
SLACK_PLATFORM_SIGNING_SECRET=<signing-secret>
```

Set all four values or omit all four. Recreate the Control Plane after a change:

```bash
docker compose --env-file compose.env up -d --force-recreate control-plane
```

When this integration is disabled, AgentConnect keeps the per-app quick-install and manifest flows available.

## Optional Mem0

Mem0 is not part of the default AgentConnect Compose stack. AgentConnect works without external memory; deploy Mem0 only when agents should recall and capture durable records in a backend you operate.

The local setup has two operator-managed pieces:

- **Mem0 OSS**, which stores and searches records; and
- the **AgentConnect Mem0 wrapper**, which runs on each participating daemon and translates AgentConnect's memory profile to Mem0 OSS calls.

### 1. Start Mem0 OSS

Follow Mem0's [self-hosted setup](https://docs.mem0.ai/open-source/setup). Its reference Docker Compose stack exposes the API on `http://localhost:8888` and the dashboard on `http://localhost:3000`.

> Mem0's dashboard port clashes with the AgentConnect console, which also defaults to `3000`. If you run both on one host, remap one of them — change `AGENTCONNECT_WEB_PORT` or Mem0's dashboard port before starting the second stack.

For example:

```bash
git clone https://github.com/mem0ai/mem0.git
cd mem0/server

# Configure server/.env first, including an LLM/embedder credential and JWT_SECRET.
make bootstrap
```

`make bootstrap` starts the stack, creates the first admin, and issues an API key. You can also start with `docker compose up -d` and finish setup in the dashboard. Mem0 shows a newly created API key only once, so put it in your secret manager before continuing.

Confirm the REST API is reachable from every daemon that will use it. The OpenAPI explorer is at `http://localhost:8888/docs`; the OSS routes do not use a `/v1` prefix. See Mem0's [REST API server guide](https://docs.mem0.ai/open-source/features/rest-api) for other deployment and authentication options.

> If a daemon runs in a container, `127.0.0.1` means that container. Use the Mem0 service DNS name or another address reachable from the daemon instead.

### 2. Build the AgentConnect Mem0 wrapper

On each participating daemon machine, build the first-party wrapper from a current AgentConnect checkout. Replace `/opt/agentconnect` if you install it elsewhere:

```bash
git clone https://github.com/agentconnect-md/agentconnect.git /opt/agentconnect
cd /opt/agentconnect
corepack enable
pnpm install --frozen-lockfile
pnpm --filter @agentconnect.md/memory-plugin-mem0 build
```

If the repository already exists, pull the current release and rebuild that package. The stdio entry point is:

```text
/opt/agentconnect/packages/memory-plugin-mem0/dist/cli.js
```

### 3. Allowlist the wrapper on the daemon

Add a `memoryPlugins` entry to the daemon's `~/.agentconnect/config.json`. Preserve the rest of the existing file:

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

The distinction matters:

- `mem0-oss` is an opaque **command reference** that an organization owner may select in the console.
- `command`, `args`, and `MEM0_OSS_BASE_URL` are controlled only by the daemon operator.
- `secretEnv` maps the connection's logical `apiKey` to the wrapper's `MEM0_API_KEY` environment variable. It does not contain the key itself.

Restart the daemon so the new allowlist is active:

```bash
npx -y @agentconnect.md/cli restart
```

Run `npx -y @agentconnect.md/cli status` if you need the service state or log path. If the daemon runs in the foreground, stop and rerun it instead. If it uses a non-default `--root`, edit that root's `config.json`.

### Remote-wrapper alternative

Use **Remote · Streamable HTTP** when the wrapper should run as a service rather than as a daemon child. Run the same package with `MEM0_DIALECT=oss`, `MEM0_OSS_BASE_URL=<your-mem0-api>`, and `MCP_TRANSPORT=http`, expose its `/mcp` endpoint behind HTTPS, then register that URL with the same plugin id and credential contract.

The remote Relay enforces the reviewed wrapper endpoint and injects the write-only credential as `X-Mem0-Api-Key`; the wrapper translates it to Mem0 OSS's `X-API-Key`. The Mem0 upstream URL still comes only from the wrapper deployment, never from organization connection JSON.

After the backend and wrapper are ready, continue with [the guide to using Mem0 OSS as external memory](/docs/external-memory) to create the organization connection, bind an agent, choose recall and capture policies, and test cross-session recall.

## Optional Logto authentication

AgentConnect does not include or start Logto. The default local stack keeps authentication off, but any network-exposed deployment should configure a Logto tenant for real user identities and renewable Control Plane tokens.

Self-hosted Logto OSS provides every Logto feature required by AgentConnect without a paid license. Logto Cloud requires a plan that includes a custom API Resource for normal production sessions; its Free plan is suitable only for short evaluation with AgentConnect's current ID-token fallback.

Follow [Logto authentication](/docs/logto-authentication) to create the SPA and machine-to-machine applications, Control Plane API Resource, social connectors, Account API access, email verification, callbacks, and regional identity settings.
