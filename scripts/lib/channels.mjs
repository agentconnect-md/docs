// A channel is one published copy of the site, bound to one environment: its API is where the
// reference comes from and where "Send" goes. Production origins are public; every other channel's
// origins come from the environment only.

// Public prefix the API gateway exposes the Control Plane's /api/v1 routes under.
export const OPENAPI_PATH_PREFIX = '/v1'

const DEFINITIONS = {
  prod: {
    label: 'Production',
    urls: {
      api: ['DOCS_PROD_API_URL', 'https://api.agentconnect.md'],
      console: ['DOCS_PROD_CONSOLE_URL', 'https://app.agentconnect.md']
    }
  },
  test: {
    label: 'Test',
    urls: {
      api: ['DOCS_TEST_API_URL'],
      console: ['DOCS_TEST_CONSOLE_URL']
    }
  }
}

export const CHANNEL_IDS = Object.keys(DEFINITIONS)

function readUrl(env, [name, fallback]) {
  const raw = env[name] ?? fallback
  if (!raw) throw new Error(`${name} is not set; see .env.example`)
  const url = new URL(raw)
  if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1')
    throw new Error(`${name} must be an https URL`)
  return url.origin
}

/** Resolve a channel with the origins of the environment it documents. */
export function resolveChannel(id, env = process.env) {
  const def = DEFINITIONS[id]
  if (!def) throw new Error(`Unknown channel "${id}"; expected one of ${CHANNEL_IDS.join(', ')}`)
  return {
    id,
    label: def.label,
    apiUrl: readUrl(env, def.urls.api),
    consoleUrl: readUrl(env, def.urls.console)
  }
}
