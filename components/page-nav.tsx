'use client'
import { useMemo } from 'react'
import Link from 'fumadocs-core/link'
import { usePathname } from 'fumadocs-core/framework'
import { useFooterItems } from 'fumadocs-ui/utils/use-footer-items'
import { ArrowLeft, ArrowRight } from 'lucide-react'

const trim = (url: string) => url.replace(/(.)\/$/, '$1')
const link = 'inline-flex min-w-0 items-center gap-2 text-fd-foreground/80 transition-colors hover:text-fd-foreground [&_svg]:size-4 [&_svg]:shrink-0'

// Previous and next page as plain links under a rule, as ReadMe showed them, in Fumadocs' page order.
export function PageNav({ className = '' }: { className?: string }) {
  const items = useFooterItems()
  const pathname = usePathname()
  const { previous, next } = useMemo(() => {
    const i = items.findIndex((item) => trim(item.url) === trim(pathname))
    return i === -1 ? {} : { previous: items[i - 1], next: items[i + 1] }
  }, [items, pathname])
  if (!previous && !next) return null

  return (
    <nav className={`mt-6 flex items-center justify-between gap-6 border-t pt-6 text-[0.9375rem] ${className}`}>
      {previous ? (
        <Link href={previous.url} className={link}>
          <ArrowLeft className="text-fd-muted-foreground" />
          {previous.icon}
          <span className="truncate">{previous.name}</span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link href={next.url} className={link}>
          {next.icon}
          <span className="truncate">{next.name}</span>
          <ArrowRight className="text-fd-muted-foreground" />
        </Link>
      )}
    </nav>
  )
}
