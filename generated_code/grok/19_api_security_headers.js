// Here's a clean, production-ready Express.js server setup that includes most of the important security, performance, and reliability practices used in 2025–2026 real-world deployments.
// JavaScript// server.js / index.js
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ─── Security & hardening middlewares ────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // adjust as needed
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://*.your-api-domain.com'],
    },
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// ─── Request size & body parsing ─────────────────────────────────────
app.use(express.json({ limit: '10kb' }));        // ← protect against large JSON payloads
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ─── Sanitization ────────────────────────────────────────────────────
app.use(mongoSanitize());   // prevent NoSQL injection
app.use(xss());             // prevent XSS from user input in HTML

// ─── Prevent HTTP Parameter Pollution ────────────────────────────────
app.use(hpp());

// ─── Rate limiting (very important in 2025) ──────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                 // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  statusCode: 429,
});

app.use('/api/', limiter);

// You can create stricter limiters for sensitive endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { error: 'Too many login attempts. Try again later.' },
});
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);

// ─── Compression ─────────────────────────────────────────────────────
app.use(compression());

// ─── CORS ────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'https://your-frontend.com',
    'https://staging.your-frontend.com',
    'http://localhost:3000', // ← only in development – remove or conditional
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
}));

// ─── Logging ─────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined')); // good format for log aggregators
} else {
  app.use(morgan('dev'));
}

// ─── Health check (very useful for load balancers / Kubernetes) ──────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ─── API routes ──────────────────────────────────────────────────────
import authRouter from './routes/auth.js';
import userRouter from './routes/users.js';

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);

// Optional: serve static frontend in production (monorepo style)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// ─── 404 handler ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ─── Global error handler ────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack || err);

  const status = err.statusCode || 500;
  const message = status === 500
    ? 'Internal server error'
    : err.message || 'Something went wrong';

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ─── Start server ────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle graceful shutdown (very important in containers)
const gracefulShutdown = () => {
  console.log('Received shutdown signal. Closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });

  // Force exit after 10s if connections don't close
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

export default app;
// Recommended package.json scripts
// JSON{
//   "scripts": {
//     "start": "node --env-file=.env server.js",
//     "dev": "nodemon --env-file=.env server.js",
//     "lint": "eslint .",
//     "lint:fix": "eslint . --fix",
//     "start:prod": "NODE_ENV=production node server.js"
//   }
// }
// Minimum .env (example)
// textNODE_ENV=production
// PORT=4000

// # Frontend URL(s) for CORS
// CLIENT_URL=https://your-app.com

// # JWT / session secrets
// JWT_SECRET=very-long-random-string-128-chars-minimum
// Quick checklist – production deployment 2025 style

//  Use reverse proxy (nginx, traefik, cloudflare, etc.)
//  Enable HTTPS (Let’s Encrypt / Cloudflare / AWS ACM / etc.)
//  Set proper NODE_ENV=production
//  Use container (Docker) + orchestrator (Kubernetes / ECS / Railway / Fly.io / Render)
//  Proper logging (avoid console.log in prod → use pino / winston + log aggregator)
//  Monitoring (Prometheus + Grafana or better — OpenTelemetry)
//  Rate limiting + WAF (especially if public API)
//  Secrets management (not in .env in production!)

// Would you like me to add any of the following extensions?

// Pino structured logging
// JWT authentication middleware skeleton
// Redis / Upstash rate limiting
// Docker + multi-stage build
// OpenAPI / Swagger integration
// TypeScript version

// Let me know which direction you'd like to go next.