import { BASE_PATH } from '@/base-path.mjs'
import { i18n, localePath } from './i18n'

const SITE_ORIGIN = process.env.DOCS_SITE_URL ?? 'https://www.agentconnect.md'

export function absoluteUrl(path: string): string {
  return new URL(`${BASE_PATH}${path}`, SITE_ORIGIN).href
}

export function pageAlternates(path: string, lang: string) {
  const languages = Object.fromEntries(i18n.languages.map((language) => [language, absoluteUrl(localePath(language, path))]))
  return { canonical: languages[lang], languages: { ...languages, 'x-default': languages[i18n.defaultLanguage] } }
}
