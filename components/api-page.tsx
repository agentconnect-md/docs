'use client'
import { createOpenAPIPage } from 'fumadocs-openapi/ui'
import { createCodeUsageGeneratorRegistry } from 'fumadocs-openapi/requests/generators'
import { registerDefault } from 'fumadocs-openapi/requests/generators/all'
import { DocsTitle, PageBreadcrumb } from 'fumadocs-ui/layouts/docs/page'
import type { MediaAdapter } from 'fumadocs-openapi'

const codeUsages = createCodeUsageGeneratorRegistry()
registerDefault(codeUsages)

// Picture uploads take the image itself as the body; the renderer knows no image types, so this sends and shows it raw.
const image: MediaAdapter = {
  encode: ({ body }) => body as BodyInit,
  generateExample: (_data, ctx) => (ctx.lang === 'js' ? `const body = await fetch('./picture.png').then((res) => res.blob())` : undefined)
}

export const OpenAPIPage = createOpenAPIPage({
  codeUsages,
  mediaAdapters: { 'image/png': image, 'image/jpeg': image, 'image/webp': image },
  content: {
    // Fumadocs' operation layout, with the page's breadcrumb, title and description moved into the operation's column,
    // so the column beside it holds only the request and response examples, from the top.
    renderOperationLayout: (slots, { operation, method, path }) => (
      <div className="flex flex-col gap-x-6 gap-y-4 @4xl:flex-row @4xl:items-start">
        <div className="min-w-0 flex-1">
          <PageBreadcrumb className="mb-4" />
          <DocsTitle className="mb-4">{operation.summary ?? `${method.toUpperCase()} ${path}`}</DocsTitle>
          {slots.header}
          {slots.description}
          {slots.apiPlayground}
          {slots.authSchemes}
          {slots.parameters}
          {slots.body}
          {slots.responses}
          {slots.callbacks}
        </div>
        <div className="@4xl:sticky @4xl:top-[calc(var(--fd-docs-row-1,2rem)+1rem)] @4xl:w-[400px]">{slots.apiExample}</div>
      </div>
    )
  }
})
