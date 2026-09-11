---
title: Sandbox runtime support
excerpt: Tested runtime paths and credential protection for SRT and microsandbox, with OAuth and API key coverage listed separately.
hidden: false
---

This page describes **self-hosted Linux SRT and microsandbox** support. It does not describe AgentConnect Cloud's provider authentication or Kubernetes pool credential handling. Configure the backend, mounts, and image in [Sandboxing](/docs/sandboxing).

## What a test result establishes

- **Native tool checks** run the runtime's own tool boundary against credential fixtures and normal workspace operations.
- **Model/tool turn** means an authenticated native ACP conversation and a native tool call completed in a real Linux microsandbox VM.
- **Transport check** uses synthetic keys to verify native credential loading, TLS/header injection, and rejection at an unauthorized host. An expected provider authentication error is not a successful model turn.
- **Image probe** checks the packaged executable and ACP startup/capability behavior. A model list, an auth-required response, or presence in the ACP registry does not establish an authenticated conversation.

These results cover the tested paths, not every model provider, authentication layout, permission mode, or session lifecycle operation. Full release-level acceptance for attachments, cancellation, Git, restart recovery, network isolation, and Docker remains tracked in [sandbox follow-ups](https://github.com/agentconnect-md/agentconnect/issues/1874).

## Runtime execution and image inventory

The full image currently declares **14 runtime families**. The legacy `qoder` ID shares the Qoder CLI binary; it is not a second installation. The smaller pool image contains Claude Code, Codex, and DeepSeek Harness.

| Runtime                                                      | SRT validation recorded                                                                                   | microsandbox validation recorded                                                                                               | In default full image |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| Claude Code (`claude-acp`)                                   | Native Bash and file-tool credential restrictions, including new/resumed sessions                         | Native policy checks; saved API-login transport with synthetic keys; a real API-key model turn was not part of that validation | Yes                   |
| Codex (`codex-acp`)                                          | Native permission-profile and credential-denial canaries                                                  | Native policy checks; saved API-login transport with synthetic keys; a real API-key model turn was not part of that validation | Yes                   |
| DeepSeek Harness (`dsh-acp`)                                 | No separate native-session result recorded here                                                           | Authenticated API model/tool turn, guest key inspection, wrong-host rejection, stop/resume and key rotation                    | Yes                   |
| OpenCode (`opencode`)                                        | No separate native-session result recorded here                                                           | Authenticated API model/tool turn; multiple providers, private OAuth preservation, resume and key rotation                     | Yes                   |
| pi (`pi-acp`)                                                | No separate native-session result recorded here                                                           | Authenticated API model/tool turn; custom model configuration, private OAuth preservation and key rotation                     | Yes                   |
| Grok Build (`grok-build`)                                    | No separate native-session result recorded here                                                           | Per-model API model/tool turn and key rotation; cached API-login path remains unvalidated                                      | Yes                   |
| Qwen Code (`qwen-code`)                                      | No separate native-session result recorded here                                                           | OpenAI-compatible API model/tool turn and key rotation                                                                         | Yes                   |
| Oh My Pi (`omp`)                                             | No separate native-session result recorded here                                                           | API model/tool turn, private SQLite key inspection and key rotation                                                            | Yes                   |
| Amp (`amp-acp`)                                              | No separate native-session result recorded here                                                           | Native ACP transport and VM projection checks with synthetic keys; authenticated model/tool turn pending                       | No                    |
| Cline (`cline`)                                              | No separate native-session result recorded here                                                           | Image probe. Ordinary API-provider-only login is rejected before a model request in the tested native ACP path                 | Yes                   |
| Devin (`devin`)                                              | Host credential/request assessment only; not an SRT session result                                        | Image probe; credential proxy deferred because native authentication also uses a Protobuf request body                         | Yes                   |
| Antigravity ACP, GitHub Copilot CLI, Qoder CLI, Qoder CN CLI | No separate native-session result recorded here                                                           | Image probes; no authenticated VM model/tool result claimed here                                                               | Yes                   |
| Kimi CLI (`kimi`)                                            | Binary discovery and OAuth-file recognition exist; real ACP validation remains pending                    | Not validated; API-key credential discovery is incomplete                                                                      | No                    |
| GLM Agent (`glm-acp-agent`)                                  | Automatic discovery is incomplete: the registry's `npx` entry lacks the required installation-state check | Not validated                                                                                                                  | No                    |

An unrecorded SRT result does not mean the runtime is refused by SRT. It means this matrix does not claim a verified native session for that combination. SRT uses the daemon user's host installation; microsandbox requires the executable in the selected image. Custom runtime IDs do not automatically inherit a registered runtime's credential import or API key protection.

The GLM row refers to the standalone ACP agent, not a GLM model selected through another runtime such as OpenCode or pi.

Validation records: [full image probes](https://github.com/agentconnect-md/agentconnect/pull/1917), [shared Claude/Codex policies](https://github.com/agentconnect-md/agentconnect/pull/1902), [Claude native file tools](https://github.com/agentconnect-md/agentconnect/pull/1989), [Codex native permission profiles](https://github.com/agentconnect-md/agentconnect/pull/423). The API implementation records are linked below.

## OAuth and API key protection

The table uses three different terms:

- **Native restrictions:** the trusted runtime can read and refresh its login, while AgentConnect configures the runtime's supported tool boundary to deny model-authored access to protected credential paths. The credential still exists inside the runtime's environment.
- **Host proxy:** imported API keys are replaced with placeholders before entering the guest. microsandbox's built-in TLS proxy substitutes the real key in outgoing headers only for host-authorized HTTPS destinations.
- **Native, unshielded:** authentication keeps its existing mount or private-HOME behavior. There is no additional credential shield; tools in that environment may read the imported credential.

| Runtime                                   | SRT: OAuth                                               | SRT: saved API key                                            | microsandbox: OAuth                                      | microsandbox: saved API key                                                                  |
| ----------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Claude Code                               | Native restrictions                                      | Native restrictions                                           | Same native restrictions; no OAuth proxy                 | Host proxy plus native restrictions                                                          |
| Codex                                     | Native restrictions                                      | Native restrictions                                           | Same native restrictions; no OAuth proxy                 | Host proxy plus native restrictions                                                          |
| DeepSeek Harness                          | Not covered by this integration                          | Native, unshielded                                            | Not covered by this integration                          | Host proxy for the standard DeepSeek key                                                     |
| OpenCode                                  | Native, unshielded                                       | Native, unshielded                                            | Native, unshielded                                       | Host proxy for supported `type: api` records                                                 |
| pi                                        | Native, unshielded                                       | Native, unshielded                                            | Native, unshielded                                       | Host proxy for supported literal file keys                                                   |
| Grok Build                                | Native, unshielded                                       | Native, unshielded                                            | Native, unshielded                                       | Host proxy for supported per-model keys; unsupported API records stay hidden and unavailable |
| Qwen Code                                 | Native, unshielded                                       | Native, unshielded                                            | Native, unshielded                                       | Host proxy for supported saved model-provider and legacy auth keys                           |
| Oh My Pi                                  | Native, unshielded                                       | Native, unshielded                                            | Native, unshielded                                       | Host proxy for supported SQLite API-key records                                              |
| Amp                                       | Not assessed                                             | Native, unshielded                                            | Not assessed                                             | Host proxy implemented for native CLI file keys; real-account validation pending             |
| Cline, Devin, Antigravity, Copilot, Qoder | No additional OAuth shield; native login where supported | No additional API-key shield; login-mode compatibility varies | No additional OAuth shield; native login where supported | No additional API-key shield; Cline/Devin proxy work deferred                                |
| Kimi CLI                                  | Native OAuth file discovery; no additional shield        | Discovery incomplete; not validated                           | No additional shield; image/runtime validation pending   | Not implemented                                                                              |
| GLM Agent                                 | Not assessed                                             | Discovery incomplete; no shield integration                   | Not assessed                                             | Not implemented                                                                              |

“No additional shield” does not assert that every runtime in a grouped row offers both login modes. OAuth preservation tests with fixtures also do not prove a live subscription can refresh successfully.

### How the native restrictions work

SRT and microsandbox reuse **the same Claude Code and Codex policy builders**. Claude gets a native Bash sandbox plus deny rules for its native file tools, including Read and Edit. Codex gets daemon-owned native permission profiles for tool operations. The trusted ACP/runtime process retains access needed for native authentication and refresh.

These are runtime-supported tool restrictions, not a VM rule that allows only one executable to read a file. Do not extend this claim to arbitrary helper processes, MCP servers, or runtimes without an integrated native boundary.

### Supported API credential sources

The following paths describe the native login files that AgentConnect imports. The daemon prepares a private file or database for the session without rewriting the host's login. This table covers file-based login, including API keys saved by a runtime's native login flow.

| Runtime          | Imported source and supported route                                                                                                                                                                      | Implementation / validation                                                          |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Claude Code      | Saved `primaryApiKey` in the active global config, including `CLAUDE_CONFIG_DIR` and legacy `.config.json`. HTTPS destination from `ANTHROPIC_BASE_URL`, otherwise `api.anthropic.com`.                  | [Claude/Codex API logins](https://github.com/agentconnect-md/agentconnect/pull/2011) |
| Codex            | `OPENAI_API_KEY` in `CODEX_HOME/auth.json`. Host `config.toml`, selected profile and `CODEX_CONFIG` determine routing; supported custom providers must use `requires_openai_auth = true`.                | [Claude/Codex API logins](https://github.com/agentconnect-md/agentconnect/pull/2011) |
| DeepSeek Harness | Standard `DEEPSEEK_API_KEY` reference in `.dsh/.credentials.yaml` or its `.env` fallback; only `https://api.deepseek.com`.                                                                               | [DeepSeek](https://github.com/agentconnect-md/agentconnect/pull/1993)                |
| OpenCode         | `type: api` records in native `auth.json`, honoring XDG data paths. Standard host config, `OPENCODE_CONFIG_CONTENT`, provider defaults or cached model catalog resolve the HTTPS destination.            | [OpenCode](https://github.com/agentconnect-md/agentconnect/pull/1995)                |
| pi               | `type: api_key` records in `auth.json` and provider `apiKey` values in `models.json`, honoring `PI_CODING_AGENT_DIR`. Host model/provider `baseUrl` or audited built-in defaults select the destination. | [pi](https://github.com/agentconnect-md/agentconnect/pull/2012)                      |
| Grok Build       | Literal `model.<id>.api_key` with an explicit HTTPS `base_url` in host `config.toml`, honoring `GROK_HOME`.                                                                                              | [Grok](https://github.com/agentconnect-md/agentconnect/pull/2019)                    |
| Qwen Code        | Saved `settings.json` model-provider `envKey` references to values in that file, or legacy `security.auth.apiKey`, honoring `QWEN_HOME`. An explicit supported HTTPS `baseUrl` is required.              | [Qwen](https://github.com/agentconnect-md/agentconnect/pull/2024)                    |
| Oh My Pi         | API-key rows in native `agent.db`, honoring `PI_CODING_AGENT_DIR`. Keys are replaced **before insertion** into a new private SQLite database.                                                            | [Oh My Pi](https://github.com/agentconnect-md/agentconnect/pull/2026)                |
| Amp              | Nonempty `apiKey@<service URL>` entries in native `secrets.json`, honoring XDG data paths. The record's HTTPS host authorizes injection.                                                                 | [Amp](https://github.com/agentconnect-md/agentconnect/pull/2029)                     |

The audited built-in defaults for pi and Oh My Pi cover Anthropic, OpenAI, DeepSeek, Google, xAI, OpenRouter, Groq, and Mistral. A supported runtime does not imply support for every custom provider or credential format.

### Limits that affect setup

- **OAuth remains native.** There is no OAuth proxy or refresh coordinator. OpenCode OAuth/`wellknown`, pi, Grok, Qwen and OMP OAuth records remain readable in the guest. Claude and Codex retain the native restrictions described above.
- **Unsupported API routes do not get plaintext fallback.** Recognized keys stay replaced by placeholders, but the affected provider cannot authenticate until its route is supported. Other OpenCode providers can remain usable. DeepSeek instead refuses a non-default endpoint at launch.
- **Endpoint authority stays on the host.** Editing guest configuration cannot authorize a new destination for a protected key. Supported injection routes use HTTPS without custom ports or URL userinfo. An allowed provider receives the real key and remains trusted; the proxy does not redact provider responses.
- **Source coverage is bounded.** Keyring-only, helper-only, arbitrary workspace configuration, and environment-only credentials are not generally covered by the file-login matrix. Keys created by logging in inside the guest are not automatically converted to host-managed proxy credentials.
- **OpenCode:** only native `auth.json` API records are discovered for protection. `OPENCODE_CONFIG` and `OPENCODE_CONFIG_DIR` sources are not imported or used for proxy routing. Unknown routes retain placeholders.
- **pi:** command keys, interpolation and structured provider environment credentials remain inert placeholders. Extra secrets stored only in arbitrary headers or extensions are outside discovery.
- **Grok:** cached API records in `auth.json`, managed/requirements keys, version overrides, and unresolved endpoints are hidden without injection. The verified path is the explicit per-model configuration above.
- **Qwen:** default endpoint inference, `.env`, workspace/CLI overrides, and keys stored only in arbitrary fields are outside this path.
- **Oh My Pi:** custom model files, model-file-only keys, broker/command/environment credentials are outside this path. A retained database/WAL validation has a combined 256 MiB limit. Native re-login that creates a new credential record can require a new session.
- **Amp:** the adapter's separate `amp-acp/credentials.json` setup login is outside the native CLI file protection. The default full image does not yet contain Amp.
- **Cline:** the tested API-provider-only native ACP startup fails before any model request. **Devin:** credentials also appear in a Protobuf body, so header substitution alone is insufficient. Both keep native authentication; a proxy shield is not claimed.
- **Custom TLS trust:** protected launches currently reject custom trust-bundle overrides rather than silently replace them. Combining operator trust with the proxy CA remains pending.
- **Mixed Claude/Codex layouts:** overlapping raw API/OAuth mounts or a Codex file explicitly selecting non-API auth while storing an API key can be refused. Do not assume arbitrary mixed-source logins are supported.

### Existing sessions and key changes

Start a **new session** to enable protection if its retained VM was created before that protection existed. An old disk may already contain plaintext credentials; upgrading the daemon does not sanitize it or delete it automatically.

For a protected VM, a changed host key is loaded when the stopped VM resumes. An already-running VM keeps its current binding. Changing credential identities, record sets, or shared-key groups may require a new session. If a required host credential disappears, restore it or create a new session; existing VM and session data are retained.

## Read the runtime status in the console

When sandboxing is required, **Runtimes** shows the sandbox status. Otherwise the **Host / Sandbox** switch separates host availability from the selected sandbox environment. For microsandbox, host probes supply model/capability metadata while the image table supplies guest binary availability. Host metadata probes do not submit a model turn and are not proof of VM compatibility.

For runtimes with credential discovery, the selected view follows this rule:

| Binary available | Stored credential found | Display                                                      |
| ---------------- | ----------------------- | ------------------------------------------------------------ |
| Yes              | Yes                     | Models and capabilities, plus any observed login failure     |
| Yes              | No                      | Login required                                               |
| No               | Yes                     | Binary not installed on host / Binary not installed in image |
| No               | No                      | Hidden                                                       |

Binary absence takes precedence over the login warning. Discovery checks the authentication file or provider record, not just the existence of `.claude`, `.codex`, or another configuration directory. Expired credentials still count as configured; a probe or real request can then report that login is required.

The Kimi API-key and GLM discovery gaps above are exceptions still to fix, not evidence that an installed runtime is necessarily signed out. Unknown credential formats defer to the runtime's own authentication result.
