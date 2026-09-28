import spec from '@/.generated/openapi.json'
import { channel } from '@/lib/channel'

export const dynamic = 'force-static'

// The exact document behind this site's API Reference: what this channel's API serves, bound to that API.
export function GET() {
  return Response.json(spec, { headers: channel.release ? { 'x-agentconnect-release': channel.release.tag } : {} })
}
