import { BASE_PATH } from '@/base-path.mjs'
import { i18n } from './i18n'

// What the links need from a page, whichever loader (guides or the API section) it comes from.
export interface LinkedPage {
  slugs: string[]
  path: string
  url: string
  data: { title: string }
}

// Each section's pages live under their own content directory and are served as Markdown under their own prefix.
export type Section = 'docs' | 'api'

/** Whether the page is served from its own translation rather than the English fallback. */
export function isTranslated(page: { absolutePath?: string }, lang: string): boolean {
  return lang !== i18n.defaultLanguage && Boolean(page.absolutePath?.endsWith(`.${lang}.mdx`))
}

// The page as Markdown (plain fetch and <a>, so it carries the base path); also its URL + .md or `Accept: text/markdown`.
export function markdownUrl(page: LinkedPage, lang: string, section: Section = 'docs'): string {
  const slugs = section === 'api' ? ['api', ...page.slugs] : page.slugs
  return `${BASE_PATH}/llms.mdx/${lang}/${slugs.join('/')}/content.md`
}

const REPO = 'https://github.com/agentconnect-md/docs'

// The page's own file, which is the translation when there is one.
export function githubUrl(page: LinkedPage, view: 'blob' | 'edit' = 'blob', section: Section = 'docs'): string {
  return `${REPO}/${view}/main/content/${section}/${page.path.split('/').map(encodeURIComponent).join('/')}`
}

// A new issue naming the page by path only, so no channel's host lands in the public tracker.
export function issueUrl(page: LinkedPage): string {
  const query = new URLSearchParams({ title: `Docs: ${page.data.title}`, body: `Page: ${BASE_PATH}${page.url}\n\n` })
  return `${REPO}/issues/new?${query}`
}
