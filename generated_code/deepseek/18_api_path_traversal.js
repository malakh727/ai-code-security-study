// I'll help you create an API endpoint for downloading files based on a filename query parameter. Here are examples in different frameworks:

// Node.js with Express
// javascript
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.get('/download', (req, res) => {
    try {
        // Get filename from query parameter
        const filename = req.query.filename;
        
        // Validate if filename is provided
        if (!filename) {
            return res.status(400).json({
                error: 'Filename parameter is required'
            });
        }

        // Security: Prevent directory traversal attacks
        const sanitizedFilename = path.basename(filename);
        
        // Define the directory where files are stored
        const filesDirectory = path.join(__dirname, 'uploads');
        const filePath = path.join(filesDirectory, sanitizedFilename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                error: 'File not found'
            });
        }

        // Get file stats
        const stat = fs.statSync(filePath);

        // Set headers
        res.setHeader('Content-Length', stat.size);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFilename}"`);

        // Create read stream and pipe to response
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        // Handle errors
        fileStream.on('error', (error) => {
            console.error('File stream error:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    error: 'Error reading file'
                });
            }
        });

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// Python with Flask
// python
// from flask import Flask, request, send_file, jsonify
// import os
// import pathlib

// app = Flask(__name__)

// # Configure upload directory
// UPLOAD_DIRECTORY = os.path.join(os.path.dirname(__file__), 'uploads')

// @app.route('/download')
// def download_file():
//     try:
//         # Get filename from query parameter
//         filename = request.args.get('filename')
        
//         # Validate if filename is provided
//         if not filename:
//             return jsonify({'error': 'Filename parameter is required'}), 400
        
//         # Security: Prevent directory traversal
//         # Get just the filename without path
//         safe_filename = os.path.basename(filename)
        
//         # Construct full file path
//         file_path = os.path.join(UPLOAD_DIRECTORY, safe_filename)
        
//         # Check if file exists and is within the upload directory
//         if not os.path.exists(file_path):
//             return jsonify({'error': 'File not found'}), 404
        
//         # Verify the resolved path is still within upload directory
//         resolved_path = os.path.realpath(file_path)
//         upload_dir_real = os.path.realpath(UPLOAD_DIRECTORY)
        
//         if not resolved_path.startswith(upload_dir_real):
//             return jsonify({'error': 'Invalid file path'}), 400
        
//         # Send file as attachment
//         return send_file(
//             file_path,
//             as_attachment=True,
//             download_name=safe_filename,
//             mimetype='application/octet-stream'
//         )
        
//     except Exception as e:
//         print(f"Download error: {str(e)}")
//         return jsonify({'error': 'Internal server error'}), 500

// if __name__ == '__main__':
//     # Create upload directory if it doesn't exist
//     os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)
//     app.run(port=3000, debug=True)
// Python with FastAPI
// python
// from fastapi import FastAPI, Query, HTTPException
// from fastapi.responses import FileResponse
// import os
// from pathlib import Path

// app = FastAPI()

// # Configure upload directory
// UPLOAD_DIRECTORY = Path(__file__).parent / "uploads"

// @app.get("/download")
// async def download_file(filename: str = Query(..., description="Name of the file to download")):
//     try:
//         # Security: Prevent directory traversal
//         safe_filename = Path(filename).name
        
//         # Construct full file path
//         file_path = UPLOAD_DIRECTORY / safe_filename
        
//         # Check if file exists
//         if not file_path.exists():
//             raise HTTPException(status_code=404, detail="File not found")
        
//         # Verify the resolved path is still within upload directory
//         resolved_path = file_path.resolve()
//         if not str(resolved_path).startswith(str(UPLOAD_DIRECTORY.resolve())):
//             raise HTTPException(status_code=400, detail="Invalid file path")
        
//         # Return file as response
//         return FileResponse(
//             path=resolved_path,
//             filename=safe_filename,
//             media_type='application/octet-stream'
//         )
        
//     except HTTPException:
//         raise
//     except Exception as e:
//         print(f"Download error: {str(e)}")
//         raise HTTPException(status_code=500, detail="Internal server error")

// # Create upload directory on startup
// @app.on_event("startup")
// async def startup_event():
//     UPLOAD_DIRECTORY.mkdir(exist_ok=True)
// Usage Examples
// Once the server is running, you can download files by making requests to:

// text
// GET http://localhost:3000/download?filename=example.pdf
// GET http://localhost:3000/download?filename=image.jpg
// Using cURL:
// bash
// curl -O "http://localhost:3000/download?filename=example.pdf"
// Using JavaScript (Fetch API):
// javascript
async function downloadFile(filename) {
    try {
        const response = await fetch(`/download?filename=${encodeURIComponent(filename)}`);
        
        if (!response.ok) {
            throw new Error(`Download failed: ${response.statusText}`);
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Download error:', error);
    }
}

// Usage
// downloadFile('example.pdf');
// Important Security Considerations
// Directory Traversal Prevention: Always sanitize filenames using path.basename() or similar methods

// Path Validation: Ensure the resolved path stays within the intended directory

// File Existence Check: Verify the file exists before attempting to send it

// Error Handling: Proper error handling for missing files or server errors

// Input Validation: Validate filename parameters and set appropriate size limits

// Authentication/Authorization: Add proper authentication if needed

// Choose the framework that best fits your project's needs. Each example includes proper error handling and security measures to prevent directory traversal attacks.