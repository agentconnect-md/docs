import assert from 'node:assert/strict'
import { test } from 'node:test'
import matter from 'gray-matter'
import { fetchReleases, releaseSummary, renderChangelogPages } from './lib/changelog.mjs'

const body = `<!-- agentconnect-release-summary:start -->
## Summary

- **File sharing** — Agents can send files to a conversation.

**Upgrade note:** Review the new default before upgrading.
<!-- agentconnect-release-summary:end -->

### Features

* feat: send files (abcdef1)

**Full Changelog**: https://github.com/example-org/example-repo/compare/v1.0.0...v1.1.0`

test('only the bounded summary reaches the changelog, with dates and release links', () => {
  const release = { tag_name: 'v1.1.0', published_at: '2026-11-05T12:00:00Z', body }
  const [{ markdown }] = renderChangelogPages([
    release,
    { ...release, tag_name: 'v1.2.0', published_at: '2026-11-06T12:00:00Z' },
    { ...release, tag_name: 'v2.0.0-rc.1', prerelease: true },
    { ...release, tag_name: 'v3.0.0', draft: true },
    { ...release, tag_name: 'v0.9.0', body: '### Features\n\n* technical notes only' }
  ])
  assert.match(markdown, /File sharing/)
  assert.match(markdown, /\*\*Upgrade note:\*\*/)
  assert.match(markdown, /2026-11-05 · \[View release on GitHub\]\(https:\/\/github.com\/agentconnect-md\/agentconnect\/releases\/tag\/v1\.1\.0\)/)
  assert.ok(markdown.indexOf('## v1.2.0') < markdown.indexOf('## v1.1.0'))
  assert.doesNotMatch(markdown, /abcdef1|Full Changelog|### Features|## Summary|<!--|v2\.0\.0|v3\.0\.0|v0\.9\.0/)
  const { data } = matter(markdown)
  assert.deepEqual(data.entries.map((entry) => entry.title), ['v1.2.0', 'v1.1.0'])
  assert.equal(data.entries[0].content, releaseSummary(body))
})

test('pages contain every eligible summary exactly once, with matching search anchors', () => {
  const releases = Array.from({ length: 21 }, (_, index) => ({
    tag_name: `v1.0.${index}`,
    published_at: `2026-10-${String(index + 1).padStart(2, '0')}T12:00:00Z`,
    body
  }))
  const pages = renderChangelogPages(releases)
  assert.deepEqual(pages.map((page) => page.name), ['index', '2', '3'])
  const entries = pages.flatMap(({ markdown }) => {
    const { data, content } = matter(markdown)
    for (const entry of data.entries) assert.ok(content.includes(`## ${entry.title} [#${entry.id}]`))
    return data.entries
  })
  assert.equal(entries.length, 21)
  assert.deepEqual(entries.map((entry) => entry.title), releases.toReversed().map((release) => release.tag_name))
})

test('missing, empty, or ambiguous summary boundaries never fall back to technical notes', () => {
  for (const value of [
    '',
    '## Summary\n\nUnmarked prose.\n\n### Features\n\n* commit',
    body.replace('<!-- agentconnect-release-summary:end -->', ''),
    body + body,
    `<!-- agentconnect-release-summary:end -->\n${body}`,
    '<!-- agentconnect-release-summary:start -->\n## Summary\n\n<!-- agentconnect-release-summary:end -->'
  ]) assert.equal(releaseSummary(value), null)
})

test('fetches every release page, including older summaries beyond the first hundred', async () => {
  const requests = []
  const releases = await fetchReleases({
    token: undefined,
    fetcher: async (url) => {
      requests.push(url)
      return Response.json(requests.length === 1 ? Array.from({ length: 100 }, (_, id) => ({ id })) : [{ id: 100 }])
    }
  })
  assert.equal(releases.length, 101)
  assert.match(requests[1], /per_page=100&page=2$/)
})

test('a failed fetch stops generation instead of publishing an incomplete changelog', async () => {
  await assert.rejects(fetchReleases({ fetcher: async () => new Response(null, { status: 503 }) }), /GitHub releases returned 503/)
})
