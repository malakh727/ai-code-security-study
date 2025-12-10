// Here is a conceptual example using Node.js with Express and the multer middleware, which is commonly used for handling multipart/form-data.

// 🛠️ Conceptual API Implementation (Node.js/Express)
// 1. Project Setup and Dependencies
// You would typically install Express and Multer:

// Bash

// npm install express multer

// 2. Configure Multer for File Storage
// Multer needs to know where to save the files and what to name them. You can use disk storage for simplicity her

const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
// NOTE: This assumes you have a 'uploads/' directory in your project root.

// --- Multer Disk Storage Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set the destination folder for uploads
    cb(null, 'uploads/profile_pictures/');
  },
  filename: (req, file, cb) => {
    // Create a unique filename: user-id + timestamp + original extension
    const userId = req.body.userId || 'guest'; // Get user ID from the request body/session
    const extension = path.extname(file.originalname);
    cb(null, `${userId}-${Date.now()}${extension}`);
  }
});

// --- Multer Middleware Setup ---
// Configure Multer to use the defined storage and optionally set file limits/filters
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB file size limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files (JPEG, PNG)
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true); // Accept file
    } else {
      cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'), false); // Reject file
    }
  }
});


// 3. Create the API EndpointThis is the POST endpoint that uses the upload middleware before the route handler.JavaScript// POST /api/v1/profile/upload
// 'profile_picture' is the name of the field in the multipart form data
app.post('/api/v1/profile/upload', upload.single('profile_picture'), (req, res) => {
  // 1. Multer middleware (upload.single) has processed the file
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded.' });
  }

  // 2. The file is saved and information is in req.file
  const filePath = req.file.path; // The relative path where the file is saved

  // 3. Update the user's database record
  // (In a real application, you would use req.user.id from an auth middleware)
  const userId = req.body.userId; // Example: Get user ID from body
  
  // *** Pseudo-Code for Database Update ***
  // db.users.update(
  //   { profilePictureUrl: filePath }, // Store the path/URL
  //   { where: { id: userId } }
  // );

  // 4. Send a success response
  res.status(200).send({
    message: 'Profile picture uploaded successfully!',
    fileName: req.file.filename,
    filePath: filePath // Or the public URL if using cloud storage
  });
});

// --- Error Handling Middleware for Multer ---
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Multer-specific errors (e.g., file size limit exceeded)
        return res.status(400).send({ message: err.message });
    } else if (err) {
        // Other errors (e.g., Invalid file type from fileFilter)
        return res.status(400).send({ message: err.message });
    }
    next();
});

// app.listen(3000, () => console.log('Server running on port 3000'));
// 🚀 How to Test the EndpointTo test this API, you would use a tool like Postman or a web form, sending a POST request to http://localhost:3000/api/v1/profile/upload with the following configuration:SettingValueHTTP MethodPOSTURL/api/v1/profile/uploadBody Typeform-dataKeyprofile_picture (must match the name used in upload.single())Value TypeFile (select your image file)Optional KeyuserIdOptional Value123Key ConsiderationsAuthentication: In a real-world scenario, you would insert an authentication middleware before upload.single to verify the user and get their ID (e.g., from a JWT token).Storage: For production, you should use Cloud Storage (like Amazon S3, Google Cloud Storage, or Azure Blob Storage) instead of local disk storage.Security: Always sanitize input, ensure file type validation, and never directly execute files uploaded by users.