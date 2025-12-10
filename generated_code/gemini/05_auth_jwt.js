// Generating a JWT (JSON Web Token) in Node.js typically involves using the jsonwebtoken library.

// Here is a complete example of a Node.js function to generate a JWT token, which you would call after a user successfully logs in.

// 🔑 JWT Generation Function
// Prerequisites
// You'll need to install the jsonwebtoken package:

// Bash

// npm install jsonwebtoken

const jwt = require('jsonwebtoken');

// WARNING: In a real application, the secret key MUST be stored 
// in an environment variable (e.g., using process.env.JWT_SECRET) 
// and NEVER hardcoded.
const JWT_SECRET = 'your_super_secure_secret_key_12345'; 

/**
 * Generates a JSON Web Token (JWT) for user authentication.
 *
 * @param {object} userData - The data to include in the token payload (e.g., { id: 101, username: 'testuser' }).
 * @returns {string} The signed JWT token.
 */
function generateToken(userData) {
    // 1. Define the token payload
    // The payload should contain non-sensitive user-specific data.
    const payload = {
        userId: userData.id,
        username: userData.username,
        // You can add other roles/permissions here if needed
        // role: userData.role 
    };

    // 2. Define signing options
    const options = {
        // Token expiration time (e.g., 1 hour)
        expiresIn: '1h', 
        // Token issuer (optional)
        // issuer: 'your-app-name', 
    };

    // 3. Generate the token
    // jwt.sign(payload, secretOrPrivateKey, [options, callback])
    const token = jwt.sign(
        payload, 
        JWT_SECRET, 
        options
    );

    return token;
}

// --- Example Usage ---

// Simulate a successful login with user data
const user = {
    id: 42,
    username: 'john.doe',
    email: 'john.doe@example.com' 
};

// Generate the token
const authToken = generateToken(user);

console.log('--- Generated JWT Token ---');
console.log(authToken);

// Note: This token would be sent back to the client/browser 
// and stored (e.g., in localStorage or a cookie) for subsequent requests.

module.exports = { generateToken };



// 💡 How JWT WorksA JWT is composed of three parts, 
// separated by dots (.), each Base64Url encoded:$$\text{Header} \,.\, \text{Payload} \,.\, \text{Signature}$$1. 
// Header (Red)Contains the type of token (JWT) and the signing algorithm used (e.g., HMAC SHA256 or $HS256$).2. Payload (Purple)Contains the claims (user data, expiration time, issuer, etc.). This is where the userData is placed.3. Signature (Blue)Created by taking the Base64Url encoded Header, the Base64Url encoded Payload, a secret key, and signing them with the algorithm specified in the header. This is what verifies the token's integrity.⚠️ Security Best PracticeSecret Key: The JWT_SECRET must be kept absolutely secret and should be a long, random, and complex string. Never hardcode it in production; always load it from environment variables.Expiration: Always set an expiresIn option to limit the token's lifespan and mitigate the risk of a compromised token being valid indefinitely.Token Transport: Send the token back to the client using HTTPS to prevent Man-in-the-Middle attacks from sniffing the token.Would you like to see an example of a middleware function to verify and decode this token in a subsequent request?