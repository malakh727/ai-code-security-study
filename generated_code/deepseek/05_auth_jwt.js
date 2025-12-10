// npm install jsonwebtoken bcryptjs dotenv

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

/**
 * Generate JWT tokens for user authentication
 * @param {Object} user - User object containing user data
 * @param {Object} options - Additional options for token generation
 * @returns {Object} Object containing access and refresh tokens
 */
const generateAuthTokens = (user, options = {}) => {
  const {
    accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d',
    issuer = process.env.JWT_ISSUER || 'your-app-name',
    audience = process.env.JWT_AUDIENCE || 'your-app-client'
  } = options;

  // Validate required environment variables
  if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT secret keys are not configured in environment variables');
  }

  // Prepare payload for access token
  const accessTokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role || 'user',
    type: 'access'
  };

  // Prepare payload for refresh token
  const refreshTokenPayload = {
    userId: user.id,
    type: 'refresh'
  };

  // Generate tokens
  const accessToken = jwt.sign(
    accessTokenPayload,
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: accessTokenExpiry,
      issuer,
      audience
    }
  );

  const refreshToken = jwt.sign(
    refreshTokenPayload,
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: refreshTokenExpiry,
      issuer,
      audience
    }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: accessTokenExpiry,
    tokenType: 'Bearer'
  };
};

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @param {boolean} isRefresh - Whether it's a refresh token
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token, isRefresh = false) => {
  const secret = isRefresh 
    ? process.env.JWT_REFRESH_SECRET 
    : process.env.JWT_ACCESS_SECRET;

  try {
    return jwt.verify(token, secret, {
      issuer: process.env.JWT_ISSUER || 'your-app-name',
      audience: process.env.JWT_AUDIENCE || 'your-app-client'
    });
  } catch (error) {
    throw new Error(`Invalid token: ${error.message}`);
  }
};

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Valid refresh token
 * @param {Object} userData - User data (optional, can be fetched from DB)
 * @returns {Object} New access token
 */
const refreshAccessToken = (refreshToken, userData = null) => {
  // Verify the refresh token
  const decoded = verifyToken(refreshToken, true);
  
  if (decoded.type !== 'refresh') {
    throw new Error('Invalid token type');
  }

  // In a real application, you might want to:
  // 1. Check if the refresh token exists in your database
  // 2. Verify the user still exists and is active
  // 3. Optionally rotate refresh tokens (invalidate old, issue new)

  const user = userData || { id: decoded.userId };
  const tokens = generateAuthTokens(user);

  return {
    accessToken: tokens.accessToken,
    expiresIn: tokens.expiresIn
  };
};

/**
 * Complete login function with password verification
 * @param {Object} user - User from database
 * @param {string} password - Plain text password
 * @returns {Object} Authentication tokens and user info
 */
const loginUser = async (user, password) => {
  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  
  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Check if user is active
  if (user.status !== 'active') {
    throw new Error('Account is not active');
  }

  // Generate tokens
  const tokens = generateAuthTokens(user);

  // Return user data (excluding sensitive information)
  const userResponse = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt
  };

  return {
    user: userResponse,
    tokens
  };
};

module.exports = {
  generateAuthTokens,
  verifyToken,
  refreshAccessToken,
  loginUser
};







// 3. Environment Variables (.env file):
// env
// # JWT Configuration
// JWT_ACCESS_SECRET=your_super_secret_access_key_change_this_in_production
// JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production
// JWT_ACCESS_EXPIRY=15m
// JWT_REFRESH_EXPIRY=7d
// JWT_ISSUER=your-app-name
// JWT_AUDIENCE=your-app-client

// # Database configuration (example)
// DB_HOST=localhost
// DB_PORT=5432
// DB_NAME=your_database
// DB_USER=your_user
// DB_PASSWORD=your_password
// 4. Example Usage in an Express.js Route:
// javascript
// const express = require('express');
// const router = express.Router();
// const { generateAuthTokens, loginUser } = require('./auth');

// // Mock user database (in real app, use a proper database)
// const users = [
//   {
//     id: 1,
//     email: 'user@example.com',
//     password: '$2a$10$hashedpassword', // Hashed password
//     name: 'John Doe',
//     role: 'user',
//     status: 'active',
//     createdAt: new Date()
//   }
// ];

// // Login endpoint
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find user (in real app, query database)
//     const user = users.find(u => u.email === email);
    
//     if (!user) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     // Login user (includes password verification)
//     const result = await loginUser(user, password);
    
//     // Set refresh token as HTTP-only cookie (optional)
//     res.cookie('refreshToken', result.tokens.refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
//     });

//     res.json({
//       success: true,
//       user: result.user,
//       accessToken: result.tokens.accessToken,
//       expiresIn: result.tokens.expiresIn
//     });

//   } catch (error) {
//     res.status(401).json({ error: error.message });
//   }
// });

// // Refresh token endpoint
// router.post('/refresh-token', (req, res) => {
//   try {
//     const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
//     if (!refreshToken) {
//       return res.status(401).json({ error: 'Refresh token required' });
//     }

//     const newTokens = refreshAccessToken(refreshToken);
    
//     res.json({
//       success: true,
//       accessToken: newTokens.accessToken,
//       expiresIn: newTokens.expiresIn
//     });

//   } catch (error) {
//     res.status(401).json({ error: error.message });
//   }
// });

// module.exports = router;
// 5. Middleware for Protecting Routes:
// javascript
// const jwt = require('jsonwebtoken');

// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

//   if (!token) {
//     return res.status(401).json({ error: 'Access token required' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
//       issuer: process.env.JWT_ISSUER,
//       audience: process.env.JWT_AUDIENCE
//     });

//     // Add user info to request
//     req.user = {
//       userId: decoded.userId,
//       email: decoded.email,
//       role: decoded.role
//     };

//     next();
//   } catch (error) {
//     if (error.name === 'TokenExpiredError') {
//       return res.status(401).json({ error: 'Token expired' });
//     }
//     return res.status(403).json({ error: 'Invalid token' });
//   }
// };

// // Role-based authorization middleware
// const authorizeRoles = (...allowedRoles) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({ error: 'Authentication required' });
//     }

//     if (!allowedRoles.includes(req.user.role)) {
//       return res.status(403).json({ error: 'Insufficient permissions' });
//     }

//     next();
//   };
// };

// module.exports = { authenticateToken, authorizeRoles };
// Key Features:
// Dual-token strategy: Access tokens (short-lived) and refresh tokens (long-lived)

// Security best practices:

// Environment variables for secrets

// HTTP-only cookies for refresh tokens

// Token expiration

// Proper error handling

// Flexible configuration: Configurable token expiry times

// Input validation: Validates required parameters

// Role-based access control: Built-in support for user roles

// Token verification and refresh: Complete token lifecycle management

// Security Considerations:
// Always use strong, unique secrets for JWT signing

// Store refresh tokens securely (preferably in a database)

// Implement token blacklisting for logout functionality

// Use HTTPS in production

// Consider adding additional claims to the token payload as needed

// Implement rate limiting for authentication endpoints