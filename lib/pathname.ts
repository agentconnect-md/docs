import { usePathname as useNextPathname } from 'next/navigation'
import { i18n } from './i18n'

const HIDDEN_LOCALE = new RegExp(`^/${i18n.defaultLanguage}(?=/|$)`)

// The path the reader sees: English pages prerender under the /en the proxy rewrites to, but are served without it.
export function usePathname(): string {
  return useNextPathname().replace(HIDDEN_LOCALE, '') || '/'
}
