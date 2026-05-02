// Here's a clean, modern implementation of a login system using JWT stored on the client side (2025–2026 best practices).
// I'll show a complete but minimal example with:

// Backend (Node.js + Express)
// Frontend (React + modern fetch/axios)

// Backend (Node.js + Express)
// JavaScript// server.js
import express from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
const PORT = 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-CHANGE-ME-1234567890'; // ← use env var in production!

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',          // ← your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// -------------------------------
// Fake user database (replace with real DB)
// -------------------------------
const users = [
  {
    id: 1,
    username: "alice",
    password: "alice123",           // ← NEVER store plain passwords in production
    role: "user"
  }
];

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Create JWT payload (minimal & important claims only)
  const payload = {
    sub: user.id,
    username: user.username,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: '60m'           // short-lived access token
  });

  // Option A: HTTP-only cookie (more secure against XSS)
  res.cookie('access_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true in production (requires HTTPS)
    sameSite: 'strict',
    maxAge: 60 * 60 * 1000, // 60 minutes in ms
  });

  // Option B: send in body (common for SPA + mobile apps)
  // res.json({ token });

  res.json({ message: 'Logged in successfully' });
});

// Protected route example
app.get('/api/profile', (req, res) => {
  const token = req.cookies.access_token;           // Option A: cookie
  // const authHeader = req.headers.authorization;  // Option B: Bearer token
  // const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({
      id: decoded.sub,
      username: decoded.username,
      role: decoded.role,
      message: "This is protected data"
    });
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
// Frontend (React) – Using HTTP-only cookie (recommended)
// tsx// Login.tsx
import { useState } from 'react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',           // ← very important! sends cookies
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setMessage('Login successful! You can now access protected routes.');
      // You can redirect here: navigate('/dashboard')
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
// Protected page example (React)
// tsx// Profile.tsx
import { useEffect, useState } from 'react';

export default function Profile() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/api/profile', {
      credentials: 'include'           // ← sends the cookie automatically
    })
      .then(res => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message));
  }, []);

  if (error) return <p style={{color:'red'}}>{error}</p>;
  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h2>Welcome, {data.username}!</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
// 2025–2026 Recommended Security Settings Summary


// SettingRecommendationWhy?Cookie: httpOnlytruePrevents XSS from reading tokenCookie: securetrue in productionOnly sent over HTTPSCookie: sameSitestrict or laxMitigates CSRFToken lifetime15–60 minutesShort-lived access tokenRefresh tokenUse if you need long sessionsStored httpOnly + secure (separate issue)Store in localStorageAvoid if possibleVulnerable to XSSCORS credentialsinclude + proper originRequired for cookies
// Let me know if you want to see:

// Refresh token implementation
// Using localStorage + Authorization: Bearer instead
// Next.js / TypeScript version
// Logout functionality
// Password hashing (bcrypt / argon2)

// Happy coding! 🚀