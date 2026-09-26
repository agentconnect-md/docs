import { getLayoutTabs } from 'fumadocs-ui/layouts/shared'
import type { NavTab } from '@/components/site-nav'
import { localePath } from './i18n'
import { reference, source } from './source'
import { t } from './strings'

// Guides and Self-hosting are the root folders of content/docs, in that order; the API Reference is its own tree.
export function siteTabs(lang: string): NavTab[] {
  const s = t(lang)
  const docsTabs = getLayoutTabs(source.getPageTree(lang))
  const urlsOf = (i: number) => {
    const folder = docsTabs[i]?.$folder
    const urls: string[] = []
    const walk = (nodes: NonNullable<typeof folder>['children']) => {
      for (const n of nodes) {
        if (n.type === 'page') urls.push(n.url)
        else if (n.type === 'folder') {
          if (n.index) urls.push(n.index.url)
          walk(n.children)
        }
      }
    }
    if (folder) walk(folder.children)
    return urls
  }
  const start = guidesStart(lang)
  const referenceHome = localePath(lang, '/api')
  return [
    { id: 'guides', title: s.guides, url: start, urls: urlsOf(0) },
    { id: 'self-hosting', title: s.selfHosting, url: docsTabs[1]?.url ?? start, urls: urlsOf(1) },
    { id: 'reference', title: s.apiReference, url: referenceHome, urls: [referenceHome, ...reference.getPages(lang).map((p) => p.url)] }
  ]
}

// Where the site and the Guides tab open: the first page of the Guides section.
export function guidesStart(lang: string): string {
  return getLayoutTabs(source.getPageTree(lang))[0]?.url ?? source.getPages(lang)[0]?.url ?? localePath(lang, '/')
}

// The star count for the GitHub button, fetched at build time; the button shows without it if GitHub is unreachable.
export async function githubStars(): Promise<number | undefined> {
  try {
    const res = await fetch('https://api.github.com/repos/agentconnect-md/agentconnect', {
      headers: { accept: 'application/vnd.github+json' },
      next: { revalidate: 3600 }
    })
    if (!res.ok) return undefined
    const body = (await res.json()) as { stargazers_count?: number }
    return body.stargazers_count
  } catch {
    return undefined
  }
}
