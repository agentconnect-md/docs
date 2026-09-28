'use client'
import { useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'
import { Check, Monitor, Moon, Sun } from 'lucide-react'
import { useI18n } from 'fumadocs-ui/contexts/i18n'
import { Popover, PopoverContent, PopoverTrigger } from 'fumadocs-ui/components/ui/popover'
import { t } from '@/lib/strings'

const OPTIONS = [
  { id: 'light', Icon: Sun },
  { id: 'dark', Icon: Moon },
  { id: 'system', Icon: Monitor }
] as const

const subscribe = () => () => {}

// One icon for the current theme; light, dark and system sit in its menu instead of a three-button strip.
export function ThemeMenu({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const { locale } = useI18n()
  const labels = t(locale ?? 'en').theme
  const mounted = useSyncExternalStore(subscribe, () => true, () => false)
  const current = mounted ? (theme ?? 'system') : 'system'
  const Icon = OPTIONS.find((o) => o.id === current)?.Icon ?? Monitor

  return (
    <Popover>
      <PopoverTrigger className={className ?? 'ac-nav-icon'} aria-label={labels.label} data-theme-toggle="">
        <Icon className="size-4.5" />
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={6} className="flex w-40 flex-col p-1 text-sm">
        {OPTIONS.map(({ id, Icon: ItemIcon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTheme(id)}
            aria-pressed={current === id}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-start hover:bg-fd-accent"
          >
            <ItemIcon className="size-4 text-fd-muted-foreground" />
            <span className="flex-1">{labels[id]}</span>
            {current === id && <Check className="size-4 text-fd-primary" />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}
