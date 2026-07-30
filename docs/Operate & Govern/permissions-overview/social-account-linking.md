---
title: 🔗 Social account linking
excerpt: Use GitHub, Google, and Slack sign-in methods with one AgentConnect profile.
hidden: false
---

When Logto-backed authentication is configured, one AgentConnect profile can have multiple social sign-in methods. The supported provider targets are **GitHub**, **Google**, and **Slack**. An operator chooses which targets AgentConnect shows through `SOCIAL_PROVIDERS` and must configure the matching Logto connectors.

Open the avatar menu → **Your profile** and find **Sign-in methods**.

## Link an account

Choose **Link** beside a provider and complete its authorization flow. AgentConnect may first send a verification code to your verified primary email so it can confirm that you still control the current profile.

After linking, you can sign in through any linked provider and reach the same AgentConnect profile, organizations, memberships, and personal settings.

A provider account that already belongs to another AgentConnect profile cannot also be linked to this one.

## Unlink an account

Choose **Unlink** beside a connected provider. You must keep at least one social sign-in method, so the final linked provider cannot be removed.

Linking or unlinking does not:

- merge two AgentConnect profiles;
- change organization memberships, roles, or resource visibility;
- install a GitHub App or authorize repositories;
- install or configure a Slack bot; or
- grant a chat-platform user access to a restricted agent.

## Session ownership status

Social account linking is available today as a sign-in feature. Linked platform identities are not yet added to the authorization identity set used for private IM sessions.

In particular, linking Slack does not yet make a workspace-scoped Slack DM session visible to that console profile. AgentConnect records the workspace and user identity so the permission model can support that mapping later without changing the stored session. See [Session visibility](/docs/session-visibility).

## Self-hosted requirements

The Profile card appears only when OIDC sign-in is enabled. A self-hosted operator must also enable Logto Account API social-identity editing, configure the Management API integration used for identity reads and safe unlinking, provide a verified-email flow, and register the account-link callback with each provider.

See [Enable social account linking](/docs/deployment-and-configuration#enable-social-account-linking) for the complete setup.
