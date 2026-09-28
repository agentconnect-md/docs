# AgentConnect docs

The AgentConnect documentation site: a [Fumadocs](https://fumadocs.dev) app served under `/docs` on
the AgentConnect website, with an interactive API reference generated from the release's OpenAPI
document. It deploys to Cloudflare Workers through OpenNext.

## Content

| Path                 | What it is                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| `content/docs/`      | Guides and Self-hosting, one MDX file per page; each folder's `meta.json` orders the sidebar   |
| `content/api/`       | The API overview; the operation pages come from the OpenAPI document at build time             |
| `public/images/`     | Screenshots and diagrams, referenced from pages as `@/public/images/<file>`                    |

A page's frontmatter carries its `title`, `description` and `icon`; icons are the names listed in
`lib/icons.tsx`. Root-relative links (`/build-your-team/agents`) resolve within the site, and a
`page.zh.mdx` beside `page.mdx` is its Chinese translation: a page without one is served in English
with a notice. A folder's `meta.zh.json` beside its `meta.json` carries the same `pages` with Chinese
titles and separators. A translation keeps the English page's headings one to one, each ending in the
English heading's id (`## 连接 Gitea [#connect-gitea]`), so `#anchor` links and the table of contents
work in both languages; images, diagrams and code blocks stay as they are.

## Channels and branches

Each build is one channel, bound to one environment and one release line:

| Channel | Branch    | Release it documents                        | API it calls         |
| ------- | --------- | ------------------------------------------- | -------------------- |
| `test`  | `main`    | the latest release candidate or release     | the test environment |
| `prod`  | `release` | the latest formal release (`vX.Y.Z`)        | the production API   |

`main` is where documentation is written and reviewed; `release` is fast-forwarded to it when the
documentation for a production release ships. `scripts/prepare.mjs` reads the OpenAPI document the
channel's API serves, so the reference is exactly what that environment runs, paths included, then
points its `servers` at the channel's API and keeps the release the API reports in
`info.x-agentconnect-release`. The same document is served at `/docs/openapi.json`, and "Send" in
the API playground goes through `/docs/api/proxy`, which forwards only to the channel's own API.

A channel's origins come from the environment the build runs in, `DOCS_API_URL` and
`DOCS_CONSOLE_URL` (`.env.example` lists them); the repository holds none, and a build never prints
them. Another installation's channel sets the same two names.

## Local preview

Requires Node 24.12+ and pnpm 11. Copy `.env.example` to `.env.local` and fill in the test
environment's origins.

```bash
pnpm install
pnpm dev                     # test channel at http://localhost:3001/docs, live-reloading content edits
pnpm build --channel test    # the channel's Worker in .open-next/
pnpm preview -- --env test   # that Worker locally, in workerd
pnpm typecheck
pnpm test                    # binding the OpenAPI document to a channel
```

## Deploying

`wrangler.jsonc` defines one Worker per channel: `agentconnect-docs` at the top level for `prod`, and
`agentconnect-docs-test` under `env.test`. A route on the website's host binds `/docs*` to the Worker;
routes live with the deployment, not in this repository.

A push to `main` deploys `test` and a push to `release` deploys `prod`
(`.github/workflows/deploy.yml`); the deployment side also rebuilds a channel after deploying to its
environment, with a `repository_dispatch` of type `test-deployed` or `prod-promoted`. Each channel is
a GitHub environment of the same name holding its `DOCS_API_URL` and `DOCS_CONSOLE_URL`, as variables
where the origins are public (`prod`) and as secrets where they are not (`test`); `CLOUDFLARE_API_TOKEN`
and `CLOUDFLARE_ACCOUNT_ID` are repository secrets. The same commands work from a checkout:

```bash
pnpm build --channel test && pnpm run deploy -- --env test
pnpm build --channel prod && pnpm run deploy
```

Page feedback ("How is this guide?") is posted to this repository's GitHub Discussions by a GitHub App
with Discussions write access, installed on this repository only. Each Worker needs its secrets:
`GITHUB_APP_ID` and `GITHUB_APP_PRIVATE_KEY` (the key in PKCS#8 form). Both channels post to the
"Docs Feedback" category, one thread per page; a thread from `test` carries a `(test)` prefix in its
title. Without the secrets the site still works; feedback is only logged.

## Ask AI

The "Ask AI" panel on every page is answered by an AgentConnect agent. `/docs/api/chat` holds the
key, opens one conversation per open panel (each with an HttpOnly cookie holding the chat id it chose) and
streams the agent's reply from the relay's agent chat API; the browser never sees the key. Each Worker
needs three secrets:

| Name                    | What it is                                                             |
| ----------------------- | ---------------------------------------------------------------------- |
| `AGENTCONNECT_API_KEY`   | an API key with the `agent:chat` permission, limited to the docs agent |
| `AGENTCONNECT_AGENT_ID`  | the docs agent's id                                                    |
| `AGENTCONNECT_RELAY_URL` | the channel's relay origin, which serves the agent chat API            |

```bash
pnpm exec wrangler secret put AGENTCONNECT_API_KEY --env test   # test; without --env for prod
```

Without them the route answers 503 and the panel says Ask AI is unavailable. For `pnpm dev`, put them
in `.env.local`. OpenNext embeds `.env.local` in a Worker built from a checkout, so leave them out of it
when deploying from one.

Each Worker's `ASK_AI_LIMIT` binding in `wrangler.jsonc` allows 5 questions a minute per visitor IP,
counted per Cloudflare location; over it the route answers 429. `pnpm dev` has no Worker context, so
nothing is limited there. A relay 503 whose reason is `not_holder`, the agent's daemon reconnecting during a
deployment, is retried once after two seconds; any other 503 may follow a delivery and is not retried.
