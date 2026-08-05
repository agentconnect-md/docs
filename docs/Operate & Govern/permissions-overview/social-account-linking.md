---
title: 🔗 Social account linking
excerpt: Use several social sign-in methods with one AgentConnect profile.
hidden: false
---

One AgentConnect profile can use multiple social sign-in methods. AgentConnect Cloud currently offers **GitHub**, **Google**, and **Slack**. A self-hosted deployment can additionally enable **Lark** and **Feishu** with the regional identity setup described in [Logto authentication](/docs/logto-authentication#lark-and-feishu-permission-sync).

Open the avatar menu → **Your profile** and find **Sign-in methods**.

![Link another sign-in method from your profile](https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/social-sign-in-methods.png)

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

A linked Slack identity can match the owner of a private Slack direct-message session. When the organization enables **Follow Slack access**, it is also used to check the viewer's current workspace or conversation access. Linking the matching account can make existing sessions visible; unlinking removes that provider match.

### Lark and Feishu on self-hosted deployments

A linked Lark or Feishu identity can match a private direct-message session. When **Follow Feishu / Lark access** is enabled, AgentConnect checks current chat membership for synchronized sessions. One regional permission app can evaluate chats served by multiple bot apps.

### GitHub

When the organization enables **Follow GitHub access**, sessions from a public repository remain available to everyone who can see the agent. A private-repository session requires a linked GitHub profile with current repository access.

Linking GitHub can therefore make an existing private-repository session available. Unlinking GitHub removes that match but does not uninstall the GitHub App or change repository grants.

Where a provider identity is required, organization membership or the Owner role does not substitute for it. GitHub, Slack, Lark, and Feishu identities affect only their own provider checks, while Google remains a sign-in method with no provider-specific authorization. A personal API key or console identity does not stand in for a linked provider identity. See [Session visibility](/docs/session-visibility).

## AgentConnect OSS setup

AgentConnect OSS does not enable social sign-in by default. To offer linked accounts, configure optional Logto-backed OIDC sign-in, choose the displayed providers with `SOCIAL_PROVIDERS`, and create the matching Logto connectors. The Profile card appears only after OIDC sign-in is enabled.

The operator must also enable Logto account linking, configure provider identity lookup, and provide email delivery for providers that require an ownership code. Local no-auth mode does not infer a linked provider identity.

See [Logto authentication](/docs/logto-authentication#4-enable-social-account-linking) for the complete setup.
