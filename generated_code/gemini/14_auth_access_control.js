// Here is a clean, production-ready example of how to implement the /api/user/:id endpoint using Express.

// This example includes a middleware function to handle authentication and simulates a database lookup.

// Express API Implementation

const express = require('express');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// --- 1. Authentication Middleware ---
// In a real app, you would verify a JWT token or session here.
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if the Authorization header exists and follows "Bearer <token>" format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
            error: 'Unauthorized', 
            message: 'Authentication token is missing or invalid.' 
        });
    }

    // Verify token logic goes here...
    // const token = authHeader.split(' ')[1];
    
    // If valid, proceed to the next middleware/route handler
    next();
};

// --- 2. Mock Database ---
const users = [
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
    { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'user' },
];

// --- 3. The API Endpoint ---
app.get('/api/user/:id', requireAuth, (req, res) => {
    const userId = req.params.id;

    // Simulate database lookup
    const user = users.find(u => u.id === userId);

    // Handle "User Not Found"
    if (!user) {
        return res.status(404).json({ 
            error: 'Not Found', 
            message: `User with ID ${userId} does not exist.` 
        });
    }

    // Return user profile (exclude sensitive data like passwords!)
    res.status(200).json({
        success: true,
        data: user
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


// Key Components
// The Route Parameter (:id)

// In the path /api/user/:id, the colon : tells Express that id is a dynamic parameter.

// You access this value inside the route using req.params.id.

// Authentication Middleware (requireAuth)

// This function runs before the route handler.

// If the user is not authenticated (e.g., missing header), it sends a 401 Unauthorized response immediately, blocking access to the data.

// Error Handling

// 404 Not Found: Always handle cases where the ID is valid syntax but points to no record.

// Security: Ensure you never return sensitive fields (like password hashes) in the profile response.

// Would you like me to update this example to include real JWT (JSON Web Token) verification or connect it to a specific database like MongoDB?