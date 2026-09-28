import { createI18nSearchAPI } from 'fumadocs-core/search/server'
import { i18n } from '@/lib/i18n'
import { reference, source } from '@/lib/source'

// Guides and API Reference in one index, per language.
export const { GET } = createI18nSearchAPI('advanced', {
  i18n,
  indexes: () =>
    i18n.languages.flatMap((locale) => [
      ...source.getPages(locale).map((page) => ({
        id: page.url,
        url: page.url,
        title: page.data.title ?? page.url,
        description: page.data.description,
        structuredData: page.data.structuredData,
        tag: 'docs',
        locale
      })),
      ...reference.getPages(locale).map((page) => ({
        id: page.url,
        url: page.url,
        title: page.data.title ?? page.url,
        description: page.data.description,
        structuredData: page.data.structuredData,
        tag: 'reference',
        locale
      }))
    ])
})
