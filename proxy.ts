import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server'
import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware'
import { isMarkdownPreferred } from 'fumadocs-core/negotiation'
import { i18n } from '@/lib/i18n'

const localize = createI18nMiddleware(i18n)
const prefixed = i18n.languages.filter((l) => l !== i18n.defaultLanguage).join('|')
// Guides sit at the site root, beside the API Reference at /api; paths here exclude the base path.
const GUIDE = new RegExp(`^(?:/(${prefixed}))?/(?!api(?:/|$))(.+?)(\\.md)?/?$`)

// A guide as Markdown: its URL with .md, or requested with `Accept: text/markdown`.
function markdownPath(request: NextRequest): string | undefined {
  const m = GUIDE.exec(request.nextUrl.pathname)
  if (!m || (!m[3] && !isMarkdownPreferred(request))) return undefined
  return `/llms.mdx/${m[1] ?? i18n.defaultLanguage}/${m[2]}/content.md`
}

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const markdown = markdownPath(request)
  if (markdown) {
    // A clone of nextUrl keeps the base path, which a plain URL would drop.
    const url = request.nextUrl.clone()
    url.pathname = markdown
    return NextResponse.rewrite(url, { headers: { Vary: 'Accept' } })
  }
  return localize(request, event)
}

export const config = {
  // Route handlers (search, the playground proxy), build assets, images, icons, Markdown and the OpenAPI document are
  // language-neutral; the API Reference beside them under /api is not. Directory names end in a slash so guide paths
  // that merely start with them (/api-mcp/…) still get a language.
  // Matchers get the base path prepended, and the second one needs a character after it, so the root is listed too.
  matcher: [
    '/',
    '/((?!api/search|api/proxy|_next/static/|_next/image|images/|llms\\.mdx/|llms\\.txt|openapi\\.json|favicon\\.ico|icon\\.svg|apple-icon\\.png).*)'
  ]
}
