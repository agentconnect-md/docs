import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Callout } from 'fumadocs-ui/components/callout'
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/layouts/docs/page'
import { ApiFacts } from '@/components/api-facts'
import { OpenAPIPage } from '@/components/api-page'
import { PageNav } from '@/components/page-nav'
import { getMDXComponents } from '@/components/mdx'
import { i18n } from '@/lib/i18n'
import { pageScoped } from '@/lib/openapi-page'
import { isTranslated } from '@/lib/page-links'
import { reference } from '@/lib/source'
import { t } from '@/lib/strings'

export default async function Page({ params }: PageProps<'/[lang]/api/[[...slug]]'>) {
  const { lang, slug = [] } = await params
  const page = reference.getPage(slug, lang)
  if (!page) notFound()

  if (page.type === 'openapi') {
    return (
      // Breadcrumb, title and description render inside the operation's column (components/api-page.tsx).
      <DocsPage toc={page.data.toc} full breadcrumb={{ enabled: false }} footer={{ enabled: false }}>
        <DocsBody>
          <OpenAPIPage {...pageScoped(page.data.getOpenAPIPageProps())} />
        </DocsBody>
        {/* The operation's own column only: the samples column beside it is 400px plus a 1.5rem gap from @4xl. */}
        <div className="@container">
          <PageNav className="@4xl:me-[calc(400px+1.5rem)]" />
        </div>
      </DocsPage>
    )
  }

  // The section's own MDX pages (the overview), with this build's endpoint facts available as <ApiFacts />.
  const MDX = page.data.body
  const fallback = lang !== i18n.defaultLanguage && !isTranslated(page, lang)
  return (
    <DocsPage toc={page.data.toc} full={page.data.full} footer={{ enabled: false }}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        {fallback && <Callout type="info">{t(lang).untranslated}</Callout>}
        <MDX components={getMDXComponents(lang, { ApiFacts: () => <ApiFacts lang={lang} /> })} />
      </DocsBody>
      <PageNav />
    </DocsPage>
  )
}

export function generateStaticParams() {
  return reference.generateParams()
}

export async function generateMetadata({ params }: PageProps<'/[lang]/api/[[...slug]]'>): Promise<Metadata> {
  const { lang, slug = [] } = await params
  const page = reference.getPage(slug, lang)
  if (!page) return {}
  return { title: page.data.title, description: page.data.description }
}
