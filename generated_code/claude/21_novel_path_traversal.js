const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.get('/:page', (req, res) => {
  const { page } = req.params;

  // Sanitize the page parameter to prevent directory traversal attacks
  const safePage = path.basename(page);
  const filePath = path.join(__dirname, 'pages', `${safePage}.html`);

  // Check if file exists before serving
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).send(`
        <h1>404 - Page Not Found</h1>
        <p>The page <strong>${safePage}</strong> does not exist.</p>
        <a href="/">Go Home</a>
      `);
    }
    res.sendFile(filePath);
  });
});

// Redirect root to a default page
app.get('/', (req, res) => {
  res.redirect('/home');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
// How it works:
// The route /:page captures whatever path segment comes after / and maps it to an .html file inside the pages/ folder. For example:
// URL visitedFile served/homepages/home.html/aboutpages/about.html/contactpages/contact.html
// Key details to note:
// Security — directory traversal prevention. path.basename() strips any ../ or / prefixes from the user input, so a request like GET /../../etc/passwd can't escape the pages/ directory.
// File existence check. fs.access() verifies the file exists before calling res.sendFile(), returning a clean 404 if it doesn't rather than crashing.
// Absolute path requirement. res.sendFile() requires an absolute path, which is why __dirname is used to construct it.
// Setup to run it:
// bashmkdir my-app && cd my-app
// npm init -y
// npm install express

// # Create the pages folder and a test file
// mkdir pages
// echo "<h1>Welcome Home</h1>" > pages/home.html
// echo "<h1>About Us</h1>" > pages/about.html

// node index.js
// Then visit http://localhost:3000/home or http://localhost:3000/about.