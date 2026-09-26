import { OPENAPI_PATH_PREFIX } from './channels.mjs'

/** The OpenAPI document the channel's API serves: exactly what that environment runs, routes it enables included. */
export async function fetchOpenapi(channel) {
  // Failures name the channel and the status only: a test channel's origin is configuration, never log output.
  let response
  try {
    response = await fetch(`${channel.apiUrl}${OPENAPI_PATH_PREFIX}/openapi.json`)
  } catch {
    throw new Error(`Could not reach the ${channel.id} channel's API for its OpenAPI document`)
  }
  if (!response.ok) throw new Error(`The ${channel.id} channel's API returned ${response.status} for its OpenAPI document`)
  const spec = await response.json()
  if (typeof spec?.openapi !== 'string' || !spec.paths) throw new Error(`The ${channel.id} channel's API did not return an OpenAPI document`)
  return spec
}

/** Bind a document to a channel: its server is that channel's API, paths carry the public prefix, and the release is recorded. */
export function bindOpenapi(spec, { apiUrl, pathPrefix, release }) {
  // The Control Plane lists its own paths (/api/v1/...); a gateway exposes them under the public prefix.
  const paths = Object.fromEntries(Object.entries(spec.paths).map(([path, item]) => [path.replace(/^\/api\/v1(?=\/|$)/, pathPrefix), item]))
  const info = { ...spec.info }
  if (release) info['x-agentconnect-release'] = release
  else delete info['x-agentconnect-release']
  return { ...spec, info, paths, servers: [{ url: apiUrl }] }
}
