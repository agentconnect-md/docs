// A channel is one published copy of the site, bound to one environment: its API is where the
// reference comes from and where "Send" goes. The origins come from the environment the build runs
// in (`DOCS_API_URL`, `DOCS_CONSOLE_URL`), never from the repository.

// Public prefix the API gateway exposes the Control Plane's /api/v1 routes under.
export const OPENAPI_PATH_PREFIX = '/v1'

const LABELS = { prod: 'Production', test: 'Test' }

export const CHANNEL_IDS = Object.keys(LABELS)

function readUrl(env, name) {
  const raw = env[name]
  if (!raw) throw new Error(`${name} is not set; see .env.example`)
  const url = new URL(raw)
  if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1')
    throw new Error(`${name} must be an https URL`)
  return url.origin
}

/** Resolve a channel with the origins of the environment it documents. */
export function resolveChannel(id, env = process.env) {
  const label = LABELS[id]
  if (!label) throw new Error(`Unknown channel "${id}"; expected one of ${CHANNEL_IDS.join(', ')}`)
  return {
    id,
    label,
    apiUrl: readUrl(env, 'DOCS_API_URL'),
    consoleUrl: readUrl(env, 'DOCS_CONSOLE_URL')
  }
}
