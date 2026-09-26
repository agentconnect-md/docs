import spec from '@/.generated/openapi.json'
import { BASE_PATH } from '@/base-path.mjs'
import { channel, releaseUrl } from '@/lib/channel'
import { t } from '@/lib/strings'

const PATH_PREFIX = Object.keys(spec.paths)[0]?.match(/^\/v\d+/)?.[0] ?? ''

// Where this build's API lives and what it documents: the channel's endpoint and the release it is bound to.
export function ApiFacts({ lang }: { lang: string }) {
  const s = t(lang)
  return (
    <table>
      <tbody>
        <tr>
          <th>{s.baseUrl}</th>
          <td>
            <code>{`${channel.apiUrl}${PATH_PREFIX}`}</code>
          </td>
        </tr>
        <tr>
          <th>{s.release}</th>
          <td>
            <a href={releaseUrl}>{channel.release.tag}</a>
          </td>
        </tr>
        <tr>
          <th>{s.document}</th>
          <td>
            <a href={`${BASE_PATH}/openapi.json`} download>
              {s.download}
            </a>{' '}
            (OpenAPI {spec.openapi}, {Object.keys(spec.paths).length} paths)
          </td>
        </tr>
      </tbody>
    </table>
  )
}
