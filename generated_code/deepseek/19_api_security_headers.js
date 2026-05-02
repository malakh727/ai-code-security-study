// Here's a comprehensive Express server configured for production deployment with best practices:

// Project Structure
// text
// my-express-app/
// ├── src/
// │   ├── config/
// │   │   └── index.js
// │   ├── middleware/
// │   │   ├── errorHandler.js
// │   │   └── rateLimiter.js
// │   ├── routes/
// │   │   └── api.js
// │   ├── utils/
// │   │   └── logger.js
// │   └── app.js
// ├── .env
// ├── .env.example
// ├── .gitignore
// ├── package.json
// └── server.js
// 1. Package.json
// json
// {
//   "name": "express-production-server",
//   "version": "1.0.0",
//   "description": "Production-ready Express server",
//   "main": "server.js",
//   "scripts": {
//     "start": "node server.js",
//     "dev": "nodemon server.js",
//     "prod": "NODE_ENV=production node server.js"
//   },
//   "dependencies": {
//     "express": "^4.18.2",
//     "cors": "^2.8.5",
//     "helmet": "^7.0.0",
//     "compression": "^1.7.4",
//     "express-rate-limit": "^6.7.0",
//     "dotenv": "^16.0.3",
//     "morgan": "^1.10.0",
//     "winston": "^3.9.0",
//     "express-mongo-sanitize": "^2.2.0",
//     "xss-clean": "^0.1.1",
//     "hpp": "^0.2.3",
//     "cookie-parser": "^1.4.6"
//   },
//   "devDependencies": {
//     "nodemon": "^2.0.22"
//   },
//   "engines": {
//     "node": ">=14.0.0"
//   }
// }
// 2. Main Server File (server.js)
// javascript
require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Received shutdown signal, closing server...');
  server.close(() => {
    logger.info('Server closed successfully');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});

module.exports = server;
// 3. Main Express App (src/app.js)
// javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const config = require('./config');
const routes = require('./routes/api');
const errorHandler = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

const app = express();

// Trust proxy - required for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
  crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
}));

// CORS configuration
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
} else {
  app.use(morgan('dev'));
}

// Apply rate limiting to all routes
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Resource not found'
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
// 4. Configuration (src/config/index.js)
// javascript
require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  
  // CORS configuration
  corsOrigins: process.env.NODE_ENV === 'production'
    ? process.env.ALLOWED_ORIGINS?.split(',') || []
    : ['http://localhost:3000', 'http://localhost:5173'],
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000 // limit each IP
  },
  
  // Logging
  logs: {
    level: process.env.LOG_LEVEL || 'info',
    directory: process.env.LOG_DIR || 'logs'
  },
  
  // JWT (if using authentication)
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  // Database (example with MongoDB)
  database: {
    url: process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: process.env.NODE_ENV !== 'production',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  }
};

// Validate required environment variables in production
if (config.env === 'production') {
  const requiredEnvVars = ['JWT_SECRET'];
  
  if (config.database.url) {
    requiredEnvVars.push('MONGODB_URI');
  }
  
  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      throw new Error(`Environment variable ${envVar} is required in production mode`);
    }
  });
}

module.exports = config;
// 5. Logger Utility (src/utils/logger.js)
// javascript
const winston = require('winston');
const path = require('path');
const config = require('../config');

const logDir = config.logs.directory;

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const logger = winston.createLogger({
  level: config.logs.level,
  format: logFormat,
  defaultMeta: { service: 'express-api' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ]
});

// If we're not in production, also log to the console with a simpler format
if (config.env !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Create a stream object for Morgan
logger.stream = {
  write: function(message) {
    logger.info(message.trim());
  }
};

module.exports = logger;
// 6. Rate Limiter Middleware (src/middleware/rateLimiter.js)
// javascript
const rateLimit = require('express-rate-limit');
const config = require('../config');

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req) => {
    // Use IP address as the key, but consider using user ID if authenticated
    return req.ip || req.connection.remoteAddress;
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});

module.exports = limiter;
// 7. Error Handler Middleware (src/middleware/errorHandler.js)
// javascript
const logger = require('../utils/logger');
const config = require('../config');

const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Default error
  let error = { ...err };
  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  // Send response
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(config.env === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
// 8. API Routes (src/routes/api.js)
// javascript
const express = require('express');
const router = express.Router();

// Example route
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Example protected route
router.get('/protected', (req, res) => {
  // Add authentication middleware here
  res.json({
    success: true,
    message: 'Protected route accessed'
  });
});

// Example error route
router.get('/error', (req, res, next) => {
  try {
    throw new Error('Something went wrong!');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
// 9. Environment Variables (.env.example)
// env
// # Server Configuration
// NODE_ENV=production
// PORT=3000

// # Security
// JWT_SECRET=your-super-secret-jwt-key-change-this
// JWT_EXPIRES_IN=7d

// # CORS
// ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com

// # Database (if using MongoDB)
// MONGODB_URI=mongodb://localhost:27017/yourdb

// # Rate Limiting
// RATE_LIMIT_WINDOW_MS=900000
// RATE_LIMIT_MAX_REQUESTS=100

// # Logging
// LOG_LEVEL=info
// LOG_DIR=logs

// # Optional: External services
// REDIS_URL=redis://localhost:6379
// 10. .gitignore
// gitignore
// # Dependencies
// node_modules/
// package-lock.json
// yarn.lock

// # Environment variables
// .env
// .env.local
// .env.production

// # Logs
// logs/
// *.log
// npm-debug.log*
// yarn-debug.log*
// yarn-error.log*

// # Runtime data
// pids
// *.pid
// *.seed
// *.pid.lock

// # Coverage directory used by tools like istanbul
// coverage/

// # nyc test coverage
// .nyc_output/

// # Build outputs
// dist/
// build/

// # Misc
// .DS_Store
// .vscode/
// .idea/
// *.swp
// *.swo
// 11. PM2 Configuration for Production (ecosystem.config.js)
// javascript
module.exports = {
  apps: [{
    name: 'express-api',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    wait_ready: true,
    kill_timeout: 5000,
    listen_timeout: 5000
  }]
};
// Deployment Instructions
// Install dependencies:

// bash
// npm install --production
// Set up environment variables:

// bash
// cp .env.example .env
// # Edit .env with your production values
// Run with PM2 (recommended for production):

// bash
// npm install -g pm2
// pm2 start ecosystem.config.js
// pm2 save
// pm2 startup
// Using Docker (alternative):

// dockerfile
// FROM node:18-alpine

// WORKDIR /usr/src/app

// COPY package*.json ./
// RUN npm ci --only=production

// COPY . .

// EXPOSE 3000

// CMD ["node", "server.js"]
// Key Production Features
// Security: Helmet, CORS, rate limiting, sanitization

// Performance: Compression, clustering (PM2)

// Logging: Winston with file rotation

// Error Handling: Centralized error handler

// Graceful Shutdown: Proper SIGTERM/SIGINT handling

// Monitoring: Health check endpoint

// Configuration: Environment-based config with validation

// Process Management: PM2 for clustering and auto-restart

// This setup provides a solid foundation for a production Express server with security, performance, and maintainability best practices.