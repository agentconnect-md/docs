import guides from './legacy-guides.json' with { type: 'json' }

const guideAliases = new Map(Object.entries(guides))

// ReadMe's flat guide slugs and operation IDs survive its versioned and unversioned URLs.
export function legacyDestination(slugs, apiPages) {
  let path
  try {
    path = decodeURIComponent(slugs.join('/')).replace(/^branches\/1\.0\//, '').toLowerCase()
  } catch {
    return undefined
  }
  if (path === 'reference') return '/api'
  if (path.startsWith('reference/')) {
    const operation = path.slice('reference/'.length)
    return apiPages.find((page) => page.slugs.at(-1)?.toLowerCase() === operation)?.url ?? guideAliases.get(operation)
  }
  return guideAliases.get(path.replace(/^(docs|guides)(\/|$)/, ''))
}
