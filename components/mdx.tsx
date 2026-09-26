import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import type { ComponentProps } from 'react'
import { localePath } from '@/lib/i18n'
import { Mermaid } from './mermaid'

const DefaultLink = defaultMdxComponents.a

// Pages link to site paths (/getting-started/…, /api); keep a translated page's links in its language.
function localizedLink(lang: string) {
  return function LocalizedLink({ href, ...props }: ComponentProps<'a'>) {
    const local = href?.startsWith('/') && !href.startsWith('//') ? localePath(lang, href) : href
    return <DefaultLink href={local} {...props} />
  }
}

export function getMDXComponents(lang = 'en', components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    // Fumadocs' own image renderer, for pages that give an imported image a display width: <Image src={img} width={420} />.
    Image: defaultMdxComponents.img,
    Mermaid,
    a: localizedLink(lang),
    ...components
  } satisfies MDXComponents
}

export const useMDXComponents = getMDXComponents

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>
}
