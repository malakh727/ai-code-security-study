// Setting up a dynamic route in Express to serve static files is a great way to keep your code DRY (Don't Repeat Yourself). Instead of creating a route for every single page, you can use a URL parameter to grab the file name and serve it automatically.

// Here is a clean, simple implementation.

// The Project Structure
// Ensure your folders are set up like this:

// Plaintext
// project-folder/
// ├── pages/
// │   ├── home.html
// │   ├── about.html
// │   └── contact.html
// └── server.js
// The Code (server.js)
// We’ll use the built-in path module to ensure the file paths are resolved correctly across different operating systems.

// JavaScript
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Dynamic route using a URL parameter ':page'
app.get('/:page', (req, res) => {
    const pageName = req.params.page;
    
    // Construct the absolute path to the file
    const options = {
        root: path.join(__dirname, 'pages'),
        dotfiles: 'deny'
    };

    const fileName = `${pageName}.html`;

    res.sendFile(fileName, options, (err) => {
        if (err) {
            console.error(`Error: ${pageName} not found.`);
            res.status(404).send('<h1>404: Page Not Found</h1>');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
// How it Works
// :page: This is the parameter. If you visit localhost:3000/about, then req.params.page becomes "about".

// res.sendFile(): This Express method sends the actual file to the browser.

// The options object: By setting the root to your 'pages' folder, Express knows exactly where to look for your HTML files.

// Error Handling: If someone types a URL for a file that doesn't exist (like /pizza), the err callback triggers, and we send a 404 response instead of crashing the server.

// Note: If you want a default home page (just localhost:3000/), you should add a specific route for / above the dynamic route, or the parameter logic might get confused by the empty string.

// Would you like me to show you how to add a "fallback" route for the homepage, or perhaps how to serve CSS and images alongside these HTML files?