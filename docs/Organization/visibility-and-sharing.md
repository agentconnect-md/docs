---
title: Visibility & sharing
excerpt: Keep an agent, daemon or schedule visible to everyone in the org — or only to the people you pick.
hidden: false
---

By default everything you create is visible to the whole organization. **Agents, daemons and schedules** can instead be **restricted** to selected members — useful for experiments, sensitive repos, or a personal agent living on your laptop's daemon.

## Setting visibility

Every create dialog (and the resource's settings) has a **Visibility** field:

- **Everyone** — all org members can see it.
- **Selected** — only the people you choose. Search and pick members; the **creator is always included** (you can't remove them), and **org owners always see restricted resources** too.

Restricted resources wear a small lock next to their name in lists. On the resource page, the Visibility row shows who has access; anyone who can manage the resource can change the audience later.

## What restriction means in practice

- A restricted **agent** disappears from lists, pickers and stats for everyone outside its audience — including its sessions.
- A restricted **daemon** hides itself and what runs on it from non-audience members; you can't place an agent on a daemon you can't see.
- A restricted **schedule** hides the schedule and links its runs' sessions only for its audience.

Sharing controls **who sees a resource** in the console. It's different from:

- [Roles](/docs/members-and-roles) — what a member may *do* at all;
- [Agent visibility / call policy](/docs/configure-an-agent) — which *agents* may call an agent as a sub-agent.
