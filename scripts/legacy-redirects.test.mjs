import assert from 'node:assert/strict'
import { test } from 'node:test'
import { legacyDestination } from '../lib/legacy-redirects.mjs'

const apiPages = [{ slugs: ['agents', 'updateAgent'], url: '/api/agents/updateAgent' }]

test('old guide and API links retain their destination through both ReadMe URL formats', () => {
  for (const [path, destination] of [
    ['docs/slack', '/connect-automate/chat-platforms/slack'],
    ['branches/1.0/guides/Agents', '/build-your-team/agents'],
    ['branches/1.0/guides/kubernetes-runtime-authentication', '/self-hosting/kubernetes/runtime-authentication'],
    ['reference/updateagent', '/api/agents/updateAgent'],
    ['branches/1.0/reference/updateagent', '/api/agents/updateAgent'],
    ['docs/linked-account-permissions', '/how-to-guides/linked-accounts'],
    ['reference', '/api'],
    ['docs', '/getting-started']
  ]) assert.equal(legacyDestination(path.split('/'), apiPages), destination, path)
})

test('unknown and removed pages do not redirect to unrelated content', () => {
  for (const path of ['docs/does-not-exist', 'reference/removedOperation', 'branches/2.0/guides/slack', 'constructor', 'docs/__proto__'])
    assert.equal(legacyDestination(path.split('/'), apiPages), undefined, path)
})
