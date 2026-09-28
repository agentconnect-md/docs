import generated from '@/.generated/channel.json'

export interface Channel {
  id: string
  label: string
  apiUrl: string
  consoleUrl: string
  // The release the channel's API reports it runs; null until an environment reports one.
  release: { tag: string } | null
}

// Written by scripts/prepare.mjs; a build is bound to exactly one channel.
export const channel = generated as Channel

const APP = 'https://github.com/agentconnect-md/agentconnect'

// Formal releases have release notes; a release candidate is only a tag.
export function releaseUrl(tag: string): string {
  return tag.includes('-rc.') ? `${APP}/tree/${tag}` : `${APP}/releases/tag/${tag}`
}
