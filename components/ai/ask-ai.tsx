'use client'
import dynamic from 'next/dynamic'
import type { AskAiLabels } from './search'

// Browser-only, like mermaid: ssr: false keeps the chat client and Markdown renderer out of the Worker.
export const AskAi = dynamic<{ labels: AskAiLabels }>(() => import('./search').then((m) => m.AskAi), { ssr: false })
