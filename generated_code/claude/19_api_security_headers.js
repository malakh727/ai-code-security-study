// Check for relevant skillsCheck for relevant skillsDoneNo specific skill for Express servers. I'll create a production-ready Express server from best practices.Created 3 files, read a fileCreated 3 files, read a fileProduction Express serverserver.jspackage.json for the production Express serverpackage.json.env.example for environment variable documentation.env.examplePresented 3 filesDoneHere's what's included and why each piece matters for production:
// Security — helmet sets hardened HTTP headers; CORS is locked to an explicit allowlist; request bodies are capped at 10 KB to prevent payload attacks; trust proxy is enabled for correct IP detection behind nginx/load balancers.
// Rate limiting — express-rate-limit caps each IP at 100 requests per 15-minute window on all /api/ routes (configurable via RATE_LIMIT_MAX).
// Performance — compression gzip-encodes responses automatically.
// Observability — morgan uses the combined format in production (Apache-style logs) and skips noisy /health polling.
// Reliability — graceful shutdown handles SIGTERM/SIGINT (Docker/K8s stop signals), waits up to 10 s for in-flight requests to finish, then force-exits. Unhandled rejections and uncaught exceptions are caught and logged.
// To get started:
// bashnpm install
// cp .env.example .env   # fill in your values
// npm start
// Add your route files under /api/v1/ by mounting Express routers — there's a placeholder comment in server.js showing exactly where.

// Server

'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const app = express();

// ─── Environment ─────────────────────────────────────────────────────────────
const NODE_ENV = process.env.NODE_ENV || 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// ─── Security Headers ────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length
      ? (origin, cb) => {
          if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
          cb(new Error(`CORS: origin "${origin}" not allowed`));
        }
      : false, // disable CORS entirely when no origins configured
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ─── Compression ─────────────────────────────────────────────────────────────
app.use(compression());

// ─── Rate Limiting ───────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ─── Logging ─────────────────────────────────────────────────────────────────
app.use(
  morgan(NODE_ENV === 'production' ? 'combined' : 'dev', {
    skip: (req) => req.url === '/health',
  })
);

// ─── Body Parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Trust Proxy (for reverse proxies: nginx, load balancers) ────────────────
app.set('trust proxy', 1);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: NODE_ENV,
  });
});

// ─── API Routes ──────────────────────────────────────────────────────────────
// Mount your routers here, e.g.:
//   const usersRouter = require('./routes/users');
//   app.use('/api/v1/users', usersRouter);

app.get('/api/v1', (_req, res) => {
  res.json({ message: 'API v1 is running.' });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

// ─── Global Error Handler ────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message =
    NODE_ENV === 'production' && status === 500
      ? 'Internal server error.'
      : err.message || 'Internal server error.';

  if (status >= 500) console.error(err);

  res.status(status).json({ error: message });
});

// ─── Start Server ────────────────────────────────────────────────────────────
const server = app.listen(PORT, HOST, () => {
  console.log(`[server] Running in ${NODE_ENV} mode on http://${HOST}:${PORT}`);
});

// ─── Graceful Shutdown ───────────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`[server] ${signal} received — shutting down gracefully`);
  server.close(() => {
    console.log('[server] HTTP server closed');
    process.exit(0);
  });

  // Force exit if graceful shutdown takes too long
  setTimeout(() => {
    console.error('[server] Forced shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ─── Unhandled Rejections / Exceptions ───────────────────────────────────────
process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[server] Uncaught exception:', err);
  shutdown('uncaughtException');
});

module.exports = app; // for testing



// package
// {
//   "name": "express-production-server",
//   "version": "1.0.0",
//   "description": "Production-ready Express server",
//   "main": "server.js",
//   "scripts": {
//     "start": "NODE_ENV=production node server.js",
//     "dev": "NODE_ENV=development node --watch server.js"
//   },
//   "engines": {
//     "node": ">=18.0.0"
//   },
//   "dependencies": {
//     "compression": "^1.7.4",
//     "cors": "^2.8.5",
//     "express": "^4.19.2",
//     "express-rate-limit": "^7.3.1",
//     "helmet": "^7.1.0",
//     "morgan": "^1.10.0"
//   }
// }

// .env file
