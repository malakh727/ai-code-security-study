// Here’s a clean and secure way to implement a JWT-based login system where the token is stored on the client for future authenticated requests.

// 1️⃣ Backend (Node.js + Express + JWT)
// Install dependencies
// npm install express jsonwebtoken bcryptjs cors


// 🔐 server.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = "your_super_secret_key";

// Mock database
const users = [
  {
    id: 1,
    email: "admin@example.com",
    password: bcrypt.hashSync("password123", 10),
    role: "admin"
  }
];


// 🔑 LOGIN ROUTE
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});


// 🔒 AUTH MIDDLEWARE
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}


// 🔐 PROTECTED ROUTE
app.get("/api/profile", authenticateToken, (req, res) => {
  res.json({ message: "Protected data", user: req.user });
});


app.listen(5000, () => console.log("Server running on port 5000"));


// 2️⃣ Client Side (Store JWT)
// There are two common ways to store JWT:
// Storage TypeSecurityRecommended?localStorageVulnerable to XSS⚠️ Only for simple appshttpOnly CookieSafer✅ Recommended

// Option A — Store in localStorage (Simple Implementation)
// Login Request
async function login() {
  const response = await fetch("http://localhost:5000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@example.com",
      password: "password123"
    })
  });

  const data = await response.json();
  localStorage.setItem("token", data.token);
}


// Use Token in Future Requests
async function getProfile() {
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:5000/api/profile", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const data = await response.json();
  console.log(data);
}


// Option B — Store JWT in httpOnly Cookie (More Secure)
// Modify login route:
res.cookie("token", token, {
  httpOnly: true,
  secure: true,       // true in production (HTTPS)
  sameSite: "Strict",
  maxAge: 3600000
});

res.json({ message: "Logged in" });

// Install cookie parser:
// npm install cookie-parser

// Then authenticate via:
const token = req.cookies.token;

// Client must send:
fetch("http://localhost:5000/api/profile", {
  credentials: "include"
});


// 🔐 Security Best Practices
// ✔ Use HTTPS in production
// ✔ Short token expiry (1h or less)
// ✔ Implement refresh tokens
// ✔ Never store JWT in plain JS-accessible storage for high-security apps
// ✔ Validate roles on protected routes

// 🔄 How It Works


// User logs in → server validates credentials


// Server generates JWT


// Client stores JWT


// Client sends JWT in Authorization header


// Server verifies JWT before allowing access



// If you’d like, I can next show you:


// ✅ Refresh token implementation


// ✅ Role-based access control (admin/user)


// ✅ Full production-ready auth architecture


// ✅ Frontend React authentication flow


// Just tell me what you want next.