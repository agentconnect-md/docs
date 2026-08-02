---
title: 🧰 Tools & Skills
excerpt: Register shared capabilities once, then enable the right tools and skills for each agent.
hidden: false
---

**Tools & Skills** is the organization library for capabilities your agents may use. Register an MCP provider, connector, or Git skill source once, then explicitly choose which agents receive it. New agents start with an empty tool and skill allowlist.

AgentConnect keeps organization management separate from agent enablement:

| Capability | Add or manage it | Enable it for an agent |
| --- | --- | --- |
| Connector or custom MCP server | **Tools & Skills → Connectors & MCP servers** | Agent → **Tools & Skills → Tools** |
| Git skill source | **Tools & Skills → Skills library** | Agent → **Tools & Skills → Skills** |
| Managed skill | **Knowledge → Suggestions**, then **Skills library** | Agent → **Tools & Skills → Skills** |

Adding something to the organization library does not automatically give it to every agent.

## Connectors & MCP servers

Open **Tools & Skills** and use **Connectors & MCP servers** to register an upstream capability:

- **Add connectors** browses the available OpenConnector providers and walks through their authorization.
- **Custom MCP provider** connects an HTTP MCP endpoint by URL, with optional upstream headers.

Choose **Everyone** or **Selected** team visibility when you add the provider. Header values are write-only after saving. AgentConnect gives enabled agents a managed proxy grant rather than the upstream URL or credential, and the Relay makes the upstream call.

A provider appears as eligible for an agent only when the agent's daemon and selected runtime support its transport. Registering the provider makes it available to choose; it does not turn it on for any agent.

Before deleting a provider, switch it off for every agent that enables it. AgentConnect rejects the deletion while an agent still references the provider name.

## Skills library

The Skills library contains two source types with different lifecycles:

| Source type | How it gets there | Lifecycle |
| --- | --- | --- |
| **Git skill source** | Search skills.sh or import a GitHub repository | Editable; updates reinstall enabled sources |
| **Managed skill** | An Owner accepts a suggestion | Immutable revisions; archive or restore |

Managed skills and Git sources remain clearly labeled even though they share one library. Adding a skill to the library never enables it automatically.

### Install from skills.sh

Use the public [skills.sh](https://skills.sh) registry when you know the capability you want but not its repository:

1. Open **Tools & Skills → Skills library** and choose **Install from skills.sh**.
2. Search by skill name and select a result.
3. Optionally change its library name, choose its team visibility, and select **Install**.

Each result registers exactly that skill from its `owner/repo` source. It becomes an ordinary Git skill source in the organization library and remains disabled until you enable it for an agent. If the registry cannot be reached, retry later or use **Import from GitHub** with a repository you already know.

### Import from GitHub

1. Open **Tools & Skills → Skills library** and choose **Import from GitHub**.
2. Enter `owner/repo` or a GitHub repository URL. The repository should contain each skill in a folder with a `SKILL.md` file.
3. Optionally set a display name, branch/tag/commit **Ref**, **Subdir**, or a list of specific **Skills**. Leave Skills blank to include all discovered skills.
4. Choose its team visibility and select **Import**.

Both registry installation and direct import support only public skill repositories today. If you set **Subdir**, provide a **Ref** unless AgentConnect can resolve the repository's default branch through the organization's GitHub App.

The owning daemon materializes enabled sources with `npx skills add`. Pin a tag or commit when you need reproducible skill content; a moving branch can resolve to newer repository content when it is installed again. Before deleting a source, disable it on every agent that uses it.

## Enable tools and skills for an agent

Open the agent and select its **Tools & Skills** tab.

Under **Tools**, turn on the MCP providers that agent should receive. The list combines providers registered by the organization with servers reported by the agent's daemon, then filters them by the selected runtime's capabilities.

Under **Skills**:

- enable an approved managed skill to use its current immutable revision;
- enable a whole Git source; or
- expand a Git source and select individual discovered skills.

If AgentConnect cannot list the individual skills in a Git source, you can still enable the whole source. An archived managed skill cannot be enabled. A previously enabled provider or source that is no longer available may remain visible only so an editor can switch it off.

## Visibility and roles

MCP providers and Git skill sources have independent [team visibility](/docs/visibility-and-sharing): **Everyone** or **Selected**. Owners can always recover restricted team resources. Collaborators can create and edit resources they are allowed to access, while Viewers are read-only.

Managed-skill approval, revision governance, and archive or restore actions require an organization Owner.

Team visibility controls which people can discover and manage a resource. The agent's explicit enablement controls whether that capability reaches the agent process; the two checks are separate.
