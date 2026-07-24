---
title: AgentConnect OSS
excerpt: Run the open-source AgentConnect coordination stack on infrastructure you control, while agents and workspaces stay on your own machines.
hidden: false
---

AgentConnect OSS is the open-source, self-hosted AgentConnect stack. It gives you control over the Web console, Control Plane, Relay, and PostgreSQL, while agent execution remains in daemons on the machines that own the workspaces. The source is available in the [AgentConnect repository](https://github.com/agentconnect-md/agentconnect).

<Cards>
  <Card title="Get started with OSS" href="/docs/get-started-with-oss" icon="fa-duotone fa-box">Start a complete local stack with Docker Compose</Card>

<Card title="Deployment and configuration" href="/docs/deployment-and-configuration" icon="fa-duotone fa-sliders">Pin versions, change ports, and connect an external Logto tenant</Card>
</Cards>

<br />

## What AgentConnect OSS includes

| Component     | Where it runs                | Purpose                                                                                              |
| ------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| Web console   | Docker                       | Configure agents, integrations, schedules, and inspect activity                                      |
| Control Plane | Docker                       | Store control metadata, authenticate users and coordinate daemons                                    |
| Relay         | Docker                       | Accept webchat, webhook, GitHub, and shared-bot ingress and forward it directly to the owning daemon |
| PostgreSQL    | Docker by default            | Persist Control Plane metadata                                                                       |
| Daemon        | Your host or another machine | Run agents, own workspaces and conversations, and connect directly to supported chat platforms       |

The Compose stack also runs a short-lived migration job. It applies the selected Control Plane image's database migrations. When sign-in is disabled, Control Plane startup initializes only the fixed local organization required by no-auth mode; it does not add sample data.

## Choose the right deployment

The included Docker Compose setup is designed for **local evaluation and single-host development**:

- it binds published ports to `127.0.0.1`;
- it starts one Relay and one Control Plane;
- it uses local-only default credentials; and
- it enables no-auth mode unless you configure an OIDC provider.

It is not an HA production topology. Before exposing AgentConnect to a network, configure real sign-in, replace every default secret, use TLS, operate PostgreSQL backups, and provide a production ingress that supports WebSockets.

## Data boundaries stay the same

AgentConnect OSS does not move agent execution into the central stack. Message bodies, attachment bytes, workspaces, and live agent-session streams remain daemon-local. The Control Plane stores coordination metadata. Relay-delivered content goes from the Relay to the owning daemon rather than through the Control Plane.

Start with [Get started with OSS](/docs/get-started-with-oss), then review [Deployment and configuration](/docs/deployment-and-configuration) before changing network exposure or enabling sign-in.
