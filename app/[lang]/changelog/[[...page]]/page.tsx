import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Callout } from 'fumadocs-ui/components/callout'
import { ChangelogPagination, ChangelogTimeline } from '@/components/changelog'
import { i18n, localePath } from '@/lib/i18n'
import { pageAlternates } from '@/lib/seo'
import { changelog } from '@/lib/source'
import { t } from '@/lib/strings'

export default async function Page({ params }: PageProps<'/[lang]/changelog/[[...page]]'>) {
  const { lang, page: slugs = [] } = await params
  const page = changelog.getPage(slugs, lang)
  if (!page) notFound()
  const number = Number(slugs[0] ?? 1)
  const pageUrl = (n: number) => localePath(lang, n === 1 ? '/changelog' : `/changelog/${n}`)
  const s = t(lang)

  return (
    <div className="mx-auto w-full max-w-[900px] px-5 py-10 md:py-12">
      <h1 className="mb-3 text-3xl font-semibold tracking-tight">{s.changelog.title}</h1>
      <p className="mb-3 text-fd-muted-foreground">{s.changelog.description}</p>
      <a href="https://github.com/agentconnect-md/agentconnect/releases" target="_blank" rel="noreferrer" className="text-sm text-fd-primary hover:underline">
        {s.changelog.releases} ↗
      </a>
      {lang !== i18n.defaultLanguage && <Callout type="info" className="mt-6">{s.untranslated}</Callout>}
      <div className="mt-6">
        <ChangelogTimeline entries={page.data.entries.map((entry) => ({ ...entry, date: new Date(entry.date) }))} lang={lang} />
      </div>
      <ChangelogPagination
        newer={number > 1 ? pageUrl(number - 1) : undefined}
        older={changelog.getPage([String(number + 1)], lang) ? pageUrl(number + 1) : undefined}
        lang={lang}
      />
    </div>
  )
}

export function generateStaticParams() {
  return i18n.languages.flatMap((lang) => changelog.getPages(lang).map((page) => ({ lang, page: page.slugs })))
}

export async function generateMetadata({ params }: PageProps<'/[lang]/changelog/[[...page]]'>): Promise<Metadata> {
  const { lang, page: slugs = [] } = await params
  const page = changelog.getPage(slugs, lang)
  if (!page) return {}
  return { title: page.data.title, description: t(lang).changelog.description, alternates: pageAlternates(changelog, slugs, lang) }
}
