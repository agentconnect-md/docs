#!/usr/bin/env node
// `pnpm dev [--channel test|prod] [--port N]`: prepare the channel, then run next dev.
import { spawn } from 'node:child_process'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { loadEnv, prepare, SITE } from './prepare.mjs'

const { values } = parseArgs({ options: { channel: { type: 'string' }, port: { type: 'string' } } })
loadEnv()
const channelId = values.channel ?? process.env.DOCS_CHANNEL ?? 'test'
await prepare({ channelId })
const port = values.port ?? (channelId === 'prod' ? '3000' : '3001')

const next = spawn(process.execPath, [join(SITE, 'node_modules/next/dist/bin/next'), 'dev', '-p', port], {
  cwd: SITE,
  stdio: 'inherit',
  env: { ...process.env, DOCS_CHANNEL: channelId }
})
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => next.kill(signal))
next.on('exit', (code) => process.exit(code ?? 0))
