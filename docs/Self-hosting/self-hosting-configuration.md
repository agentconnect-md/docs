---
title: Self-hosting configuration
excerpt: Configure Compose versions, ports, secrets, public URLs, and optional Logto-backed sign-in.
hidden: false
---

The default Compose stack requires no configuration. It uses current stable images, local-only credentials, fixed localhost ports, and no-auth mode.

For overrides, copy the provided template:

```bash
cp compose.env.example compose.env
```

Uncomment and edit only the values you need, then include the file in every command:

```bash
docker compose --env-file compose.env up -d
```

`compose.env` is gitignored. Keep it out of source control and backups that are not approved for secrets.

## Image version and platform

| Variable                          | Default                   | Purpose                                              |
| --------------------------------- | ------------------------- | ---------------------------------------------------- |
| `AGENTCONNECT_VERSION`            | `latest`                  | Shared release tag for Web, Control Plane, and Relay |
| `AGENTCONNECT_PLATFORM`           | `linux/amd64`             | Platform of the published images                     |
| `AGENTCONNECT_IMAGE_REGISTRY`     | `ghcr.io/agentconnect-md` | Image registry and namespace                         |
| `AGENTCONNECT_PRISMA_CLI_VERSION` | `7.8.0-node24-r1`         | Version-matched migration runner toolchain           |

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
