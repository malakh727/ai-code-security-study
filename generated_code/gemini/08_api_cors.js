// 🛠️ Installation
// First, install the cors package:

// Bash

// npm install cors

// 1. Simple Default (Accepts ALL Origins)
// To allow requests from any origin (domain), you can use the middleware without any options. This is suitable for development or public APIs.

const express = require('express');
const cors = require('require');
const app = express();
const port = 3000;

// Use the cors middleware to allow all origins
app.use(cors());

// Example route
app.get('/data', (req, res) => {
  res.json({ message: 'Data from the API' });
});

app.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`);
});

//  Configured Options (Recommended for Production)For production, you should specify exactly which origins are allowed to access your API.In this example, we'll allow requests only from a frontend application running at http://localhost:5173.JavaScriptconst express = require('express');
const cors = require('cors');
// const app = express();
// const port = 3000;

// Configuration object for CORS
const corsOptions = {
  // Specify the exact origin(s) that are allowed to access the API
  // Replace 'http://localhost:5173' with your actual frontend URL (e.g., 'https://your-frontend-domain.com')
  origin: 'http://localhost:5173', 
  
  // You can specify which HTTP methods are allowed (GET, POST, etc.)
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  
  // Allow or deny cookies/credentials to be sent (must match frontend's 'withCredentials' setting)
  credentials: true,
  
  // Set the Access-Control-Max-Age header to enable pre-flight request caching
  preflightContinue: false,
  optionsSuccessStatus: 204 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Use the cors middleware with the specified options
app.use(cors(corsOptions));

// Example route
app.get('/data', (req, res) => {
  // Check request headers for the Origin header (optional, just for demonstration)
  console.log('Request Origin:', req.headers.origin);
  res.json({ message: 'Data only accessible from ' + corsOptions.origin });
});

app.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`);
});
// 🔑 Key Configuration OptionsOptionDescriptionoriginThe only origin(s) allowed. Can be a string, an array of strings, or a function for dynamic checks.methodsSpecifies the allowed HTTP request methods.allowedHeadersSpecifies the allowed request headers (e.g., Authorization, Content-Type).exposedHeadersSpecifies headers that are allowed to be exposed to the frontend (browser).credentialsSet to true to allow the client to send and receive cookies/credentials.Would you like to explore how to set up CORS differently for various environments (e.g., development vs. production)?