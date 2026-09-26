import assert from 'node:assert/strict'
import { test } from 'node:test'
import { bindOpenapi } from './lib/openapi.mjs'

const spec = {
  openapi: '3.1.0',
  info: { title: 'AgentConnect', version: '1' },
  paths: { '/api/v1/me': {}, '/api/v1/orgs/{orgId}': {} },
  servers: [{ url: 'http://control-plane.internal' }]
}

test('binds a document to its channel: public prefix, that API, the release', () => {
  const bound = bindOpenapi(spec, { apiUrl: 'https://api.example.test', pathPrefix: '/v1', release: 'v1.2.3' })
  assert.deepEqual(Object.keys(bound.paths), ['/v1/me', '/v1/orgs/{orgId}'])
  assert.deepEqual(bound.servers, [{ url: 'https://api.example.test' }])
  assert.equal(bound.info['x-agentconnect-release'], 'v1.2.3')
  assert.equal(spec.paths['/api/v1/me'] !== undefined, true)
})

test('leaves paths already on the public prefix alone and records no unknown release', () => {
  const served = { ...spec, paths: { '/v1/me': {} }, info: { ...spec.info, 'x-agentconnect-release': 'v9.9.9' } }
  const bound = bindOpenapi(served, { apiUrl: 'https://api.example.test', pathPrefix: '/v1', release: null })
  assert.deepEqual(Object.keys(bound.paths), ['/v1/me'])
  assert.equal('x-agentconnect-release' in bound.info, false)
})
