// I'll help you implement a JWT-based login system with client-side token storage. Here's a complete example using Node.js/Express for the backend and JavaScript for the frontend.

// Backend Implementation (Node.js/Express)
// 1. Install required dependencies
// bash
// npm install express jsonwebtoken bcryptjs cors dotenv
// 2. Server Setup (server.js)
// javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// In-memory user storage (replace with database in production)
const users = [];

// JWT secret key (store in .env file)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRES_IN = '24h';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Registration endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword
    };

    users.push(user);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Protected route example
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Another protected route
app.get('/api/dashboard', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Welcome to dashboard!',
    user: req.user,
    data: ['item1', 'item2', 'item3']
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// Frontend Implementation
// 1. Create auth service (auth.js)
// javascript
// auth.js - Authentication service
class AuthService {
  constructor() {
    this.tokenKey = 'jwt_token';
    this.userKey = 'user_data';
    this.apiUrl = 'http://localhost:3000/api';
  }

  // Store token and user data
  setSession(token, user) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  // Get stored token
  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  // Get stored user data
  getUser() {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  }

  // Clear session (logout)
  clearSession() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  // Register new user
  async register(userData) {
    try {
      const response = await fetch(`${this.apiUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      this.setSession(data.token, data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Login user
  async login(credentials) {
    try {
      const response = await fetch(`${this.apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      this.setSession(data.token, data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Logout user
  logout() {
    this.clearSession();
  }

  // Make authenticated API request
  async fetchWithAuth(url, options = {}) {
    const token = this.getToken();
    
    if (!token) {
      throw new Error('No authentication token');
    }

    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    };

    const fetchOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };

    try {
      const response = await fetch(`${this.apiUrl}${url}`, fetchOptions);
      
      if (response.status === 401 || response.status === 403) {
        this.clearSession(); // Token expired or invalid
        throw new Error('Session expired');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Create and export auth service instance
const authService = new AuthService();
// 2. Create login component (login.js)
// javascript
// login.js - Login form handler
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const logoutBtn = document.getElementById('logoutBtn');
  const profileBtn = document.getElementById('profileBtn');

  // Check if user is already logged in
  if (authService.isAuthenticated()) {
    showAuthenticatedUI(authService.getUser());
  }

  // Login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;

      const result = await authService.login({ email, password });
      
      if (result.success) {
        showNotification('Login successful!', 'success');
        showAuthenticatedUI(result.user);
        loginForm.reset();
      } else {
        showNotification(result.error, 'error');
      }
    });
  }

  // Register form submission
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('registerUsername').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;

      const result = await authService.register({ username, email, password });
      
      if (result.success) {
        showNotification('Registration successful!', 'success');
        showAuthenticatedUI(result.user);
        registerForm.reset();
      } else {
        showNotification(result.error, 'error');
      }
    });
  }

  // Logout button
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      authService.logout();
      showUnauthenticatedUI();
      showNotification('Logged out successfully', 'success');
    });
  }

  // Profile button - fetch protected data
  if (profileBtn) {
    profileBtn.addEventListener('click', async () => {
      const result = await authService.fetchWithAuth('/profile');
      
      if (result.success) {
        displayProfileData(result.data.user);
      } else {
        showNotification(result.error, 'error');
        if (result.error === 'Session expired') {
          showUnauthenticatedUI();
        }
      }
    });
  }

  // UI helper functions
  function showAuthenticatedUI(user) {
    document.getElementById('authForms').style.display = 'none';
    document.getElementById('authenticatedContent').style.display = 'block';
    document.getElementById('userDisplay').textContent = `Welcome, ${user.username || user.email}!`;
  }

  function showUnauthenticatedUI() {
    document.getElementById('authForms').style.display = 'block';
    document.getElementById('authenticatedContent').style.display = 'none';
    document.getElementById('profileData').innerHTML = '';
  }

  function displayProfileData(user) {
    const profileDiv = document.getElementById('profileData');
    profileDiv.innerHTML = `
      <h3>Profile Information</h3>
      <p><strong>ID:</strong> ${user.id}</p>
      <p><strong>Username:</strong> ${user.username}</p>
      <p><strong>Email:</strong> ${user.email}</p>
    `;
  }

  function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
});
// 3. Create HTML template (index.html)
// html
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>JWT Authentication Demo</title>
//     <style>
//         body {
//             font-family: Arial, sans-serif;
//             max-width: 800px;
//             margin: 0 auto;
//             padding: 20px;
//         }
//         .container {
//             background: #f5f5f5;
//             padding: 20px;
//             border-radius: 8px;
//             margin-top: 20px;
//         }
//         .form-group {
//             margin-bottom: 15px;
//         }
//         label {
//             display: block;
//             margin-bottom: 5px;
//             font-weight: bold;
//         }
//         input {
//             width: 100%;
//             padding: 8px;
//             border: 1px solid #ddd;
//             border-radius: 4px;
//             box-sizing: border-box;
//         }
//         button {
//             background: #007bff;
//             color: white;
//             border: none;
//             padding: 10px 20px;
//             border-radius: 4px;
//             cursor: pointer;
//             margin-right: 10px;
//         }
//         button:hover {
//             background: #0056b3;
//         }
//         .logout-btn {
//             background: #dc3545;
//         }
//         .logout-btn:hover {
//             background: #c82333;
//         }
//         .notification {
//             position: fixed;
//             top: 20px;
//             right: 20px;
//             padding: 10px 20px;
//             border-radius: 4px;
//             color: white;
//             animation: slideIn 0.3s ease;
//         }
//         .notification.success {
//             background: #28a745;
//         }
//         .notification.error {
//             background: #dc3545;
//         }
//         @keyframes slideIn {
//             from {
//                 transform: translateX(100%);
//                 opacity: 0;
//             }
//             to {
//                 transform: translateX(0);
//                 opacity: 1;
//             }
//         }
//         #authForms {
//             display: flex;
//             gap: 20px;
//         }
//         .form-container {
//             flex: 1;
//             background: white;
//             padding: 20px;
//             border-radius: 8px;
//         }
//         #profileData {
//             background: white;
//             padding: 15px;
//             border-radius: 4px;
//             margin-top: 15px;
//         }
//     </style>
// </head>
// <body>
//     <h1>JWT Authentication Demo</h1>
    
//     {/* <!-- Auth Forms (shown when not logged in) --> */}
//     <div id="authForms" class="container">
//         <div class="form-container">
//             <h2>Login</h2>
//             <form id="loginForm">
//                 <div class="form-group">
//                     <label for="loginEmail">Email:</label>
//                     <input type="email" id="loginEmail" required>
//                 </div>
//                 <div class="form-group">
//                     <label for="loginPassword">Password:</label>
//                     <input type="password" id="loginPassword" required>
//                 </div>
//                 <button type="submit">Login</button>
//             </form>
//         </div>

//         <div class="form-container">
//             <h2>Register</h2>
//             <form id="registerForm">
//                 <div class="form-group">
//                     <label for="registerUsername">Username:</label>
//                     <input type="text" id="registerUsername" required>
//                 </div>
//                 <div class="form-group">
//                     <label for="registerEmail">Email:</label>
//                     <input type="email" id="registerEmail" required>
//                 </div>
//                 <div class="form-group">
//                     <label for="registerPassword">Password:</label>
//                     <input type="password" id="registerPassword" required>
//                 </div>
//                 <button type="submit">Register</button>
//             </form>
//         </div>
//     </div>

//     {/* <!-- Authenticated Content (shown when logged in) --> */}
//     <div id="authenticatedContent" class="container" style="display: none;">
//         <h2 id="userDisplay"></h2>
//         <button id="profileBtn">View Profile</button>
//         <button id="logoutBtn" class="logout-btn">Logout</button>
        
//         <div id="profileData"></div>
//     </div>

//     <script src="auth.js"></script>
//     <script src="login.js"></script>
// </body>
// </html>
{/* Key Features of This Implementation:
JWT Generation: Tokens are created on successful login/registration

Client-side Storage: JWT stored in localStorage

Token Authentication: Bearer token sent in Authorization header

Protected Routes: Server validates JWT for protected endpoints

Auto-logout: Clears session when token expires

Error Handling: Proper error messages for various scenarios

Security Considerations:
Use HTTPS in production

Store JWT secret in environment variables

Set short token expiration times

Consider using httpOnly cookies for better security (alternative to localStorage)

Implement token refresh mechanism

Add rate limiting for login attempts

Use database instead of in-memory storage

This implementation provides a solid foundation for JWT-based authentication that you can extend based on your specific requirements. */}