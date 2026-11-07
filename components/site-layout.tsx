import type { ReactNode } from 'react'
import type * as PageTree from 'fumadocs-core/page-tree'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { Sidebar, SidebarProvider, useSidebar } from 'fumadocs-ui/layouts/docs/slots/sidebar'
import { AskAi } from '@/components/ai/ask-ai'
import { MenuTrigger, MobileSections } from '@/components/sidebar-parts'
import { SiteFooter } from '@/components/site-footer'
import { SiteNav } from '@/components/site-nav'
import { channel } from '@/lib/channel'
import { baseOptions } from '@/lib/layout.shared'
import { githubStars, siteTabs } from '@/lib/sections'
import { t } from '@/lib/strings'

// Sidebar nodes without descriptions, which the sidebar never shows (64 KB for the API tree).
function forSidebar<T extends PageTree.Node | PageTree.Root>(node: T): T {
  if (node.type === 'page') return { ...node, description: undefined } as T
  if (node.type === 'folder')
    return { ...node, children: node.children.map(forSidebar), ...(node.index ? { index: forSidebar(node.index) } : {}) } as T
  if (node.type === 'root') return { ...node, children: node.children.map(forSidebar) }
  return node
}

// Sections share the site header and footer; written docs also have a sidebar.
export async function SiteLayout({ lang, tree, children }: { lang: string; tree?: PageTree.Root; children: ReactNode }) {
  const s = t(lang)
  const tabs = siteTabs(lang)
  const stars = await githubStars()

  return (
    <>
      <div className="ac-header">
        <SiteNav tabs={tabs} consoleUrl={channel.consoleUrl} consoleLabel={s.openConsole} starLabel={s.star} stars={stars} />
      </div>
      {tree ? (
        <DocsLayout
          {...baseOptions(lang)}
          tree={forSidebar(tree)}
          // Section tabs live in the site header and the mobile drawer.
          tabs={false}
          slots={{ sidebar: { provider: SidebarProvider, root: Sidebar, trigger: MenuTrigger, useSidebar } }}
          sidebar={{ collapsible: false, banner: <MobileSections key="sections" tabs={tabs} /> }}
        >
          {/* The Ask AI panel takes the TOC's column; the trigger floats bottom right. */}
          <AskAi labels={s.askAi} />
          {children}
        </DocsLayout>
      ) : (
        <HomeLayout
          {...baseOptions(lang)}
          links={tabs.map((tab) => ({ text: tab.title, url: tab.url, active: 'nested-url' }))}
          className="[&>#nd-nav]:md:hidden"
        >
          {children}
        </HomeLayout>
      )}
      <SiteFooter lang={lang} labels={s.footer} />
    </>
  )
}
