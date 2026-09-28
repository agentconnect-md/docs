import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import type { ComponentProps } from 'react'
import { localePath } from '@/lib/i18n'
import { Mermaid } from './mermaid'

const DefaultLink = defaultMdxComponents.a
const DefaultCard = defaultMdxComponents.Card

// A site path (/getting-started/…, /api) keeps a translated page's language; anything else is left alone.
function localizeHref(lang: string, href: string | undefined): string | undefined {
  return href?.startsWith('/') && !href.startsWith('//') ? localePath(lang, href) : href
}

// Pages link to site paths; plain links and Cards alike stay in the page's language.
function localizedLink(lang: string) {
  return function LocalizedLink({ href, ...props }: ComponentProps<'a'>) {
    return <DefaultLink href={localizeHref(lang, href)} {...props} />
  }
}

function localizedCard(lang: string) {
  return function LocalizedCard({ href, ...props }: ComponentProps<typeof DefaultCard>) {
    return <DefaultCard href={localizeHref(lang, href)} {...props} />
  }
}

export function getMDXComponents(lang = 'en', components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    // Fumadocs' own image renderer, for pages that give an imported image a display width: <Image src={img} width={420} />.
    Image: defaultMdxComponents.img,
    Mermaid,
    a: localizedLink(lang),
    Card: localizedCard(lang),
    ...components
  } satisfies MDXComponents
}

export const useMDXComponents = getMDXComponents

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>
}
