// Ask AI: the chat route's logic, kept free of Next and path aliases so `node --test` can import it as is.

export interface AskAiConfig {
  // The channel's REST base, e.g. https://api.example.test/v1.
  apiBase: string
  apiKey: string
  orgId: string
  agentId: string
}

export interface Minted {
  token: string
  relayUrl: string
  conversationId: string
  expiresAtMs: number
}

interface ChatPart {
  type: string
  text?: string
  data?: unknown
}

interface ChatMessage {
  id?: string
  role: string
  parts?: ChatPart[]
}

export interface ChatBody {
  messages?: ChatMessage[]
  [key: string]: unknown
}

// One cookie per panel tab, `ac_ask_ai_<handle>`, so overlapping responses never overwrite another tab's binding.
export const COOKIE_PREFIX = 'ac_ask_ai_'
// A token is reused until this long before it expires, so a turn never starts on one about to lapse.
export const TOKEN_MARGIN_MS = 30_000
const COOKIE_MAX_AGE_S = 24 * 60 * 60
const CACHE_LIMIT = 1000
const CONVERSATION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// A panel's random handle, checked strictly before it becomes part of a cookie name.
const TAB = /^[0-9a-f]{32}$/
const STREAM_HEADERS = ['content-type', 'x-vercel-ai-ui-message-stream']
// Only the daemon's own `not_holder` ack proves no turn started (seen while a release rolls); other 503s may follow a delivery.
export const RELAY_RETRY_DELAY_MS = 2_000
const RETRYABLE_REASON = 'not_holder'

async function isRetryableRefusal(response: Response): Promise<boolean> {
  if (response.status !== 503) return false
  try {
    return ((await response.json()) as { reason?: unknown }).reason === RETRYABLE_REASON
  } catch {
    return false
  }
}

export function isTabHandle(value: unknown): value is string {
  return typeof value === 'string' && TAB.test(value)
}

/** The three settings from the environment, or null when any is unset and the feature is off. */
export function readConfig(env: Record<string, string | undefined>, apiBase: string): AskAiConfig | null {
  const apiKey = env.AGENTCONNECT_API_KEY
  const orgId = env.AGENTCONNECT_ORG_ID
  const agentId = env.AGENTCONNECT_AGENT_ID
  if (!apiKey || !orgId || !agentId) return null
  return { apiBase, apiKey, orgId, agentId }
}

/** The conversation this tab's own cookie binds it to, if well-formed; other tabs' cookies are never read. */
export function readTabConversation(header: string | null, tab: string): string | undefined {
  const name = `${COOKIE_PREFIX}${tab}`
  for (const pair of header?.split(';') ?? []) {
    const eq = pair.indexOf('=')
    if (eq < 0 || pair.slice(0, eq).trim() !== name) continue
    const value = pair.slice(eq + 1).trim()
    return CONVERSATION_ID.test(value) ? value : undefined
  }
  return undefined
}

export function tabCookie(tab: string, conversationId: string, path: string): string {
  return `${COOKIE_PREFIX}${tab}=${conversationId}; Path=${path}; Max-Age=${COOKIE_MAX_AGE_S}; HttpOnly; Secure; SameSite=Lax`
}

/** `useChat` clears its history without telling the server, so a lone first question starts a new conversation. */
export function isNewConversation(messages: ChatMessage[] | undefined): boolean {
  const list = messages ?? []
  return list.filter((m) => m.role === 'user').length === 1 && !list.some((m) => m.role === 'assistant')
}

/** Fold the panel's `data-client` location into the last user message's text, since the relay reads text parts only. */
export function foldLocation(body: ChatBody): ChatBody {
  const messages = body.messages ?? []
  const index = messages.findLastIndex((m) => m.role === 'user')
  if (index < 0) return body
  const message = messages[index]
  const parts = message.parts ?? []
  const client = parts.find((p) => p.type === 'data-client')?.data as { location?: unknown } | undefined
  const location = typeof client?.location === 'string' ? client.location.replace(/\s+/g, ' ').trim().slice(0, 500) : ''
  const question = parts
    .filter((p) => p.type === 'text' && typeof p.text === 'string')
    .map((p) => p.text)
    .join('\n')
  const text = location ? `Reader is on ${location}\n\n${question}` : question
  const folded = { ...message, parts: [{ type: 'text', text }] }
  return { ...body, messages: messages.map((m, i) => (i === index ? folded : m)) }
}

/** Tokens per conversation, per isolate; a miss just mints again. */
export class TokenCache {
  private readonly entries = new Map<string, Minted>()
  private readonly now: () => number

  constructor(now: () => number = Date.now) {
    this.now = now
  }

  get(conversationId: string): Minted | undefined {
    const entry = this.entries.get(conversationId)
    if (!entry) return undefined
    if (entry.expiresAtMs - TOKEN_MARGIN_MS > this.now()) return entry
    this.entries.delete(conversationId)
    return undefined
  }

  set(minted: Minted): void {
    this.entries.delete(minted.conversationId)
    this.entries.set(minted.conversationId, minted)
    // Maps iterate in insertion order, so the first key is the least recently minted.
    while (this.entries.size > CACHE_LIMIT) this.entries.delete(this.entries.keys().next().value!)
  }

  delete(conversationId: string): void {
    this.entries.delete(conversationId)
  }
}

class UpstreamError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`upstream ${status}`)
    this.status = status
  }
}

function json(status: number, error: string, headers?: HeadersInit): Response {
  return Response.json({ error }, { status, headers })
}

export interface ChatHandlerOptions {
  config: () => AskAiConfig | null
  cookiePath: string
  // Resolves false when this caller is over its rate; absent, nothing is limited.
  limit?: (request: Request) => Promise<boolean>
  fetch?: typeof fetch
  cache?: TokenCache
  delay?: (ms: number) => Promise<void>
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/** The `/api/chat` POST handler: mint or reuse a conversation token, then stream the relay's turn straight through. */
export function createChatHandler({
  config,
  cookiePath,
  limit,
  fetch: fetcher = fetch,
  cache = new TokenCache(),
  delay = sleep
}: ChatHandlerOptions) {
  async function mint(cfg: AskAiConfig, conversationId?: string): Promise<Minted> {
    const url = `${cfg.apiBase}/orgs/${encodeURIComponent(cfg.orgId)}/agents/${encodeURIComponent(cfg.agentId)}/webchat/token`
    const response = await fetcher(url, {
      method: 'POST',
      headers: { authorization: `Bearer ${cfg.apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify(conversationId ? { conversationId } : {})
    })
    if (!response.ok) throw new UpstreamError(response.status)
    const body = (await response.json()) as { token: string; relayUrl: string; conversationId: string; expiresAt: string }
    const minted = {
      token: body.token,
      relayUrl: body.relayUrl.replace(/\/+$/, ''),
      conversationId: body.conversationId,
      expiresAtMs: Date.parse(body.expiresAt)
    }
    cache.set(minted)
    return minted
  }

  return async function POST(request: Request): Promise<Response> {
    const cfg = config()
    if (!cfg) return json(503, 'disabled')
    if (limit && !(await limit(request))) return json(429, 'rate_limited')

    let body: ChatBody
    try {
      body = (await request.json()) as ChatBody
    } catch {
      return json(400, 'bad_request')
    }
    if (!Array.isArray(body?.messages)) return json(400, 'bad_request')
    // The panel's tab handle picks its own cookie, so two tabs never share a conversation.
    const { tab, ...forward } = body
    if (!isTabHandle(tab)) return json(400, 'bad_request')

    // The client's chat id is never trusted; a tab's conversation is the one its HttpOnly cookie binds it to.
    const bound = readTabConversation(request.headers.get('cookie'), tab)
    let minted: Minted
    let rebound = false
    try {
      if (!bound || isNewConversation(body.messages)) {
        minted = await mint(cfg)
        rebound = true
      } else {
        const cached = cache.get(bound)
        if (cached) minted = cached
        else {
          try {
            minted = await mint(cfg, bound)
          } catch (err) {
            // An unknown conversation, or one whose agent moved, is replaced by a new one, once.
            if (!(err instanceof UpstreamError) || (err.status !== 404 && err.status !== 409)) throw err
            minted = await mint(cfg)
            rebound = true
          }
        }
      }
    } catch (err) {
      if (err instanceof UpstreamError) return json(err.status, 'mint_failed')
      return json(502, 'unreachable')
    }

    const headers = new Headers({ 'cache-control': 'no-store' })
    if (rebound) headers.append('set-cookie', tabCookie(tab, minted.conversationId, cookiePath))

    const payload = JSON.stringify(foldLocation(forward))
    const send = () =>
      fetcher(`${minted.relayUrl}/ai-sdk/chat/${encodeURIComponent(minted.conversationId)}`, {
        method: 'POST',
        headers: { authorization: `Bearer ${minted.token}`, 'content-type': 'application/json' },
        body: payload,
        signal: request.signal
      })
    let upstream: Response
    try {
      upstream = await send()
      if (upstream.status === 503 && !request.signal.aborted && (await isRetryableRefusal(upstream.clone()))) {
        await upstream.body?.cancel()
        await delay(RELAY_RETRY_DELAY_MS)
        upstream = await send()
      }
    } catch {
      return json(502, 'unreachable', headers)
    }

    if (!upstream.ok) {
      if (upstream.status === 401) cache.delete(minted.conversationId)
      await upstream.body?.cancel()
      return json(upstream.status, upstream.status === 409 ? 'busy' : 'relay_failed', headers)
    }
    for (const name of STREAM_HEADERS) {
      const value = upstream.headers.get(name)
      if (value) headers.set(name, value)
    }
    return new Response(upstream.body, { status: upstream.status, headers })
  }
}
