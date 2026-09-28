import { llms } from 'fumadocs-core/source'
import { BASE_PATH } from '@/base-path.mjs'
import { reference, source } from '@/lib/source'

export const dynamic = 'force-static'

// The llms.txt index: every guide and API operation with its URL, which page URLs give without the base path.
export async function GET() {
  const [guides, api] = await Promise.all([llms(source).index(), llms(reference).index()])
  const body = `# AgentConnect\n\n${guides}\n\n${api}\n`.replaceAll('](/', `](${BASE_PATH}/`)
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } })
}
