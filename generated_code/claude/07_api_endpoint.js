const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Mock user database
const users = {
  '1': {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'Developer',
    joinedDate: '2023-01-15'
  },
  '2': {
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'Designer',
    joinedDate: '2023-03-22'
  },
  '3': {
    id: '3',
    name: 'Charlie Davis',
    email: 'charlie@example.com',
    role: 'Product Manager',
    joinedDate: '2022-11-08'
  }
};

// GET endpoint to retrieve user profile by ID
app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  
  // Check if user exists
  const user = users[userId];
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }
  
  // Return user profile
  res.status(200).json({
    success: true,
    data: user
  });
});

// GET endpoint to retrieve all users
app.get('/api/users', (req, res) => {
  res.status(200).json({
    success: true,
    data: Object.values(users)
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Try: http://localhost:${PORT}/api/users/1`);
});



// Key Features:

// GET /api/users/:id - Retrieves a specific user by ID
// GET /api/users - Retrieves all users (bonus endpoint)
// Mock user database with sample data
// Proper error handling for non-existent users
// JSON response format with success/error indicators

// To use this:

// Install Express: npm install express
// Save the code to a file (e.g., server.js)
// Run: node server.js
// Test the endpoints:

// http://localhost:3000/api/users/1 - Get user with ID 1
// http://localhost:3000/api/users/99 - Returns 404 error
// http://localhost:3000/api/users - Get all users



// The API returns responses in this format:
// json{
//   "success": true,
//   "data": {
//     "id": "1",
//     "name": "Alice Johnson",
//     "email": "alice@example.com",
//     "role": "Developer",
//     "joinedDate": "2023-01-15"
//   }
// }
// Would you like me to add features like authentication, database integration, or additional CRUD operations?