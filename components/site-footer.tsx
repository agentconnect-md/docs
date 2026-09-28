'use client'
import { usePathname } from 'next/navigation'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from 'fumadocs-ui/components/ui/popover'
import { BASE_PATH } from '@/base-path.mjs'
import { GitHubMark, SlackMark, XMark } from './brand-marks'

const LANGS = [
  { id: 'en', label: 'English' },
  { id: 'zh', label: '中文' }
]

// The current language, with the others in its menu; each keeps the reader on the same page.
function LanguageMenu({ lang, hrefFor }: { lang: string; hrefFor: (id: string) => string }) {
  const current = LANGS.find((l) => l.id === lang) ?? LANGS[0]
  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-1.5 rounded-md py-1 transition-colors hover:text-fd-foreground data-[popup-open]:text-fd-foreground">
        <Globe className="size-4" aria-hidden="true" />
        {current.label}
        <ChevronDown className="size-3.5" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={6} className="flex w-36 flex-col p-1 text-sm">
        {LANGS.map((l) => (
          <a
            key={l.id}
            href={hrefFor(l.id)}
            hrefLang={l.id}
            aria-current={l.id === lang ? 'true' : undefined}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-fd-accent"
          >
            {l.label}
            <Check className={`ms-auto size-3.5 text-fd-primary ${l.id === lang ? '' : 'invisible'}`} />
          </a>
        ))}
      </PopoverContent>
    </Popover>
  )
}

// One row: site links on the left; community and the language menu on the right.
export function SiteFooter({
  lang,
  labels
}: {
  lang: string
  labels: { home: string; blog: string; terms: string; privacy: string }
}) {
  const pathname = usePathname()
  const site = lang === 'zh' ? 'https://agentconnect.md/zh' : 'https://agentconnect.md'
  const unprefixed = pathname.replace(/^\/zh(?=\/|$)/, '') || '/'
  // usePathname() omits the base path, and these are plain links, so it goes back on.
  const hrefFor = (id: string) => BASE_PATH + (id === 'en' ? unprefixed : unprefixed === '/' ? '/zh' : `/zh${unprefixed}`)

  return (
    <footer className="ac-footer">
      <nav className="flex items-center gap-4 md:gap-5">
        <a href={`${site}/`}>{labels.home}</a>
        <a href={`${site}/blog/`}>{labels.blog}</a>
        {/* Phones keep the footer to the two links people look for. */}
        <a href={`${site}/terms/`} className="max-md:hidden">
          {labels.terms}
        </a>
        <a href={`${site}/privacy/`} className="max-md:hidden">
          {labels.privacy}
        </a>
      </nav>
      <div className="ac-footer-links">
        <div className="flex items-center gap-4">
          <a href="https://github.com/agentconnect-md/agentconnect" target="_blank" rel="noreferrer" aria-label="GitHub">
            <GitHubMark />
          </a>
          <a href="https://x.com/getAgentConnect" target="_blank" rel="noreferrer" aria-label="X">
            <XMark />
          </a>
          <a href="https://slack.agentconnect.md/" target="_blank" rel="noreferrer" aria-label="Slack">
            <SlackMark />
          </a>
        </div>
        <span className="ac-footer-divider" aria-hidden="true" />
        <LanguageMenu lang={lang} hrefFor={hrefFor} />
      </div>
    </footer>
  )
}
