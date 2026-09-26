import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { OPENAPI_PATH_PREFIX } from './channels.mjs'

function run(cmd, args, opts) {
  execFileSync(cmd, args, { stdio: ['ignore', 'inherit', 'inherit'], ...opts })
}

/**
 * The OpenAPI document a release shipped, generated from that tag's source with the same
 * generator the release pipeline runs. Cached per tag: a tag's document never changes.
 */
export function releaseOpenapi({ release, repository, cacheDir, log = console.log }) {
  const dir = join(cacheDir, 'openapi')
  const specFile = join(dir, `${release.tag}.json`)
  const metaFile = join(dir, `${release.tag}.meta.json`)
  if (existsSync(specFile) && existsSync(metaFile)) {
    const meta = JSON.parse(readFileSync(metaFile, 'utf8'))
    if (meta.commit === release.commit) {
      log(`openapi: ${release.tag} from cache`)
      return { spec: JSON.parse(readFileSync(specFile, 'utf8')), meta }
    }
  }

  const work = resolve(cacheDir, 'app', release.tag)
  rmSync(work, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  log(`openapi: generating ${release.tag} from source`)
  try {
    run('git', ['-c', 'advice.detachedHead=false', 'clone', '--quiet', '--depth', '1', '--branch', release.tag, '--single-branch', repository, work])
    const head = execFileSync('git', ['-C', work, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
    if (head !== release.commit) throw new Error(`${release.tag} resolved to ${head}, expected ${release.commit}`)
    const committedAt = execFileSync('git', ['-C', work, 'log', '-1', '--format=%cI'], { encoding: 'utf8' }).trim()

    run('pnpm', ['install', '--frozen-lockfile', '--ignore-scripts', '--reporter=silent', '--filter', '@agentconnect.md/control-plane...'], { cwd: work })
    const env = { ...process.env, OPENAPI_PATH_PREFIX }
    delete env.PUBLIC_CP_URL
    run('pnpm', ['--filter', '@agentconnect.md/control-plane', 'openapi:generate', resolve(specFile)], { cwd: work, env })

    const meta = { tag: release.tag, commit: release.commit, committedAt }
    writeFileSync(metaFile, JSON.stringify(meta, null, 2) + '\n')
    return { spec: JSON.parse(readFileSync(specFile, 'utf8')), meta }
  } finally {
    rmSync(work, { recursive: true, force: true })
  }
}

/** Bind a release's document to a channel: its server is that channel's API, and the release is recorded. */
export function bindOpenapi(spec, { apiUrl, release }) {
  return {
    ...spec,
    info: { ...spec.info, 'x-agentconnect-release': release.tag },
    servers: [{ url: apiUrl }]
  }
}
