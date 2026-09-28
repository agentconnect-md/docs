import { getCloudflareContext } from '@opennextjs/cloudflare'
import { BASE_PATH } from '@/base-path.mjs'
import { createChatHandler, readConfig } from '@/lib/ask-ai'
import { channel } from '@/lib/channel'
import { OPENAPI_PATH_PREFIX } from '@/scripts/lib/channels.mjs'

interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>
}

// The Worker's per-visitor limiter from wrangler.jsonc; `next dev` has no Worker context, so nothing is limited there.
function limiter(): RateLimiter | undefined {
  try {
    return (getCloudflareContext().env as { ASK_AI_LIMIT?: RateLimiter }).ASK_AI_LIMIT
  } catch {
    return undefined
  }
}

// Ask AI: the key, org and agent are Worker secrets read per request, like the feedback App's; unset, the route answers 503.
export const POST = createChatHandler({
  config: () => readConfig(process.env, `${channel.apiUrl}${OPENAPI_PATH_PREFIX}`),
  cookiePath: BASE_PATH,
  limit: async (request) => {
    const binding = limiter()
    if (!binding) return true
    const { success } = await binding.limit({ key: request.headers.get('cf-connecting-ip') ?? 'unknown' })
    return success
  }
})
