// Fastify v5 is excellent for this because it has first-class support for asynchronous primitives. By using the Web Streams API (fetch and ReadableStream), you avoid buffering the entire video into memory, which prevents your server from crashing on large files.

// The Implementation
// To make this work seamlessly, we use the global fetch (standard in Node.js 18+) and pipe the body directly to the Fastify response.

// JavaScript
import Fastify from 'fastify';

const fastify = Fastify({ logger: true });

fastify.get('/proxy-video', async (request, reply) => {
  const videoUrl = 'https://example.com/large-video.mp4';

  try {
    const response = await fetch(videoUrl);

    if (!response.ok) {
      return reply.code(response.status).send({ error: 'Failed to fetch video' });
    }

    // 1. Forward essential headers
    reply.headers({
      'content-type': response.headers.get('content-type') || 'video/mp4',
      'content-length': response.headers.get('content-length'),
      'accept-ranges': 'bytes',
    });

    // 2. Stream the body directly
    // response.body is a ReadableStream (Web API)
    return reply.send(response.body);
    
  } catch (error) {
    fastify.log.error(error);
    return reply.code(500).send({ error: 'Internal Server Error' });
  }
});

fastify.listen({ port: 3000 });
// Why this is high-performance:
// Zero-Buffering: The data chunks are passed from the external source to the client as soon as they arrive. Your Node.js process memory usage stays low regardless of whether the video is 10MB or 10GB.

// Backpressure Handling: Fastify and the Web Streams API automatically handle backpressure. If the client’s internet is slow, the stream will signal the source to slow down, preventing a memory buildup in your proxy.

// Native Integration: In Fastify v5, if you pass a ReadableStream to reply.send(), the framework recognizes it and handles the piping and cleanup (closing the stream) automatically.

// Important Considerations
// Range Requests: The example above is a simple "pass-through." If your video player needs to skip around (seeking), you would need to forward the Range headers from the client to the upstream URL and return a 206 Partial Content status.

// Timeouts: For very long videos, ensure your idle timeout settings on your load balancer or gateway (like Nginx) aren't set too low, or the connection might drop mid-stream.

// Would you like me to show you how to expand this to support Range headers for seeking/scrubbing within the video?