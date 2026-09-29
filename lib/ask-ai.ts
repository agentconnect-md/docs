// Ask AI: the chat route's logic, kept free of Next and path aliases so `node --test` can import it as is.

export interface AskAiConfig {
  // The channel's relay origin, e.g. https://relay.example.test.
  relayUrl: string
  apiKey: string
  agentId: string
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

// One cookie per panel tab, `ac_ask_ai_<handle>`, holding the chat id this route chose, so overlapping responses never overwrite another tab's binding.
export const COOKIE_PREFIX = 'ac_ask_ai_'
const COOKIE_MAX_AGE_S = 24 * 60 * 60
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
export function readConfig(env: Record<string, string | undefined>): AskAiConfig | null {
  const apiKey = env.AGENTCONNECT_API_KEY
  const agentId = env.AGENTCONNECT_AGENT_ID
  const relayUrl = env.AGENTCONNECT_RELAY_URL?.replace(/\/+$/, '')
  if (!apiKey || !agentId || !relayUrl) return null
  return { relayUrl, apiKey, agentId }
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

/** The agent's open questions and tool approvals in a message; the panel answers none, so it dismisses and refuses each. */
export function openAgentQuestions(parts: readonly unknown[]): { dismiss: string[]; refuse: string[] } {
  const dismiss: string[] = []
  const refuse: string[] = []
  for (const part of parts) {
    const p = part as { type?: unknown; toolName?: unknown; state?: unknown; toolCallId?: unknown; approval?: { id?: unknown } }
    if (p.type !== 'dynamic-tool') continue
    if (p.toolName === 'agentconnect_ask' && p.state === 'input-available' && typeof p.toolCallId === 'string')
      dismiss.push(p.toolCallId)
    if (p.toolName === 'agentconnect_approval' && p.state === 'approval-requested' && typeof p.approval?.id === 'string')
      refuse.push(p.approval.id)
  }
  return { dismiss, refuse }
}

function json(status: number, error: string, headers?: HeadersInit): Response {
  return Response.json({ error }, { status, headers })
}

async function reasonOf(response: Response): Promise<unknown> {
  try {
    return ((await response.clone().json()) as { reason?: unknown }).reason
  } catch {
    return undefined
  }
}

// The daemon refusing an agent that is not running now; anything else is a plain failure.
const OFFLINE_REASONS = new Set(['no_agent', 'paused', 'draining'])

/** The code the panel words a refused turn by: its API's Decision gate declined it, a turn is running, or the agent is offline. */
export function errorCode(status: number, reason: unknown): string {
  if (status === 422 && reason === 'declined') return 'declined'
  if (status === 409 && reason === 'busy') return 'busy'
  if (status === 503 && typeof reason === 'string' && OFFLINE_REASONS.has(reason)) return 'offline'
  return 'relay_failed'
}

export interface ChatHandlerOptions {
  config: () => AskAiConfig | null
  cookiePath: string
  // Resolves false when this caller is over its rate; absent, nothing is limited.
  limit?: (request: Request) => Promise<boolean>
  fetch?: typeof fetch
  delay?: (ms: number) => Promise<void>
  newChatId?: () => string
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/** The `/api/chat` POST handler: the key and the tab's chat id go to the relay's chat API, and its turn streams straight through. */
export function createChatHandler({
  config,
  cookiePath,
  limit,
  fetch: fetcher = fetch,
  delay = sleep,
  newChatId = () => crypto.randomUUID()
}: ChatHandlerOptions) {
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

    // The client's chat id is never trusted; a tab's conversation is the chat id its HttpOnly cookie holds.
    const bound = readTabConversation(request.headers.get('cookie'), tab)
    let chatId = !bound || isNewConversation(body.messages) ? newChatId() : bound
    const folded = foldLocation(forward)
    const send = () =>
      fetcher(`${cfg.relayUrl}/ai-sdk/agents/${encodeURIComponent(cfg.agentId)}/chat`, {
        method: 'POST',
        headers: { authorization: `Bearer ${cfg.apiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({ ...folded, id: chatId }),
        signal: request.signal
      })
    let upstream: Response
    try {
      upstream = await send()
      // A conversation whose agent moved is replaced by a new one, once.
      if (upstream.status === 409 && chatId === bound && (await reasonOf(upstream)) === 'agent_moved') {
        await upstream.body?.cancel()
        chatId = newChatId()
        upstream = await send()
      }
      if (upstream.status === 503 && !request.signal.aborted && (await isRetryableRefusal(upstream.clone()))) {
        await upstream.body?.cancel()
        await delay(RELAY_RETRY_DELAY_MS)
        upstream = await send()
      }
    } catch {
      return json(502, 'unreachable')
    }

    const headers = new Headers({ 'cache-control': 'no-store' })
    if (chatId !== bound) headers.append('set-cookie', tabCookie(tab, chatId, cookiePath))
    if (!upstream.ok) {
      const code = errorCode(upstream.status, await reasonOf(upstream))
      await upstream.body?.cancel()
      return json(upstream.status, code, headers)
    }
    for (const name of STREAM_HEADERS) {
      const value = upstream.headers.get(name)
      if (value) headers.set(name, value)
    }
    return new Response(upstream.body, { status: upstream.status, headers })
  }
}
