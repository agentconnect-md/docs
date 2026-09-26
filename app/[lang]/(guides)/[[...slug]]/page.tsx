import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { Callout } from 'fumadocs-ui/components/callout'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page'
import { getMDXComponents } from '@/components/mdx'
import { PageActions } from '@/components/page-actions'
import { PageHelp } from '@/components/page-help'
import { PageNav } from '@/components/page-nav'
import { i18n } from '@/lib/i18n'
import { githubUrl, isTranslated, issueUrl, markdownUrl } from '@/lib/page-links'
import { guidesStart } from '@/lib/sections'
import { source } from '@/lib/source'
import { t } from '@/lib/strings'

export default async function Page({ params }: PageProps<'/[lang]/[[...slug]]'>) {
  const { lang, slug } = await params
  if (!slug?.length) redirect(guidesStart(lang))
  const page = source.getPage(slug, lang)
  if (!page) notFound()

  const MDX = page.data.body
  const md = markdownUrl(page, lang)
  // A language without its own copy of the page is served the English one.
  const fallback = lang !== i18n.defaultLanguage && !isTranslated(page, lang)
  const actions = <PageActions markdownUrl={md} githubUrl={githubUrl(page)} moreLabel={t(lang).moreActions} />
  const help = (className: string) => (
    <PageHelp editUrl={githubUrl(page, 'edit')} issueUrl={issueUrl(page)} labels={t(lang)} className={className} />
  )

  return (
    // The table of contents is headed by the page actions and followed by its help; below xl, where that column is
    // hidden, both move into the body. A page without headings drops only the empty "On this page" (ac-toc-empty).
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      breadcrumb={{ includeSeparator: true }}
      footer={{ enabled: false }}
      tableOfContent={{
        header: <div className="mb-4">{actions}</div>,
        footer: help('mt-4 border-t pt-4'),
        container: page.data.toc.length ? undefined : { className: 'ac-toc-empty' }
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription className="mb-0">{page.data.description}</DocsDescription>
      <div className="border-b pb-6">
        <div className="xl:hidden">{actions}</div>
      </div>
      <DocsBody>
        {fallback && <Callout type="info">{t(lang).untranslated}</Callout>}
        <MDX components={getMDXComponents(lang)} />
      </DocsBody>
      {help('mt-6 border-t pt-6 xl:hidden')}
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
