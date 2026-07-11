---
title: Discord
excerpt: A bot token, one intent checkbox and an invite link — then your agent lives in your Discord server.
hidden: false
---

The daemon connects to Discord's gateway outbound — no public endpoint required.

## Create the bot

1. Open the [Discord Developer Portal](https://discord.com/developers/applications) → **New Application**, name it.
2. Under **Bot**, copy the **token** (Reset Token if none is shown).
3. Still under **Bot**, enable the **Message Content intent** — without it the bot can't read what people write.

## Connect it

On your agent: **Integrations → Add integration → Discord**, paste the token. The dialog shows a **setup checklist** and an **Add to Discord** button — the invite link is built for your app with the right scopes (`bot` + `applications.commands`) and permissions (including **Create Public Threads**, which the agent uses to keep conversations tidy).

Click **Add to Discord**, pick your server, approve.

## Use it

Mention the bot in a channel it can see and it answers — longer conversations continue in threads. `/stop` interrupts its current turn; `/queue <message>` delivers a message once it's idle.

## Notes

- If the bot joins but never replies, re-check the **Message Content intent** — it's the most common miss.
- One Discord bot binds to one agent; deleting the integration frees the bot for reuse.
- Org-wide bot management (incl. re-invite links) lives under **Settings → Bots → Discord**.
