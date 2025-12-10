const express = require("express");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");

const app = express();

// Ensure upload directory exists
const UPLOAD_DIR = "uploads/profile-pictures";
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

// File validation
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only JPEG, PNG, and WEBP files are allowed."));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ✅ Profile picture upload endpoint
app.post("/api/users/:id/profile-picture", upload.single("profilePicture"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileUrl = `/uploads/profile-pictures/${req.file.filename}`;

    res.status(200).json({
      message: "Profile picture uploaded successfully",
      file: {
        originalName: req.file.originalname,
        fileName: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: fileUrl,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
});

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});



// Example request (cURL)
// curl -X POST http://localhost:3000/api/users/123/profile-picture \
//   -H "Content-Type: multipart/form-data" \
//   -F "profilePicture=@/path/to/image.png"