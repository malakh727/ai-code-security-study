// Basic CORS Configuration
javascript
const express = require('express');
const cors = require('cors');
const app = express();

// Basic configuration - allows requests from any origin
app.use(cors());

// Your routes
app.get('/api/data', (req, res) => {
  res.json({ message: 'Hello from API!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Advanced Configuration with Specific Origins

const express = require('express');
const cors = require('cors');
const app = express();

// Configuration for specific origins
const corsOptions = {
  origin: function (origin, callback) {
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://your-frontend-domain.com',
      'https://staging.yourdomain.com'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    
    return callback(null, true);
  },
  credentials: true, // Allow cookies and credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Headers'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // Cache preflight requests for 24 hours
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Apply CORS globally
app.use(cors(corsOptions));

// OR apply CORS to specific routes
app.use('/api/public', cors()); // Public API routes
app.use('/api/secure', cors(corsOptions)); // Secure API routes

// Your API routes
app.get('/api/data', (req, res) => {
  res.json({ message: 'This data is accessible from allowed origins' });
});

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// Environment-based Configuration
const express = require('express');
const cors = require('cors');
const app = express();

// Load environment variables
require('dotenv').config();

// Dynamic CORS configuration based on environment
const getCorsOptions = () => {
  if (process.env.NODE_ENV === 'production') {
    return {
      origin: [
        'https://production-frontend.com',
        'https://www.production-frontend.com'
      ],
      credentials: true,
      optionsSuccessStatus: 200
    };
  } else if (process.env.NODE_ENV === 'staging') {
    return {
      origin: 'https://staging-frontend.com',
      credentials: true,
      optionsSuccessStatus: 200
    };
  } else {
    // Development - allow localhost origins
    return {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
      optionsSuccessStatus: 200
    };
  }
};

app.use(cors(getCorsOptions()));

// API Routes
app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.post('/api/login', express.json(), (req, res) => {
  // Handle login logic
  res.json({ token: 'jwt-token-here' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
// Manual CORS Headers (Without the cors package)
const express = require('express');
const app = express();

// Custom CORS middleware
const corsMiddleware = (req, res, next) => {
  // Set allowed origins (adjust as needed)
  const allowedOrigins = [
    'http://localhost:3000',
    'https://yourfrontend.com'
  ];
  
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
};

// Apply CORS middleware
app.use(corsMiddleware);

// Your API routes
app.get('/api/data', (req, res) => {
  res.json({ data: 'Protected by custom CORS middleware' });
});

app.listen(3000, () => {
  console.log('Server running with custom CORS middleware');
});
// Package.json Setup
// json
// {
//   "name": "express-api",
//   "version": "1.0.0",
//   "dependencies": {
//     "express": "^4.18.0",
//     "cors": "^2.8.5",
//     "dotenv": "^16.0.0"
//   },
//   "scripts": {
//     "start": "node server.js",
//     "dev": "nodemon server.js"
//   }
// }
// Installation
// bash
// # Install dependencies
// npm install express cors dotenv

// # For development with auto-restart
// npm install -D nodemon
// Key Configuration Options Explained:
// origin: Controls which domains can access your API

// credentials: Set to true if your frontend needs to send cookies/credentials

// methods: HTTP methods allowed

// allowedHeaders: Headers the client can send

// exposedHeaders: Headers the client can read

// maxAge: How long to cache preflight requests

// Choose the approach based on your security requirements. For production, always specify exact origins rather than using wildcards (*) when credentials are involved.