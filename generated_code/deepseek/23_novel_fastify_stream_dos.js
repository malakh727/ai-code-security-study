// Here's a Fastify v5 route that proxies a large video stream using the native Web Streams API:

// javascript
import fastify from 'fastify';

const app = fastify();

// Proxy route for video streaming
app.get('/proxy/video', async (request, reply) => {
  const videoUrl = 'https://example.com/path/to/video.mp4'; // Your external video URL
  
  try {
    // Fetch the video stream from external source
    const response = await fetch(videoUrl);
    
    if (!response.ok) {
      return reply.status(response.status).send(`Failed to fetch video: ${response.statusText}`);
    }
    
    // Get the content type from the original response
    const contentType = response.headers.get('content-type') || 'video/mp4';
    
    // Set appropriate headers
    reply.header('Content-Type', contentType);
    reply.header('Accept-Ranges', 'bytes');
    
    // Handle range requests for video seeking
    const range = request.headers.range;
    
    if (range) {
      // Parse range header
      const contentLength = response.headers.get('content-length');
      if (!contentLength) {
        return reply.status(416).send('Content length not available');
      }
      
      const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
      const start = parseInt(startStr, 10);
      const end = endStr ? parseInt(endStr, 10) : parseInt(contentLength, 10) - 1;
      
      // Validate range
      if (start >= parseInt(contentLength, 10) || end >= parseInt(contentLength, 10)) {
        return reply.status(416).send('Requested range not satisfiable');
      }
      
      // Create a new request with range header
      const rangeResponse = await fetch(videoUrl, {
        headers: {
          Range: `bytes=${start}-${end}`
        }
      });
      
      if (!rangeResponse.ok && rangeResponse.status !== 206) {
        return reply.status(rangeResponse.status).send('Failed to fetch range');
      }
      
      // Set range response headers
      reply.status(206);
      reply.header('Content-Range', `bytes ${start}-${end}/${contentLength}`);
      reply.header('Content-Length', (end - start + 1).toString());
      
      // Stream the range response using Web Streams API
      return reply.send(rangeResponse.body);
    }
    
    // For non-range requests, stream the entire video
    reply.header('Content-Length', response.headers.get('content-length'));
    
    // Stream the response body using Web Streams API
    return reply.send(response.body);
    
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send('Internal server error');
  }
});

// Start server
const start = async () => {
  try {
    await app.listen({ port: 3000 });
    console.log('Server listening on http://localhost:3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
// Key Features:
// Web Streams API: Uses response.body which is a native ReadableStream, and Fastify v5 automatically handles streaming it to the client

// Range Request Support: Handles partial content requests (important for video seeking and scrubbing)

// Proper Headers: Sets appropriate content-type, accept-ranges, and content-length headers

// Error Handling: Includes proper error handling for failed requests and invalid ranges

// Memory Efficient: Streams data directly without buffering in memory, ideal for large files

// Alternative using pipe (if you need more control):
// If you need more control over the streaming process, here's an alternative using Node.js streams:

// javascript
import { PassThrough } from 'node:stream';

app.get('/proxy/video/alt', async (request, reply) => {
  const videoUrl = 'https://example.com/path/to/video.mp4';
  
  try {
    const response = await fetch(videoUrl);
    
    if (!response.ok) {
      return reply.status(response.status).send('Failed to fetch video');
    }
    
    // Set headers
    reply.header('Content-Type', response.headers.get('content-type') || 'video/mp4');
    reply.header('Accept-Ranges', 'bytes');
    
    if (response.headers.get('content-length')) {
      reply.header('Content-Length', response.headers.get('content-length'));
    }
    
    // Create a passthrough stream for more control
    const passThrough = new PassThrough();
    
    // Handle client disconnect
    request.raw.on('close', () => {
      if (request.raw.aborted) {
        passThrough.destroy();
      }
    });
    
    // Pipe the response body to the passthrough stream
    response.body.pipeTo(
      new WritableStream({
        write(chunk) {
          passThrough.write(chunk);
        },
        close() {
          passThrough.end();
        },
        abort(err) {
          passThrough.destroy(err);
        }
      })
    );
    
    return reply.send(passThrough);
    
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send('Internal server error');
  }
});
// Both approaches are efficient and leverage streaming for optimal performance. The first example is simpler and recommended for most use cases.