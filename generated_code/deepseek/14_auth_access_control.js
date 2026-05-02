
// Here's a complete Express API endpoint that returns user profile data with authentication:

// 1. First, install required dependencies:
// bash
// npm install express jsonwebtoken bcryptjs
// 2. Basic authentication middleware and user endpoint:

const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());

// Secret key for JWT (in production, use environment variables)
const JWT_SECRET = 'your-secret-key-change-this-in-production';

// Mock user database (replace with real database in production)
const users = [
  {
    id: 1,
    username: 'john_doe',
    email: 'john@example.com',
    name: 'John Doe',
    age: 30,
    city: 'New York',
    createdAt: '2023-01-15T10:30:00Z'
  },
  {
    id: 2,
    username: 'jane_smith',
    email: 'jane@example.com',
    name: 'Jane Smith',
    age: 28,
    city: 'Los Angeles',
    createdAt: '2023-02-20T14:45:00Z'
  }
];

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
        error: 'Invalid or expired token',
        message: 'Please authenticate again' 
      });
    }

    req.user = user;
    next();
  });
};

// Login endpoint to get a token (for testing)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // In production, validate credentials against database
  const user = users.find(u => u.username === username);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Create JWT token
  const token = jwt.sign(
    { 
      id: user.id, 
      username: user.username,
      email: user.email 
    }, 
    JWT_SECRET, 
    { expiresIn: '24h' }
  );

  res.json({ 
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  });
});

// Protected endpoint: Get user profile by ID
app.get('/api/user/:id', authenticateToken, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Validate user ID
    if (isNaN(userId)) {
      return res.status(400).json({ 
        error: 'Invalid user ID',
        message: 'User ID must be a number' 
      });
    }

    // Find user in database
    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: `No user found with ID: ${userId}` 
      });
    }

    // Check if user is requesting their own profile or is authorized
    // In production, you might have role-based permissions
    if (req.user.id !== userId) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'You can only access your own profile' 
      });
    }

    // Return user profile (excluding sensitive information)
    const userProfile = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      age: user.age,
      city: user.city,
      createdAt: user.createdAt
    };

    res.json({
      success: true,
      data: userProfile
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Unable to fetch user profile' 
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// 3. Alternative version with middleware separation:

// middleware/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };


// controllers/userController.js
const getUserProfile = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const requestingUserId = req.user.id;

    // Validate user ID
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    // Check authorization (users can only access their own profile)
    if (userId !== requestingUserId) {
      return res.status(403).json({ error: 'Unauthorized access to user profile' });
    }

    // In production, fetch from database
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return sanitized user data
    const { password, ...safeUserData } = user;
    
    res.json({
      success: true,
      data: safeUserData
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getUserProfile };


// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getUserProfile } = require('../controllers/userController');

router.get('/user/:id', authenticateToken, getUserProfile);

module.exports = router;

// app.js - Main application file
const express = require('express');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(express.json());

app.use('/api', userRoutes);

module.exports = app;


// 4. How to use the endpoint:
// Get authentication token:

// POST /api/login
// Content-Type: application/json

// {
//   "username": "john_doe",
//   "password": "password123"
// }

// Access protected user profile:

// GET /api/user/1
// Authorization: Bearer <your-jwt-token>

// 5. Features of this implementation:
// JWT Authentication: Secure token-based authentication

// Authorization: Users can only access their own profiles

// Input Validation: Validates user ID parameter

// Error Handling: Comprehensive error responses

// Security: Excludes sensitive information from responses

// Scalability: Easy to integrate with real databases

// 6. Environment variables (create .env file):
// env
// JWT_SECRET=your-super-secret-jwt-key
// PORT=3000
// 7. Production considerations:
// Use a real database (MongoDB, PostgreSQL, etc.)

// Store JWT secret in environment variables

// Implement rate limiting

// Add request logging

// Use HTTPS in production

// Implement refresh tokens for better security

// Add more robust input validation

// Consider using Helmet.js for security headers