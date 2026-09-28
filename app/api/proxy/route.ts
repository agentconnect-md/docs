import { channel } from '@/lib/channel'
import { openapi } from '@/lib/openapi'

// "Send" in the playground: forwarded only to this channel's API, whose CORS policy admits the console alone.
export const { GET, HEAD, PUT, POST, PATCH, DELETE } = openapi.createProxy({
  allowedOrigins: [channel.apiUrl],
  overrides: {
    request(request) {
      const headers = new Headers(request.headers)
      headers.delete('cookie')
      return new Request(request, { headers })
    }
  }
})
