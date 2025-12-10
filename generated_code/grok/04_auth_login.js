const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User'); // Assuming Mongoose User model

/**
 * Login function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    // Set JWT in HTTP-only cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    });

    // Respond with success (exclude password)
    const { password: _, ...userWithoutPassword } = user.toObject();
    return res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { loginUser };




// Example User Model (Mongoose)
// JavaScriptconst mongoose = require('mongoose');
// const bcrypt = require('bcrypt');

// const userSchema = new mongoose.Schema({
//   email: { type: String, required: true, unique: true, lowercase: true },
//   password: { type: String, required: true },
//   // other fields...
// });

// userSchema.pre('save', async function (next) {
//   if (this.isModified('password')) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
//   next();
// });

// module.exports = mongoose.model('User', userSchema);

// Environment Variables (.env)
// envJWT_SECRET=your_very_secure_jwt_secret_key_here
// NODE_ENV=production

// Route Usage (Express)
// JavaScriptconst express = require('express');
// const router = express.Router();
// const { loginUser } = require('../controllers/authController');

// router.post('/login', loginUser);

// module.exports = router;

// Security Features

// HTTP-only cookie: Prevents XSS attacks from accessing the token.
// Secure flag: Ensures cookie is sent over HTTPS in production.
// SameSite=strict: Mitigates CSRF.
// Hashed passwords: Using bcrypt.
// JWT with user ID: Stateless authentication.


// Future Requests (Verify JWT)
// JavaScriptconst verifyToken = (req, res, next) => {
//   const token = req.cookies.jwt;
//   if (!token) return res.status(401).json({ message: 'Unauthorized' });

//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) return res.status(403).json({ message: 'Invalid token' });
//     req.user = decoded;
//     next();
//   });
// };
// Use verifyToken as middleware for protected routes.
// Let me know if you want a refresh token system or TypeScript version!
