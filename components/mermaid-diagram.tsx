'use client'
import { use, useId } from 'react'
import { useTheme } from 'next-themes'

const cache = new Map<string, Promise<unknown>>()

function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  if (!cache.has(key)) cache.set(key, load())
  return cache.get(key) as Promise<T>
}

export function Diagram({ chart }: { chart: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const { resolvedTheme } = useTheme()
  const { default: mermaid } = use(cached('mermaid', () => import('mermaid')))
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    fontFamily: 'inherit',
    theme: resolvedTheme === 'dark' ? 'dark' : 'default'
  })
  const { svg, bindFunctions } = use(cached(`${resolvedTheme}:${chart}`, () => mermaid.render(`m${id}`, chart)))
  return (
    <div
      className="my-6 flex justify-center [&_svg]:max-w-full"
      ref={(el) => {
        if (el) bindFunctions?.(el)
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
