import type { MetadataRoute } from 'next'
import { channel } from '@/lib/channel'
import { i18n, localePath } from '@/lib/i18n'
import { absoluteUrl, pageAlternates } from '@/lib/seo'
import { reference, source } from '@/lib/source'

export default function sitemap(): MetadataRoute.Sitemap {
  if (channel.id !== 'prod') return []
  return [source, reference].flatMap((loader) =>
    loader.getPages(i18n.defaultLanguage).flatMap((page) =>
      i18n.languages.map((lang) => ({
        url: absoluteUrl(localePath(lang, page.url)),
        alternates: { languages: pageAlternates(page.url, lang).languages }
      }))
    )
  )
}
