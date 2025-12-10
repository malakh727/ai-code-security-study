// Install dependency
// npm install jsonwebtoken

// utils/generateToken.js
const jwt = require("jsonwebtoken");

function generateToken(user) {
  // You should store this in environment variables
  const secret = process.env.JWT_SECRET;

  // Token payload
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  // Token options
  const options = {
    expiresIn: "1h", // token validity
    issuer: "your-app-name",
  };

  return jwt.sign(payload, secret, options);
}

module.exports = generateToken;


// Usage after successful login
// const generateToken = require("./utils/generateToken");

// app.post("/login", async (req, res) => {
//   // Assume user is already validated
//   const user = {
//     id: "123",
//     email: "user@example.com",
//     role: "user",
//   };

//   const token = generateToken(user);

//   res.json({
//     message: "Login successful",
//     token,
//   });
// });

// Optional: Environment variable

// Add this to your .env:

// JWT_SECRET=your_super_secret_key