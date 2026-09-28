import assert from 'node:assert/strict'
import { test } from 'node:test'
import { bindOpenapi } from './lib/openapi.mjs'

const spec = {
  openapi: '3.1.0',
  info: { title: 'AgentConnect', version: '1' },
  paths: { '/v1/me': {}, '/v1/orgs/{orgId}': {} },
  servers: [{ url: 'http://control-plane.internal' }]
}

test('binds a document to its channel: that API, the release, the paths as served', () => {
  const bound = bindOpenapi(spec, { apiUrl: 'https://api.example.test', release: 'v1.2.3' })
  assert.deepEqual(Object.keys(bound.paths), ['/v1/me', '/v1/orgs/{orgId}'])
  assert.deepEqual(bound.servers, [{ url: 'https://api.example.test' }])
  assert.equal(bound.info['x-agentconnect-release'], 'v1.2.3')
})

test('records no release the API did not report', () => {
  const served = { ...spec, info: { ...spec.info, 'x-agentconnect-release': 'v9.9.9' } }
  const bound = bindOpenapi(served, { apiUrl: 'https://api.example.test', release: null })
  assert.equal('x-agentconnect-release' in bound.info, false)
})
