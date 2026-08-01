---
title: 🧠 External memory with Mem0 OSS
excerpt: Connect an agent to self-hosted Mem0, choose recall and capture policies, and inspect the resulting memory records.
hidden: false
---

External memory lets an AgentConnect agent recall and save durable records in a memory system that you operate. This walkthrough uses [Mem0 OSS](https://github.com/mem0ai/mem0) with AgentConnect's first-party Mem0 wrapper.

The data path has four parts:

1. The **agent binding** says when this agent may recall or capture memory.
2. The **daemon** supplies the trusted agent scope, enforces limits, and keeps credentials out of the agent runtime.
3. The **AgentConnect Mem0 wrapper** translates the memory-plugin profile to Mem0 OSS REST calls.
4. **Mem0 OSS** extracts, stores, searches, and returns the records.

The agent never receives the backend credential or raw plugin tools. Mem0 records are scoped to one stable entity, `agent_id=ac:agent:<agentId>`, so one agent cannot recall another agent's records.

## Before you start

The deployment operator must first complete the [optional Mem0 deployment configuration](/docs/deployment-and-configuration#optional-mem0). You then need:

- an organization **owner** to review the plugin installation and create the connection;
- an online agent daemon with the `mem0-oss` command reference installed;
- network reachability from that daemon to Mem0 OSS; and
- the Mem0 API key issued during deployment.

This walkthrough uses the **local stdio plugin** configured by the deployment operator. The Control Plane stores only the allowlist name `mem0-oss`, never an executable or filesystem path.

## 1. Create the organization connection

In the console, go to [**Knowledge**](/docs/knowledge) → **External memory → Add connection**, then choose **Register a new plugin…**.

Enter:

| Field | Value |
| --- | --- |
| Plugin transport | **Local · operator-installed stdio** |
| Plugin id | `ai.mem0.memory.oss` |
| Operator command reference | `mem0-oss` |
| Expected manifest digest | Leave empty for the first connection, or enter a reviewed digest to pin it |
| Credential name | `apiKey` |
| Credential header | `X-Mem0-Api-Key` |
| Required | Checked |
| Credential value | The API key issued by your Mem0 OSS server |
| Non-secret connection config | `{}` |

Then click **Create connection**. The credential is write-only: AgentConnect will show the logical name later, never its value.

The new connection initially shows **probing**. Its exact revision is checked on the daemon after an agent selects it.

## 2. Bind an agent and choose the policy

Open the agent, select its **Memory** tab, and choose **External**. Select the connection you just created.

Choose the two policies independently:

- **Recall → Every turn** searches Mem0 before each activation and appends up to the configured limit as an explicitly untrusted reference. A timeout or transient recall error does not block the agent's answer.
- **Recall → Tool only** performs no automatic search. The agent can search through AgentConnect's stable external-memory tool when it needs to.
- **Capture → Manual only** sends content only when a memory is explicitly saved.
- **Capture → Every turn** sends the delivered user input and final reply to Mem0 after the reply is delivered. Enabling it requires confirming the data boundary.

The defaults — 5 results, 8 KiB, and a 1-second timeout — are a good starting point. Click **Use external memory** or **Save external-memory policy**.

The connection must pass the manifest, credential-contract, configuration, and capability checks for this exact revision before the agent can start with it. **Ready** is the normal active state. A revision that was already verified may later show **degraded** during a transient failure; the daemon keeps it admission-open and retries while recall itself fails open.

## 3. Test recall across sessions

For the clearest end-to-end test, temporarily set **Capture → Every turn**:

1. Start a Playground conversation and say: `Remember that production deploys require a change ticket and two reviewers.`
2. Let the agent reply. Capture is queued only after that reply has been delivered.
3. Open the agent's **Memory** tab again. Under **Memory records**, search for `production deploys` or inspect the list.
4. Start a new Playground conversation with the same agent and ask: `What do I need before a production deploy?`

With **Recall → Every turn**, the new session should answer from the stored record. A different agent should not see it because AgentConnect supplies a different trusted `agent_id` scope.

The record panel is proxied live through the owning daemon; memory bodies are not copied into the control plane. Mem0 OSS supports search, list, get, create, delete, and history in this integration. It intentionally does not expose record editing because Mem0's ID-only update route cannot satisfy AgentConnect's optimistic-version requirement.

## Connection status and troubleshooting

| Status or reason | What to check |
| --- | --- |
| `probing` | The agent must be bound to the connection, its daemon must be online, and the daemon must have reloaded the allowlist. |
| `invalid` / `local_plugin_not_allowed` | The connection's `mem0-oss` reference is missing from `config.json` on the agent's owning daemon. Add the exact key and restart. |
| `invalid` / `secret_delivery_unavailable` | `secretEnv` does not map the logical `apiKey` to an environment variable. Use `{ "apiKey": "MEM0_API_KEY" }`. |
| `invalid` / `conformance_failed` | The wrapper's plugin id, profile, credential contract, config schema, or MCP output did not match. Rebuild the current wrapper and verify the field values above. |
| `degraded` / `plugin_unavailable` | The wrapper or Mem0 endpoint is temporarily unavailable. Check the daemon, Mem0 health, and the configured network address. The daemon retries; an unverified revision remains blocked until a probe succeeds. |
| `degraded` / `plugin_process_exited` | The local wrapper exited. Check the Node path and built `dist/cli.js`; the daemon restarts it with backoff. |
| `ready` | This revision passed compatibility checks and can serve recall/capture operations. |

Editing the connection increments its revision and triggers a fresh check. Replacing credentials replaces the complete write-only secret set. Unbind every agent before deleting a connection; deleting it does **not** delete records in Mem0.
