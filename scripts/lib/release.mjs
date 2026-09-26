import { execFileSync } from 'node:child_process'

const TAG = /^v(\d+)\.(\d+)\.(\d+)(?:-rc\.(\d+))?$/

export function parseTag(tag) {
  const m = TAG.exec(tag)
  if (!m) return undefined
  return { tag, core: [Number(m[1]), Number(m[2]), Number(m[3])], rc: m[4] === undefined ? undefined : Number(m[4]) }
}

// Semver order: a release candidate sorts below the release of the same version.
export function compareTags(a, b) {
  for (let i = 0; i < 3; i++) if (a.core[i] !== b.core[i]) return a.core[i] - b.core[i]
  if (a.rc === b.rc) return 0
  if (a.rc === undefined) return 1
  if (b.rc === undefined) return -1
  return a.rc - b.rc
}

/** Latest tag of a release line: `stable` takes vX.Y.Z only, `rc` takes whatever shipped last. */
export function latestTag(tags, line) {
  const parsed = tags.map(parseTag).filter((t) => t && (line === 'rc' || t.rc === undefined))
  if (parsed.length === 0) throw new Error(`No ${line} release tag found`)
  return parsed.sort(compareTags).at(-1).tag
}

/** `git ls-remote` output → { tag: commit }, peeling annotated tags to the commit they point at. */
export function parseLsRemote(output) {
  const tags = {}
  for (const line of output.split('\n')) {
    const [sha, ref] = line.trim().split(/\s+/)
    if (!ref?.startsWith('refs/tags/')) continue
    const peeled = ref.endsWith('^{}')
    const name = ref.slice('refs/tags/'.length).replace(/\^\{\}$/, '')
    if (peeled || !(name in tags)) tags[name] = sha
  }
  return tags
}

export function listReleaseTags(repository) {
  const out = execFileSync('git', ['ls-remote', '--tags', repository, 'refs/tags/v*'], { encoding: 'utf8' })
  return parseLsRemote(out)
}

/** The release a channel is bound to; DOCS_RELEASE pins it, e.g. to rebuild an older release. */
export function resolveRelease({ repository, line, pinned }) {
  const tags = listReleaseTags(repository)
  const tag = pinned ?? latestTag(Object.keys(tags), line)
  const parsed = parseTag(tag)
  if (!parsed) throw new Error(`"${tag}" is not a release tag`)
  if (line === 'stable' && parsed.rc !== undefined) throw new Error(`${tag} is a release candidate, not a formal release`)
  if (!tags[tag]) throw new Error(`Release tag ${tag} does not exist in ${repository}`)
  return { tag, commit: tags[tag] }
}
