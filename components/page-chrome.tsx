import type { ComponentProps } from 'react'
import type { DocsPage } from 'fumadocs-ui/layouts/docs/page'
import { PageActions } from '@/components/page-actions'
import { PageHelp } from '@/components/page-help'
import { githubUrl, issueUrl, markdownUrl, type LinkedPage, type Section } from '@/lib/page-links'
import { t } from '@/lib/strings'

// A written page's actions and help: the table of contents is headed by the actions and followed by the help; below xl,
// where that column is hidden, both move into the body. A page without headings drops only the empty "On this page".
export function pageChrome(page: LinkedPage, lang: string, { hasToc, section = 'docs' }: { hasToc: boolean; section?: Section }) {
  const s = t(lang)
  const actions = (
    <PageActions markdownUrl={markdownUrl(page, lang, section)} githubUrl={githubUrl(page, 'blob', section)} moreLabel={s.moreActions} />
  )
  const help = (className: string) => (
    <PageHelp editUrl={githubUrl(page, 'edit', section)} issueUrl={issueUrl(page)} labels={s} className={className} />
  )
  const tableOfContent: ComponentProps<typeof DocsPage>['tableOfContent'] = {
    header: <div className="mb-4">{actions}</div>,
    footer: help('mt-4 border-t pt-4'),
    container: hasToc ? undefined : { className: 'ac-toc-empty' }
  }
  return {
    tableOfContent,
    // Under the description, closing the page's header.
    headerRow: (
      <div className="border-b pb-6">
        <div className="xl:hidden">{actions}</div>
      </div>
    ),
    bodyHelp: help('mt-6 border-t pt-6 xl:hidden')
  }
}
