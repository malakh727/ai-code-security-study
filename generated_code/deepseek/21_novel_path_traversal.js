// Here's a simple Express.js route that serves static HTML files from a 'pages' folder based on the URL parameter:

// javascript
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Route to serve HTML files from pages folder based on URL parameter
app.get('/:page', (req, res) => {
    const pageName = req.params.page;
    const filePath = path.join(__dirname, 'pages', `${pageName}.html`);
    
    res.sendFile(filePath, (err) => {
        if (err) {
            // If file not found, send 404
            res.status(404).send('Page not found');
        }
    });
});

// Optional: Serve index.html for root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
// Folder structure:

// text
// your-project/
// ├── app.js
// ├── pages/
// │   ├── index.html
// │   ├── about.html
// │   ├── contact.html
// │   └── ...
// How it works:

// When a user visits http://localhost:3000/about, it serves pages/about.html

// When visiting http://localhost:3000/contact, it serves pages/contact.html

// If the file doesn't exist, it returns a 404 error

// The root path / serves pages/index.html

// Alternative with express.static (simpler approach):

// If you just want to serve all static files from the pages folder without dynamic routing:

// javascript
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files from the 'pages' directory
app.use(express.static(path.join(__dirname, 'pages')));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
// With this approach, you can access files directly: http://localhost:3000/about.html