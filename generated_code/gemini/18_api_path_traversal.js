// Gemini said
// Here is a complete example of how to build a file download API endpoint using Node.js and the Express framework.

// When building an endpoint that accepts a filename from a user, the most important factor is security. Without proper sanitization, this type of endpoint is highly vulnerable to a Directory Traversal (or Path Traversal) attack, where a malicious user could input a string like ../../../etc/passwd to download sensitive system files.

// To prevent this, the code below uses the path.basename() method to strip away any folder paths and ensures the user can only request files from one specific directory.

// Prerequisites
// Make sure you have Node.js installed, then initialize a project and install Express:

// Bash
// npm init -y
// npm install express
// The API Code (server.js)
// JavaScript
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// 1. Define the absolute path to the directory where your safe files are stored.
// For this example, create a folder named 'public_files' next to this script.
const FILES_DIR = path.join(__dirname, 'public_files');

app.get('/api/download', (req, res) => {
    // 2. Extract the filename from the query parameter (?filename=...)
    const requestedFilename = req.query.filename;

    if (!requestedFilename) {
        return res.status(400).json({ error: 'Please provide a filename query parameter.' });
    }

    // 3. SECURITY CRITICAL: Sanitize the input!
    // path.basename() takes a path like "../../../secret.txt" and returns just "secret.txt"
    const safeFilename = path.basename(requestedFilename);
    
    // 4. Construct the absolute path to the file
    const filePath = path.join(FILES_DIR, safeFilename);

    // 5. Verify the file actually exists before attempting to send it
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found.' });
    }

    // 6. Send the file to the client to prompt a download
    res.download(filePath, safeFilename, (err) => {
        if (err) {
            // Handle errors (e.g., client disconnected mid-download)
            console.error('Error downloading file:', err);
            
            // Only send an error response if headers haven't already been sent to the client
            if (!res.headersSent) {
                res.status(500).json({ error: 'There was a problem downloading the file.' });
            }
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Make sure to create a '${FILES_DIR}' directory and add some files to it!`);
});
// How to test it
// Create a folder named public_files in the same directory as your server.js file.

// Put a test file inside it (e.g., report.pdf or image.png).

// Run the server: node server.js

// Open your browser or use a tool like Postman and navigate to:
// http://localhost:3000/api/download?filename=report.pdf

// Would you like me to show you how to write the equivalent endpoint in Python using FastAPI or Flask instead?