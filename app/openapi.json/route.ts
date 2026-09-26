import spec from '@/.generated/openapi.json'
import { channel } from '@/lib/channel'

export const dynamic = 'force-static'

// The exact document behind this site's API Reference: the bound release, served against this channel's API.
export function GET() {
  return Response.json(spec, { headers: { 'x-agentconnect-release': channel.release.tag } })
}
