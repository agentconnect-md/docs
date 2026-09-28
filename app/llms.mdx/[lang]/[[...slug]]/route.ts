import { notFound } from 'next/navigation'
import { i18n } from '@/lib/i18n'
import { reference, source } from '@/lib/source'

export const dynamic = 'force-static'

// A written page: a guide, or under api/ one of the API section's own pages (operation pages are the OpenAPI document).
function writtenPage(slug: string[], lang: string) {
  if (slug[0] !== 'api') return source.getPage(slug, lang)
  const page = reference.getPage(slug.slice(1), lang)
  return page && page.type !== 'openapi' ? page : undefined
}

// A written page as Markdown, for "Copy Markdown", AI tools and `Accept: text/markdown` readers.
export async function GET(_req: Request, { params }: RouteContext<'/llms.mdx/[lang]/[[...slug]]'>) {
  const { lang, slug = [] } = await params
  const page = slug.at(-1) === 'content.md' ? writtenPage(slug.slice(0, -1), lang) : undefined
  if (!page) notFound()
  const body = await page.data.getText('processed')
  const header = [`# ${page.data.title}`, page.data.description ? `\n${page.data.description}` : ''].join('')
  return new Response(`${header}\n\n${body}`, { headers: { 'content-type': 'text/markdown; charset=utf-8' } })
}

export function generateStaticParams() {
  return i18n.languages.flatMap((lang) => [
    ...source.getPages(lang).map((page) => ({ lang, slug: [...page.slugs, 'content.md'] })),
    ...reference
      .getPages(lang)
      .filter((page) => page.type !== 'openapi')
      .map((page) => ({ lang, slug: ['api', ...page.slugs, 'content.md'] }))
  ])
}
