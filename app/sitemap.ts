import type { MetadataRoute } from 'next'
import { channel } from '@/lib/channel'
import { i18n } from '@/lib/i18n'
import { pageAlternates } from '@/lib/seo'
import { reference, source } from '@/lib/source'

export default function sitemap(): MetadataRoute.Sitemap {
  if (channel.id !== 'prod') return []
  return [source, reference].flatMap((loader) =>
    loader.getPages(i18n.defaultLanguage).flatMap((page) => {
      const { languages } = pageAlternates(loader, page.slugs, i18n.defaultLanguage)
      return Object.entries(languages).filter(([lang]) => lang !== 'x-default').map(([, url]) => ({ url, alternates: { languages } }))
    })
  )
}
