'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { FrameworkProvider, type Framework } from 'fumadocs-core/framework'
import { RootProvider } from 'fumadocs-ui/provider/base'
import type { ComponentProps } from 'react'
import { BASE_PATH } from '@/base-path.mjs'
import { usePathname } from '@/lib/pathname'

// Fumadocs' Next.js adapter hands over the same two components; Next types their props more strictly than the slots.
const NextLink = Link as Framework['Link']
const NextImage = Image as Framework['Image']

// Fumadocs' Next.js provider reading the reader's path, so prerendered English pages hydrate; search under the base path.
export function Provider({ i18n, children }: Pick<ComponentProps<typeof RootProvider>, 'i18n' | 'children'>) {
  return (
    <FrameworkProvider usePathname={usePathname} useParams={useParams} useRouter={useRouter} Link={NextLink} Image={NextImage}>
      <RootProvider i18n={i18n} search={{ options: { api: `${BASE_PATH}/api/search` } }}>
        {children}
      </RootProvider>
    </FrameworkProvider>
  )
}
