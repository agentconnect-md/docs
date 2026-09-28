import { loader } from 'fumadocs-core/source'
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema'
import { defineDocs } from 'fumadocs-mdx/macro'
import { i18n } from './i18n'
import { iconsPlugin } from './icons'
import { openapi } from './openapi'

// URLs are Fumadocs' defaults, a page's path under content/docs, at the site root.
const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema,
    postprocess: { includeProcessedMarkdown: true }
  },
  meta: { schema: metaSchema }
})

export const source = loader({
  baseUrl: '/',
  source: docs.toFumadocsSource(),
  i18n,
  plugins: [iconsPlugin()]
})

// Tag folder names: lower case, runs of anything else become one hyphen ("Organization variables & secrets").
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// The API section's own pages (its overview), written in MDX under content/api.
const apiDocs = defineDocs({
  dir: 'content/api',
  docs: { schema: pageSchema, postprocess: { includeProcessedMarkdown: true } },
  meta: { schema: metaSchema }
})

// The overview beside one page per operation, named by its operationId (the default), in a folder per tag. The
// operations sit in a route group, (operations), so their generated meta.json leaves content/api/meta.json the root's.
export const reference = loader(
  {
    docs: apiDocs.toFumadocsSource(),
    openapi: await openapi.staticSource({ groupBy: 'tag', slugify, meta: true, baseDir: '(operations)' })
  },
  { baseUrl: '/api', i18n, plugins: [openapi.loaderPlugin(), iconsPlugin()] }
)
