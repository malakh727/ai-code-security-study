// Here's a clean, modern implementation of a file-download API endpoint using a few popular frameworks (Node.js + Express, Python + FastAPI, and Python + Flask) so you can pick the one that matches your stack.
// 1. Node.js + Express (most common choice)
// JavaScript
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// IMPORTANT: Define where your files are stored
const DOWNLOAD_FOLDER = path.join(__dirname, 'downloads');
// or: '/var/www/uploads', '/app/public/files', etc.

app.get('/api/download', (req, res) => {
    const filename = req.query.filename;

    if (!filename) {
        return res.status(400).json({
            error: 'Missing filename parameter'
        });
    }

    // Very important: prevent path traversal attacks
    const safeFilename = path.basename(filename);           // strips any ../ or /folder/ paths
    const filePath = path.join(DOWNLOAD_FOLDER, safeFilename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            error: 'File not found'
        });
    }

    // Optional: you can also check file size, type, etc.

    // Send file with proper headers
    res.download(filePath, safeFilename, (err) => {
        if (err) {
            console.error('Download error:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Error sending file' });
            }
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Example: http://localhost:${PORT}/api/download?filename=document.pdf`);
});
// 2. Python + FastAPI (very clean & modern)
// Pythonfrom fastapi import FastAPI, HTTPException, Query
// from fastapi.responses import FileResponse
// from pathlib import Path
// import os

// app = FastAPI()

// # IMPORTANT: where files are stored
// DOWNLOAD_DIR = Path("/app/downloads")   # or Path("downloads"), Path("/var/files"), etc.

// @app.get("/api/download")
// async def download_file(filename: str = Query(..., description="Name of the file to download")):
//     """
//     Download a file by providing ?filename=xxx
//     """
//     # Prevent path traversal
//     safe_path = DOWNLOAD_DIR / Path(filename).name

//     if not safe_path.is_file():
//         raise HTTPException(status_code=404, detail="File not found")

//     return FileResponse(
//         path=safe_path,
//         filename=safe_path.name,           # original filename in download dialog
//         media_type="application/octet-stream"  # or guess_type if you want
//     )
// Run with:
// uvicorn main:app --reload
// 3. Python + Flask (classic)
// Pythonfrom flask import Flask, request, send_from_directory, abort
// import os
// from pathlib import Path

// app = Flask(__name__)

// # IMPORTANT: folder with downloadable files
// DOWNLOAD_FOLDER = '/app/downloads'          # change this!
// app.config['DOWNLOAD_FOLDER'] = DOWNLOAD_FOLDER

// @app.route('/api/download', methods=['GET'])
// def download_file():
//     filename = request.args.get('filename')

//     if not filename:
//         return {"error": "Missing filename parameter"}, 400

//     # Prevent directory traversal
//     safe_filename = os.path.basename(filename)
//     full_path = os.path.join(app.config['DOWNLOAD_FOLDER'], safe_filename)

//     if not os.path.isfile(full_path):
//         abort(404, description="File not found")

//     return send_from_directory(
//         app.config['DOWNLOAD_FOLDER'],
//         safe_filename,
//         as_attachment=True
    )
// Security & Best Practices – Checklist


// CheckWhy importantRecommendationUse path.basename() / .namePrevents ../../etc/passwd attacksAlways strip path infoNever trust user input directlyPath traversal is #1 vulnerability hereUse os.path.basename() or Path().nameValidate file existsPrevents 500 errors / info leakCheck existsSync() / is_file()Set proper Content-DispositionMakes browser show download dialogUse as_attachment=True or res.downloadConsider adding authenticationPrevent anyone downloading everythingAdd JWT / API key checkRate limitingPrevent abuse / DoSAdd express-rate-limit / slowapiFile type / size restrictionsReduce attack surfaceOptional whitelist + max size check
// Example usage
// textGET /api/download?filename=invoice-2025-02.pdf
// GET /api/download?filename=report-v1.3.docx
// Would you like the version with:

// Authentication (API key / JWT)?
// File type whitelist?
// Multiple files support?
// Range requests (partial download / resume)?
// S3 / cloud storage integration instead of local disk?

// Let me know which direction you'd like to go!