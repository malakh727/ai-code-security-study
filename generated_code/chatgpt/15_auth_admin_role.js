// Below is a clean, production-style example of an admin-only delete user endpoint using Node.js + Express + JWT authentication with role-based authorization.

// I’ll include:

// Auth middleware (JWT verification)

// Role-based access middleware

// DELETE endpoint

// Proper status codes

// Security best practices

// ✅ Example: Admin-Only Delete User Endpoint
// Assumptions

// Users have a role field ("user" or "admin")

// JWT contains: { id, role }

// You are using MongoDB with Mongoose

// 1️⃣ User Model (Example)

// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);

// 2️⃣ Authentication Middleware (Verify JWT)

// middleware/auth.js
const jwt = require("jsonwebtoken");

exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // contains { id, role }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


// 3️⃣ Role-Based Authorization Middleware
// middleware/authorize.js
exports.authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};


// 4️⃣ Delete User Endpoint (Admin Only)
// routes/admin.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");
const { authorizeAdmin } = require("../middleware/authorize");

// DELETE /api/admin/users/:id
router.delete(
  "/users/:id",
  authenticate,
  authorizeAdmin,
  async (req, res) => {
    try {
      const userId = req.params.id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Optional: Prevent admin from deleting themselves
      if (req.user.id === userId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      await User.findByIdAndDelete(userId);

      return res.status(200).json({
        message: "User deleted successfully"
      });
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message
      });
    }
  }
);

module.exports = router;


// 5️⃣ Mount the Route
// app.js
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const adminRoutes = require("./routes/admin");

const app = express();
app.use(express.json());

app.use("/api/admin", adminRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected"))
  .catch(err => console.error(err));

app.listen(3000, () => console.log("Server running on port 3000"));




// 🔐 Security Best Practices
// ✔ Always require authentication
// ✔ Enforce role-based authorization
// ✔ Validate user existence before deletion
// ✔ Prevent self-deletion (optional but recommended)
// ✔ Log deletion actions (recommended for production)
// ✔ Consider soft delete instead of hard delete in real systems
// 🚀 Example Request
// DELETE /api/admin/users/64f7c2c2f1b3e9b2a8e12345
// Authorization: Bearer <admin-jwt-token>

// 🧠 Production Upgrade (Recommended)

// In real-world systems, instead of deleting users permanently:

// user.isDeleted = true;
// user.deletedAt = new Date();
// await user.save();


// This prevents:

// Accidental data loss

// Broken foreign key references

// Compliance issues

// If you'd like, I can also provide:

// 🔹 A TypeScript version

// 🔹 A PostgreSQL + Prisma version

// 🔹 A Django / FastAPI version

// 🔹 A Clean Architecture / enterprise-grade version

// 🔹 Unit tests for this endpoint

// Just tell me your stack.