---
title: Security boundary
excerpt: Which execution environments isolate a session from the machine it runs on, and which work each one is for.
hidden: false
---

A session's execution environment decides what it can reach when the agent does something you did not intend: a wrong command, or an instruction it picked up from content it read. Choose it by the least-trusted content the agent acts on, not only by who can start the session.

## What each environment isolates

| Environment                | Security boundary                                              | Use it for                                         |
| -------------------------- | -------------------------------------------------------------- | -------------------------------------------------- |
| `host` (no sandbox)        | None. Sessions run with the daemon user's permissions.         | Your own trusted tasks                             |
| `srt`                      | None against a determined adversary. It contains mistakes.     | Trusted internal development and automation        |
| `microsandbox`             | A separate VM per session                                      | Work that acts on untrusted input                  |
| Kubernetes (Agent Sandbox) | A separate pod per session, isolated by your cluster's runtime | Work that acts on untrusted input, across machines |

## Untrusted input

A model acts on what it reads. Content from outside your organization is untrusted even when a maintainer starts the session:

- pull requests, diffs, issues, and comments from outside contributors;
- public webhooks;
- chat channels shared with people outside your organization.

[Trigger permissions](/docs/github) decide who can start a session. They do not change what the session reads once it runs. Run an agent that works with such content in `microsandbox` or Kubernetes.

## Why `srt` is not a boundary for untrusted work

`srt` restricts what the runtime and its tools can read, write, and reach over the network. It still shares the host's kernel and user account, and the daemon runs some operations on the session's workspace outside the sandbox, such as Git. Treat it as protection against mistakes in trusted work, not against content written to make the agent misbehave.

In `microsandbox` and Kubernetes, the session's tools and the daemon's Git for that session run inside the same VM or pod.

GitHub draws the same line for its self-hosted runners, which it advises against for public repositories.

## Limit what the session holds

A boundary limits what a session can reach on the machine. It does not limit what the agent can do with the access you give it. For an agent that reads untrusted content, also use a conservative [permission mode](/docs/create-an-agent) and narrowly scoped repository access, and check which credentials each environment shields in [Credential protection](/docs/credential-protection).

See [Sandboxing](/docs/sandboxing) to set up each environment.
