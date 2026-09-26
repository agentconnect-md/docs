import { SiteLayout } from '@/components/site-layout'
import { reference } from '@/lib/source'

export default async function Layout({ params, children }: LayoutProps<'/[lang]/api'>) {
  const { lang } = await params
  return (
    <SiteLayout lang={lang} tree={reference.getPageTree(lang)}>
      {children}
    </SiteLayout>
  )
}
