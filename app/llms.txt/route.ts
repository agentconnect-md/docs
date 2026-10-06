import { llms } from 'fumadocs-core/source'
import { BASE_PATH } from '@/base-path.mjs'
import { reference, source } from '@/lib/source'

// The llms.txt index: every guide and API operation with an absolute URL on the origin it was requested from.
export async function GET(request: Request) {
  const [guides, api] = await Promise.all([llms(source).index(), llms(reference).index()])
  const root = `${new URL(request.url).origin}${BASE_PATH}`
  const body = `# AgentConnect\n\n${guides}\n\n${api}\n`.replaceAll('](/', `](${root}/`)
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}
