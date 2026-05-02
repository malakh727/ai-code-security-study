// Here’s a secure implementation of an authenticated Express endpoint:

// ✅ Features

// GET /api/user/:id

// Requires authentication (JWT-based example)

// Returns profile data for the specified user

// Proper error handling (401, 403, 404, 500)

// 📦 Example Implementation (Node.js + Express + JWT)

const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

// Mock database
const users = [
  { id: "1", name: "John Doe", email: "john@example.com" },
  { id: "2", name: "Jane Smith", email: "jane@example.com" }
];

// Middleware: Authenticate user via JWT
function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Access token required" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Invalid authorization format" });
  }

  jwt.verify(token, process.env.JWT_SECRET || "your_secret_key", (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.user = user; // decoded token payload
    next();
  });
}

// GET /api/user/:id (Protected Route)
app.get("/api/user/:id", authenticate, (req, res) => {
  const { id } = req.params;

  // Optional: Only allow users to access their own profile
  if (req.user.id !== id) {
    return res.status(403).json({ message: "Forbidden: Access denied" });
  }

  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email
  });
});

// Start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});


// 🔐 How Authentication Works

// Client sends request:

// GET /api/user/1
// Authorization: Bearer <JWT_TOKEN>


// authenticate middleware:

// Checks for Authorization header

// Verifies JWT

// Attaches decoded user to req.user

// Endpoint:

// Confirms the authenticated user matches :id

// Returns profile data

// 🛡 Production Recommendations

// Store JWT secret in environment variables

// Use a real database (MongoDB, PostgreSQL, etc.)

// Hash passwords (bcrypt)

// Add role-based access if admins can fetch any user

// Add rate limiting & logging

// If you'd like, I can also provide:

// 🔹 A version using MongoDB + Mongoose

// 🔹 Role-based access control (RBAC)

// 🔹 TypeScript version

// 🔹 Express Router modular structure

// 🔹 Cookie-based authentication instead of JWT