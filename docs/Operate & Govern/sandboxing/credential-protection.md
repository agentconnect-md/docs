---
title: Credential protection
excerpt: How SRT and microsandbox protect saved OAuth credentials and API keys.
hidden: false
---

AgentConnect reuses the runtime login saved on the daemon machine. Protection depends on the sandbox, runtime, and login method. This page covers saved login files on self-hosted Linux daemons.

## Protection by runtime

| Runtime          | SRT: OAuth | SRT: API key | microsandbox: OAuth | microsandbox: API key |
| ---------------- | ---------- | ------------ | ------------------- | --------------------- |
| Claude Code      | Tool rules | Tool rules   | Tool rules          | Proxy                 |
| Codex            | Tool rules | Tool rules   | Tool rules          | Proxy                 |
| DeepSeek Harness | NA         | Unshielded   | NA                  | Proxy                 |
| OpenCode         | Unshielded | Unshielded   | Unshielded          | Proxy                 |
| pi               | Unshielded | Unshielded   | Unshielded          | Proxy                 |
| Grok Build       | Unshielded | Unshielded   | Unshielded          | Proxy                 |
| Qwen Code        | Unshielded | Unshielded   | Unshielded          | Proxy                 |
| Oh My Pi         | Unshielded | Unshielded   | Unshielded          | Proxy                 |
| Amp              | NA         | Unshielded   | NA                  | Proxy                 |
| Cline            | Unshielded | Unshielded   | Unshielded          | Unshielded            |
| Devin            | Unshielded | Unshielded   | Unshielded          | Unshielded            |
| Antigravity ACP  | Unshielded | Unshielded   | Unshielded          | Unshielded            |
| GitHub Copilot   | Unshielded | Unshielded   | Unshielded          | Unshielded            |
| Qoder CLI        | Unshielded | Unshielded   | Unshielded          | Unshielded            |
| Qoder CN CLI     | Unshielded | Unshielded   | Unshielded          | Unshielded            |

- **Tool rules:** the runtime blocks its tools from reading or changing protected credential files.
- **Proxy:** the real API key stays on the host (supported sources below).
- **Unshielded:** tools may read the credential inside the sandbox.
- **NA:** login mode not covered by this integration.

Claude Code and Codex also keep their tool rules when using the API proxy.

## OAuth and tool rules

OAuth credentials are mounted or copied into the session. The runtime handles login and token refresh.

Claude Code and Codex use the same tool rules in SRT and microsandbox. Claude Code restricts Bash and its file tools (including Read and Edit). Codex uses permission profiles to restrict tool access to credential paths. The runtime itself can still read its credentials to authenticate.

These rules apply to the integrated runtime tools. They do not cover arbitrary helper processes or MCP servers. Other runtimes receive OAuth credentials without an additional shield.

## API key proxy

For supported microsandbox logins, the daemon gives the session a placeholder instead of the real API key. The host proxy replaces that placeholder in outgoing request headers only for the provider's approved HTTPS endpoint.

The sandbox's imported credential files contain placeholders. For Oh My Pi, the daemon creates a private SQLite database with placeholders before writing any API-key records. The host's login files remain unchanged.

The proxy uses provider settings from the host. Editing settings inside the sandbox cannot authorize another destination for a key. The authorized provider receives the real key (its responses are not redacted).

### Supported saved keys

| Runtime          | Saved key source                                                                 |
| ---------------- | -------------------------------------------------------------------------------- |
| Claude Code      | `primaryApiKey` in the active global configuration                               |
| Codex            | `OPENAI_API_KEY` in `CODEX_HOME/auth.json`                                       |
| DeepSeek Harness | Standard `DEEPSEEK_API_KEY` entry in `.dsh/.credentials.yaml` or `.dsh/.env`     |
| OpenCode         | API records in `auth.json` (`type: api`)                                         |
| pi               | API records in `auth.json`, or provider keys in `models.json`                    |
| Grok Build       | Per-model keys in `config.toml` (`model.<id>.api_key`)                           |
| Qwen Code        | Model-provider keys in `settings.json` (including legacy `security.auth.apiKey`) |
| Oh My Pi         | API-key records in `agent.db`                                                    |
| Amp              | Native CLI entries in `secrets.json` (`apiKey@<service URL>`)                    |

### Provider limits

DeepSeek uses `https://api.deepseek.com`. Grok and Qwen need an explicit HTTPS endpoint in the host configuration. Claude Code, Codex, OpenCode, and pi use supported host provider settings or built-in defaults. Oh My Pi uses built-in provider defaults.

pi and Oh My Pi support the default endpoints for Anthropic, OpenAI, DeepSeek, Google, xAI, OpenRouter, Groq, and Mistral. Custom Codex providers must set `requires_openai_auth = true`.

If a recognized API key has no supported route, it stays hidden and that provider is unavailable. OpenCode's other configured providers can still work. DeepSeek rejects a custom endpoint at startup.

Protection covers the saved sources above. It does not automatically cover keyrings, command-based keys, arbitrary headers, custom plugins, or new logins performed inside the sandbox. Amp's separate `amp-acp/credentials.json` login is outside this protection. Oh My Pi keys stored only in custom model files are also outside it.

Supported endpoints use HTTPS without custom ports or URL credentials. Protected sessions reject custom TLS trust overrides and conflicting credential mounts.

## Existing sessions and key changes

A protected VM reloads a changed host key when it resumes after stopping. A running VM keeps its current key. Changing login accounts, provider records, or credential layout can rebuild the VM (see [what is preserved](/docs/sandboxing#runtime-image)).
