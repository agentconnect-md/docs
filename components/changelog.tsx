import type { ChangelogEntry } from '@fumadocs/changelog'
import Link from 'fumadocs-core/link'
import { createMarkdownRenderer } from 'fumadocs-core/content/md'
import { remarkGfm } from 'fumadocs-core/mdx-plugins/remark-gfm'
import { rehypeCode } from 'fumadocs-core/mdx-plugins/rehype-code'
import defaultMdxComponents from 'fumadocs-ui/mdx'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { t } from '@/lib/strings'

const { MarkdownServer } = createMarkdownRenderer({
  remarkPlugins: [remarkGfm],
  rehypePlugins: [[rehypeCode, { fallbackLanguage: 'plaintext', tab: false }]]
})
const mdxComponents = { ...defaultMdxComponents, img: 'img' as const }

export function ChangelogTimeline({ entries, lang }: { entries: ChangelogEntry[]; lang: string }) {
  const locale = lang === 'zh' ? 'zh-CN' : 'en-US'
  const monthFormat = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' })
  const dayFormat = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', timeZone: 'UTC' })
  const months = new Map<string, ChangelogEntry[]>()
  for (const entry of entries) {
    const month = monthFormat.format(entry.date)
    const items = months.get(month)
    if (items) items.push(entry)
    else months.set(month, [entry])
  }

  return (
    <div className="flex flex-col gap-8">
      {Array.from(months, ([month, items]) => (
        <section key={month} aria-label={month}>
          <h2 className="sticky top-14 z-1 bg-fd-background/80 py-4 text-sm font-medium text-fd-muted-foreground backdrop-blur-sm">
            {month}
          </h2>
          <ol className="ms-3 border-s ps-6">
            {items.map((entry) => (
              <li key={entry.id} id={entry.id} className="scroll-mt-28 pb-10 last:pb-0">
                <time dateTime={entry.date.toISOString()} className="relative text-xs font-medium text-fd-primary tabular-nums">
                  <span aria-hidden="true" className="absolute -start-6 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-fd-primary" />
                  {dayFormat.format(entry.date)}
                </time>
                <h3 className="mt-2 mb-4 text-lg font-semibold">
                  <a href={entry.url} target="_blank" rel="noreferrer" className="hover:text-fd-primary">
                    {entry.title}
                  </a>
                </h3>
                <div className="prose prose-sm max-w-none text-fd-muted-foreground" lang="en">
                  {entry.content && <MarkdownServer components={mdxComponents}>{entry.content}</MarkdownServer>}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}

export function ChangelogPagination({ newer, older, lang }: { newer?: string; older?: string; lang: string }) {
  if (!newer && !older) return null
  const labels = t(lang).changelog
  const linkClass = 'inline-flex items-center gap-1.5 rounded-lg border bg-fd-card px-3 py-1.5 text-sm font-medium transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground'

  return (
    <nav aria-label={labels.pagination} className="mt-10 flex flex-row">
      {newer && (
        <Link href={newer} rel="prev" className={linkClass}>
          <ChevronLeft className="size-4" aria-hidden="true" />
          {labels.newer}
        </Link>
      )}
      {older && (
        <Link href={older} rel="next" className={`${linkClass} ms-auto`}>
          {labels.older}
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      )}
    </nav>
  )
}
