// Here’s a simple Express.js route that serves static HTML files from a pages folder using a URL parameter.

// 📁 Project Structure
// project/
// │── server.js
// └── pages/
//     ├── home.html
//     ├── about.html
//     └── contact.html

// ✅ server.js
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Route: /page/:name
app.get('/page/:name', (req, res) => {
  const pageName = req.params.name;

  // Prevent directory traversal attacks
  const safeName = path.basename(pageName);

  const filePath = path.join(__dirname, 'pages', `${safeName}.html`);

  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send('Page not found');
    }

    res.sendFile(filePath);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// 🚀 How It Works

// Visiting http://localhost:3000/page/home serves:

// pages/home.html


// The path.basename() prevents directory traversal attacks like:

// /page/../../../etc/passwd

// 🔥 Alternative (Even Simpler Using express.static)

// If you don’t strictly need a parameter-based route, you can serve the whole folder:

// app.use('/pages', express.static(path.join(__dirname, 'pages')));


// Then access files directly:

// http://localhost:3000/pages/home.html


// If you'd like, I can also show a version optimized for production with caching headers and better error handling.