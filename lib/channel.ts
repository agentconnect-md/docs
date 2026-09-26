import generated from '@/.generated/channel.json'

export interface Channel {
  id: string
  label: string
  apiUrl: string
  consoleUrl: string
  release: { tag: string; commit: string; committedAt: string }
}

// Written by scripts/prepare.mjs; a build is bound to exactly one channel.
export const channel = generated as Channel

const APP = 'https://github.com/agentconnect-md/agentconnect'

// Formal releases have release notes; a release candidate is only a tag.
export const releaseUrl = channel.release.tag.includes('-rc.')
  ? `${APP}/tree/${channel.release.tag}`
  : `${APP}/releases/tag/${channel.release.tag}`
