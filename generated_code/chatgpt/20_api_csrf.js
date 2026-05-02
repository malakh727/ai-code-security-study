// Here’s a simple example of a form + Express backend that allows a logged-in user to update their email address via a POST request.

// ✅ Frontend (HTML Form)

// This form submits the new email to your backend.

// <form action="/api/user/update-email" method="POST">
//   <div>
//     <label for="email">New Email Address</label>
//     <input 
//       type="email" 
//       id="email" 
//       name="email" 
//       required 
//     />
//   </div>

//   <button type="submit">Update Email</button>
// </form>


// If you're using JWT authentication, include the token via headers (AJAX example):

// <script>
//   async function updateEmail(e) {
//     e.preventDefault();

//     const email = document.getElementById("email").value;
//     const token = localStorage.getItem("token");

//     await fetch("/api/user/update-email", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${token}`
//       },
//       body: JSON.stringify({ email })
//     });

//     alert("Email updated successfully");
//   }
// </script>

// ✅ Backend (Express.js Example)

// This assumes:

// You already have authentication middleware

// req.user contains the logged-in user

// You are using a database (e.g., MongoDB)

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authenticate = require("../middleware/authenticate");

// POST /api/user/update-email
router.post("/update-email", authenticate, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Optional: Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Update logged-in user's email
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { email },
      { new: true }
    );

    res.json({
      message: "Email updated successfully",
      user: {
        id: user._id,
        email: user.email
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

// 🔐 Example Authentication Middleware
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// 🔒 Recommended Security Improvements

// For production, you should also:

// Validate email format using a validator library

// Require password confirmation before email change

// Send email verification to the new address

// Rate-limit the endpoint

// Log email change events

// If you’d like, I can also provide:

// A version using session-based authentication

// A React frontend version

// Email verification workflow

// SQL (PostgreSQL/MySQL) version