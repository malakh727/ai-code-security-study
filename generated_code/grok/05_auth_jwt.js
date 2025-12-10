const jwt = require('jsonwebtoken');

/**
 * Generates a JWT token for authenticated user
 * @param {Object} user - User object containing at least user ID
 * @param {string} secret - JWT secret key
 * @param {string|number} expiresIn - Token expiration time (e.g., '1h', '24h', 3600)
 * @returns {Object} - Object containing token and expiration info
 */
function generateAuthToken(user, secret, expiresIn = '24h') {
  // Validate required parameters
  if (!user || !user.id) {
    throw new Error('User object must contain an id property');
  }
  
  if (!secret) {
    throw new Error('JWT secret is required');
  }

  // Define the payload (avoid putting sensitive data like passwords)
  const payload = {
    sub: user.id,                    // Subject (user ID)
    iat: Math.floor(Date.now() / 1000), // Issued at time
    name: user.name || user.username || '',
    email: user.email || '',
    role: user.role || 'user'
  };

  // Generate the JWT token
  const token = jwt.sign(payload, secret, { 
    expiresIn: expiresIn,
    algorithm: 'HS256'
  });

  // Calculate expiration timestamp
  let expiresAt;
  if (typeof expiresIn === 'number') {
    expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
  } else {
    const duration = parseDuration(expiresIn);
    expiresAt = Math.floor(Date.now() / 1000) + duration;
  }

  return {
    token: token,
    expiresIn: expiresIn,
    expiresAt: expiresAt,
    tokenType: 'Bearer'
  };
}

/**
 * Helper function to parse duration strings like '1h', '30m', '2d'
 */
function parseDuration(duration) {
  const regex = /^(\d+)([smhd])$/;
  const match = duration.toLowerCase().match(regex);
  
  if (!match) return 3600; // default to 1 hour
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 3600;
    case 'd': return value * 86400;
    default: return 3600;
  }
}

// Example usage:
/*
const user = {
  id: 123,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin'
};

try {
  const authData = generateAuthToken(
    user, 
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
    '2h'
  );
  
  console.log('Token generated:', authData);
  // Use authData.token in Authorization header: Bearer <token>
} catch (error) {
  console.error('Token generation failed:', error.message);
}
*/

module.exports = { generateAuthToken };






// Installation Requirements
// First, install the required dependency:
// Bashnpm install jsonwebtoken
// Environment Setup
// Add your JWT secret to your .env file:
// envJWT_SECRET=your-super-secret-jwt-key-here-minimum-32-characters
// JWT_EXPIRES_IN=24h
// Key Features

// Secure payload with essential user claims
// Configurable expiration time
// Proper error handling
// Returns complete auth response with metadata
// Helper function to parse duration strings
// Uses HS256 algorithm (recommended for symmetric keys)

// Usage in Login Route
// JavaScriptapp.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
    
//     // Validate credentials (your authentication logic here)
//     const user = await validateUserCredentials(email, password);
    
//     if (!user) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }
    
//     // Generate JWT token
//     const authData = generateAuthToken(
//       user,
//       process.env.JWT_SECRET,
//       process.env.JWT_EXPIRES_IN || '24h'
//     );
    
//     res.json({
//       message: 'Login successful',
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       },
//       ...authData
//     });
    
//   } catch (error) {
//     res.status(500).json({ error: 'Login failed' });
//   }
// });
// The token should be sent in the Authorization header for protected routes:
// textAuthorization: Bearer <your-jwt-token-here>
// Security Best Practices:

// Use a strong, random secret key (minimum 32 characters)
// Store secret in environment variables
// Use HTTPS in production
// Set appropriate token expiration
// Never include sensitive data in the payload