---
title: 🐧 QQ
excerpt: Connect an official QQ bot for private chats and group @mentions on a self-hosted deployment.
hidden: false
---

QQ is available on **self-hosted deployments only**. AgentConnect Cloud does not offer it. The official Helm chart turns it on by default (`features.qq`). On the Docker Compose stack, add `qq` to `FEATURE_FLAGS` in `compose.env`, then recreate the web service — `docker compose restart` keeps the container's current environment and would leave the flag off:

```bash
docker compose --env-file compose.env up -d --force-recreate web
```

Until the flag is on, QQ does not appear in the integration picker.

The daemon connects outbound to QQ's official bot API, so no public callback URL is required.

## Create the bot

1. Open the [QQ Open Platform](https://q.qq.com/), register, and create a bot.
2. Turn on private and group messages in the bot's development settings, and copy its **AppID** and **AppSecret**.
3. While the bot is unpublished, add your own account and a test group to its sandbox — an unpublished bot answers nowhere else.
4. Before you publish the bot, add the public IP of the machine running your daemon to the bot's **IP allowlist**. QQ rejects API calls from any other address once a bot is live, and a bot behind a changing home IP stops answering when that address changes.

## Connect it

On your agent, open **Integrations → Add integration → QQ**, paste the AppID and AppSecret, and click **Connect**. AgentConnect verifies the pair with QQ before saving it.

## Use it

- **Private chat** — message the bot directly. Replies stream in as the agent works, formatted as Markdown.
- **Groups** — add the bot to a QQ group and **@-mention** it. Everyone in the group shares that group's conversation with the agent; ordinary group chatter the bot is not mentioned in is not part of it.
- **Images** — send the bot a PNG, JPEG, or WEBP image, and an agent can share images from its workspace back. Other file types are not supported yet.

See [In-conversation commands](/docs/integrations-overview#in-conversation-commands) for stopping, cancelling, queuing, and changing supported session settings.

## Notes

- QQ tells a bot nothing about the group it is in, so conversations are listed as `QQ group · <id>` rather than by name. People appear by name only where QQ sends one, which it never does in private chats.
- QQ limits how many replies a bot may send for one incoming message. In a group, the agent acknowledges the request, posts bounded progress, and then the answer; if the answer does not fit, AgentConnect says so and keeps the full text in the session.
- QQ replies must answer a message the bot received, so the console cannot send into a QQ conversation, and an agent cannot open one on its own.
- One QQ bot binds to one agent. Deleting the integration frees the bot for reuse (**Use an existing bot** next time).
- Rotate the AppSecret under **Settings → Bots → QQ → Update secret**. The bot's conversations are unchanged.
