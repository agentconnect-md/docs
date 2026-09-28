import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  COOKIE_PREFIX,
  RELAY_RETRY_DELAY_MS,
  TOKEN_MARGIN_MS,
  TokenCache,
  createChatHandler,
  foldLocation,
  isNewConversation,
  readConfig,
  readTabConversation,
  tabCookie
} from '../lib/ask-ai.ts'

const API = 'https://api.example.test/v1'
const RELAY = 'https://relay.example.test'
const conv = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`
const CONV_A = conv(10)
const CONV_B = conv(11)
const TAB_A = 'a'.repeat(32)
const TAB_B = 'b'.repeat(32)
const CONFIG = { apiBase: API, apiKey: 'test-key', orgId: 'org-1', agentId: 'agent-1' }

const user = (text, location) => ({
  id: `u-${text}`,
  role: 'user',
  parts: [...(location ? [{ type: 'data-client', data: { location } }] : []), { type: 'text', text }]
})
const assistant = (text) => ({ id: `a-${text}`, role: 'assistant', parts: [{ type: 'text', text }] })
const followUp = [user('q'), assistant('a'), user('q2')]

// A fetch stub: token mints answer from `mints` in order (else a fresh id), relay turns answer `relay`; calls are recorded.
function stubFetch({ mints = [], relay = () => sse() } = {}) {
  const calls = []
  let fresh = 100
  const fetch = async (url, init) => {
    const body = init.body ? JSON.parse(init.body) : undefined
    calls.push({ url, headers: init.headers, body })
    if (url.endsWith('/webchat/token')) {
      const next = mints.shift()
      if (typeof next === 'number') return new Response('{}', { status: next })
      const conversationId = next ?? body.conversationId ?? conv(fresh++)
      const expiresAt = new Date(Date.now() + 300_000).toISOString()
      return Response.json({ token: `tok-${conversationId}`, relayUrl: `${RELAY}/`, conversationId, expiresAt })
    }
    return relay()
  }
  return {
    fetch,
    calls,
    mintCalls: () => calls.filter((c) => c.url.endsWith('/webchat/token')),
    relayCalls: () => calls.filter((c) => c.url.startsWith(`${RELAY}/ai-sdk/chat/`))
  }
}

function sse() {
  return new Response('data: {"type":"start"}\n\n', {
    headers: { 'content-type': 'text/event-stream', 'x-vercel-ai-ui-message-stream': 'v1', 'x-other': 'dropped' }
  })
}

function chatRequest(messages, { tab = TAB_A, cookie } = {}) {
  return new Request('https://docs.example.test/docs/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie: `theme=dark; ${cookie}` } : {}) },
    body: JSON.stringify({ id: 'client-chosen', trigger: 'submit-message', messages, ...(tab === null ? {} : { tab }) })
  })
}

// A browser's cookie jar, shared by its tabs: a request carries what the jar held when it was sent.
function browser() {
  const jar = new Map()
  const header = () => [...jar].map(([name, value]) => `${name}=${value}`).join('; ')
  return {
    jar,
    request: (tab, messages) => chatRequest(messages, { tab, cookie: header() }),
    receive(res) {
      const set = res.headers.get('set-cookie')
      if (!set) return
      const [pair] = set.split(';')
      const eq = pair.indexOf('=')
      jar.set(pair.slice(0, eq), pair.slice(eq + 1))
    }
  }
}

const cookieFor = (tab, conversationId) => tabCookie(tab, conversationId, '/docs').split(';')[0]
const conversationOf = (call) => call.url.split('/').at(-1)

function handler(stub, cache = new TokenCache(), extra = {}) {
  return createChatHandler({ config: () => CONFIG, cookiePath: '/docs', fetch: stub.fetch, cache, delay: async () => {}, ...extra })
}

test('reads the three settings, or none when any is unset', () => {
  const env = { AGENTCONNECT_API_KEY: 'k', AGENTCONNECT_ORG_ID: 'o', AGENTCONNECT_AGENT_ID: 'a' }
  assert.deepEqual(readConfig(env, API), { apiBase: API, apiKey: 'k', orgId: 'o', agentId: 'a' })
  assert.equal(readConfig({ ...env, AGENTCONNECT_AGENT_ID: '' }, API), null)
})

test('a lone first question is a new conversation; anything with history resumes', () => {
  assert.equal(isNewConversation([user('q')]), true)
  assert.equal(isNewConversation(followUp), false)
  assert.equal(isNewConversation([user('q'), user('q2')]), false)
  assert.equal(isNewConversation([]), false)
})

test('each tab has its own HttpOnly, Secure cookie under the base path, and reads only its own', () => {
  const cookie = tabCookie(TAB_A, CONV_A, '/docs')
  assert.equal(cookie, `${COOKIE_PREFIX}${TAB_A}=${CONV_A}; Path=/docs; Max-Age=86400; HttpOnly; Secure; SameSite=Lax`)
  const header = `a=1; ${cookieFor(TAB_A, CONV_A)}; ${cookieFor(TAB_B, CONV_B)}`
  assert.equal(readTabConversation(header, TAB_A), CONV_A)
  assert.equal(readTabConversation(header, TAB_B), CONV_B)
  assert.equal(readTabConversation(header, 'c'.repeat(32)), undefined)
  assert.equal(readTabConversation(null, TAB_A), undefined)
})

test('a malformed conversation id in a tab cookie reads as absent', () => {
  assert.equal(readTabConversation(`${COOKIE_PREFIX}${TAB_A}=not-a-uuid`, TAB_A), undefined)
  assert.equal(readTabConversation(`${COOKIE_PREFIX}${TAB_A}=${CONV_A}x`, TAB_A), undefined)
})

test('folds the reader location into the last user message as one text part', () => {
  const body = { id: 'x', messages: [user('earlier', '/a'), assistant('ok'), user('How do I add a bot?', 'https://docs.example.test/docs/bots')] }
  const folded = foldLocation(body)
  assert.equal(folded.id, 'x')
  assert.deepEqual(folded.messages[0], body.messages[0])
  const text = 'Reader is on https://docs.example.test/docs/bots\n\nHow do I add a bot?'
  assert.deepEqual(folded.messages[2].parts, [{ type: 'text', text }])
  assert.deepEqual(foldLocation({ messages: [user('plain')] }).messages[0].parts, [{ type: 'text', text: 'plain' }])
})

test('a cached token lives until its expiry minus the margin', () => {
  let now = 1_000_000
  const cache = new TokenCache(() => now)
  cache.set({ token: 't', relayUrl: RELAY, conversationId: CONV_A, expiresAtMs: now + 60_000 })
  assert.equal(cache.get(CONV_A)?.token, 't')
  now += 60_000 - TOKEN_MARGIN_MS - 1
  assert.equal(cache.get(CONV_A)?.token, 't')
  now += 1
  assert.equal(cache.get(CONV_A), undefined)
})

test('answers 503 when the feature is not configured', async () => {
  const post = createChatHandler({ config: () => null, cookiePath: '/docs', fetch: async () => assert.fail('no fetch') })
  const res = await post(chatRequest([user('q')]))
  assert.equal(res.status, 503)
  assert.deepEqual(await res.json(), { error: 'disabled' })
})

test('a missing or malformed tab handle is a bad request', async () => {
  const bad = [null, '', 'a'.repeat(31), 'a'.repeat(33), 'A'.repeat(32), `${'a'.repeat(30)}=x`, `${'a'.repeat(28)}; x`, 42]
  for (const tab of bad) {
    const stub = stubFetch()
    const res = await handler(stub)(chatRequest([user('q')], { tab }))
    assert.equal(res.status, 400, String(tab))
    assert.equal(stub.calls.length, 0)
  }
})

test('a first question mints a new conversation, binds the tab and streams the relay through', async () => {
  const stub = stubFetch({ mints: [CONV_B] })
  const res = await handler(stub)(chatRequest([user('q', '/docs/x')], { cookie: cookieFor(TAB_A, CONV_A) }))
  assert.equal(res.status, 200)
  assert.equal(res.headers.get('content-type'), 'text/event-stream')
  assert.equal(res.headers.get('x-vercel-ai-ui-message-stream'), 'v1')
  assert.equal(res.headers.get('x-other'), null)
  assert.equal(res.headers.get('set-cookie'), tabCookie(TAB_A, CONV_B, '/docs'))
  assert.equal(await res.text(), 'data: {"type":"start"}\n\n')

  const [mint, turn] = stub.calls
  assert.equal(mint.url, `${API}/orgs/org-1/agents/agent-1/webchat/token`)
  assert.equal(mint.headers.authorization, 'Bearer test-key')
  assert.deepEqual(mint.body, {})
  assert.equal(turn.url, `${RELAY}/ai-sdk/chat/${CONV_B}`)
  assert.equal(turn.headers.authorization, `Bearer tok-${CONV_B}`)
  assert.equal(turn.body.id, 'client-chosen')
  assert.equal('tab' in turn.body, false)
  assert.equal(turn.body.messages[0].parts[0].text, 'Reader is on /docs/x\n\nq')
})

test('two tabs keep their own conversations: A opens, B opens, A follows up', async () => {
  const stub = stubFetch({ mints: [CONV_A, CONV_B] })
  const post = handler(stub)
  const visitor = browser()
  visitor.receive(await post(visitor.request(TAB_A, [user('qa')])))
  visitor.receive(await post(visitor.request(TAB_B, [user('qb')])))
  const res = await post(visitor.request(TAB_A, [user('qa'), assistant('aa'), user('qa2')]))
  assert.equal(res.headers.get('set-cookie'), null)
  assert.deepEqual(stub.relayCalls().map(conversationOf), [CONV_A, CONV_B, CONV_A])
})

test('first questions sent before either response keep both bindings: A, B, then B follows up', async () => {
  const stub = stubFetch({ mints: [CONV_A, CONV_B] })
  const post = handler(stub)
  const visitor = browser()
  // Both requests leave with the same empty jar; each response sets only its own tab's cookie, in either order.
  const first = visitor.request(TAB_A, [user('qa')])
  const second = visitor.request(TAB_B, [user('qb')])
  const [resA, resB] = [await post(first), await post(second)]
  visitor.receive(resB)
  visitor.receive(resA)
  await post(visitor.request(TAB_B, [user('qb'), assistant('ab'), user('qb2')]))
  assert.deepEqual(stub.relayCalls().map(conversationOf), [CONV_A, CONV_B, CONV_B])
  assert.equal(stub.mintCalls().length, 2)
})

test('a follow-up resumes the tab conversation and reuses its token', async () => {
  const stub = stubFetch()
  const post = handler(stub)
  const cookie = `${cookieFor(TAB_B, CONV_B)}; ${cookieFor(TAB_A, CONV_A)}`
  const first = await post(chatRequest(followUp, { cookie }))
  assert.equal(first.headers.get('set-cookie'), null)
  await post(chatRequest([...followUp, assistant('a2'), user('q3')], { cookie }))
  assert.deepEqual(stub.mintCalls().map((c) => c.body), [{ conversationId: CONV_A }])
  assert.deepEqual(stub.relayCalls().map(conversationOf), [CONV_A, CONV_A])
})

test('a follow-up from a tab without a cookie starts a new conversation', async () => {
  const stub = stubFetch({ mints: [CONV_A] })
  const res = await handler(stub)(chatRequest(followUp, { cookie: cookieFor(TAB_B, CONV_B) }))
  assert.deepEqual(stub.mintCalls().map((c) => c.body), [{}])
  assert.equal(res.headers.get('set-cookie'), tabCookie(TAB_A, CONV_A, '/docs'))
})

for (const status of [404, 409]) {
  test(`a resume answered ${status} opens a new conversation once, for that tab only`, async () => {
    const stub = stubFetch({ mints: [status, conv(50)] })
    const cookie = `${cookieFor(TAB_A, CONV_A)}; ${cookieFor(TAB_B, CONV_B)}`
    const res = await handler(stub)(chatRequest(followUp, { cookie }))
    assert.equal(res.status, 200)
    assert.deepEqual(stub.mintCalls().map((c) => c.body), [{ conversationId: CONV_A }, {}])
    assert.equal(res.headers.get('set-cookie'), tabCookie(TAB_A, conv(50), '/docs'))
  })
}

test('other mint failures keep their status and do not retry', async () => {
  const stub = stubFetch({ mints: [403] })
  const res = await handler(stub)(chatRequest(followUp, { cookie: cookieFor(TAB_A, CONV_A) }))
  assert.equal(res.status, 403)
  assert.deepEqual(await res.json(), { error: 'mint_failed' })
  assert.equal(stub.calls.length, 1)
})

test('a relay 409 stays 409; other relay errors keep their status', async () => {
  const busy = await handler(stubFetch({ relay: () => new Response('busy', { status: 409 }) }))(chatRequest([user('q')]))
  assert.equal(busy.status, 409)
  assert.deepEqual(await busy.json(), { error: 'busy' })
  const failed = await handler(stubFetch({ relay: () => new Response('no', { status: 502 }) }))(chatRequest([user('q')]))
  assert.equal(failed.status, 502)
  assert.deepEqual(await failed.json(), { error: 'relay_failed' })
})

// The relay's refusal body: `reason` is the daemon's ack reason, or `no_agent` when delivery itself failed.
const refused = (reason) => Response.json({ error: 'Service Unavailable', statusCode: 503, message: 'refused', reason }, { status: 503 })

test('a not_holder refusal is retried once after a pause, then streamed', async () => {
  const answers = [refused('not_holder'), sse()]
  const stub = stubFetch({ relay: () => answers.shift() })
  const waits = []
  const res = await handler(stub, new TokenCache(), { delay: async (ms) => void waits.push(ms) })(chatRequest([user('q')]))
  assert.equal(res.status, 200)
  assert.equal(res.headers.get('x-vercel-ai-ui-message-stream'), 'v1')
  assert.equal(stub.relayCalls().length, 2)
  assert.deepEqual(stub.relayCalls()[0].body, stub.relayCalls()[1].body)
  assert.deepEqual(waits, [RELAY_RETRY_DELAY_MS])
})

test('a second not_holder refusal is answered as is', async () => {
  const twice = stubFetch({ relay: () => refused('not_holder') })
  const res = await handler(twice)(chatRequest([user('q')]))
  assert.equal(res.status, 503)
  assert.deepEqual(await res.json(), { error: 'relay_failed' })
  assert.equal(twice.relayCalls().length, 2)
})

test('a 503 that may follow a delivery, or any other status, is never retried', async () => {
  const answers = [
    () => refused('no_agent'),
    () => refused(undefined),
    () => new Response('down', { status: 503 }),
    () => new Response('no', { status: 409 }),
    () => new Response('no', { status: 502 })
  ]
  for (const answer of answers) {
    const once = stubFetch({ relay: answer })
    await handler(once)(chatRequest([user('q')]))
    assert.equal(once.relayCalls().length, 1)
  }
})

test('a caller over its rate gets 429 before anything is minted or sent', async () => {
  const stub = stubFetch()
  const seen = []
  const limit = async (request) => {
    seen.push(request.headers.get('cf-connecting-ip'))
    return false
  }
  const req = new Request(chatRequest([user('q')]), { headers: { 'content-type': 'application/json', 'cf-connecting-ip': '192.0.2.7' } })
  const res = await handler(stub, new TokenCache(), { limit })(req)
  assert.equal(res.status, 429)
  assert.deepEqual(await res.json(), { error: 'rate_limited' })
  assert.deepEqual(seen, ['192.0.2.7'])
  assert.equal(stub.calls.length, 0)
})

test('a caller within its rate goes through', async () => {
  const stub = stubFetch()
  const res = await handler(stub, new TokenCache(), { limit: async () => true })(chatRequest([user('q')]))
  assert.equal(res.status, 200)
  assert.equal(stub.relayCalls().length, 1)
})
