import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { notFound } from 'next/navigation'
import { i18nProvider } from 'fumadocs-ui/i18n'
import { Provider } from '@/components/provider'
import { channel } from '@/lib/channel'
import { i18n } from '@/lib/i18n'
import { translations } from '@/lib/layout.shared'
import '../global.css'

// The console's typefaces.
const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: { template: '%s | AgentConnect', default: 'AgentConnect' },
  // Only production is meant to be found through search engines.
  robots: channel.id === 'prod' ? undefined : { index: false, follow: false }
}

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }))
}

export default async function Layout({ params, children }: LayoutProps<'/[lang]'>) {
  const { lang } = await params
  // Not dynamicParams = false: OpenNext then 404s every page under a base path; unknown languages 404 here instead.
  if (!(i18n.languages as readonly string[]).includes(lang)) notFound()
  return (
    <html
      lang={lang === 'zh' ? 'zh-CN' : lang}
      className={`${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <Provider i18n={i18nProvider(translations, lang)}>{children}</Provider>
      </body>
    </html>
  )
}
