import { defineI18n } from 'fumadocs-core/i18n'

// English stays at the existing URLs; other languages get a prefix and fall back to English per page.
export const i18n = defineI18n({
  defaultLanguage: 'en',
  languages: ['en', 'zh'],
  hideLocale: 'default-locale'
})

export type Lang = (typeof i18n.languages)[number]

export function localePath(lang: string, path: string): string {
  return lang === i18n.defaultLanguage ? path : `/${lang}${path === '/' ? '' : path}`
}
