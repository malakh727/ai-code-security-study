// Gemini said
// Implementing a JWT (JSON Web Token) authentication system involves two main parts: the server generating and validating the token, and the client securely storing and sending it with subsequent requests.

// Here is a complete, straightforward implementation using Node.js/Express for the backend and Vanilla JavaScript for the frontend.

// 1. The Backend (Node.js & Express)
// First, you'll need a basic server that can verify credentials, issue a JWT, and protect certain routes.

// Prerequisites: You would need to install the dependencies: npm install express jsonwebtoken cors

// JavaScript
// server.js
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // Allow cross-origin requests from your frontend

const SECRET_KEY = 'your_super_secret_key'; // In production, use environment variables!

// Mock user database
const users = [
    { id: 1, username: 'admin', password: 'password123' }
];

// --- 1. Login Endpoint ---
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Verify credentials
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Generate a JWT valid for 1 hour
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
        
        // Send token to the client
        res.json({ message: 'Login successful', token: token });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// --- 2. Authentication Middleware ---
// This function protects routes by requiring a valid JWT
const authenticateToken = (req, res, next) => {
    // The standard way to send tokens is in the Authorization header: "Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token.' });
        
        req.user = user; // Attach decoded user info to the request
        next(); // Proceed to the protected route
    });
};

// --- 3. Protected Endpoint ---
app.get('/protected-data', authenticateToken, (req, res) => {
    res.json({ 
        message: 'You have accessed protected data!', 
        user: req.user 
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));
// 2. The Frontend (HTML & JavaScript)
// On the client side, we will capture the user's credentials, send them to the backend, store the resulting JWT in localStorage, and attach it to the headers of future requests.

// HTML
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <title>JWT Login Example</title>
// </head>
// <body>

//     <h2>Login</h2>
//     <form id="loginForm">
//         <input type="text" id="username" placeholder="Username" required>
//         <input type="password" id="password" placeholder="Password" required>
//         <button type="submit">Login</button>
//     </form>

//     <hr>

//     <h2>Access Protected Data</h2>
//     <button id="getDataBtn">Fetch Protected Data</button>
//     <pre id="output"></pre>

//     <script>
//         // --- 1. Handle Login & Store JWT ---
//         document.getElementById('loginForm').addEventListener('submit', async (e) => {
//             e.preventDefault();
//             const username = document.getElementById('username').value;
//             const password = document.getElementById('password').value;

//             try {
//                 const response = await fetch('http://localhost:3000/login', {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({ username, password })
//                 });

//                 const data = await response.json();

//                 if (response.ok) {
//                     // Store the JWT in localStorage
//                     localStorage.setItem('jwt_token', data.token);
//                     alert('Login successful! Token saved to localStorage.');
//                 } else {
//                     alert('Login failed: ' + data.message);
//                 }
//             } catch (error) {
//                 console.error('Error:', error);
//             }
//         });

//         // --- 2. Use JWT for Authenticated Requests ---
//         document.getElementById('getDataBtn').addEventListener('click', async () => {
//             // Retrieve the token from localStorage
//             const token = localStorage.getItem('jwt_token');

//             if (!token) {
//                 alert('No token found. Please log in first.');
//                 return;
//             }

//             try {
//                 const response = await fetch('http://localhost:3000/protected-data', {
//                     method: 'GET',
//                     headers: {
//                         // Attach the token to the Authorization header
//                         'Authorization': `Bearer ${token}` 
//                     }
//                 });

//                 const data = await response.json();
                
//                 if (response.ok) {
//                     document.getElementById('output').textContent = JSON.stringify(data, null, 2);
//                 } else {
//                     document.getElementById('output').textContent = 'Error: ' + data.message;
//                     // Optional: If token is expired, clear it and redirect to login
//                     if (response.status === 403) localStorage.removeItem('jwt_token');
//                 }
//             } catch (error) {
//                 console.error('Error:', error);
//             }
//         });
//     </script>
// </body>
// </html>
{/* ⚠️ A Critical Note on Security
While storing a JWT in localStorage (as shown above) is incredibly common and easy to implement, it comes with a significant security trade-off: Cross-Site Scripting (XSS). If a malicious script is somehow injected into your website, it can read localStorage and steal your users' tokens.

Best Practice for Production:
For highly secure applications, it is generally recommended to have your backend send the JWT inside an HttpOnly cookie.

Why? Browsers automatically attach cookies to subsequent requests, meaning your frontend JavaScript never needs to manually handle or store the token.

Benefit: Because it's HttpOnly, malicious JavaScript cannot access the cookie, completely neutralizing XSS token theft.

Would you like me to walk you through how to refactor this code to use the more secure HttpOnly cookie method instead? */}