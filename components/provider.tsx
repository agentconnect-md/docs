'use client'
import { RootProvider } from 'fumadocs-ui/provider/next'
import type { ComponentProps } from 'react'
import { BASE_PATH } from '@/base-path.mjs'

// Fumadocs' default search dialog, pointed at the search route under the base path.
export function Provider({ i18n, children }: Pick<ComponentProps<typeof RootProvider>, 'i18n' | 'children'>) {
  return (
    <RootProvider i18n={i18n} search={{ options: { api: `${BASE_PATH}/api/search` } }}>
      {children}
    </RootProvider>
  )
}
