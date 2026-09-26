#!/usr/bin/env node
// `pnpm build --channel test|prod`: the channel's Cloudflare Worker in .open-next/ (`pnpm preview` serves it locally).
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { loadEnv, prepare, SITE } from './prepare.mjs'

const { values } = parseArgs({ options: { channel: { type: 'string' } } })
loadEnv()
const channelId = values.channel ?? process.env.DOCS_CHANNEL
if (!channelId) throw new Error('Pass --channel test|prod')
prepare({ channelId })

function run(script, args, env = {}) {
  const result = spawnSync(process.execPath, [join(SITE, 'node_modules', script), ...args], {
    cwd: SITE,
    stdio: 'inherit',
    env: { ...process.env, DOCS_CHANNEL: channelId, ...env }
  })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

// OpenNext would otherwise run the package's build script, which is this file, so Next is built here first,
// with the standalone output OpenNext bundles from (what it sets when it runs Next itself).
run('next/dist/bin/next', ['build'], { NEXT_PRIVATE_STANDALONE: 'true' })
run('@opennextjs/cloudflare/dist/cli/index.js', ['build', '--skipNextBuild', ...(channelId === 'prod' ? [] : ['--env', channelId])])
