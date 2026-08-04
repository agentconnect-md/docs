---
title: 🔐 Logto authentication
excerpt: Configure production sign-in, renewable Control Plane tokens, social account linking, and provider-aware access for AgentConnect OSS.
hidden: false
---

AgentConnect OSS does not include or start Logto. The local Compose stack uses no-auth mode by default; connect a Logto tenant before exposing the Web console or Control Plane to a network.

AgentConnect uses Logto to:

- sign people in and give each person a stable OIDC identity;
- issue a renewable JWT for the AgentConnect Control Plane;
- let one profile link several social sign-in methods; and
- read linked provider identities when AgentConnect evaluates provider-specific session access.

AgentConnect does **not** use Logto Organizations or Logto RBAC for its own organizations, roles, visibility, or permissions. Those remain AgentConnect concepts.

## Choose a Logto edition

| Logto option | AgentConnect use |
| --- | --- |
| [Logto OSS](https://docs.logto.io/logto-oss) | Full production setup without paid Logto features |
| [Logto Cloud Pro](https://logto.io/pricing) | Managed production setup |
| Logto Cloud Free | Short evaluation only |

A production deployment needs one custom **API Resource** for the Control Plane. Logto OSS includes this capability. Logto Cloud currently requires a paid plan to create custom API resources; check the [current Logto pricing](https://logto.io/pricing). The Cloud Free plan includes the Account API, one machine-to-machine application, and up to three social connectors, so the missing API Resource is the production blocker for AgentConnect.

AgentConnect needs the resource because the Web console calls a separately deployed Control Plane. It gives the browser a renewable JWT access token whose audience is that API. No Logto permissions need to be added to the resource because AgentConnect performs authorization itself.

Without an API Resource, AgentConnect can fall back to the SPA's ID token. That token is intended for the client rather than the Control Plane and the current AgentConnect client does not renew it. Under the usual one-hour Logto token lifetime, longer sessions begin receiving `401` responses. Use this fallback only for local evaluation.

## What to create in Logto

| Logto setup | Needed for |
| --- | --- |
| Single-page application | Browser sign-in |
| API Resource | Production Control Plane auth |
| Social connectors | Chosen sign-in providers |
| Account API | Linking providers |
| Machine-to-machine application | Linking and provider access |
| Email connector | Ownership codes when required |

## 1. Create the SPA application

In **Logto Console → Applications**, create a **Single-page application (SPA)**. AgentConnect uses Authorization Code with PKCE, so this application has an App ID but no App Secret.

Register these exact URLs, using your `AGENTCONNECT_PUBLIC_WEB_URL` as the origin:

| Setting | URI |
| --- | --- |
| Redirect URI | `<AGENTCONNECT_PUBLIC_WEB_URL>/auth/callback` |
| Post sign-out redirect URI | `<AGENTCONNECT_PUBLIC_WEB_URL>/login` |

For the default local stack, the values are:

```text
http://localhost:3000/auth/callback
http://localhost:3000/login
```

Copy the application's **App ID**. Do not create a Traditional Web application for the browser client.

## 2. Create the Control Plane API Resource

In **Logto Console → API resources**, create one [API Resource](https://docs.logto.io/authorization/global-api-resources) such as:

| Setting | Example |
| --- | --- |
| Name | `AgentConnect Control Plane` |
| API identifier | `https://agentconnect.example/control-plane` |

The identifier is an absolute URI used as the token audience; it does not need to resolve to a public endpoint. You do not need to add permissions or assign user roles to this resource.

Use the exact identifier for both values:

```dotenv
LOGTO_API_RESOURCE=https://agentconnect.example/control-plane
OIDC_AUDIENCE=https://agentconnect.example/control-plane
```

For an evaluation-only Logto Cloud Free setup, omit `LOGTO_API_RESOURCE` and set `OIDC_AUDIENCE` to the SPA App ID. This selects the non-renewing ID-token fallback described above.

## 3. Configure social connectors

Create the social connectors you want in Logto, then add them to the tenant's sign-in experience. AgentConnect recognizes these lowercase connector targets:

```dotenv
SOCIAL_PROVIDERS=github,google,slack,lark,feishu
```

Set this list to match the connectors that actually exist. `SOCIAL_PROVIDERS` controls what AgentConnect displays; it does not create or discover connectors.

Three callback types are involved:

| Register with | Callback |
| --- | --- |
| Logto SPA | `<AGENTCONNECT_PUBLIC_WEB_URL>/auth/callback` |
| Social provider | The callback shown by its Logto connector |
| Social provider | `<AGENTCONNECT_PUBLIC_WEB_URL>/auth/social/callback` |

The final callback is required for linking another sign-in method from **Your profile**. Keep it alongside the normal Logto connector callback. For GitHub, register the connector as a [GitHub App](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app) rather than an OAuth App: a GitHub App accepts multiple callback URLs and an OAuth App accepts only one, so an OAuth App cannot serve both callbacks above.

This is a separate app from the [AgentConnect GitHub App](/docs/deployment-and-configuration#optional-github-app), which handles repositories and events. One is a sign-in connector, the other is a repository integration; do not reuse a single registration for both.

## 4. Enable social account linking

Complete all three parts when people should be able to link and unlink providers from **Your profile → Sign-in methods**.

### Account API

In **Logto Console → Sign-in & account → Account center**, configure the [Account API](https://docs.logto.io/end-user-flows/account-settings/by-account-api):

1. Enable **Account API**.
2. Set **Social identities** to `Edit`.

AgentConnect requests the `email`, `profile`, and `identities` scopes needed by these flows.

### Email verification

Email delivery is not required for every provider:

| Provider | Email connector needed for profile linking |
| --- | --- |
| GitHub | No |
| Google | No |
| Feishu with Logto's built-in connector | No |
| Slack | Yes |
| Feishu / Lark with Standard OAuth | Depends; configure if **Send code** appears |

For Slack, Logto asks for an ownership code when the current profile has a password, primary email, or primary phone. Configure email delivery whenever you offer Slack profile linking, even if some social-only profiles can complete the flow without a code.

If a profile sees **Send code**, it needs both a verified Logto `primaryEmail` and working email delivery. An email stored only inside a social identity is not sufficient. Configure a Logto [email connector](https://docs.logto.io/connectors/email-connectors):

1. Open **Console → Connectors → Email and SMS connectors → Set up**.
2. Choose an email provider. For Logto OSS, use SMTP, HTTP, or another supported provider connector.
3. Ensure the connector handles the [`UserPermissionValidation` template](https://docs.logto.io/connectors/email-connectors/email-templates) and that the template includes the `{{code}}` placeholder.
4. Send a test message, then choose **Save and Done**.

Logto OSS does not include Logto Cloud's built-in email delivery service. Use SMTP, HTTP, or another supported email connector and account for any provider cost.

### Management API application

Create a **Machine-to-machine application** by following Logto's [Management API guide](https://docs.logto.io/integrate-logto/interact-with-management-api), then assign it the built-in **Logto Management API access** role. That role includes the Management API's `all` permission, which AgentConnect requests for connector lookup, identity metadata, and safe unlinking.

Copy its App ID and App Secret, then configure:

```dotenv
LOGTO_MGMT_ENDPOINT=<canonical-logto-origin>
LOGTO_MGMT_APP_ID=<m2m-app-id>
LOGTO_MGMT_APP_SECRET=<m2m-app-secret>
LOGTO_MGMT_RESOURCE=<management-api-identifier>
```

Use the Management API identifier for your Logto edition:

| Logto edition | `LOGTO_MGMT_RESOURCE` |
| --- | --- |
| Logto Cloud | `https://<tenant-id>.logto.app/api` |
| Logto OSS | `https://default.logto.app/api` |

For Logto Cloud with a custom sign-in domain, `LOGTO_ENDPOINT` can use the custom domain, but `LOGTO_MGMT_ENDPOINT` and `LOGTO_MGMT_RESOURCE` must use the tenant's canonical `logto.app` origin. For Logto OSS, use the deployed Logto origin as `LOGTO_MGMT_ENDPOINT` and set the resource explicitly to `https://default.logto.app/api`.

## 5. Configure AgentConnect

Put the browser and Control Plane settings in `compose.env`:

```dotenv
LOGTO_ENDPOINT=https://login.example.com/
LOGTO_APP_ID=<spa-app-id>
LOGTO_API_RESOURCE=https://agentconnect.example/control-plane
SOCIAL_PROVIDERS=github,google,slack

OIDC_ISSUER=https://login.example.com/oidc
OIDC_AUDIENCE=https://agentconnect.example/control-plane

LOGTO_MGMT_ENDPOINT=https://<tenant-id>.logto.app
LOGTO_MGMT_APP_ID=<m2m-app-id>
LOGTO_MGMT_APP_SECRET=<m2m-app-secret>
LOGTO_MGMT_RESOURCE=https://<tenant-id>.logto.app/api
```

Keep these relationships exact:

- `OIDC_ISSUER` is the Logto endpoint's origin plus `/oidc`, with no doubled slash — for the endpoint above that is `https://login.example.com/oidc`.
- `LOGTO_API_RESOURCE` and `OIDC_AUDIENCE` are the same API identifier.
- The SPA and M2M applications belong to the same Logto tenant.
- `SOCIAL_PROVIDERS` matches the tenant's connector targets.

Restart the affected services:

```bash
docker compose --env-file compose.env up -d --force-recreate control-plane web
```

## Lark and Feishu permission sync

Lark and Feishu social sign-in and account linking are self-hosted options. **Follow Feishu / Lark access** is a separate capability: it uses a linked person's provider token to check whether they currently belong to each source chat.

One regional permission app can check sessions created by multiple AgentConnect bot apps. The permission app does not send or receive AgentConnect messages, and its App ID does not need to match the bot App IDs.

For each region you want to synchronize:

1. Create a dedicated Lark or Feishu app. Enable its **Bot** capability and grant `im:chat:readonly` or `im:chat.members:read`; the platform requires Bot capability for its [membership-check API](https://open.feishu.cn/document/server-docs/group/chat-member/is_in_chat).
2. Configure a Logto connector with target `lark` or `feishu` that can store and return the provider's access and refresh tokens. Enable [third-party token storage](https://docs.logto.io/secret-vault/federated-token-set).
3. Use that permission app's credentials below. These are not the credentials of every AgentConnect bot:

```dotenv
FEISHU_PLATFORM_APP_ID=<app-id>
FEISHU_PLATFORM_APP_SECRET=<app-secret>
LARK_PLATFORM_APP_ID=<app-id>
LARK_PLATFORM_APP_SECRET=<app-secret>
```

Add the values to `compose.env`, then recreate the Control Plane:

```bash
docker compose --env-file compose.env up -d --force-recreate control-plane
```

Logto's built-in Feishu connector supports sign-in and profile linking, but it is not currently one of Logto's token-storage-capable social connectors. By itself, it cannot power **Follow Feishu / Lark access**. Use Logto's [Standard OAuth 2.0 connector](https://docs.logto.io/integrations/oauth2) or another compatible connector when you need permission sync.

The setting stays unavailable until at least one regional permission app is configured. Access checks fail closed if Logto cannot return a valid provider token.

## Verify the setup

1. Open the console in a private browser window and sign in through one configured provider.
2. Open **Your profile → Sign-in methods** and confirm the configured providers appear.
3. Confirm GitHub, Google, or Logto's built-in Feishu connector proceeds without an ownership code.
4. If you offer Slack or another connector that asks for a code, confirm the `UserPermissionValidation` email arrives and completes the link.
5. Unlink the second provider again; the final sign-in method remains protected.
6. If you enabled Lark or Feishu permission sync, confirm the linked profile can open an allowed chat session created through a different bot App ID.
7. Confirm the Web console can continue calling the Control Plane after the original access token expires.

An immediate `401` normally means the API identifier and `OIDC_AUDIENCE` do not match. A provider button that reaches a Logto error page normally means the connector target is absent or not enabled in the sign-in experience.

Leaving all Logto and OIDC variables unset preserves local no-auth mode. In that mode the Control Plane admits every request as the fixed local owner, so keep it bound to localhost.
