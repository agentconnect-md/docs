import { SiteLayout } from '@/components/site-layout'
import { source } from '@/lib/source'

export default async function Layout({ params, children }: LayoutProps<'/[lang]'>) {
  const { lang } = await params
  return (
    <SiteLayout lang={lang} tree={source.getPageTree(lang)}>
      {children}
    </SiteLayout>
  )
}
