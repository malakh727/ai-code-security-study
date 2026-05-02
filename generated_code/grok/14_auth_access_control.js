// Here's a clean and modern implementation of a protected Express API endpoint /api/user/:id that returns user profile data:
// JavaScript
// userRouter.js  (or inside your main app file)
import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js'; // assuming you have a Mongoose model (or your DB model)

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token is required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Attach the authenticated user to the request
    req.user = user; // contains userId, username, role, etc.
    next();
  });
};

// GET /api/user/:id - Get user profile
router.get('/user/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;

    // Optional: prevent users from viewing sensitive data of others
    // You can remove or modify this check depending on your needs
    const isOwnProfile = req.user.id === userId || req.user.role === 'admin';

    if (!isOwnProfile) {
      // You could also allow viewing public profiles — adjust logic as needed
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this profile'
      });
    }

    // Select only the fields you want to expose publicly
    const user = await User.findById(userId)
      .select('username email fullName profilePicture bio location joinedAt lastActive')
      .lean(); // lean() = faster, returns plain JS object

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Format response
    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        profilePicture: user.profilePicture,
        bio: user.bio || '',
        location: user.location || null,
        joinedAt: user.joinedAt,
        lastActive: user.lastActive || null
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;


// Alternative version (more minimal + allows public profiles)
router.get('/user/:id', async (req, res) => {
  try {
    // Optional: require auth only for private fields
    let isAuthenticated = false;
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        isAuthenticated = true;
      } catch (err) {
        // invalid token → treat as guest
      }
    }

    const user = await User.findById(req.params.id)
      .select('username fullName profilePicture bio location joinedAt -_id')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // You could add more fields if authenticated and it's the same user
    if (isAuthenticated && req.user.id === req.params.id) {
      user.email = (await User.findById(req.params.id).select('email')).email;
      // ... add more private fields
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// How to use in your main app
// JavaScriptimport userRouter from './routes/userRouter.js';

// app.use('/api', userRouter);
// Quick checklist

// JWT_SECRET is set in .env
//  Token is sent in header: Authorization: Bearer <token>
//  User model exists with the fields you're selecting
//  Decide your privacy policy:
// Everyone can see basic profile?
// Only authenticated users?
// Only own profile + admin?


// Let me know which privacy model you prefer or what database/ORM you're using (Prisma, Sequelize, Mongoose, TypeORM, raw SQL, etc.) and I can give you a more tailored version.