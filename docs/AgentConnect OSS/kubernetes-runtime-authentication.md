---
title: 🔐 Runtime authentication on Kubernetes
excerpt: Give Kubernetes runtimes API keys and model endpoints for both discovery and agent sessions.
hidden: false
---

The daemon pool starts each installed runtime in a probe sandbox to read its models. That probe has no agent identity, so it cannot read organization or agent secrets. An install-wide Secret can supply API keys to both the probe and agent sessions. Use API-key authentication for unattended runtimes; an interactive OAuth login cannot complete in the pool probe.

## Choose the runtime image

The chart's default `runtime-sandbox` image contains Claude Code, Codex, and DeepSeek Harness. The published `runtime-sandbox-full` image also contains OpenCode, Qwen Code, and other ACP runtimes:

```yaml
daemonPool:
  runtime:
    repository: ghcr.io/agentconnect-md/runtime-sandbox-full
```

The chart appends the selected AgentConnect release tag. Use `daemonPool.runtime.image` to pin a complete image reference. Changing the image restarts runtime discovery.

## Configure any runtime with a Secret

1. Choose a model provider and obtain an API key. Check the runtime's official documentation for its API-key environment variable, supported model IDs, and endpoint format. For example, see [Qwen Code authentication](https://github.com/QwenLM/qwen-code/blob/main/docs/users/configuration/auth.md), [OpenCode providers](https://opencode.ai/docs/providers), and [DeepSeek's API root](https://api-docs.deepseek.com/guides/harness).
2. Put the key, endpoint, and any runtime configuration in a Kubernetes Secret in the AgentConnect release namespace. Do not put the key in Helm values.
3. Map each runtime's environment variable to a Secret entry under `daemonPool.runtimeEnvironment.runtimes`. Use the runtime ID reported by the image. The chart projects only the named entries into the daemon; it sends each runtime only its own mapped variables at probe and session launch.
4. Upgrade the Helm release. A changed mapping rolls the daemon pool and runs the probe again. After changing a Secret value, restart the daemon pool so its environment and probe refresh.

For example, an install using DeepSeek's OpenAI-compatible API can put these entries in its Secret:

| Secret entry | Value |
| --- | --- |
| `PROVIDER_API_KEY` | Your DeepSeek API key |
| `PROVIDER_BASE_URL` | `https://api.deepseek.com` |
| `QWEN_MODEL` | `deepseek-flash` |
| `OPENCODE_CONFIG_CONTENT` | `{"model":"deepseek/deepseek-flash","provider":{"deepseek":{"options":{"baseURL":"https://api.deepseek.com"}}}}` |

Then reference those entries without copying their values into Helm:

```yaml
daemonPool:
  runtime:
    repository: ghcr.io/agentconnect-md/runtime-sandbox-full
  runtimeEnvironment:
    existingSecret: agentconnect-model-credentials
    runtimes:
      qwen-code:
        OPENAI_API_KEY: PROVIDER_API_KEY
        OPENAI_BASE_URL: PROVIDER_BASE_URL
        OPENAI_MODEL: QWEN_MODEL
      opencode:
        DEEPSEEK_API_KEY: PROVIDER_API_KEY
        OPENCODE_CONFIG_CONTENT: OPENCODE_CONFIG_CONTENT
```

Qwen Code selects its OpenAI-compatible API-key authentication from `OPENAI_API_KEY`. OpenCode selects the `deepseek` provider and model from `OPENCODE_CONFIG_CONTENT` and reads `DEEPSEEK_API_KEY` from its environment. The endpoint and model shown here follow [DeepSeek's current API documentation](https://api-docs.deepseek.com/guides/harness); use your chosen provider's documentation for a different service. Neither runtime needs a browser login or a stored OAuth account.

OpenCode's `model` setting selects a default; it does not limit the provider list. To enable additional providers, put each provider's real API key in the Secret and add its variable to the `opencode` mapping. For example, map `ANTHROPIC_API_KEY` for [Anthropic](https://opencode.ai/docs/providers#anthropic) or `OPENCODE_API_KEY` for [OpenCode Zen](https://opencode.ai/docs/zen). A model appearing in a catalog does not prove that an account can call it; verify it with a request using that provider's API key.

`runtimeEnvironment.existingSecret` can be omitted when `daemonPool.modelCredentials.existingSecret` already names the same Secret. Each mapping points to a Secret **entry name**, not an inline value. A missing or empty entry stops the daemon at startup instead of silently probing without the intended credential. A runtime mapping overrides an agent-level variable with the same name; built-in model translation and issued session keys retain their existing precedence for variables they write.

## Built-in model pairs and other sources

The chart also supports `daemonPool.modelCredentials.existingSecret` for its built-in credential translation:

| Runtime | Token entry | Base URL entry |
| --- | --- | --- |
| Claude Code | `ANTHROPIC_MODEL_TOKEN` | `ANTHROPIC_MODEL_BASE_URL` |
| Codex | `OPENAI_MODEL_TOKEN` | `OPENAI_MODEL_BASE_URL` |
| DeepSeek Harness | `DEEPSEEK_MODEL_TOKEN` | `DEEPSEEK_MODEL_BASE_URL` |
| OpenCode | `MODEL_TOKEN` | `MODEL_BASE_URL` |

`MODEL_TOKEN` and `MODEL_BASE_URL` are a shared fallback for these recognized runtimes. A runtime-specific pair replaces the shared pair as a whole. The daemon translates each pair into that runtime's configuration at probe and spawn; it does not translate a pair for Qwen Code or arbitrary runtimes. Use `runtimeEnvironment` for those runtimes and for settings beyond a key and URL, such as a model selection or provider configuration.

`modelEgress.clients` is another install-wide source for supported clients. The chart refuses combining it with `modelCredentials.existingSecret`, or setting a built-in pair again in `daemonPool.extraEnv`. Organization and agent [variables and secrets](/docs/variables-and-secrets) reach their agent sessions but not the independent pool probe. **Infra → Provider keys** are organization connections for supported provider consumers; they are not ACP runtime credentials.

For a Codex gateway, use `OPENAI_MODEL_TOKEN` and `OPENAI_MODEL_BASE_URL` with the gateway's Codex-compatible API root. The daemon configures Codex's provider URL as well as its API key. When the endpoint is DeepSeek directly, use its [documented API root](https://api-docs.deepseek.com/guides/responses_api/), `https://api.deepseek.com`.

To confirm discovery after rollout, inspect the daemon pool's probe completion log and check the runtime's model picker in the console. A runtime installed in the image can still have an empty picker if its API key, model ID, or endpoint is wrong.
