#!/usr/bin/env node
// Materializes one channel into .generated/: its release's OpenAPI document, bound to its API, and the
// channel the build serves. The docs themselves are read from content/docs as they are.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { APP_REPOSITORY, resolveChannel } from './lib/channels.mjs'
import { bindOpenapi, releaseOpenapi } from './lib/openapi.mjs'
import { resolveRelease } from './lib/release.mjs'

export const SITE = resolve(import.meta.dirname, '..')
const GENERATED = join(SITE, '.generated')
const CACHE = join(SITE, '.cache')

export function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const path = join(SITE, file)
    if (existsSync(path)) process.loadEnvFile(path)
  }
}

function writeJson(file, value) {
  mkdirSync(GENERATED, { recursive: true })
  writeFileSync(join(GENERATED, file), JSON.stringify(value, null, 2) + '\n')
}

export function prepare({ channelId }) {
  const channel = resolveChannel(channelId)
  const release = resolveRelease({ repository: APP_REPOSITORY, line: channel.releaseLine, pinned: process.env.DOCS_RELEASE })
  const { spec, meta } = releaseOpenapi({ release, repository: APP_REPOSITORY, cacheDir: CACHE })

  writeJson('openapi.json', bindOpenapi(spec, { apiUrl: channel.apiUrl, release }))
  writeJson('channel.json', {
    id: channel.id,
    label: channel.label,
    apiUrl: channel.apiUrl,
    consoleUrl: channel.consoleUrl,
    release: meta
  })
  console.log(`prepared ${channel.id}: release ${release.tag}`)
  return { channel }
}

if (import.meta.main) {
  const { values } = parseArgs({ options: { channel: { type: 'string' } } })
  loadEnv()
  prepare({ channelId: values.channel ?? process.env.DOCS_CHANNEL ?? 'test' })
}
