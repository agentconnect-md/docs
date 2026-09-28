'use client'
import { MarkdownCopyButton, ViewOptionsPopover } from 'fumadocs-ui/layouts/docs/page'

// Fumadocs' two page actions joined into one split button: Copy Markdown, and its open-in menu behind the chevron.
export function PageActions({ markdownUrl, githubUrl, moreLabel }: { markdownUrl: string; githubUrl: string; moreLabel: string }) {
  return (
    <div className="inline-flex">
      <MarkdownCopyButton markdownUrl={markdownUrl} className="rounded-e-none" />
      <ViewOptionsPopover markdownUrl={markdownUrl} githubUrl={githubUrl} className="rounded-s-none border-s-0 px-2" aria-label={moreLabel}>
        <span className="sr-only">{moreLabel}</span>
      </ViewOptionsPopover>
    </div>
  )
}
