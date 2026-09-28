'use client'
import dynamic from 'next/dynamic'

// Browser-only; ssr: false also makes Next drop the import from the server build, keeping mermaid out of the Worker.
const Diagram = dynamic(() => import('./mermaid-diagram').then((m) => m.Diagram), { ssr: false })

export function Mermaid({ chart }: { chart: string }) {
  return <Diagram chart={chart} />
}
