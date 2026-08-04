---
title: 🔗 Social account linking
excerpt: Use several social sign-in methods with one AgentConnect profile.
hidden: false
---

One AgentConnect profile can use multiple social sign-in methods. AgentConnect Cloud currently offers **GitHub**, **Google**, and **Slack**. A self-hosted deployment can additionally enable **Lark** and **Feishu** through its own Logto tenant.

Open the avatar menu → **Your profile** and find **Sign-in methods**.

## Link an account

Choose **Link** beside a provider and complete its authorization flow. GitHub and Google do not require an ownership code. Slack and Standard OAuth connectors can first ask for a code sent to the current profile's verified primary email; on a self-hosted deployment, ask the operator whether email verification is configured.

After linking, you can sign in through any linked provider and reach the same AgentConnect profile, organizations, memberships, and personal settings.

A provider account that already belongs to another AgentConnect profile cannot also be linked to this one.

## Unlink an account

Choose **Unlink** beside a connected provider. You must keep at least one social sign-in method, so the final linked provider cannot be removed.

Linking or unlinking does not:

- merge two AgentConnect profiles;
- change organization memberships, roles, or resource visibility;
- install a GitHub App or authorize repositories;
- install or configure a chat bot; or
- grant a chat-platform user access to a restricted agent.

For a provider-by-provider comparison, including profiles with several linked methods, see [Permissions with linked accounts](/docs/linked-account-permissions).

## Provider-specific session access

### Slack

A linked, verified Slack identity participates in two session checks:

- it matches the owner of private Slack direct-message sessions by workspace ID plus user ID; and
- when the organization enables **Follow Slack access**, it identifies the viewer whose current workspace or conversation access Slack must confirm.

For a public channel, an active full member of the installing workspace does not need to have joined that channel. Private channels and group DMs require current conversation membership; guests and Slack Connect users also require current conversation membership. Linking the matching Slack account can make existing sessions visible without rewriting their records. Unlinking removes that recognized identity, so private Slack DMs and Slack-scoped shared sessions that depended on it are no longer visible.

### Lark and Feishu on self-hosted deployments

A linked Lark or Feishu identity can directly match private-message ownership when the identity and bot come from the same app. That app-scoped match is not permission sync.

When the organization enables **Follow Feishu / Lark access**, AgentConnect instead checks current membership in the source chat. One regional permission app can evaluate chats from multiple bot apps; their App IDs do not need to match. This requires a Standard OAuth connector that stores the provider user token.

### GitHub

When the organization enables **Follow GitHub access**, sessions from a public repository remain available to everyone who can see the agent. A private-repository session requires a linked GitHub profile with current repository access.

Linking GitHub can therefore make an existing private-repository session available without rewriting it. Unlinking GitHub removes that match immediately but does not uninstall the GitHub App or change repository grants. If someone follows a protected session link from GitHub without a linked profile, the not-found screen can offer **Link GitHub profile**; that hint does not reveal whether the session exists or bypass its access check.

Where a provider identity is required, organization membership or the Owner role does not substitute for it. GitHub, Slack, Lark, and Feishu identities affect only their own provider checks, while Google remains a sign-in method with no provider-specific authorization. A personal API key or console identity does not stand in for a linked provider identity. See [Session visibility](/docs/session-visibility).

## AgentConnect OSS setup

AgentConnect OSS does not enable social sign-in by default. To offer linked accounts, configure optional Logto-backed OIDC sign-in, choose the displayed providers with `SOCIAL_PROVIDERS`, and create the matching Logto connectors. The Profile card appears only after OIDC sign-in is enabled.

The operator must also enable Logto Account API social-identity editing, configure the Management API integration used for identity reads and safe unlinking, provide working email delivery for profiles that require an ownership code, and register the account-link callback with each provider. Local no-auth mode does not infer a linked provider identity.

See [Logto authentication](/docs/logto-authentication#4-enable-social-account-linking) for the complete setup.
