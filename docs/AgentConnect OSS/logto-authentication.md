---
title: 🔐 Logto authentication
excerpt: Add Logto-backed sign-in to AgentConnect OSS with the bundled local overlay or an external production tenant.
hidden: false
---

AgentConnect uses Logto for human sign-in, renewable browser tokens, and linked social identities. AgentConnect still owns organizations, roles, agent visibility, session visibility, and repository permissions.

The base Compose stack keeps authentication off for local evaluation. Choose one of these paths when you want real identities:

| Path | Use it for |
| --- | --- |
| Bundled Logto OSS overlay | Local evaluation without DNS or TLS |
| External Logto OSS or Cloud tenant | Network and production deployments |

## Local sign-in with the bundled overlay

### 1. Start AgentConnect and Logto

From the AgentConnect repository:

```bash
docker compose -f compose.yaml -f compose.logto.yaml up -d
```

Open:

- Logto Console: [http://admin.agentconnect.localhost:3002](http://admin.agentconnect.localhost:3002)
- Tenant Admin: [http://localhost:8091](http://localhost:8091)
- AgentConnect: [http://app.agentconnect.localhost:3000](http://app.agentconnect.localhost:3000)

Complete Logto's initial Console onboarding if this is a new database.

### 2. Create the Management API application

In **Logto Console → Applications**, create a **Machine-to-machine** application. Assign it the built-in **Logto Management API access** role, then copy its App ID and App Secret.

Open Tenant Admin, choose **Continue setup**, and enter those credentials under **Connect Logto**. AgentConnect stores the secret as a write-only deployment secret.

The expected Management API resource is:

```text
https://default.logto.app/api
```

See Logto's [Management API guide](https://docs.logto.io/integrate-logto/interact-with-management-api) for the application and role.

### 3. Choose the first sign-in provider

Tenant Admin creates or updates the AgentConnect SPA, its redirects, the selected social connector, the sign-in experience, and the `ADMIN` role.

| Provider | Local bootstrap |
| --- | --- |
| Google | Works on localhost; create the Web OAuth client with the exact values shown |
| GitHub | Tenant Admin creates one App for repository integration and sign-in |
| Slack | Requires HTTPS Logto, Web, Control Plane, and Relay origins |

Google is the shortest local path. Paste its client ID and secret into Tenant Admin and choose **Save Google OAuth and configure Logto**.

For GitHub, choose **Create GitHub App and configure Logto** and approve the manifest on GitHub. The local HTTP setup leaves webhook delivery disabled until you add reachable HTTPS ingress.

### 4. Claim the first administrator

After Tenant Admin finishes the provider setup:

1. Choose **Sign in with Logto**.
2. Complete sign-in with the configured provider.
3. Tenant Admin assigns that first user the `ADMIN` role.
4. Sign in once more so the refreshed token contains the role.

Tenant Admin then opens the complete deployment settings. Restart the consuming services after changes:

```bash
docker compose restart control-plane relay web
```

The bundled overlay is for local evaluation. It uses the SPA's ID token until you add an API Resource; use the production setup below before exposing AgentConnect to a network.

## Production or external Logto

Run Logto OSS separately, or use a Logto Cloud plan that supports a custom API Resource. Configure the final public origins and Logto endpoints in `compose.env` before opening Tenant Admin:

```dotenv
AGENTCONNECT_PUBLIC_WEB_URL=https://app.agentconnect.example
AGENTCONNECT_PUBLIC_CP_URL=https://api.agentconnect.example
AGENTCONNECT_PUBLIC_RELAY_URL=https://relay.agentconnect.example
AGENTCONNECT_RELAY_DAEMON_URL=wss://relay.agentconnect.example

LOGTO_ENDPOINT=https://login.agentconnect.example
LOGTO_ADMIN_ENDPOINT=https://admin.agentconnect.example
OIDC_ISSUER=https://login.agentconnect.example/oidc
LOGTO_MGMT_ENDPOINT=https://login.agentconnect.example
```

For Logto Cloud, use the tenant's canonical `logto.app` origin for `LOGTO_MGMT_ENDPOINT`, even when sign-in uses a custom domain.

Start the base stack with the environment file:

```bash
docker compose --env-file compose.env up -d
```

Create the Management API M2M application in that tenant, assign **Logto Management API access**, and enter its credentials in Tenant Admin. Tenant Admin will create or adopt the browser SPA and configure the supported social connectors.

## Create the Control Plane API Resource

A production browser session needs a renewable access token whose audience identifies the AgentConnect Control Plane. In **Logto Console → API resources**, create one custom API Resource:

| Setting | Example |
| --- | --- |
| Name | `AgentConnect Control Plane` |
| API identifier | `https://api.agentconnect.example` |

The identifier must be an absolute URI but does not need to resolve to the Control Plane. AgentConnect performs its own authorization, so this resource does not need Logto permissions or user roles.

In Tenant Admin:

1. Open **Logto → Edit**.
2. Enter the identifier as **Browser API resource**.
3. Save, choose **Apply expected settings**, and restart Control Plane and Web.

The saved value becomes both the browser token resource and the Control Plane audience. Logto requires the requested resource to exactly match its registered API identifier; see [Protect global API resources](https://docs.logto.io/authorization/global-api-resources).

Without an API Resource, AgentConnect falls back to the SPA ID token. That is sufficient for the local overlay, but it is not the normal production session because the current browser flow does not renew that fallback token.

## Social providers

Tenant Admin manages the Logto connectors for GitHub, Google, and Slack from the corresponding provider cards:

- **GitHub:** one AgentConnect GitHub App can handle repository integration and sign-in.
- **Google:** create the OAuth client manually with the exact callback values Tenant Admin shows.
- **Slack:** one deployment App can handle workspace installation and a separate Slack OIDC sign-in flow; all public origins must use HTTPS.

The Lark and Feishu cards configure regional tenant Apps for trusted-workspace bot admission. They do not automatically add Lark or Feishu as Logto sign-in methods. See [Lark and Feishu tenant Apps](/docs/deployment-and-configuration#lark-and-feishu-tenant-apps).

## Lark and Feishu identities

Lark and Feishu session access is an advanced self-hosted setup. It needs both:

- a Logto social identity that preserves the provider's cross-App `union_id`; and
- the matching regional Login App configured in Tenant Admin.

The Login App and every admitted AgentConnect bot App must belong to the same provider workspace. AgentConnect uses `union_id` to recognize the same person across those Apps, then uses the installed bot's credentials to check current chat membership. It does not use a person's provider token or the Login App credential for that membership read.

Tenant Admin does not create the Lark or Feishu Logto connector. If you enable either sign-in method, confirm that its Logto identity record includes `union_id`; an App-scoped `open_id` is not sufficient. See [Lark / Feishu](/docs/lark-feishu) for the bot permissions and installation flow.

## Link additional social accounts

To let people add or remove providers under **Your profile → Sign-in methods**:

1. In **Logto Console → Sign-in & account → Account center**, enable the Account API.
2. Set **Social identities** to **Edit**.
3. Keep each provider's normal Logto callback and the AgentConnect callback shown by Tenant Admin.

Logto may require an ownership code before changing a social identity:

| Provider | Email verification for linking |
| --- | --- |
| GitHub | Not normally required |
| Google | Not normally required |
| Slack | Required |

If the flow shows **Send code**, configure a Logto [email connector](https://docs.logto.io/connectors/email-connectors) that supports the `UserPermissionValidation` template. The user also needs a verified primary email; an address available only inside a social identity is not enough.

The bundled Logto OSS deployment does not include an email delivery service. Connect SMTP, HTTP, or another supported email provider when you enable flows that send verification codes.

Logto documents the identity-editing behavior in [Account settings by Account API](https://docs.logto.io/end-user-flows/account-settings/by-account-api).

## Verify the setup

1. Sign in to AgentConnect in a private browser window.
2. Confirm Tenant Admin opens only for a user with the `ADMIN` role.
3. Open **Your profile → Sign-in methods** and link a second configured provider.
4. Confirm AgentConnect continues calling the Control Plane after the original access token expires.
5. In Tenant Admin, use **Check match** for Logto and each configured provider.

An immediate `401` usually means the browser API resource and Control Plane audience do not match. A provider button that reaches a Logto error page usually means the connector is missing from the sign-in experience.

Leaving Logto and OIDC endpoints unset preserves the local no-auth mode. Keep that mode bound to loopback.
