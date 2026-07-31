---
title: ⏰ Schedules
excerpt: Run an agent on a timer — daily reports, nightly audits, periodic sweeps — with output posted to a channel or kept headless.
hidden: false
---

**Schedules** run an agent on a cron cadence: a daily deploy report, a nightly dependency audit, a Monday-morning triage sweep. Each firing starts a fresh session for the agent, so every run is fully replayable in [Sessions](/docs/sessions).

![Creating a schedule](https://raw.githubusercontent.com/agentconnect-md/docs/HEAD/images/new-schedule.png)

## Create one

**Schedules → New schedule**:

- **Name** — e.g. `weekly-deploy-report`.
- **Agent** — who runs it.
- **Repeats** — a friendly builder: **Hourly / Daily / Weekdays / Weekly** (day picker + time) or **Custom** with a raw five-field cron expression (`0 9 * * 1`).
- **Timezone** — the IANA timezone used to evaluate the schedule, such as `America/New_York` or `Asia/Shanghai`. New schedules default to your browser's timezone, and the saved timezone continues to apply if the agent later moves to a daemon in another region.
- **Prompt** — the task, written like you'd brief a person: *"Summarize last week's deploys and rollbacks, and post the report to #deploys."*
- **Target integration** — optional. Pick one of the agent's integration channels and the run posts its output there, threading replies under it. Leave it on **None — session only** for a headless run you read in Sessions.
- **Visibility** — who in the org sees the schedule ([details](/docs/visibility-and-sharing)).

New schedules start **enabled**; the toggle on the list (or detail header) pauses them without losing anything.

## The schedule page

- Header: enabled toggle, next run, the cron expression in plain words, and target channel. **Edit** shows the saved timezone.
- **Run now** fires an off-cycle run immediately — perfect while iterating on the prompt. The run appears below once the daemon reports it.
- **Runs** — history with status (**Running / Success / Failed**), target, duration, and a link to each run's session.

## Notes

- Schedules fire on the agent's daemon; if the daemon is offline at the scheduled moment, that firing is skipped (the runs list is your audit trail).
- API clients should send an explicit IANA `timezone` so a schedule does not depend on the control-plane host's default timezone.
- Because each run is a fresh session, the prompt must be self-contained — use the agent's [memory](/docs/configure-an-agent) for standing context.
