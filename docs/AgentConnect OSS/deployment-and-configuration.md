---
title: Deployment and configuration
excerpt: Configure AgentConnect OSS versions, ports, secrets, public URLs, GitHub App integration, and optional Logto-backed sign-in.
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

| Variable                         | Requirement                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------- |
| `AGENTCONNECT_POSTGRES_PASSWORD` | Use URL-safe characters; the value is embedded in the PostgreSQL connection URL |
| `AGENTCONNECT_API_KEY_PEPPER`    | At least 32 characters and stable for the lifetime of issued API keys           |
| `AGENTCONNECT_RELAY_TOKEN`       | At least 32 characters; shared only by the Control Plane and Relay              |

Generate independent values, for example:

```bash
openssl rand -hex 32
```

Run the command separately for each secret. Rotating `AGENTCONNECT_API_KEY_PEPPER` invalidates existing daemon and personal API keys.

PostgreSQL 18 data lives in the `agentconnect_postgres-data` Docker volume. `docker compose down` preserves it; `docker compose down --volumes` permanently deletes it. Back up the database before any non-throwaway use.

## Optional GitHub App

Configure an instance-level GitHub App when you want to:

- select private repositories for agent workspaces;
- give daemons short-lived, repository-scoped Git credentials; or
- trigger agents from GitHub issues, pull requests, comments, and pushes.

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

| Repository permission | Access         | AgentConnect use                                                                         |
| --------------------- | -------------- | ---------------------------------------------------------------------------------------- |
| Metadata              | Read-only      | Installation and repository identity; GitHub grants this automatically                   |
| Contents              | Read and write | Clone, fetch, inspect branches, and push                                                 |
| Issues                | Read and write | Receive issue events and post issue replies                                              |
| Pull requests         | Read and write | Receive PR events, post replies, and submit formal reviews                               |
| Actions               | Read and write | Inspect and run GitHub Actions for repositories with AgentConnect `write` access         |
| Workflows             | Read and write | Push changes under `.github/workflows` for repositories with AgentConnect `write` access |
| Checks                | Read and write | Publish informational **AgentConnect PR Review** Checks                                  |

For repository selection and read-only cloning only, keep **Contents** read-only and omit the other optional permissions. Event subscriptions without write-back need read-only **Issues** or **Pull requests**; replies and formal reviews need write access. The AgentConnect `write` tier requires **Contents**, **Actions**, and **Workflows** at read and write. **Checks** is optional when you do not publish PR review Checks. AgentConnect cannot expand an installation beyond the permissions declared by the App.

Under **Subscribe to events**, select:

- `issues`;
- `pull_request`;
- `issue_comment`;
- `pull_request_review_comment`;
- `push`; and
- `check_run` when using informational PR review Checks.

GitHub sends `installation` and `installation_repositories` events to GitHub Apps automatically; they are not manual subscription options.

The App declaration is the maximum permission set. Each installation owner chooses the repositories and approves that set. AgentConnect then mints a short-lived token narrowed to one authorized repository and the agent's `read`, `comment`, or `write` tier. Existing installation owners must approve permission increases before AgentConnect can use them.

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

The `LOGTO_MGMT_*` variables below are not required to enable the GitHub App. They add per-user GitHub authorization checks when Logto-backed sign-in is enabled; without them, repository authorization follows the AgentConnect organization and installation boundary.

## Optional Logto sign-in

AgentConnect does not include or start Logto. You may connect an existing Logto tenant by configuring both the browser client and Control Plane verifier:

```dotenv
LOGTO_ENDPOINT=https://tenant.example.com/
LOGTO_APP_ID=<application-id>
LOGTO_API_RESOURCE=https://api.example.com

OIDC_ISSUER=https://tenant.example.com/oidc
OIDC_AUDIENCE=https://api.example.com
```

In Logto, register this redirect URI for the Web application:

```text
http://localhost:3000/auth/callback
```

If you changed `AGENTCONNECT_PUBLIC_WEB_URL`, use that origin followed by `/auth/callback`.

The values must agree:

- `OIDC_ISSUER` is the Logto endpoint with `/oidc`.
- When `LOGTO_API_RESOURCE` is set, `OIDC_AUDIENCE` must equal that resource.
- Without an API resource, omit `LOGTO_API_RESOURCE` and set `OIDC_AUDIENCE` to `LOGTO_APP_ID`.
- Set or remove the Web and Control Plane values together. Configuring only one side leaves the console unable to authenticate its API calls.

Restart the affected services after changing the file:

```bash
docker compose --env-file compose.env up -d --force-recreate control-plane web
```

Leaving all five variables unset preserves no-auth mode. In that mode the Control Plane deliberately admits every request as the fixed local owner, so it must remain private.
