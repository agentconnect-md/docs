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
with a notice.

## Channels and branches

Each build is one channel, bound to one environment and one release line:

| Channel | Branch    | Release it documents                        | API it calls         |
| ------- | --------- | ------------------------------------------- | -------------------- |
| `test`  | `main`    | the latest release candidate or release     | the test environment |
| `prod`  | `release` | the latest formal release (`vX.Y.Z`)        | the production API   |

`main` is where documentation is written and reviewed; `release` is fast-forwarded to it when the
documentation for a production release ships. `scripts/prepare.mjs` resolves the channel's release from
the application repository's tags, generates that tag's OpenAPI document with the release pipeline's
own generator (cached per tag in `.cache/`), points its `servers` at the channel's API and records the
tag in `info.x-agentconnect-release`. The same document is served at `/docs/openapi.json`, and "Send"
in the API playground goes through `/docs/api/proxy`, which forwards only to the channel's own API.

Production origins are public and built in; every other channel's origins come from the environment
(`.env.example` lists them) and are never committed. `DOCS_RELEASE` pins a channel to an exact tag.

## Local preview

Requires Node 24.12+ and pnpm 11. Copy `.env.example` to `.env.local` and fill in the test
environment's origins.

```bash
pnpm install
pnpm dev                     # test channel at http://localhost:3001/docs, live-reloading content edits
pnpm build --channel test    # the channel's Worker in .open-next/
pnpm preview -- --env test   # that Worker locally, in workerd
pnpm typecheck
pnpm test                    # release resolution
```

The first build of a release clones the application repository at its tag and installs the
Control Plane's dependencies to generate the document, which takes about a minute.

## Deploying

`wrangler.jsonc` defines one Worker per channel: `agentconnect-docs` at the top level for `prod`, and
`agentconnect-docs-test` under `env.test`. A route on the website's host binds `/docs*` to the Worker;
routes live with the deployment, not in this repository.

```bash
pnpm build --channel test && pnpm deploy -- --env test
pnpm build --channel prod && pnpm deploy
```

Page feedback ("How is this guide?") is posted to this repository's GitHub Discussions by a GitHub App
with Discussions write access, installed on this repository only. Each Worker needs its secrets:
`GITHUB_APP_ID` and `GITHUB_APP_PRIVATE_KEY` (the key in PKCS#8 form). `prod` posts to the
"Docs Feedback" category and `test` to "Docs Feedback (test)". Without the secrets the site still
works; feedback is only logged.
