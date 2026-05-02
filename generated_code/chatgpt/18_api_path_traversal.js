// Here’s an example of an Express.js API endpoint that allows users to download a file by passing the filename as a query parameter.

// This implementation includes basic security protections (like preventing path traversal attacks).

// ✅ Example: File Download Endpoint
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Directory where downloadable files are stored
const FILES_DIR = path.join(__dirname, 'uploads');

app.get('/api/download', (req, res) => {
  const { filename } = req.query;

  // Validate filename
  if (!filename) {
    return res.status(400).json({ message: 'Filename query parameter is required' });
  }

  // Prevent directory traversal attacks
  const safePath = path.normalize(filename).replace(/^(\.\.(\/|\\|$))+/, '');
  const filePath = path.join(FILES_DIR, safePath);

  // Ensure file exists inside allowed directory
  if (!filePath.startsWith(FILES_DIR)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'File not found' });
  }

  // Send file for download
  res.download(filePath, safePath, (err) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Error downloading file' });
    }
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

// 🔐 Security Considerations

// Directory Restriction – Files are only served from the uploads directory.

// Path Traversal Protection – Prevents ../../etc/passwd type attacks.

// File Existence Check – Returns proper HTTP status codes.

// (Optional) Add authentication middleware if downloads should be restricted.

// 📌 Example Request
// GET /api/download?filename=example.pdf


// If you'd like, I can also provide:

// A version with JWT authentication

// A version using streaming for large files

// A version with file type validation

// Or a production-ready variant with rate limiting**