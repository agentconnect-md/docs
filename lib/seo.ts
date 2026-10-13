import { BASE_PATH } from '@/base-path.mjs'
import { i18n } from './i18n'
import { isTranslated } from './page-links'

const SITE_ORIGIN = process.env.DOCS_SITE_URL ?? 'https://www.agentconnect.md'

export function absoluteUrl(path: string): string {
  return new URL(`${BASE_PATH}${path}`, SITE_ORIGIN).href
}

type PageSource = { getPage(slugs: string[], lang: string): { url: string; absolutePath?: string } | undefined }

export function pageAlternates(source: PageSource, slugs: string[], lang: string) {
  const languages = Object.fromEntries(i18n.languages.flatMap((language) => {
    const page = source.getPage(slugs, language)
    return page && (language === i18n.defaultLanguage || isTranslated(page, language)) ? [[language, absoluteUrl(page.url)]] : []
  }))
  const fallback = languages[i18n.defaultLanguage]
  return { canonical: languages[lang] ?? fallback, languages: { ...languages, 'x-default': fallback } }
}
