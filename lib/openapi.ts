import { createOpenAPI } from 'fumadocs-openapi/server'
import spec from '@/.generated/openapi.json'
import { BASE_PATH } from '@/base-path.mjs'

// The renderer upgrades the document in place, so it gets its own copy and /openapi.json stays as released.
function forRendering() {
  const doc = structuredClone(spec) as typeof spec & { tags?: { name: string }[] }
  // Tag names are already titles ("API keys"); without this the renderer re-splits them ("A P I keys").
  doc.tags = doc.tags?.map((tag) => ({ 'x-displayName': tag.name, ...tag }))
  return doc as never
}

// Bundled at build time, so a built server always serves the document of the release it was built for.
export const openapi = createOpenAPI({
  input: { agentconnect: forRendering },
  proxyUrl: `${BASE_PATH}/api/proxy`
})
