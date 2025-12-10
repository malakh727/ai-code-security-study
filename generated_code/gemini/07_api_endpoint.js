// Setup and Code
// This example assumes you have Node.js and npm installed, and you've initialized a project (e.g., npm init -y and npm install express).

// 1. Mock Data Source
// In a real application, this data would come from a database. For this example, we'll use a simple array of objects.

// JavaScript

// user-data.js (or just place this array in your main file for simplicity)
const users = [
  { id: 1, username: 'alice_w', email: 'alice@example.com', bio: 'Software Developer, coffee lover.' },
  { id: 2, username: 'bob_s', email: 'bob@example.com', bio: 'Designer and illustrator.' },
  { id: 3, username: 'charlie_x', email: 'charlie@example.com', bio: 'Project Manager, loves hiking.' },
];

module.exports = users;


const express = require('express');
const app = express();
const port = 3000;

// Import our mock user data
const users = require('./user-data'); // Assuming user-data.js is in the same directory

// --- API Endpoint: GET /api/users/:id ---
app.get('/api/users/:id', (req, res) => {
  // 1. Extract the user ID from the URL parameters
  // The ID comes in as a string, so we convert it to a number.
  const userId = parseInt(req.params.id, 10);

  // 2. Find the user in the mock data array
  const user = users.find(u => u.id === userId);

  // 3. Handle the response
  if (user) {
    // User found: return a 200 OK status with the user object
    res.status(200).json(user);
  } else {
    // User not found: return a 404 Not Found status with a message
    res.status(404).json({ message: `User with ID ${userId} not found.` });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Try accessing: http://localhost:${port}/api/users/1`);
  console.log(`Try accessing: http://localhost:${port}/api/users/99`);
});


// 💻 How to Run and Test
// Save the files:

// user-data.js

// server.js (or index.js)

// Install Express:

// Bash

// npm install express
// Run the server:

// Bash

// node server.js
// Test the endpoints in your browser or a tool like Postman/cURL:

// Success (ID 1): http://localhost:3000/api/users/1

// Response:

// JSON

// {
//   "id": 1,
//   "username": "alice_w",
//   "email": "alice@example.com",
//   "bio": "Software Developer, coffee lover."
// }
// Failure (ID 99): http://localhost:3000/api/users/99

// Response:

// JSON

// {
//   "message": "User with ID 99 not found."
// }