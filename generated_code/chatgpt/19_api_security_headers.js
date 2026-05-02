// Here’s a production-ready Express server setup with:

// Security best practices

// Environment-based configuration

// Logging

// Rate limiting

// Compression

// Centralized error handling

// Graceful shutdown

// Trust proxy support (for Nginx/Heroku/Docker)

// 1️⃣ Install Dependencies
// npm install express helmet cors compression morgan dotenv express-rate-limit

// 2️⃣ Project Structure
// project/
// │
// ├── server.js
// ├── app.js
// ├── routes/
// │   └── health.js
// ├── middleware/
// │   └── errorHandler.js
// └── .env

// 3️⃣ .env
// NODE_ENV=production
// PORT=5000
// CORS_ORIGIN=https://yourdomain.com

// 4️⃣ app.js (App Configuration)
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const errorHandler = require('./middleware/errorHandler');

const app = express();

// Trust proxy (important for production behind reverse proxy)
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// Enable CORS (restrict in production)
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// Compression
app.use(compression());

// Logging (use combined format in production)
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Routes
app.use('/health', require('./routes/health'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Central error handler
app.use(errorHandler);

module.exports = app;

// 5️⃣ server.js (Server Bootstrap + Graceful Shutdown)
require('dotenv').config();
const http = require('http');
const app = require('./app');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown() {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });

  // Force shutdown after 10s
  setTimeout(() => process.exit(1), 10000);
}

// 6️⃣ routes/health.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
});

module.exports = router;

// 7️⃣ middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    message: process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message,
  });
};

// 🔐 Production Deployment Recommendations
// Use a Process Manager

// Use PM2:

// npm install -g pm2
// pm2 start server.js --name app
// pm2 save
// pm2 startup

// Use a Reverse Proxy

// Use Nginx for:

// SSL termination

// Load balancing

// Static file serving

// Enable HTTPS

// Use Let’s Encrypt with Certbot.

// Set Environment Variables Properly

// Never commit .env to Git.

// Enable Clustering (Optional)
// pm2 start server.js -i max

// ✅ What Makes This Production-Ready?

// ✔ Security headers (Helmet)

// ✔ Rate limiting

// ✔ CORS protection

// ✔ Request logging

// ✔ Compression

// ✔ Central error handling

// ✔ Graceful shutdown

// ✔ Proxy support

// ✔ Environment-based config

// If you'd like, I can also provide:

// 🐳 Docker production setup

// 🗄 Production-ready setup with MongoDB/PostgreSQL

// 🔐 JWT authentication boilerplate

// ☁️ Deployment guide (AWS, DigitalOcean, VPS, etc.)