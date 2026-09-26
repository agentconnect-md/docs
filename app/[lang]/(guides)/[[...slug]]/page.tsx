import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { Callout } from 'fumadocs-ui/components/callout'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page'
import { getMDXComponents } from '@/components/mdx'
import { pageChrome } from '@/components/page-chrome'
import { PageNav } from '@/components/page-nav'
import { i18n } from '@/lib/i18n'
import { isTranslated } from '@/lib/page-links'
import { guidesStart } from '@/lib/sections'
import { source } from '@/lib/source'
import { t } from '@/lib/strings'

export default async function Page({ params }: PageProps<'/[lang]/[[...slug]]'>) {
  const { lang, slug } = await params
  if (!slug?.length) redirect(guidesStart(lang))
  const page = source.getPage(slug, lang)
  if (!page) notFound()

  const MDX = page.data.body
  // A language without its own copy of the page is served the English one.
  const fallback = lang !== i18n.defaultLanguage && !isTranslated(page, lang)
  const chrome = pageChrome(page, lang, { hasToc: page.data.toc.length > 0 })

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      breadcrumb={{ includeSeparator: true }}
      footer={{ enabled: false }}
      tableOfContent={chrome.tableOfContent}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      {chrome.headerRow}
      <DocsBody>
        {fallback && <Callout type="info">{t(lang).untranslated}</Callout>}
        <MDX components={getMDXComponents(lang)} />
      </DocsBody>
      {chrome.bodyHelp}
      <PageNav />
    </DocsPage>
  )
}

export function generateStaticParams() {
  // The site root redirects to the first guide.
  return [...source.generateParams(), ...i18n.languages.map((lang) => ({ lang, slug: [] }))]
}

export async function generateMetadata({ params }: PageProps<'/[lang]/[[...slug]]'>): Promise<Metadata> {
  const { lang, slug } = await params
  const page = slug?.length ? source.getPage(slug, lang) : undefined
  if (!page) return {}
  return { title: page.data.title, description: page.data.description }
}
