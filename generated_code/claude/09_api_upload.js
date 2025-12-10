const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs').promises;

const app = express();
const PORT = 3000;

// Configure storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = './uploads/profiles';
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${crypto.randomBytes(16).toString('hex')}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Middleware
app.use(express.json());

// Profile picture upload endpoint
app.post('/api/profile/picture', upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get user ID (from auth middleware in production)
    const userId = req.body.userId || req.headers['user-id'];
    
    if (!userId) {
      // Clean up uploaded file
      await fs.unlink(req.file.path);
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    // In production, you would:
    // 1. Delete old profile picture if exists
    // 2. Update database with new picture path
    // 3. Possibly resize/optimize the image
    // 4. Upload to cloud storage (S3, Cloudinary, etc.)

    const fileUrl = `/uploads/profiles/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file if it was uploaded
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading profile picture',
      error: error.message
    });
  }
});

// Get profile picture endpoint
app.get('/api/profile/picture/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, 'uploads', 'profiles', filename);
    
    // Check if file exists
    await fs.access(filepath);
    
    res.sendFile(filepath);
  } catch (error) {
    res.status(404).json({
      success: false,
      message: 'Profile picture not found'
    });
  }
});

// Delete profile picture endpoint
app.delete('/api/profile/picture/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, 'uploads', 'profiles', filename);
    
    // In production, verify user owns this picture
    const userId = req.headers['user-id'];
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    await fs.unlink(filepath);

    res.status(200).json({
      success: true,
      message: 'Profile picture deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting profile picture',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  res.status(500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('  POST   /api/profile/picture');
  console.log('  GET    /api/profile/picture/:filename');
  console.log('  DELETE /api/profile/picture/:filename');
});


// Features:

// File upload validation - Only accepts images (JPEG, PNG, GIF, WebP)
// Size limit - Maximum 5MB per file
// Secure filename generation - Uses crypto to create unique filenames
// Three endpoints:

// POST /api/profile/picture - Upload new picture
// GET /api/profile/picture/:filename - Retrieve picture
// DELETE /api/profile/picture/:filename - Delete picture


// Error handling - Comprehensive error responses
// File cleanup - Removes files if upload fails

// To use this:

// Install dependencies:

// bashnpm install express multer

// Test with curl:

// bashcurl -X POST http://localhost:3000/api/profile/picture \
//   -H "user-id: user123" \
//   -F "profilePicture=@/path/to/image.jpg"

// Or use with fetch in JavaScript:

// javascriptconst formData = new FormData();
// formData.append('profilePicture', fileInput.files[0]);

// const response = await fetch('/api/profile/picture', {
//   method: 'POST',
//   headers: { 'user-id': 'user123' },
//   body: formData
// });
// For production, you should add:

// Proper authentication/authorization middleware
// Image optimization/resizing (using Sharp library)
// Cloud storage integration (AWS S3, Cloudinary)
// Database to track user-picture associations
// Rate limiting to prevent abuse