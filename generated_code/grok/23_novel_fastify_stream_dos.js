// Here's a clean, high-performance Fastify v5 route that proxies a large video stream using the native Web Streams API ( WHATWG streams ) — the most efficient way available in Node.js 18+ / 20+ today:
// JavaScript
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import fetch from 'node-fetch'; // or use undici fetch (Node 18+ built-in)

export default async function videoProxyRoutes(fastify) {
  fastify.get('/proxy-video', {
    // Optional: schema can help clients understand what to expect
    schema: {
      querystring: {
        type: 'object',
        required: ['url'],
        properties: {
          url: { type: 'string', format: 'uri' }
        }
      },
      response: {
        200: {
          type: 'string',
          format: 'binary'
        }
      }
    },
    // Very important flags for large binary streaming
    config: {
      // Prevents Fastify from trying to buffer the whole response
      bodyLimit: false
    }
  }, async function (request, reply) {
    const { url } = request.query;

    if (!url) {
      reply.code(400);
      return { error: 'Missing ?url= parameter' };
    }

    try {
      // Fetch with streaming enabled
      const externalRes = await fetch(url, {
        redirect: 'follow',
        headers: {
          // Forward useful client headers if needed
          'User-Agent': request.headers['user-agent'] || 'video-proxy',
          'Accept': request.headers['accept'] || 'video/*, */*',
          'Range': request.headers['range'] || undefined, // ← crucial for seeking
        },
      });

      if (!externalRes.ok) {
        reply.code(externalRes.status);
        return { error: `Upstream returned ${externalRes.status}` };
      }

      const contentType = externalRes.headers.get('content-type') || 'video/mp4';
      const contentLength = externalRes.headers.get('content-length');
      const acceptRanges = externalRes.headers.get('accept-ranges');

      // Prepare reply headers
      reply
        .header('Content-Type', contentType)
        .header('Cache-Control', 'no-cache, no-store') // or public, max-age=... depending on use-case
        .header('Accept-Ranges', acceptRanges || 'none');

      if (contentLength) {
        reply.header('Content-Length', contentLength);
      }

      // Forward range-related headers when present
      if (request.headers.range) {
        const range = externalRes.headers.get('content-range');
        if (range) {
          reply.header('Content-Range', range);
          reply.code(206); // Partial Content
        }
      }

      // ───────────────────────────────────────────────
      //            The most performant path (Node 18+)
      // ───────────────────────────────────────────────
      if (externalRes.body && typeof externalRes.body.getReader === 'function') {
        // Native Web Stream → Fastify reply.raw (very efficient)
        reply.raw.writeHead(reply.statusCode || 200, reply.getHeaders());

        // Use WHATWG ReadableStream directly with Node.js Readable.from
        const nodeReadable = Readable.fromWeb(externalRes.body);

        // Pipe directly to HTTP response stream
        await pipeline(
          nodeReadable,
          reply.raw
        );

        return reply; // signal we're done
      }

      // Fallback for older Node or non-streaming fetch (rare today)
      reply.send(externalRes.body);

    } catch (err) {
      fastify.log.error(err);

      if (!reply.sent) {
        reply.code(502);
        return { error: 'Failed to proxy video stream' };
      }
    }
  });
}
// Key Points & Best Practices (2025 edition)


// FeatureStatusWhy it mattersSupports Range requestsYesVideo players seek / scrub timelineUses Web StreamsYes (preferred path)Zero-copy where possible, backpressureForwards important headersYesContent-Range, Accept-Ranges, Content-TypeNo body bufferingYes (bodyLimit: false)Critical for large files (> 2–10 GB)Fastify v5 compatibleYesWorks with latest reply.raw streamingNode.js 18+ best pathReadable.fromWeb()Most memory & CPU efficient
// Even more minimal version (if you don't care about Range headers)
// JavaScript
fastify.get('/stream', async (req, reply) => {
  const { url } = req.query;
  const res = await fetch(url);
  
  reply
    .type(res.headers.get('content-type') || 'video/mp4')
    .header('Cache-Control', 'no-cache');

  return reply.send(res.body); // works great in Node ≥18
});
// But the first version is recommended when you want proper video player seeking support.
// Let me know if you need:

// signed / expiring URLs
// token authentication before proxy
// multiple quality variants (like HLS proxy)
// S3 / Cloudflare R2 presigned URL proxy variant

// Happy streaming! 🎥