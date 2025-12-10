const jwt = require('jsonwebtoken');

/**
 * Generate JWT access and refresh tokens for authenticated users
 * @param {Object} user - User object from database
 * @param {string} user.id - User ID
 * @param {string} user.email - User email
 * @param {string} user.role - User role (e.g., 'admin', 'user')
 * @returns {Object} Object containing access and refresh tokens
 */
function generateAuthTokens(user) {
  // Payload for the JWT - include minimal, non-sensitive data
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  // Generate access token (short-lived)
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: '15m', // 15 minutes
      issuer: 'your-app-name',
      audience: 'your-app-users'
    }
  );

  // Generate refresh token (long-lived)
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: '7d', // 7 days
      issuer: 'your-app-name',
      audience: 'your-app-users'
    }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: 900 // 15 minutes in seconds
  };
}

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @param {string} tokenType - 'access' or 'refresh'
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
function verifyToken(token, tokenType = 'access') {
  const secret = tokenType === 'access' 
    ? process.env.JWT_ACCESS_SECRET 
    : process.env.JWT_REFRESH_SECRET;

  try {
    return jwt.verify(token, secret, {
      issuer: 'your-app-name',
      audience: 'your-app-users'
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (err.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw err;
  }
}

/**
 * Express middleware to protect routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = verifyToken(token, 'access');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: err.message });
  }
}

/**
 * Example login endpoint
 */
async function loginHandler(req, res) {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    // 1. Find user in database (pseudo-code)
    // const user = await User.findOne({ email });
    
    // 2. Verify password (pseudo-code)
    // const isValid = await bcrypt.compare(password, user.password);
    
    // Example user object (replace with actual DB query)
    const user = {
      id: '12345',
      email: email,
      role: 'user'
    };

    // 3. Generate tokens
    const tokens = generateAuthTokens(user);

    // 4. Store refresh token in database (recommended)
    // await RefreshToken.create({
    //   userId: user.id,
    //   token: tokens.refreshToken,
    //   expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    // });

    // 5. Send response
    res.json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Refresh token endpoint
 */
async function refreshTokenHandler(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  try {
    // Verify refresh token
    const decoded = verifyToken(refreshToken, 'refresh');

    // Check if refresh token exists in database (recommended)
    // const storedToken = await RefreshToken.findOne({
    //   userId: decoded.id,
    //   token: refreshToken
    // });

    // Fetch user from database
    // const user = await User.findById(decoded.id);

    // Generate new tokens
    const user = { id: decoded.id, email: 'user@example.com', role: 'user' };
    const tokens = generateAuthTokens(user);

    res.json({
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn
    });
  } catch (err) {
    return res.status(403).json({ error: err.message });
  }
}

module.exports = {
  generateAuthTokens,
  verifyToken,
  authenticateToken,
  loginHandler,
  refreshTokenHandler
};


// Key Features:

// Token Generation - Creates both access (15 min) and refresh tokens (7 days)
// Token Verification - Validates and decodes tokens with proper error handling
// Middleware Protection - Express middleware to secure routes
// Login Handler - Complete example of handling user login
// Token Refresh - Endpoint to get new access tokens

// Setup Requirements:
// bashnpm install jsonwebtoken
// Environment Variables (.env):
// envJWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
// JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
// Usage Example:
// javascriptconst express = require('express');
// const { authenticateToken, loginHandler } = require('./auth');

// const app = express();
// app.use(express.json());

// // Public route
// app.post('/login', loginHandler);

// // Protected route
// app.get('/profile', authenticateToken, (req, res) => {
//   res.json({ user: req.user });
// });
// Security Best Practices Implemented:

// Short-lived access tokens (15 minutes)
// Separate secrets for access and refresh tokens
// Minimal payload data (no sensitive info)
// Token expiration handling
// Bearer token format support