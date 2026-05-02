// Here’s a Fastify v5 route that proxies a large video stream from an external URL to the client using the native Web Streams API (via fetch in Node 18+ / 20+).
// This avoids buffering and provides maximum streaming performance.

// ✅ Requirements

// Node.js 18+ (native fetch + Web Streams)

// Fastify v5

// 🚀 Fastify Video Proxy Route (Web Streams API)
import Fastify from 'fastify'

const fastify = Fastify({
  logger: true
})

fastify.get('/video-proxy', async (request, reply) => {
  const { url } = request.query

  if (!url) {
    return reply.code(400).send({ error: 'Missing video URL' })
  }

  try {
    // Fetch external video (Web Streams API)
    const upstreamResponse = await fetch(url, {
      method: 'GET',
      headers: {
        // Forward range header for seeking support
        range: request.headers.range || ''
      }
    })

    if (!upstreamResponse.ok && upstreamResponse.status !== 206) {
      return reply.code(upstreamResponse.status).send({
        error: 'Failed to fetch video stream'
      })
    }

    // Forward important streaming headers
    reply
      .code(upstreamResponse.status)
      .header('Content-Type', upstreamResponse.headers.get('content-type') || 'video/mp4')
      .header('Content-Length', upstreamResponse.headers.get('content-length'))
      .header('Accept-Ranges', upstreamResponse.headers.get('accept-ranges') || 'bytes')
      .header('Content-Range', upstreamResponse.headers.get('content-range'))
      .header('Cache-Control', 'no-cache')

    // 🚀 Send native Web ReadableStream directly (zero buffering)
    return reply.send(upstreamResponse.body)

  } catch (err) {
    request.log.error(err)
    return reply.code(500).send({ error: 'Streaming failed' })
  }
})

fastify.listen({ port: 3000 })

// 🎯 Why This Is High Performance

// ✅ Uses native fetch()

// ✅ Streams ReadableStream directly (no buffering)

// ✅ Supports Range headers (video seeking works)

// ✅ Zero memory accumulation

// ✅ No conversion to Node streams

// 🔥 Example Usage
// curl "http://localhost:3000/video-proxy?url=https://example.com/large-video.mp4" --output video.mp4


// Or use directly in a browser:

// <video controls src="http://localhost:3000/video-proxy?url=https://example.com/video.mp4"></video>

// ⚡ Production Tips

// For production deployment (which you were setting up earlier):

// Validate allowed domains (prevent open proxy abuse)

// Add timeout via AbortController

// Consider rate limiting

// Optionally cache via CDN instead of app layer

// Restrict content-type to video/*

// If you'd like, I can also provide:

// 🔒 A secure allowlist version

// 📦 An HTTP/2 optimized version

// 🧠 A version with backpressure tuning

// ☁️ A reverse proxy alternative (NGINX-based, more scalable)

// Just tell me your target environment (Docker? VPS? Cloud?).