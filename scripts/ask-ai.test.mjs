import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  COOKIE_PREFIX,
  RELAY_RETRY_DELAY_MS,
  createChatHandler,
  errorCode,
  foldLocation,
  isNewConversation,
  readConfig,
  readTabConversation,
  tabCookie
} from '../lib/ask-ai.ts'

const RELAY = 'https://relay.example.test'
const CHAT_URL = `${RELAY}/ai-sdk/agents/agent-1/chat`
const conv = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`
const CONV_A = conv(10)
const CONV_B = conv(11)
const TAB_A = 'a'.repeat(32)
const TAB_B = 'b'.repeat(32)
const CONFIG = { relayUrl: RELAY, apiKey: 'test-key', agentId: 'agent-1' }

const user = (text, location) => ({
  id: `u-${text}`,
  role: 'user',
  parts: [...(location ? [{ type: 'data-client', data: { location } }] : []), { type: 'text', text }]
})
const assistant = (text) => ({ id: `a-${text}`, role: 'assistant', parts: [{ type: 'text', text }] })
const followUp = [user('q'), assistant('a'), user('q2')]

// A fetch stub for the relay: turns answer `relay` in order of calls; every call is recorded.
function stubFetch({ relay = () => sse() } = {}) {
  const calls = []
  const fetch = async (url, init) => {
    calls.push({ url, headers: init.headers, body: JSON.parse(init.body) })
    return relay(calls.length)
  }
  return { fetch, calls, chats: () => calls.map((c) => c.body.id) }
}

function sse() {
  return new Response('data: {"type":"start"}\n\n', {
    headers: { 'content-type': 'text/event-stream', 'x-vercel-ai-ui-message-stream': 'v1', 'x-other': 'dropped' }
  })
}

// The relay's refusal body, whose `reason` the route acts on.
const refused = (status, reason) =>
  Response.json({ error: 'Refused', statusCode: status, message: 'refused', reason }, { status })

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

const cookieFor = (tab, chatId) => tabCookie(tab, chatId, '/docs').split(';')[0]

function handler(stub, extra = {}) {
  let next = 100
  return createChatHandler({
    config: () => CONFIG,
    cookiePath: '/docs',
    fetch: stub.fetch,
    delay: async () => {},
    newChatId: () => conv(next++),
    ...extra
  })
}

test('reads the three settings, or none when any is unset', () => {
  const env = { AGENTCONNECT_API_KEY: 'k', AGENTCONNECT_AGENT_ID: 'a', AGENTCONNECT_RELAY_URL: `${RELAY}/` }
  assert.deepEqual(readConfig(env), { relayUrl: RELAY, apiKey: 'k', agentId: 'a' })
  assert.equal(readConfig({ ...env, AGENTCONNECT_RELAY_URL: '' }), null)
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

test('a malformed chat id in a tab cookie reads as absent', () => {
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

test('a first question gets a chat id of its own, binds the tab and streams the relay through', async () => {
  const stub = stubFetch()
  const res = await handler(stub)(chatRequest([user('q', '/docs/x')], { cookie: cookieFor(TAB_A, CONV_A) }))
  assert.equal(res.status, 200)
  assert.equal(res.headers.get('content-type'), 'text/event-stream')
  assert.equal(res.headers.get('x-vercel-ai-ui-message-stream'), 'v1')
  assert.equal(res.headers.get('x-other'), null)
  assert.equal(res.headers.get('set-cookie'), tabCookie(TAB_A, conv(100), '/docs'))
  assert.equal(await res.text(), 'data: {"type":"start"}\n\n')

  const [turn] = stub.calls
  assert.equal(turn.url, CHAT_URL)
  assert.equal(turn.headers.authorization, 'Bearer test-key')
  // The client's own id is replaced; the tab handle never leaves this route.
  assert.equal(turn.body.id, conv(100))
  assert.equal('tab' in turn.body, false)
  assert.equal(turn.body.messages[0].parts[0].text, 'Reader is on /docs/x\n\nq')
})

test('two tabs keep their own conversations: A opens, B opens, A follows up', async () => {
  const stub = stubFetch()
  const post = handler(stub)
  const visitor = browser()
  visitor.receive(await post(visitor.request(TAB_A, [user('qa')])))
  visitor.receive(await post(visitor.request(TAB_B, [user('qb')])))
  const res = await post(visitor.request(TAB_A, [user('qa'), assistant('aa'), user('qa2')]))
  assert.equal(res.headers.get('set-cookie'), null)
  assert.deepEqual(stub.chats(), [conv(100), conv(101), conv(100)])
})

test('a follow-up continues the tab conversation without resetting its cookie', async () => {
  const stub = stubFetch()
  const cookie = `${cookieFor(TAB_B, CONV_B)}; ${cookieFor(TAB_A, CONV_A)}`
  const res = await handler(stub)(chatRequest(followUp, { cookie }))
  assert.equal(res.headers.get('set-cookie'), null)
  assert.deepEqual(stub.chats(), [CONV_A])
})

test('a follow-up from a tab without a cookie starts a new conversation', async () => {
  const stub = stubFetch()
  const res = await handler(stub)(chatRequest(followUp, { cookie: cookieFor(TAB_B, CONV_B) }))
  assert.deepEqual(stub.chats(), [conv(100)])
  assert.equal(res.headers.get('set-cookie'), tabCookie(TAB_A, conv(100), '/docs'))
})

test('a conversation whose agent moved is replaced by a new one, once', async () => {
  const stub = stubFetch({ relay: (n) => (n === 1 ? refused(409, 'agent_moved') : sse()) })
  const res = await handler(stub)(chatRequest(followUp, { cookie: cookieFor(TAB_A, CONV_A) }))
  assert.equal(res.status, 200)
  assert.deepEqual(stub.chats(), [CONV_A, conv(100)])
  assert.equal(res.headers.get('set-cookie'), tabCookie(TAB_A, conv(100), '/docs'))

  const again = stubFetch({ relay: () => refused(409, 'agent_moved') })
  const fresh = await handler(again)(chatRequest([user('q')]))
  assert.equal(fresh.status, 409)
  assert.equal(again.calls.length, 1)
})

test('a busy conversation stays 409; other relay errors keep their status', async () => {
  const busy = await handler(stubFetch({ relay: () => refused(409, 'busy') }))(chatRequest([user('q')]))
  assert.equal(busy.status, 409)
  assert.deepEqual(await busy.json(), { error: 'busy' })
  for (const status of [401, 403, 404, 502]) {
    const res = await handler(stubFetch({ relay: () => new Response('no', { status }) }))(chatRequest([user('q')]))
    assert.equal(res.status, status)
    assert.deepEqual(await res.json(), { error: 'relay_failed' })
  }
})

test('a declined turn and an offline agent get codes of their own, so the panel can word them', async () => {
  const declined = await handler(stubFetch({ relay: () => refused(422, 'declined') }))(chatRequest([user('q')]))
  assert.equal(declined.status, 422)
  assert.deepEqual(await declined.json(), { error: 'declined' })
  for (const reason of ['no_agent', 'paused', 'draining']) {
    const res = await handler(stubFetch({ relay: () => refused(503, reason) }))(chatRequest([user('q')]))
    assert.deepEqual(await res.json(), { error: 'offline' }, reason)
  }
  assert.equal(errorCode(422, undefined), 'relay_failed')
  assert.equal(errorCode(503, 'not_holder'), 'relay_failed')
})

test('a not_holder refusal is retried once after a pause, then streamed', async () => {
  const stub = stubFetch({ relay: (n) => (n === 1 ? refused(503, 'not_holder') : sse()) })
  const waits = []
  const res = await handler(stub, { delay: async (ms) => void waits.push(ms) })(chatRequest([user('q')]))
  assert.equal(res.status, 200)
  assert.equal(res.headers.get('x-vercel-ai-ui-message-stream'), 'v1')
  assert.equal(stub.calls.length, 2)
  assert.deepEqual(stub.calls[0].body, stub.calls[1].body)
  assert.deepEqual(waits, [RELAY_RETRY_DELAY_MS])
})

test('a second not_holder refusal is answered as is', async () => {
  const twice = stubFetch({ relay: () => refused(503, 'not_holder') })
  const res = await handler(twice)(chatRequest([user('q')]))
  assert.equal(res.status, 503)
  assert.deepEqual(await res.json(), { error: 'relay_failed' })
  assert.equal(twice.calls.length, 2)
})

test('a 503 that may follow a delivery, or any other status, is never retried', async () => {
  const answers = [
    () => refused(503, 'no_agent'),
    () => refused(503, undefined),
    () => new Response('down', { status: 503 }),
    () => new Response('no', { status: 409 }),
    () => new Response('no', { status: 502 })
  ]
  for (const answer of answers) {
    const once = stubFetch({ relay: answer })
    await handler(once)(chatRequest([user('q')]))
    assert.equal(once.calls.length, 1)
  }
})

test('a caller over its rate gets 429 before anything is sent', async () => {
  const stub = stubFetch()
  const seen = []
  const limit = async (request) => {
    seen.push(request.headers.get('cf-connecting-ip'))
    return false
  }
  const req = new Request(chatRequest([user('q')]), { headers: { 'content-type': 'application/json', 'cf-connecting-ip': '192.0.2.7' } })
  const res = await handler(stub, { limit })(req)
  assert.equal(res.status, 429)
  assert.deepEqual(await res.json(), { error: 'rate_limited' })
  assert.deepEqual(seen, ['192.0.2.7'])
  assert.equal(stub.calls.length, 0)
})

test('a caller within its rate goes through', async () => {
  const stub = stubFetch()
  const res = await handler(stub, { limit: async () => true })(chatRequest([user('q')]))
  assert.equal(res.status, 200)
  assert.equal(stub.calls.length, 1)
})
