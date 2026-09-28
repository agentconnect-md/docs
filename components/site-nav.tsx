'use client'
import Link from 'fumadocs-core/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Code2, Server, type LucideIcon } from 'lucide-react'
import { FullSearchTrigger, SearchTrigger } from 'fumadocs-ui/layouts/shared/slots/search-trigger'
import { GitHubMark } from './brand-marks'
import { Logo } from './logo'
import { ThemeMenu } from './theme-menu'

export interface NavTab {
  id: 'guides' | 'reference' | 'self-hosting'
  title: string
  url: string
  urls: string[]
}

export const TAB_ICONS: Record<NavTab['id'], LucideIcon> = { guides: BookOpen, 'self-hosting': Server, reference: Code2 }

export function useActiveTab(tabs: NavTab[]): NavTab['id'] {
  const pathname = usePathname().replace(/(.)\/$/, '$1')
  return tabs.find((tab) => tab.urls.includes(pathname))?.id ?? 'guides'
}

function formatStars(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '')}k` : String(n)
}

// Desktop header: brand and section tabs; search, theme, the Star button and the console.
export function SiteNav({
  tabs,
  consoleUrl,
  consoleLabel,
  starLabel,
  stars
}: {
  tabs: NavTab[]
  consoleUrl: string
  consoleLabel: string
  starLabel: string
  stars?: number
}) {
  const active = useActiveTab(tabs)

  return (
    <header className="ac-nav hidden md:flex">
      <Link href={tabs[0].url} aria-label="AgentConnect" className="shrink-0">
        {/* Below 900px the header keeps the diamond and drops the wordmark, so the tabs and buttons still fit. */}
        <Logo wordmarkClassName="hidden min-[900px]:inline" />
      </Link>
      <nav className="ac-nav-tabs">
        {tabs.map((tab) => {
          const Icon = TAB_ICONS[tab.id]
          return (
            <Link key={tab.id} href={tab.url} data-active={tab.id === active} className="ac-nav-tab">
              <Icon className="size-4" />
              {tab.title}
            </Link>
          )
        })}
      </nav>
      <div className="ms-auto flex items-center gap-2">
        {/* The search box shrinks to an icon, and the Star label drops, as the header narrows. */}
        <FullSearchTrigger className="hidden h-8 w-44 rounded-[7px] border-fd-border bg-fd-card py-0 text-[13px] xl:flex" />
        <SearchTrigger className="xl:hidden" />
        <ThemeMenu />
        <a
          href="https://github.com/agentconnect-md/agentconnect"
          target="_blank"
          rel="noreferrer"
          aria-label={stars === undefined ? 'GitHub' : `GitHub, ${stars} stars`}
          className="ac-btn-github"
        >
          <GitHubMark />
          <span className="hidden lg:inline">{starLabel}</span>
          {stars !== undefined && <span className="tabular-nums">{formatStars(stars)}</span>}
        </a>
        <a href={consoleUrl} target="_blank" rel="noreferrer" className="ac-btn-primary">
          {consoleLabel}
        </a>
      </div>
    </header>
  )
}
