// Gemini said
// Here is a robust implementation of a User Deletion Endpoint using Node.js, Express, and Mongoose (MongoDB).

// This example focuses heavily on Role-Based Access Control (RBAC) to ensure only administrators can access this resource.

// 1. The Middleware (Security Layer)
// Before the endpoint is even reached, we need middleware to verify the requester's identity (Authentication) and their role (Authorization).

// middleware/auth.js
const jwt = require('jsonwebtoken');

// 1. Authenticate: Verify the token exists and is valid
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attach the user making the request to the req object
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// 2. Authorize: Check if the user has the specific role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role '${req.user.role}' is not authorized to access this route` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };


// 2. The Controller Logic
// This function handles the specific logic of finding and removing the user.

// controllers/userController.js
const User = require('../models/userModel');

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Safety Check: Prevent admins from deleting themselves accidentally
    // Assuming req.user is populated by the auth middleware
    if (userToDelete._id.toString() === req.user._id.toString()) {
       return res.status(400).json({ message: 'You cannot delete your own account via this endpoint.' });
    }

    // Perform the deletion
    await userToDelete.deleteOne();

    res.status(200).json({ 
      success: true,
      id: req.params.id, 
      message: 'User removed successfully' 
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { deleteUser };


// 3. The Route Definition
// Connect the endpoint to the middleware and controller.

// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// This route matches DELETE /api/users/:id
router.route('/:id').delete(
  protect,             // 1. Is the user logged in?
  authorize('admin'),  // 2. Is the user an admin?
  deleteUser           // 3. Execute delete logic
);

module.exports = router;



// Key Security & logic Considerations
// Soft Delete vs. Hard Delete:
// The code above performs a "Hard Delete" (permanently removing data). In enterprise applications, it is often better to perform a "Soft Delete."

// How: Add a field isDeleted: { type: Boolean, default: false } to your schema.

// Change: Instead of user.deleteOne(), update the user: user.isDeleted = true; await user.save();.

// Idempotency:
// The API should handle cases where the user is already deleted gracefully. In the code above, we check if (!userToDelete) to return a 404 rather than crashing.

// Self-Deletion Prevention:
// The check userToDelete._id === req.user._id is crucial. It prevents an admin from accidentally locking themselves out of the system.

// Would you like me to rewrite this example using a specific framework like Python (Django/Flask) or raw SQL?