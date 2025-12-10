const express = require('express');
const cors = require('cors');
const app = express();

// Option 1: Simple configuration (for development only)
// app.use(cors());

// Option 2: Secure configuration for production (recommended)
const allowedOrigins = [
  'https://your-frontend-domain.com',
  'https://www.your-frontend-domain.com',
  // Add localhost for development if needed
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true, // Allow cookies and Authorization headers
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Your API routes
app.get('/api/data', (req, res) => {
  res.json({ message: 'Hello from Express API!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});






// Alternative: Using environment variables (best practice)
// JavaScriptrequire('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const app = express();

// const allowedOrigins = process.env.ALLOWED_ORIGINS 
//   ? process.env.ALLOWED_ORIGINS.split(',') 
//   : ['http://localhost:3000'];

// const corsOptions = {
//   origin: allowedOrigins,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true
// };

// app.use(cors(corsOptions));

// // Middleware to parse JSON
// app.use(express.json());

// // Your routes here...

// app.listen(5000, () => {
//   console.log('API server running on port 5000');
// });
// .env file
// textALLOWED_ORIGINS=https://your-frontend.com,https://www.your-frontend.com
// Install required packages:
// Bashnpm install express cors dotenv
// Key Security Notes:

// Never use cors() without options in production
// Always specify exact origins
// Use HTTPS in production
// Include credentials: true only if you need to send cookies/auth headers
// Validate origins against a whitelist

// This configuration ensures your API only accepts requests from your trusted frontend while maintaining security best practices.