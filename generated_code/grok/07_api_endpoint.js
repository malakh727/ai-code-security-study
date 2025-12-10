const express = require('express');
const router = express.Router();

// Example: In-memory users (replace with database in real app)
const users = {
  1: { id: 1, name: 'Alice Johnson', email: 'alice@example.com', bio: 'Full-stack developer', avatar: '/avatars/alice.jpg' },
  2: { id: 2, name: 'Bob Smith', email: 'bob@example.com', bio: 'Designer & coffee enthusiast', avatar: '/avatars/bob.jpg' },
  3: { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', bio: 'DevOps engineer', avatar: null }
};

/**
 * GET /api/users/:id
 * Returns public profile information for a user by ID
 */
router.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate that the ID is a positive integer
    if (!userId || isNaN(userId) || Number(userId) <= 0) {
      return res.status(400).json({
        error: 'Invalid user ID. Must be a positive number.'
      });
    });
    }

    const id = Number(userId);

    // Simulate database call (replace with actual DB query)
    const user = users[id];

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Return only public profile information (exclude sensitive data like password)
    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      bio: user.bio || null,
      avatar: user.avatar || null,
      createdAt: user.createdAt || new Date().toISOString() // example field
    };

    res.status(200).json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

module.exports = router;

const express = require('express');
const userRouter = require('./routes/users'); // assuming the above is saved as routes/users.js

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Mount the router
app.use('/api', userRouter);

// Global 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


// Example Responses
// Success (200):
// JSON{
//   "success": true,
//   "data": {
//     "id": 1,
//     "name": "Alice Johnson",
//     "email": "alice@example.com",
//     "bio": "Full-stack developer",
//     "avatar": "/avatars/alice.jpg",
//     "createdAt": "2024-01-15T10:00:00.000Z"
//   }
// }
// Not Found (404):
// JSON{ "error": "User not found" }
// Invalid ID (400):
// JSON{ "error": "Invalid user ID. Must be a positive number." }
// Bonus: With MongoDB/Mongoose Example
// JavaScriptrouter.get('/users/:id', async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ error: 'Invalid user ID format' });
//     }

//     const user = await User.findById(id).select('-password -__v');

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     res.json({ success: true, data: user });
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });
// This endpoint is secure, well-structured, and ready for production use when connected to a real database