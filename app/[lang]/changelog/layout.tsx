import { SiteLayout } from '@/components/site-layout'

export default async function Layout({ params, children }: LayoutProps<'/[lang]/changelog'>) {
  const { lang } = await params
  return <SiteLayout lang={lang}>{children}</SiteLayout>
}
