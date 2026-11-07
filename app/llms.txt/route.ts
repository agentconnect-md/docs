import { llms } from 'fumadocs-core/source'
import { BASE_PATH } from '@/base-path.mjs'
import { changelog, reference, source } from '@/lib/source'

// Every section with absolute URLs on the request's origin.
export async function GET(request: Request) {
  const sections = await Promise.all([llms(source).index(), llms(reference).index(), llms(changelog).index()])
  const root = `${new URL(request.url).origin}${BASE_PATH}`
  const body = `# AgentConnect\n\n${sections.join('\n\n')}\n`.replaceAll('](/', `](${root}/`)
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}
