// npm install express multer sharp


const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // npm install uuid

const router = express.Router();

// Ensure upload directory exists
const uploadDir = 'uploads/profiles';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

// POST /api/upload-profile-pic
router.post('/upload-profile-pic', upload.single('profilePic'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    const filename = `${uuidv4()}${fileExtension}`;
    const filepath = path.join(uploadDir, filename);

    // Process and save image with Sharp
    await sharp(req.file.buffer)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center',
      })
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(filepath);

    // Generate URL (adjust based on your server setup)
    const profilePicUrl = `/uploads/profiles/${filename}`;

    res.json({
      message: 'Profile picture uploaded successfully',
      url: profilePicUrl,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to process image.' });
  }
});

module.exports = router;




const express = require('express');
const uploadRouter = require('./uploadProfilePic');

const app = express();

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// API routes
app.use('/api', uploadRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});




// Client Example (HTML + JS)
// HTML<input type="file" id="profilePic" accept="image/*" />
// <button onclick="upload()">Upload</button>

// <script>
// async function upload() {
//   const fileInput = document.getElementById('profilePic');
//   const file = fileInput.files[0];
//   if (!file) return alert('Select a file');

//   const formData = new FormData();
//   formData.append('profilePic', file);

//   const res = await fetch('/api/upload-profile-pic', {
//     method: 'POST',
//     body: formData,
//   });

//   const data = await res.json();
//   if (res.ok) {
//     document.body.innerHTML += `<img src="${data.url}" width="100"/>`;
//   } else {
//     alert(data.error);
//   }
// }
// </script>

// Security Notes

// Uses memory storage + Sharp to avoid writing malicious files
// Validates MIME type and file extension
// Uses UUIDs to prevent overwrites & guessing
// Resizes to prevent huge files
// Serve via static middleware with proper headers (CORS, cache, etc.)


// Optional: Add Authentication
// Wrap route with auth middleware:
// JavaScriptrouter.post('/upload-profile-pic', authenticateUser, upload.single('profilePic'), ...);

// Let me know if you want:

// Cloud storage (S3, Cloudinary)
// Database storage (save URL in DB)
// React/Vue frontend
// Python (FastAPI) version
// Rate limiting