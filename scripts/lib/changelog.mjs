export const RELEASES_URL = 'https://github.com/agentconnect-md/agentconnect/releases'
const API_URL = 'https://api.github.com/repos/agentconnect-md/agentconnect/releases'
const START = '<!-- agentconnect-release-summary:start -->'
const END = '<!-- agentconnect-release-summary:end -->'

export function releaseSummary(body = '') {
  const parts = body.split(START)
  if (parts.length !== 2) return null
  const summary = parts[1].split(END)
  if (summary.length !== 2 || parts[0].includes(END)) return null
  return summary[0].trim().replace(/^## Summary[ \t]*(?:\r?\n|$)/, '').trim() || null
}

export async function fetchReleases({ fetcher = fetch, token = process.env.GITHUB_TOKEN } = {}) {
  const releases = []
  for (let page = 1; ; page++) {
    const response = await fetcher(`${API_URL}?per_page=100&page=${page}`, {
      headers: {
        accept: 'application/vnd.github+json',
        ...(token ? { authorization: `Bearer ${token}` } : {})
      },
      signal: AbortSignal.timeout(30_000)
    })
    if (!response.ok) throw new Error(`GitHub releases returned ${response.status}`)
    const batch = await response.json()
    releases.push(...batch)
    if (batch.length < 100) return releases
  }
}

export function renderChangelogPages(releases, perPage = 10) {
  const entries = releases
    .filter((release) => !release.draft && !release.prerelease && release.published_at)
    .map((release) => ({ ...release, summary: releaseSummary(release.body ?? '') }))
    .filter((release) => release.summary)
    .sort((a, b) => b.published_at.localeCompare(a.published_at))
    .map((release) => ({
      id: release.tag_name,
      title: release.tag_name,
      date: release.published_at,
      url: `${RELEASES_URL}/tag/${encodeURIComponent(release.tag_name)}`,
      content: release.summary
    }))

  return Array.from({ length: Math.max(1, Math.ceil(entries.length / perPage)) }, (_, index) => {
    const page = entries.slice(index * perPage, (index + 1) * perPage)
    return { name: index === 0 ? 'index' : String(index + 1), markdown: renderPage(page, index + 1) }
  })
}

function renderPage(entries, page) {
  return [
    '---',
    `title: Changelog${page > 1 ? ` (page ${page})` : ''}`,
    'description: New features, improvements, and important fixes in AgentConnect.',
    'icon: ScrollText',
    `sourceUrl: ${RELEASES_URL}`,
    `entries: ${JSON.stringify(entries)}`,
    '---',
    '',
    `Product updates from our stable releases. [All releases on GitHub](${RELEASES_URL}).`,
    '',
    ...entries.map((entry) => [
      `## ${entry.title} [#${entry.id}]`,
      `${entry.date.slice(0, 10)} · [View release on GitHub](${entry.url})`,
      `${entry.content}\n`
    ].join('\n\n'))
  ].join('\n')
}
