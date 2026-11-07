#!/usr/bin/env node
// Prepares the channel's OpenAPI document and the changelog before Next reads the documentation.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { parseArgs } from 'node:util'
import { resolveChannel } from './lib/channels.mjs'
import { bindOpenapi, fetchOpenapi } from './lib/openapi.mjs'
import { fetchReleases, renderChangelog } from './lib/changelog.mjs'

export const SITE = resolve(import.meta.dirname, '..')
const GENERATED = join(SITE, '.generated')

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

export async function prepare({ channelId }) {
  const channel = resolveChannel(channelId)
  const spec = await fetchOpenapi(channel)
  // The release the API reports it runs; an API that reports none leaves the label out.
  const release = spec.info?.['x-agentconnect-release'] ?? null

  writeJson('openapi.json', bindOpenapi(spec, { apiUrl: channel.apiUrl, release }))
  writeJson('channel.json', {
    id: channel.id,
    label: channel.label,
    apiUrl: channel.apiUrl,
    consoleUrl: channel.consoleUrl,
    release: release ? { tag: release } : null
  })
  writeFileSync(join(SITE, 'content/docs/(guides)/changelog.md'), renderChangelog(await fetchReleases()))
  console.log(`prepared ${channel.id}: ${Object.keys(spec.paths).length} paths${release ? `, release ${release}` : ''}`)
  return { channel }
}

if (import.meta.main) {
  const { values } = parseArgs({ options: { channel: { type: 'string' } } })
  loadEnv()
  await prepare({ channelId: values.channel ?? process.env.DOCS_CHANNEL ?? 'test' })
}
