import type { ReactNode } from 'react'
import type * as PageTree from 'fumadocs-core/page-tree'
import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { Sidebar, SidebarProvider, useSidebar } from 'fumadocs-ui/layouts/docs/slots/sidebar'
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

// Every section shares one frame: the site header over Fumadocs' docs layout.
export async function SiteLayout({ lang, tree, children }: { lang: string; tree: PageTree.Root; children: ReactNode }) {
  const s = t(lang)
  const tabs = siteTabs(lang)
  const stars = await githubStars()

  return (
    <>
      <div className="ac-header">
        <SiteNav tabs={tabs} consoleUrl={channel.consoleUrl} consoleLabel={s.openConsole} starLabel={s.star} stars={stars} />
      </div>
      <DocsLayout
        {...baseOptions(lang)}
        tree={forSidebar(tree)}
        // Section tabs live in the site header (and MobileSections in the drawer), not in Fumadocs' tab bar.
        tabs={false}
        slots={{ sidebar: { provider: SidebarProvider, root: Sidebar, trigger: MenuTrigger, useSidebar } }}
        sidebar={{
          collapsible: false,
          banner: <MobileSections key="sections" tabs={tabs} />
        }}
      >
        {children}
      </DocsLayout>
      <SiteFooter lang={lang} labels={s.footer} />
    </>
  )
}
