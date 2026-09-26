'use client'
import { useState, type ComponentProps } from 'react'
import Link from 'fumadocs-core/link'
import { SidebarTrigger, useSidebar } from 'fumadocs-ui/components/sidebar/base'
import { Popover, PopoverContent, PopoverTrigger } from 'fumadocs-ui/components/ui/popover'
import { Check, ChevronsUpDown, Menu, X } from 'lucide-react'
import { TAB_ICONS, useActiveTab, type NavTab } from './site-nav'

// The mobile top bar's menu button, which turns into a close button while the full-screen menu is open.
export function MenuTrigger({ children: _icon, ...props }: ComponentProps<'button'>) {
  const { open } = useSidebar()
  return <SidebarTrigger {...props}>{open ? <X /> : <Menu />}</SidebarTrigger>
}

// The mobile menu has no site header, so it switches sections with Fumadocs' dropdown instead.
export function MobileSections({ tabs }: { tabs: NavTab[] }) {
  const [open, setOpen] = useState(false)
  const activeId = useActiveTab(tabs)
  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0]
  const ActiveIcon = TAB_ICONS[active.id]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex items-center gap-2 rounded-lg border bg-fd-secondary/50 p-2 text-start text-sm font-medium text-fd-secondary-foreground transition-colors hover:bg-fd-accent data-[popup-open]:bg-fd-accent md:hidden">
        <ActiveIcon className="size-4 shrink-0" />
        {active.title}
        <ChevronsUpDown className="ms-auto size-4 shrink-0 text-fd-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent className="flex w-(--anchor-width) flex-col gap-1 p-1">
        {tabs.map((tab) => {
          const Icon = TAB_ICONS[tab.id]
          return (
            <Link
              key={tab.id}
              href={tab.url}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg p-2 text-sm font-medium hover:bg-fd-accent hover:text-fd-accent-foreground"
            >
              <Icon className="size-4 shrink-0" />
              {tab.title}
              <Check className={`ms-auto size-3.5 shrink-0 text-fd-primary ${tab.id === active.id ? '' : 'invisible'}`} />
            </Link>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}
