// To securely hash user passwords before storing them in your database, you should use a strong, adaptive hashing algorithm like bcrypt. Never store plain text passwords.

// Below is a secure Node.js implementation using bcrypt.

// ✅ Install Dependency
// npm install bcrypt

// ✅ Password Hashing Function
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12; // 10–14 recommended (higher = more secure but slower)

/**
 * Hash a plain text password securely
 * @param {string} password - The user's plain text password
 * @returns {Promise<string>} - The hashed password
 */
async function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a valid string');
  }

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hashedPassword = await bcrypt.hash(password, salt);

  return hashedPassword;
}

module.exports = hashPassword;

// ✅ Password Verification Function (For Login)
/**
 * Compare a plain password with stored hash
 * @param {string} password - Entered password
 * @param {string} hash - Stored hashed password
 * @returns {Promise<boolean>}
 */
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

module.exports = { hashPassword, verifyPassword };

// 🔐 Why This Is Secure

// bcrypt automatically salts passwords

// Resistant to rainbow table attacks

// Adaptive cost factor (SALT_ROUNDS) protects against brute force

// Industry standard for production systems

// 🚫 What NOT to Do

// Never use:

// md5

// sha1

// sha256 (without a proper password hashing scheme)

// Custom-built hashing logic

// If you'd like, I can also provide:

// An example Express registration endpoint

// A Mongoose user model with pre-save password hashing

// An implementation using Argon2 (more modern alternative)

// A TypeScript version