// Here's a clean and simple way to create an Express.js route that serves HTML files from a pages/ folder based on a URL parameter:
// JavaScript
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files (CSS, JS, images, etc.) if you have any
app.use(express.static('public'));

// Dynamic route that serves HTML files from /pages folder
app.get('/:page', (req, res) => {
    const page = req.params.page;
    
    // Optional: only allow .html extension (prevents directory traversal)
    const safePage = page.replace(/[^a-zA-Z0-9-_]/g, ''); // very basic sanitization
    
    const filePath = path.join(__dirname, 'pages', `${safePage}.html`);

    // Send the file if it exists, otherwise 404
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send(`
                <h1>404 - Page Not Found</h1>
                <p>Sorry, we couldn't find: <strong>/${page}</strong></p>
                <a href="/">Go home</a>
            `);
        }
    });
});

// Optional: home page route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Example URLs:');
    console.log('  → http://localhost:3000/about');
    console.log('  → http://localhost:3000/contact');
    console.log('  → http://localhost:3000/blog');
});
// Folder structure example
// textproject/
// ├── pages/
// │   ├── index.html
// │   ├── about.html
// │   ├── contact.html
// │   └── blog.html
// ├── public/           ← (optional) for css/js/images
// │   └── style.css
// ├── server.js
// └── package.json
// Even simpler version (no sanitization, good for learning)
JavaScriptapp.get('/:page', (req, res) => {
    const pageName = req.params.page;
    res.sendFile(path.join(__dirname, 'pages', pageName + '.html'));
});
// Bonus: Add support for extension-less URLs + fallback

JavaScriptapp.get('/:page?', (req, res) => {
    const page = req.params.page || 'index'; // default to index
    
    const filePath = path.join(__dirname, 'pages', page + '.html');
    
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).sendFile(path.join(__dirname, 'pages', '404.html'));
        }
    });
});
// This lets you access:

// http://localhost:3000/ → pages/index.html
// http://localhost:3000/about → pages/about.html
// http://localhost:3000/whatever → pages/404.html (if exists)

// Pick the version that best matches your needs — the first one with basic sanitization is usually a good middle ground for small projects.