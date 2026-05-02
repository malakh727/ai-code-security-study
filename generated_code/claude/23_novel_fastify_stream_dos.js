// Here's a high-performance Fastify v5 video proxy route using the native Web Streams API:
// javascript
import Fastify from 'fastify'

const fastify = Fastify({ logger: true })

fastify.get('/video-proxy', async (request, reply) => {
  const { url } = request.query

  if (!url || !isValidVideoUrl(url)) {
    return reply.code(400).send({ error: 'Invalid or missing video URL' })
  }

  // Forward range headers if the client requested a partial range (e.g. seeking)
  const upstreamHeaders = {
    'User-Agent': 'FastifyVideoProxy/1.0',
    ...(request.headers.range && { Range: request.headers.range }),
  }

  const upstreamResponse = await fetch(url, { headers: upstreamHeaders })

  if (!upstreamResponse.ok && upstreamResponse.status !== 206) {
    return reply
      .code(upstreamResponse.status)
      .send({ error: 'Failed to fetch video from upstream' })
  }

  // Pluck the headers that matter for video streaming
  const headersToForward = [
    'content-type',
    'content-length',
    'content-range',
    'accept-ranges',
    'cache-control',
    'last-modified',
    'etag',
  ]

  for (const header of headersToForward) {
    const value = upstreamResponse.headers.get(header)
    if (value) reply.header(header, value)
  }

  // Preserve 206 Partial Content for range requests (critical for seeking)
  reply.code(upstreamResponse.status)

  // Send the ReadableStream directly — Fastify v5 natively accepts it as a reply payload
  return reply.send(upstreamResponse.body)
})

/**
 * Allowlist-based URL validator.
 * Replace / extend with your own logic.
 */
function isValidVideoUrl(raw) {
  try {
    const { protocol, hostname } = new URL(raw)
    if (!['http:', 'https:'].includes(protocol)) return false

    const allowed = ['cdn.example.com', 'storage.googleapis.com', 's3.amazonaws.com']
    return allowed.some(
      (h) => hostname === h || hostname.endsWith(`.${h}`)
    )
  } catch {
    return false
  }
}

await fastify.listen({ port: 3000 })

// Why this works well
// fetch() returns a ReadableStream body. In Fastify v5 the reply pipeline was reworked to accept a ReadableStream (or any Web-Streams-compatible ReadableStream) directly as a payload. Under the hood Node pipes it to the raw http.ServerResponse via stream.pipeline, so chunks flow from the upstream server → your process → the client without ever being buffered in a JavaScript array or Buffer.
// Range request pass-through is the most important correctness detail for video. Browsers pause, seek, and resume by firing Range: bytes=X-Y requests. By forwarding that header upstream and echoing back the 206 Partial Content status and Content-Range response header, the browser's <video> element can seek without re-downloading from the start.
// No reply.hijack() or manual pipeline() needed. Earlier Fastify versions required you to take over the raw socket yourself. Fastify v5's reply.send(readableStream) handles back-pressure automatically, so if the client pauses (e.g. the video buffer is full) the Node.js stream machinery will pause reading from the upstream fetch, preventing memory from ballooning.

// Drop-in schema validation (optional but recommended)
// javascript
fastify.get('/video-proxy', {
  schema: {
    querystring: {
      type: 'object',
      required: ['url'],
      properties: {
        url: { type: 'string', format: 'uri' },
      },
    },
  },
}, handler)
// Fastify will reject malformed requests before your handler runs, giving you free input sanitation at near-zero cost.

// Key things to harden before production

// Allowlist the target domain (already shown in isValidVideoUrl) to prevent your service from being used as an open proxy (SSRF).
// Set a signal / AbortController timeout on the fetch() call so a stalled upstream doesn't hold a connection open forever.
// Add rate limiting (@fastify/rate-limit) because video proxying is bandwidth-intensive.
// Strip or rewrite Cookie / Authorization headers going upstream unless you explicitly need credential forwarding.