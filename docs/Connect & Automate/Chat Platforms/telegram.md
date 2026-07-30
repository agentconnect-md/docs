---
title: ✈️ Telegram
excerpt: One token from @BotFather and your agent answers Telegram DMs and groups.
hidden: false
---

Telegram is the quickest chat integration: one token, no app review, no public URL — the daemon connects outbound to Telegram's API.

## Create the bot

1. In Telegram, message [@BotFather](https://t.me/botfather), send `/newbot`, and follow the prompts (bot name, then a username ending in `bot`).
2. BotFather replies with a **bot token** like `123456789:AAE…` — copy it.

## Connect it

On your agent: **Integrations → Add integration → Telegram**, paste the token, **Connect**.

## Use it

- **DM the bot** — open `t.me/<your_bot_username>` and just talk.
- **Groups** — add the bot to a group. By default Telegram's **privacy mode** means bots only see commands and replies to them; for a conversational agent you'll usually want to disable it: in @BotFather, `/mybots → your bot → Bot Settings → Group Privacy → Turn off`, then re-add the bot to the group.

`/stop` interrupts the agent's current turn; `/queue <message>` holds a message until it finishes (handled by the daemon, works even offline from the control plane).

## Notes

- One Telegram bot binds to one agent. Deleting the integration frees the bot for reuse (**Use an existing bot** next time).
- Bots and their tokens are managed org-wide under **Settings → Bots → Telegram**.
