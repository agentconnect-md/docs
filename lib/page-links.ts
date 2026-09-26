import { BASE_PATH } from '@/base-path.mjs'
import { i18n } from './i18n'
import type { source } from './source'

type DocsPage = NonNullable<ReturnType<typeof source.getPage>>

/** Whether the page is served from its own translation rather than the English fallback. */
export function isTranslated(page: { absolutePath?: string }, lang: string): boolean {
  return lang !== i18n.defaultLanguage && Boolean(page.absolutePath?.endsWith(`.${lang}.mdx`))
}

// The page as Markdown (plain fetch and <a>, so it carries the base path); also its URL + .md or `Accept: text/markdown`.
export function markdownUrl(page: DocsPage, lang: string): string {
  return `${BASE_PATH}/llms.mdx/${lang}/${page.slugs.join('/')}/content.md`
}

const REPO = 'https://github.com/agentconnect-md/docs'

// The page's own file, which is the translation when there is one.
export function githubUrl(page: DocsPage, view: 'blob' | 'edit' = 'blob'): string {
  return `${REPO}/${view}/main/content/docs/${page.path.split('/').map(encodeURIComponent).join('/')}`
}

// A new issue naming the page by path only, so no channel's host lands in the public tracker.
export function issueUrl(page: DocsPage): string {
  const query = new URLSearchParams({ title: `Docs: ${page.data.title}`, body: `Page: ${BASE_PATH}${page.url}\n\n` })
  return `${REPO}/issues/new?${query}`
}
