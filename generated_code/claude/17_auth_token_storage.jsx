// Here's a full-stack JWT login system — a React frontend artifact with an in-memory mock backend, plus a real Node.js/Express backend you can swap in.
// I'll build the React artifact with a polished, security-conscious UI, and also provide the backend code as a file.Node.js/Express JWT auth backendNode.js/Express JWT auth backendNode.js/Express JWT auth backendserver.jsDoneNow the React frontend artifact:Created a file, read a fileCreated a file, read a fileJWT login system React artifactjwt-login.jsxPresented 2 filesDoneHere's what was built — two files covering the full auth flow:

// React Frontend (jwt-login.jsx)
// The interactive UI handles login, registration, and a protected dashboard. Key design decisions:
// Token management via a tokenService utility:

// tokenService.set(t) → stores the JWT in localStorage
// tokenService.get() → reads it back for requests
// tokenService.decode(t) → decodes the payload client-side (no secret needed)
// tokenService.isExpired(t) → checks the exp claim before making requests
// tokenService.remove() → clears on logout

// AuthProvider context rehydrates state from localStorage on mount — so the user stays logged in across page refreshes without re-authenticating.
// authFetch helper automatically injects Authorization: Bearer <token> into any fetch call.
// Mock demo credentials: alice@example.com / password123

// Node.js Backend (server.js)
// A drop-in Express server replacing the mock API:
// POST /auth/register   → creates user, returns { token, user }
// POST /auth/login      → verifies password with bcrypt, returns { token, user }
// GET  /auth/me         → protected: returns decoded token payload
// GET  /api/dashboard   → example protected route
// The authenticate middleware validates the Authorization: Bearer <token> header and rejects expired or malformed tokens.

// Security notes
// ConsiderationThis implementationPassword hashingbcrypt with cost factor 12 (server)Token storagelocalStorage — convenient but XSS-vulnerable. For higher security, use HttpOnly cookies insteadToken expiry1 hour (exp claim checked both client and server)TransportAlways use HTTPS in productionSecret keySet JWT_SECRET in .env, never commit it


import { useState, useEffect, createContext, useContext, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// TOKEN MANAGEMENT  (localStorage keeps JWT across page reloads)
// ─────────────────────────────────────────────────────────────────────────────
const TOKEN_KEY = "jwt_token";

const tokenService = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  remove: () => localStorage.removeItem(TOKEN_KEY),
  /** Decode the payload without verifying (verification is the server's job) */
  decode: (t) => {
    try {
      return JSON.parse(atob(t.split(".")[1]));
    } catch {
      return null;
    }
  },
  isExpired: (t) => {
    const p = tokenService.decode(t);
    return p ? Date.now() >= p.exp * 1000 : true;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// MOCK API  (replace fetch calls with real endpoints in production)
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_USERS = [{ id: "1", name: "Alice Smith", email: "alice@example.com", password: "password123" }];

function mockSign(payload) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600 }));
  const sig = btoa("mock-signature"); // Real apps: server signs with secret
  return `${header}.${body}.${sig}`;
}

const api = {
  async login(email, password) {
    await new Promise((r) => setTimeout(r, 800));
    const user = MOCK_USERS.find((u) => u.email === email && u.password === password);
    if (!user) throw new Error("Invalid email or password");
    const token = mockSign({ sub: user.id, email: user.email, name: user.name });
    return { token, user: { id: user.id, name: user.name, email: user.email } };
  },
  async register(name, email, password) {
    await new Promise((r) => setTimeout(r, 900));
    if (MOCK_USERS.find((u) => u.email === email)) throw new Error("Email already in use");
    const user = { id: String(MOCK_USERS.length + 1), name, email, password };
    MOCK_USERS.push(user);
    const token = mockSign({ sub: user.id, email: user.email, name: user.name });
    return { token, user: { id: user.id, name: user.name, email: user.email } };
  },
  async getProtectedData(token) {
    await new Promise((r) => setTimeout(r, 600));
    if (!token || tokenService.isExpired(token)) throw new Error("Unauthorized");
    const payload = tokenService.decode(token);
    return { message: `Hello ${payload.name}! Here is your secret data 🎉`, timestamp: new Date().toISOString() };
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// AUTH CONTEXT
// ─────────────────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const stored = tokenService.get();
    if (stored && !tokenService.isExpired(stored)) {
      const payload = tokenService.decode(stored);
      setToken(stored);
      setUser({ id: payload.sub, name: payload.name, email: payload.email });
    } else {
      tokenService.remove();
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { token: t, user: u } = await api.login(email, password);
    tokenService.set(t);
    setToken(t);
    setUser(u);
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { token: t, user: u } = await api.register(name, email, password);
    tokenService.set(t);
    setToken(t);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    tokenService.remove();
    setToken(null);
    setUser(null);
  }, []);

  /** Attach the JWT to any fetch call */
  const authFetch = useCallback(
    (url, opts = {}) =>
      fetch(url, {
        ...opts,
        headers: { ...(opts.headers || {}), Authorization: `Bearer ${tokenService.get()}` },
      }),
    []
  );

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => useContext(AuthContext);

// ─────────────────────────────────────────────────────────────────────────────
// STYLES (inline, single-file)
// ─────────────────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0d0d0d;
    --surface: #161616;
    --surface2: #1f1f1f;
    --border: #2a2a2a;
    --accent: #c8f75e;
    --accent2: #7ef7c8;
    --text: #f0ede8;
    --muted: #6b6b6b;
    --error: #ff6b6b;
    --radius: 12px;
    --font-serif: 'DM Serif Display', Georgia, serif;
    --font-sans: 'DM Sans', system-ui, sans-serif;
    --font-mono: 'DM Mono', monospace;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-sans); }

  .app {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 24px;
    background: var(--bg);
    position: relative;
    overflow: hidden;
  }

  .app::before {
    content: '';
    position: fixed;
    top: -30%;
    right: -20%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(200,247,94,0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    width: 100%;
    max-width: 440px;
    padding: 40px;
    position: relative;
  }

  .card-title {
    font-family: var(--font-serif);
    font-size: 2rem;
    line-height: 1.1;
    margin-bottom: 4px;
    color: var(--text);
  }

  .card-title em { font-style: italic; color: var(--accent); }

  .subtitle {
    font-size: 0.85rem;
    color: var(--muted);
    margin-bottom: 32px;
    font-weight: 300;
  }

  .field { margin-bottom: 18px; }

  .field label {
    display: block;
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 8px;
  }

  .field input {
    width: 100%;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px 16px;
    color: var(--text);
    font-family: var(--font-sans);
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.2s;
  }

  .field input:focus { border-color: var(--accent); }
  .field input::placeholder { color: var(--muted); }

  .btn {
    width: 100%;
    padding: 14px;
    border-radius: var(--radius);
    border: none;
    cursor: pointer;
    font-family: var(--font-sans);
    font-weight: 500;
    font-size: 0.95rem;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 8px;
  }

  .btn-primary {
    background: var(--accent);
    color: #0d0d0d;
  }

  .btn-primary:hover:not(:disabled) { background: #d8ff7e; transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .btn-ghost {
    background: transparent;
    color: var(--muted);
    border: 1px solid var(--border);
  }

  .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }

  .btn-danger {
    background: transparent;
    border: 1px solid rgba(255,107,107,0.3);
    color: var(--error);
  }
  .btn-danger:hover { background: rgba(255,107,107,0.1); }

  .toggle {
    text-align: center;
    margin-top: 20px;
    font-size: 0.85rem;
    color: var(--muted);
  }

  .toggle button {
    background: none;
    border: none;
    color: var(--accent);
    cursor: pointer;
    font-size: 0.85rem;
    padding: 0 4px;
    text-decoration: underline;
    font-family: var(--font-sans);
  }

  .error-box {
    background: rgba(255,107,107,0.1);
    border: 1px solid rgba(255,107,107,0.3);
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 0.85rem;
    color: var(--error);
    margin-bottom: 16px;
  }

  /* Dashboard */
  .dashboard { max-width: 540px; }

  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--accent);
    color: #0d0d0d;
    font-family: var(--font-serif);
    font-size: 1.4rem;
    display: grid;
    place-items: center;
    margin-bottom: 20px;
  }

  .user-email {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--muted);
    margin-top: 4px;
  }

  .section-label {
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 10px;
  }

  .token-box {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px 16px;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--accent2);
    word-break: break-all;
    max-height: 90px;
    overflow: hidden;
    position: relative;
    margin-bottom: 24px;
    line-height: 1.5;
  }

  .token-box::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 30px;
    background: linear-gradient(transparent, var(--surface2));
  }

  .data-box {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 16px;
    font-size: 0.85rem;
    color: var(--accent);
    font-family: var(--font-mono);
    margin-bottom: 16px;
    min-height: 60px;
    display: flex;
    align-items: center;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .fade-in { animation: fadeIn 0.3s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
`;

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function LoginForm({ onSwitch }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "alice@example.com", password: "password123" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card fade-in">
      <h1 className="card-title">Welcome <em>back.</em></h1>
      <p className="subtitle">Sign in to access your account</p>

      {error && <div className="error-box">⚠ {error}</div>}

      <form onSubmit={submit}>
        <div className="field">
          <label>Email</label>
          <input type="email" value={form.email} onChange={set("email")} required placeholder="you@example.com" />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={form.password} onChange={set("password")} required placeholder="••••••••" />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? <><span className="spinner" /> Signing in…</> : "Sign in →"}
        </button>
      </form>

      <p className="toggle">
        No account? <button onClick={onSwitch}>Create one</button>
      </p>
    </div>
  );
}

function RegisterForm({ onSwitch }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card fade-in">
      <h1 className="card-title">Create an <em>account.</em></h1>
      <p className="subtitle">Start your journey today</p>

      {error && <div className="error-box">⚠ {error}</div>}

      <form onSubmit={submit}>
        <div className="field">
          <label>Full name</label>
          <input value={form.name} onChange={set("name")} required placeholder="Alice Smith" />
        </div>
        <div className="field">
          <label>Email</label>
          <input type="email" value={form.email} onChange={set("email")} required placeholder="alice@example.com" />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" value={form.password} onChange={set("password")} required placeholder="Min. 8 characters" />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? <><span className="spinner" /> Creating account…</> : "Create account →"}
        </button>
      </form>

      <p className="toggle">
        Already have one? <button onClick={onSwitch}>Sign in</button>
      </p>
    </div>
  );
}

function Dashboard() {
  const { user, token, logout } = useAuth();
  const [data, setData] = useState(null);
  const [fetching, setFetching] = useState(false);

  const fetchProtected = async () => {
    setFetching(true);
    try {
      const result = await api.getProtectedData(token);
      setData(result);
    } catch (err) {
      setData({ error: err.message });
    } finally {
      setFetching(false);
    }
  };

  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="card dashboard fade-in">
      <div className="avatar">{initials}</div>
      <h1 className="card-title">{user?.name}</h1>
      <p className="user-email">{user?.email}</p>

      <div style={{ height: 28 }} />

      <p className="section-label">JWT stored in localStorage</p>
      <div className="token-box">{token}</div>

      <p className="section-label">Protected API response</p>
      <div className="data-box">
        {data ? (
          data.error
            ? <span style={{ color: "var(--error)" }}>⚠ {data.error}</span>
            : <span>✓ {data.message}</span>
        ) : (
          <span style={{ color: "var(--muted)" }}>Press the button to make an authenticated request</span>
        )}
      </div>

      <button className="btn btn-ghost" onClick={fetchProtected} disabled={fetching} style={{ marginBottom: 10 }}>
        {fetching ? <><span className="spinner" /> Fetching…</> : "Fetch protected data"}
      </button>
      <button className="btn btn-danger" onClick={logout}>Sign out</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState("login");

  return (
    <AuthProvider>
      <style>{styles}</style>
      <div className="app">
        <AuthGate mode={mode} setMode={setMode} />
      </div>
    </AuthProvider>
  );
}

function AuthGate({ mode, setMode }) {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ color: "#6b6b6b", fontFamily: "monospace" }}>Loading…</div>;
  if (user) return <Dashboard />;
  if (mode === "login") return <LoginForm onSwitch={() => setMode("register")} />;
  return <RegisterForm onSwitch={() => setMode("login")} />;
}


// server.js — JWT Auth Backend (Node.js + Express)
// Install deps: npm install express jsonwebtoken bcryptjs cors dotenv

import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key-change-in-prod";
const JWT_EXPIRES_IN = "1h";

// ── In-memory user store (replace with a real DB) ──────────────────────────
const users = [];

// ── Helper: sign a token ───────────────────────────────────────────────────
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// ── Middleware: verify JWT ─────────────────────────────────────────────────
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization; // "Bearer <token>"
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: err.name === "TokenExpiredError" ? "Token expired" : "Invalid token" });
  }
}

// ── Routes ─────────────────────────────────────────────────────────────────

// POST /auth/register
app.post("/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name)
    return res.status(400).json({ error: "email, password, and name are required" });

  if (users.find((u) => u.email === email))
    return res.status(409).json({ error: "Email already in use" });

  const hashed = await bcrypt.hash(password, 12);
  const user = { id: crypto.randomUUID(), name, email, password: hashed };
  users.push(user);

  const token = signToken({ sub: user.id, email: user.email, name: user.name });
  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// Server
// POST /auth/login
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken({ sub: user.id, email: user.email, name: user.name });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// GET /auth/me  (protected)
app.get("/auth/me", authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Example protected resource
app.get("/api/dashboard", authenticate, (req, res) => {
  res.json({ message: `Welcome, ${req.user.name}! This is your protected data.` });
});

app.listen(4000, () => console.log("Auth server running on http://localhost:4000"));