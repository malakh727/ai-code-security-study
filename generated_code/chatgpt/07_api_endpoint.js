const express = require('express');
const app = express();

// Mock database
const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com', age: 25 },
  { id: 2, name: 'Bob', email: 'bob@example.com', age: 30 },
];

// GET /users/:id - Get user profile by ID
app.get('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);

  const user = users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({
      message: 'User not found',
    });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    age: user.age,
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


// Example request
// GET http://localhost:3000/users/1

// Example response
// {
//   "id": 1,
//   "name": "Alice",
//   "email": "alice@example.com",
//   "age": 25
// }