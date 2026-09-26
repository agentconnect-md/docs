import type { OpenAPIPageProps_Spec } from 'fumadocs-openapi/server'

const METHODS = new Set(['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace', 'query'])

type PathItem = Record<string, unknown>

/**
 * The page props carry the whole document to the browser (over 1 MB per page); keep only this page's
 * operations. Components, servers and security stay whole, so any `$ref` still resolves.
 */
export function pageScoped(props: OpenAPIPageProps_Spec): OpenAPIPageProps_Spec {
  const doc = props.payload.bundled as { paths?: Record<string, PathItem>; webhooks?: unknown }
  const paths: Record<string, PathItem> = {}
  for (const { path, method } of props.operations ?? []) {
    const item = doc.paths?.[path]
    if (!item) continue
    const shared = Object.fromEntries(Object.entries(item).filter(([k]) => !METHODS.has(k)))
    paths[path] = { ...shared, ...paths[path], [method]: item[method] }
  }
  const bundled = { ...doc, paths, webhooks: props.webhooks?.length ? doc.webhooks : undefined }
  return { ...props, payload: { ...props.payload, bundled: bundled as never } }
}
