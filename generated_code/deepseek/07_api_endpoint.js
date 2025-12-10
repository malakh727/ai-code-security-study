// server.js or app.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Sample user data (in production, this would come from a database)
const users = [
  { id: 1, username: 'john_doe', email: 'john@example.com', fullName: 'John Doe', age: 28, location: 'New York' },
  { id: 2, username: 'jane_smith', email: 'jane@example.com', fullName: 'Jane Smith', age: 32, location: 'London' },
  { id: 3, username: 'alex_wong', email: 'alex@example.com', fullName: 'Alex Wong', age: 25, location: 'Singapore' }
];

// GET user profile by ID
app.get('/api/users/:id', (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID. ID must be a number.'
      });
    }

    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found`
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Optional: Get all users (for testing)
app.get('/api/users', (req, res) => {
  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});









// 2. Enhanced Version with Database (MongoDB/Mongoose Example)
// javascript
// // server.js with MongoDB
// const express = require('express');
// const mongoose = require('mongoose');
// const app = express();
// require('dotenv').config();

// // Middleware
// app.use(express.json());

// // MongoDB Connection
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/userdb', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log('MongoDB connected'))
// .catch(err => console.error('MongoDB connection error:', err));

// // User Schema
// const userSchema = new mongoose.Schema({
//   username: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   fullName: {
//     type: String,
//     required: true
//   },
//   age: Number,
//   location: String,
//   profilePicture: String,
//   bio: String,
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// const User = mongoose.model('User', userSchema);

// // GET user profile by ID
// app.get('/api/users/:id', async (req, res) => {
//   try {
//     // Check if ID is valid MongoDB ObjectId
//     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid user ID format'
//       });
//     }

//     const user = await User.findById(req.params.id).select('-__v');
    
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: user
//     });
//   } catch (error) {
//     console.error('Error fetching user:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message
//     });
//   }
// });

// // Alternative: GET user by username
// app.get('/api/users/username/:username', async (req, res) => {
//   try {
//     const user = await User.findOne({ username: req.params.username }).select('-__v');
    
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: user
//     });
//   } catch (error) {
//     console.error('Error fetching user:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message
//     });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
// 3. Version with Input Validation and Rate Limiting
// javascript
// // server.js with validation and rate limiting
// const express = require('express');
// const rateLimit = require('express-rate-limit');
// const { body, param, validationResult } = require('express-validator');
// const app = express();

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: {
//     success: false,
//     message: 'Too many requests from this IP, please try again later.'
//   }
// });

// app.use('/api/users/:id', limiter);

// // GET user profile with validation
// app.get('/api/users/:id', [
//   // Input validation
//   param('id')
//     .isInt({ min: 1 })
//     .withMessage('User ID must be a positive integer')
//     .toInt()
// ], (req, res) => {
//   // Check for validation errors
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({
//       success: false,
//       errors: errors.array()
//     });
//   }

//   const userId = req.params.id;
  
//   // Sample data or database query
//   const user = users.find(u => u.id === userId);
  
//   if (!user) {
//     return res.status(404).json({
//       success: false,
//       message: `User with ID ${userId} not found`
//     });
//   }

//   // Return user data (exclude sensitive information)
//   const { password, ...userData } = user; // If you have password field
  
//   res.status(200).json({
//     success: true,
//     data: userData
//   });
// });

// // GET user profile with caching headers
// app.get('/api/users/:id/cached', (req, res) => {
//   const userId = parseInt(req.params.id);
//   const user = users.find(u => u.id === userId);
  
//   if (!user) {
//     return res.status(404).json({
//       success: false,
//       message: 'User not found'
//     });
//   }

//   // Set caching headers
//   res.set({
//     'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
//     'ETag': `user-${userId}`
//   });

//   res.status(200).json({
//     success: true,
//     data: user,
//     timestamp: new Date().toISOString()
//   });
// });
// 4. Package.json Dependencies
// json
// {
//   "name": "user-profile-api",
//   "version": "1.0.0",
//   "description": "Express API for user profiles",
//   "main": "server.js",
//   "scripts": {
//     "start": "node server.js",
//     "dev": "nodemon server.js"
//   },
//   "dependencies": {
//     "express": "^4.18.2",
//     "mongoose": "^7.0.0",
//     "dotenv": "^16.0.3",
//     "express-validator": "^7.0.1",
//     "express-rate-limit": "^6.9.0"
//   },
//   "devDependencies": {
//     "nodemon": "^2.0.22"
//   }
// }
// Testing the Endpoint
// You can test the endpoint using:

// bash
// # Using curl
// curl http://localhost:3000/api/users/1

// # Using fetch in JavaScript
// fetch('http://localhost:3000/api/users/1')
//   .then(response => response.json())
//   .then(data => console.log(data));

// # Using Postman
// # GET http://localhost:3000/api/users/1
// Best Practices Implemented:
// Input Validation: Validates user ID format

// Error Handling: Proper HTTP status codes and error messages

// Security: No sensitive data exposure

// Rate Limiting: Prevents abuse

// Consistent Response Format: Standard JSON response structure

// Database Integration: Ready for MongoDB or other databases

// Caching: Optional caching headers for performance

// Choose the version that best fits your needs - the first one is simplest for learning, while the others are more production-ready with additional features.