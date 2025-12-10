// 1. Basic Express Server with Multer for File Uploads
// server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp'); // For image processing
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads/profile-pictures';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter for validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Only image files are allowed!'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Middleware
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }
  next(err);
});

// Process image (resize, convert to webp)
const processImage = async (filePath, userId) => {
  const filename = `profile_${userId}_${uuidv4()}.webp`;
  const outputPath = path.join(uploadDir, filename);
  
  await sharp(filePath)
    .resize(500, 500, {
      fit: 'cover',
      position: 'center'
    })
    .toFormat('webp')
    .webp({ quality: 80 })
    .toFile(outputPath);
  
  // Delete original file
  fs.unlinkSync(filePath);
  
  return filename;
};

// Upload endpoint
app.post('/api/profile-picture/upload', upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get user ID from auth middleware (assuming you have authentication)
    const userId = req.user?.id || req.body.userId;
    
    if (!userId) {
      // Clean up uploaded file if no user ID
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Process the image
    const processedFilename = await processImage(req.file.path, userId);

    // Generate URL for the processed image
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/profile-pictures/${processedFilename}`;

    // Here you would typically update the user's profile in database
    // await User.findByIdAndUpdate(userId, { profilePicture: imageUrl });

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        filename: processedFilename,
        url: imageUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file if error occurs
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture',
      error: error.message
    });
  }
});

// Get current profile picture
app.get('/api/profile-picture/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    // Here you would fetch from database
    // const user = await User.findById(userId);
    
    // For demo, return a default or existing image
    res.json({
      success: true,
      data: {
        url: null // or user.profilePicture
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile picture'
    });
  }
});

// Delete profile picture
app.delete('/api/profile-picture/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Fetch user to get current picture
    // const user = await User.findById(userId);
    
    // if (user.profilePicture) {
    //   const filename = user.profilePicture.split('/').pop();
    //   const filePath = path.join(uploadDir, filename);
      
    //   if (fs.existsSync(filePath)) {
    //     fs.unlinkSync(filePath);
    //   }
      
    //   // Update database
    //   await User.findByIdAndUpdate(userId, { profilePicture: null });
    // }
    
    res.json({
      success: true,
      message: 'Profile picture deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete profile picture'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// 2. Package.json Dependencies
// {
//   "name": "profile-picture-upload-api",
//   "version": "1.0.0",
//   "description": "API for uploading profile pictures",
//   "main": "server.js",
//   "scripts": {
//     "start": "node server.js",
//     "dev": "nodemon server.js"
//   },
//   "dependencies": {
//     "express": "^4.18.2",
//     "multer": "^1.4.5-lts.1",
//     "sharp": "^0.32.0",
//     "uuid": "^9.0.0",
//     "cors": "^2.8.5",
//     "dotenv": "^16.0.3"
//   },
//   "devDependencies": {
//     "nodemon": "^2.0.22"
//   }
// }
// 3. Environment Configuration (.env)
env
PORT=3000
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,webp
UPLOAD_PATH=uploads/profile-pictures
NODE_ENV=development
// 4. Enhanced Version with Security Features
// enhanced-server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 uploads per windowMs
  message: 'Too many upload attempts, please try again later'
});

// Image processing service
class ImageProcessor {
  constructor() {
    this.supportedFormats = ['jpeg', 'jpg', 'png', 'gif', 'webp', 'bmp', 'tiff'];
  }

  async processProfilePicture(inputPath, userId, options = {}) {
    const {
      width = 500,
      height = 500,
      format = 'webp',
      quality = 80
    } = options;

    const filename = `profile_${userId}_${uuidv4()}.${format}`;
    const outputPath = path.join(process.env.UPLOAD_PATH || 'uploads', filename);

    await sharp(inputPath)
      .resize(width, height, {
        fit: 'cover',
        position: 'center',
        withoutEnlargement: true
      })
      .toFormat(format, { quality })
      .toFile(outputPath);

    return {
      filename,
      path: outputPath,
      format,
      size: fs.statSync(outputPath).size
    };
  }

  validateImage(filePath) {
    return sharp(filePath)
      .metadata()
      .then(metadata => {
        return {
          isValid: true,
          metadata: {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            size: metadata.size
          }
        };
      })
      .catch(() => ({
        isValid: false,
        metadata: null
      }));
  }
}

// Initialize services
const imageProcessor = new ImageProcessor();

// Upload configuration
const upload = multer({
  storage: multer.memoryStorage(), // Use memory storage for processing
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = new RegExp(
      `\\.(${process.env.ALLOWED_FILE_TYPES || 'jpg|jpeg|png|gif|webp'})$`,
      'i'
    );
    
    if (allowedTypes.test(file.originalname) && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

// Upload endpoint with enhanced features
app.post('/api/v1/users/:userId/profile-picture', 
  uploadLimiter,
  upload.single('file'),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const file = req.file;

      // Validate input
      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'NO_FILE',
          message: 'No file provided'
        });
      }

      // Validate user (in real app, check authentication)
      // const user = await UserService.findById(userId);
      // if (!user) {
      //   return res.status(404).json({
      //     success: false,
      //     error: 'USER_NOT_FOUND',
      //     message: 'User not found'
      //   });
      // }

      // Save temporary file
      const tempPath = path.join('/tmp', `${uuidv4()}_${file.originalname}`);
      fs.writeFileSync(tempPath, file.buffer);

      // Validate image integrity
      const validation = await imageProcessor.validateImage(tempPath);
      if (!validation.isValid) {
        fs.unlinkSync(tempPath);
        return res.status(400).json({
          success: false,
          error: 'INVALID_IMAGE',
          message: 'The uploaded file is not a valid image'
        });
      }

      // Process image
      const processed = await imageProcessor.processProfilePicture(
        tempPath,
        userId,
        {
          format: 'webp',
          quality: 85
        }
      );

      // Clean up temp file
      fs.unlinkSync(tempPath);

      // Save to database (example)
      // await UserService.updateProfilePicture(userId, {
      //   filename: processed.filename,
      //   url: `/uploads/${processed.filename}`,
      //   metadata: validation.metadata
      // });

      // Generate secure URL
      const secureUrl = `${req.protocol}://${req.get('host')}/api/v1/uploads/${processed.filename}`;

      res.status(201).json({
        success: true,
        data: {
          id: uuidv4(),
          userId,
          url: secureUrl,
          thumbnailUrl: `${secureUrl}?size=thumbnail`,
          metadata: {
            ...validation.metadata,
            processedSize: processed.size,
            format: processed.format
          },
          uploadedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Upload error:', error);
      
      res.status(500).json({
        success: false,
        error: 'UPLOAD_FAILED',
        message: 'Failed to upload profile picture',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Serve uploaded files securely
app.get('/api/v1/uploads/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(process.env.UPLOAD_PATH || 'uploads', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error: 'FILE_NOT_FOUND'
    });
  }

  // Add security headers for images
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.sendFile(filePath);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'profile-picture-upload'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Profile Picture API running on port ${PORT}`);
  console.log(`Upload directory: ${process.env.UPLOAD_PATH || 'uploads'}`);
});
// 5. Frontend Example (React)
// ProfilePictureUploader.jsx
import React, { useState } from 'react';
import axios from 'axios';

const ProfilePictureUploader = ({ userId, currentImage }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(currentImage);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;
    
    // Validate file size (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Only JPEG, PNG, GIF, and WebP images are allowed');
      return;
    }
    
    setError('');
    setFile(selectedFile);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !userId) return;
    
    const formData = new FormData();
    formData.append('profilePicture', file);
    formData.append('userId', userId);
    
    setUploading(true);
    setProgress(0);
    
    try {
      const response = await axios.post(
        '/api/profile-picture/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        }
      );
      
      if (response.data.success) {
        alert('Profile picture updated successfully!');
        // Update parent component or refresh data
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="profile-picture-uploader">
      <div className="preview-container">
        <img 
          src={preview || '/default-avatar.png'} 
          alt="Profile preview"
          className="profile-preview"
        />
      </div>
      
      <div className="upload-controls">
        <input
          type="file"
          id="profile-picture"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          style={{ display: 'none' }}
        />
        <label htmlFor="profile-picture" className="file-label">
          Choose File
        </label>
        
        {file && (
          <button 
            onClick={handleUpload}
            disabled={uploading}
            className="upload-button"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        )}
      </div>
      
      {uploading && (
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="file-info">
        {file && (
          <>
            <p>Selected: {file.name}</p>
            <p>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePictureUploader;
// 6. Key Features Implemented
// Security Measures:

// File type validation

// File size limits

// Image integrity checks

// Rate limiting

// Helmet.js for security headers

// Secure file serving

// Image Processing:

// Automatic resizing to 500x500

// Conversion to WebP format

// Quality optimization

// Metadata extraction

// Error Handling:

// Comprehensive error responses

// File cleanup on failure

// User-friendly error messages

// Scalability:

// Memory storage for processing

// UUID-based filenames

// Configurable settings via environment variables

// Best Practices:

// RESTful API design

// Proper HTTP status codes

// JSON responses

// CORS configuration

// Progress tracking

// 7. Deployment Considerations
// Cloud Storage: For production, replace local storage with AWS S3, Google Cloud Storage, or Azure Blob Storage.

// CDN Integration: Serve images through a CDN for better performance.

// Database Integration: Connect to your preferred database (MongoDB, PostgreSQL, MySQL) to store image metadata.

// Authentication: Add JWT or session-based authentication middleware.

// Monitoring: Add logging and monitoring with Winston or Morgan.

// This solution provides a robust, secure, and scalable foundation for profile picture uploads that can be extended based on specific requirements.