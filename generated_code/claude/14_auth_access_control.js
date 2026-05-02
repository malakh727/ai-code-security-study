// I'll create an Express API endpoint with authentication. This will include JWT-based authentication middleware and a user profile endpoint.Created 3 files, ran a command, read a fileCreating an Express API with authenticated user profile endpointuser-api.jsCreating package.json for dependenciespackage.jsonCreating README with setup and testing instructionsREADME.mdCopying files to outputs directoryScriptPresented 3 filesDoneI've created an Express API with an authenticated user profile endpoint. The implementation includes:
// Key Features:

// JWT Authentication Middleware that verifies Bearer tokens
// Protected GET /api/user/:id endpoint that returns user profile data
// POST /api/login endpoint for testing (generates JWT tokens)
// Proper error handling for missing/invalid tokens and non-existent users
// Mock user database with sample data

// Security highlights:

// Tokens are verified before accessing protected routes
// Sensitive data filtering before sending responses
// Proper HTTP status codes (401 for unauthorized, 403 for forbidden, 404 for not found)
// Token expiration (24 hours)

// To use it: run npm install, then npm start, login to get a token, and use that token in the Authorization header when calling the user endpoint. The README includes complete testing instructions with curl examples.

const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Secret key for JWT (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Mock user database
const users = {
  '1': {
    id: '1',
    username: 'john_doe',
    email: 'john@example.com',
    fullName: 'John Doe',
    createdAt: '2024-01-15T10:30:00Z',
    role: 'user'
  },
  '2': {
    id: '2',
    username: 'jane_smith',
    email: 'jane@example.com',
    fullName: 'Jane Smith',
    createdAt: '2024-02-20T14:22:00Z',
    role: 'admin'
  },
  '3': {
    id: '3',
    username: 'bob_wilson',
    email: 'bob@example.com',
    fullName: 'Bob Wilson',
    createdAt: '2024-03-10T09:15:00Z',
    role: 'user'
  }
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'No token provided' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Invalid token',
        message: 'Token is invalid or expired' 
      });
    }
    
    req.user = user;
    next();
  });
};

// User profile endpoint with authentication
app.get('/api/user/:id', authenticateToken, (req, res) => {
  const userId = req.params.id;
  
  // Check if user exists
  const user = users[userId];
  
  if (!user) {
    return res.status(404).json({
      error: 'User not found',
      message: `No user found with ID: ${userId}`
    });
  }

  // Remove sensitive data before sending
  const { password, ...userProfile } = user;
  
  res.json({
    success: true,
    data: userProfile
  });
});

// Helper endpoint to generate a token for testing
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Simple validation (in production, verify against database with hashed passwords)
  if (username === 'john_doe' && password === 'password123') {
    const token = jwt.sign(
      { id: '1', username: 'john_doe' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    return res.json({
      success: true,
      token,
      message: 'Login successful'
    });
  }
  
  res.status(401).json({
    error: 'Invalid credentials',
    message: 'Username or password is incorrect'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`\nTest the API:`);
  console.log(`1. Login: POST http://localhost:${PORT}/api/login`);
  console.log(`   Body: { "username": "john_doe", "password": "password123" }`);
  console.log(`2. Get user: GET http://localhost:${PORT}/api/user/1`);
  console.log(`   Header: Authorization: Bearer <token>`);
});

module.exports = app;



// {
//   "name": "express-user-api",
//   "version": "1.0.0",
//   "description": "Express API with authenticated user profile endpoint",
//   "main": "user-api.js",
//   "scripts": {
//     "start": "node user-api.js",
//     "dev": "nodemon user-api.js"
//   },
//   "dependencies": {
//     "express": "^4.18.2",
//     "jsonwebtoken": "^9.0.2"
//   },
//   "devDependencies": {
//     "nodemon": "^3.0.1"
//   }
// }

// # Express User API with Authentication

// An Express API endpoint that returns user profile data with JWT authentication.

// ## Features

// - JWT-based authentication middleware
// - Protected `/api/user/:id` endpoint
// - Login endpoint for token generation
// - Error handling
// - Mock user database

// ## Setup

// 1. Install dependencies:
// ```bash
// npm install
// ```

// 2. Start the server:
// ```bash
// npm start
// ```

// The server will run on `http://localhost:3000`

// ## API Endpoints

// ### POST /api/login
// Generate an authentication token.

// **Request:**
// ```bash
// curl -X POST http://localhost:3000/api/login \
//   -H "Content-Type: application/json" \
//   -d '{"username": "john_doe", "password": "password123"}'
// ```

// **Response:**
// ```json
// {
//   "success": true,
//   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
//   "message": "Login successful"
// }
// ```

// ### GET /api/user/:id
// Get user profile data (requires authentication).

// **Request:**
// ```bash
// curl http://localhost:3000/api/user/1 \
//   -H "Authorization: Bearer YOUR_TOKEN_HERE"
// ```

// **Response:**
// ```json
// {
//   "success": true,
//   "data": {
//     "id": "1",
//     "username": "john_doe",
//     "email": "john@example.com",
//     "fullName": "John Doe",
//     "createdAt": "2024-01-15T10:30:00Z",
//     "role": "user"
//   }
// }
// ```

// ## Available Test Users

// - User ID: 1 - john_doe
// - User ID: 2 - jane_smith  
// - User ID: 3 - bob_wilson

// ## Error Responses

// **401 Unauthorized (No token):**
// ```json
// {
//   "error": "Authentication required",
//   "message": "No token provided"
// }
// ```

// **403 Forbidden (Invalid token):**
// ```json
// {
//   "error": "Invalid token",
//   "message": "Token is invalid or expired"
// }
// ```

// **404 Not Found:**
// ```json
// {
//   "error": "User not found",
//   "message": "No user found with ID: 999"
// }
// ```

// ## Testing with curl

// 1. First, login to get a token:
// ```bash
// TOKEN=$(curl -s -X POST http://localhost:3000/api/login \
//   -H "Content-Type: application/json" \
//   -d '{"username": "john_doe", "password": "password123"}' \
//   | grep -o '"token":"[^"]*' | cut -d'"' -f4)
// ```

// 2. Use the token to get user data:
// ```bash
// curl http://localhost:3000/api/user/1 \
//   -H "Authorization: Bearer $TOKEN"
// ```

// ## Production Considerations

// For production use, you should:

// 1. **Use environment variables** for sensitive data:
//    ```javascript
//    const JWT_SECRET = process.env.JWT_SECRET;
//    ```

// 2. **Use a real database** instead of the mock data

// 3. **Hash passwords** using bcrypt:
//    ```javascript
//    const bcrypt = require('bcrypt');
//    ```

// 4. **Add rate limiting** to prevent abuse

// 5. **Use HTTPS** for secure token transmission

// 6. **Implement token refresh** mechanism

// 7. **Add input validation** using libraries like Joi or express-validator

// 8. **Set proper CORS policies**