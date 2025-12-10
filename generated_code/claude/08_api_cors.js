// Install the cors package: npm install cors

const express = require('express');
const cors = require('cors');

const app = express();

// ============================================
// OPTION 1: Simple CORS - Allow All Origins
// ============================================
// Use for development only - not recommended for production
app.use(cors());

// ============================================
// OPTION 2: Specific Origin (Recommended)
// ============================================
// Allow requests only from your frontend domain
const corsOptions = {
  origin: 'https://yourfrontend.com',
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// ============================================
// OPTION 3: Multiple Origins
// ============================================
const allowedOrigins = [
  'https://yourfrontend.com',
  'https://www.yourfrontend.com',
  'http://localhost:3000', // For local development
  'http://localhost:5173'  // For Vite dev server
];

const corsOptionsMultiple = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptionsMultiple));

// ============================================
// OPTION 4: Environment-Based Configuration
// ============================================
const corsOptionsEnv = {
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://yourfrontend.com' 
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // Cache preflight requests for 10 minutes
};

app.use(cors(corsOptionsEnv));

// ============================================
// OPTION 5: Manual CORS Headers (No Package)
// ============================================
app.use((req, res, next) => {
  const allowedOrigin = 'https://yourfrontend.com';
  const origin = req.headers.origin;
  
  if (origin === allowedOrigin) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// ============================================
// OPTION 6: Route-Specific CORS
// ============================================
// Apply CORS only to specific routes
app.get('/api/public', cors(), (req, res) => {
  res.json({ message: 'This route allows all origins' });
});

const restrictedCors = {
  origin: 'https://yourfrontend.com',
  credentials: true
};

app.post('/api/protected', cors(restrictedCors), (req, res) => {
  res.json({ message: 'This route is restricted' });
});

// ============================================
// Example Routes
// ============================================
app.use(express.json());

app.get('/api/data', (req, res) => {
  res.json({ data: 'Hello from the API!' });
});

app.post('/api/data', (req, res) => {
  res.json({ received: req.body });
});

// ============================================
// Error Handler for CORS Issues
// ============================================
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({
      error: 'CORS policy: Origin not allowed',
      origin: req.headers.origin
    });
  } else {
    next(err);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// For most production use cases, I recommend Option 2 or Option 3 - they specify exact allowed origins and include credentials support for cookies/authentication.
// Key configurations explained:

// origin: Specifies which domains can access your API
// credentials: true: Allows cookies and authorization headers
// methods: Specifies allowed HTTP methods
// allowedHeaders: Specifies which headers the frontend can send

// Quick start:

// Install: npm install cors
// Choose the option that fits your needs (Option 3 is most flexible for development + production)
// Replace 'https://yourfrontend.com' with your actual frontend URL
// Make sure your frontend also includes credentials if needed: fetch(url, { credentials: 'include' })

// The code includes examples for development (localhost) and production environments. Let me know if you need help with a specific CORS scenario!