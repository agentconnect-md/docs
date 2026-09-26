import assert from 'node:assert/strict'
import { test } from 'node:test'
import { latestTag, parseLsRemote } from './lib/release.mjs'

const TAGS = ['v1.9.0', 'v1.10.0-rc.2', 'v1.10.0-rc.10', 'v1.9.1-rc.1', 'v1.10.0', 'v1.11.0-rc.1', 'v0.1', 'nightly']

test('stable takes the highest formal release, never a release candidate', () => {
  assert.equal(latestTag(TAGS, 'stable'), 'v1.10.0')
})

test('rc takes whatever shipped last, comparing rc numbers numerically', () => {
  assert.equal(latestTag(TAGS, 'rc'), 'v1.11.0-rc.1')
  assert.equal(latestTag(['v1.10.0-rc.2', 'v1.10.0-rc.10'], 'rc'), 'v1.10.0-rc.10')
})

test('a release sorts above its own release candidates', () => {
  assert.equal(latestTag(['v2.0.0-rc.5', 'v2.0.0'], 'rc'), 'v2.0.0')
})

test('no matching tag is an error rather than a guess', () => {
  assert.throws(() => latestTag(['v1.0.0-rc.1'], 'stable'), /No stable release tag/)
})

test('ls-remote output maps annotated tags to the commit they point at', () => {
  const out = [
    'aaa\trefs/tags/v1.0.0',
    'bbb\trefs/tags/v1.0.0^{}',
    'ccc\trefs/tags/v1.1.0-rc.1',
    'ddd\trefs/heads/main'
  ].join('\n')
  assert.deepEqual(parseLsRemote(out), { 'v1.0.0': 'bbb', 'v1.1.0-rc.1': 'ccc' })
})
