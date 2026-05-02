# 10:57 PMHere's a secure API endpoint for file downloads with proper validation and error handling:
# pythonfrom flask import Flask, request, send_file, jsonify, abort
import os
import mimetypes
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure the base directory for downloadable files
# IMPORTANT: Set this to your actual secure files directory
BASE_DOWNLOAD_DIR = os.path.abspath("./downloadable_files")


def is_safe_path(base_dir: str, requested_path: str) -> bool:
    """
    Prevent path traversal attacks by ensuring the resolved path
    stays within the allowed base directory.
    """
    resolved = os.path.realpath(os.path.join(base_dir, requested_path))
    return resolved.startswith(base_dir + os.sep) or resolved == base_dir


@app.route("/download", methods=["GET"])
def download_file():
    """
    Download a file by providing its filename as a query parameter.

    Query Parameters:
        filename (str): The name of the file to download (required).

    Returns:
        File as an attachment, or a JSON error response.

    Example:
        GET /download?filename=report.pdf
    """
    filename = request.args.get("filename")

    # --- Validate input ---
    if not filename:
        return jsonify({
            "error": "Missing parameter",
            "message": "The 'filename' query parameter is required."
        }), 400

    if not filename.strip():
        return jsonify({
            "error": "Invalid parameter",
            "message": "The 'filename' parameter cannot be empty or whitespace."
        }), 400

    # --- Guard against path traversal ---
    if not is_safe_path(BASE_DOWNLOAD_DIR, filename):
        logger.warning(f"Path traversal attempt detected: '{filename}'")
        return jsonify({
            "error": "Forbidden",
            "message": "Access to the requested file is not permitted."
        }), 403

    # --- Resolve the full file path ---
    file_path = os.path.realpath(os.path.join(BASE_DOWNLOAD_DIR, filename))

    # --- Check file existence ---
    if not os.path.exists(file_path):
        return jsonify({
            "error": "Not Found",
            "message": f"File '{filename}' does not exist."
        }), 404

    # --- Ensure it's a file, not a directory ---
    if not os.path.isfile(file_path):
        return jsonify({
            "error": "Invalid request",
            "message": f"'{filename}' is not a downloadable file."
        }), 400

    # --- Detect MIME type ---
    mime_type, _ = mimetypes.guess_type(file_path)
    mime_type = mime_type or "application/octet-stream"

    logger.info(f"Serving file: '{filename}' ({mime_type})")

    return send_file(
        file_path,
        mimetype=mime_type,
        as_attachment=True,         # Forces browser download
        download_name=os.path.basename(file_path)  # Sanitizes the name in the header
    )


# --- Optional: list available files (disable in production if sensitive) ---
@app.route("/files", methods=["GET"])
def list_files():
    """
    Returns a list of available files in the download directory.
    Remove or protect this endpoint in production environments.
    """
    if not os.path.exists(BASE_DOWNLOAD_DIR):
        return jsonify({"files": []})

    files = [
        f for f in os.listdir(BASE_DOWNLOAD_DIR)
        if os.path.isfile(os.path.join(BASE_DOWNLOAD_DIR, f))
    ]
    return jsonify({"files": files, "count": len(files)})


if __name__ == "__main__":
    os.makedirs(BASE_DOWNLOAD_DIR, exist_ok=True)
    app.run(debug=False, host="0.0.0.0", port=5000)
# ```

# ---

## How It Works

# **Request format:**
# ```
# GET /download?filename=report.pdf
# Response: The file is streamed back as an attachment with the correct MIME type — the browser will prompt a download.

# Key Security Measures
# Path Traversal Prevention is the most critical concern. Without it, a malicious user could request filename=../../etc/passwd and read arbitrary files. The is_safe_path() function resolves the real absolute path and checks that it stays within BASE_DOWNLOAD_DIR.
# python# This attack is blocked:
# GET /download?filename=../../etc/passwd  # → 403 Forbidden
# Input Validation rejects missing or blank filenames early with a clear 400 Bad Request.
# Directory Check ensures that even if a directory name is provided, it won't be served as a file.
# MIME Type Detection uses Python's mimetypes module to set the correct Content-Type header, so browsers handle the file appropriately.

# Setup & Usage
# bash# Install Flask
# pip install flask

# # Create the files directory and add sample files
# mkdir downloadable_files
# echo "Hello, World!" > downloadable_files/hello.txt

# # Run the server
# python app.py

# # Test it
# curl -OJ "http://localhost:5000/download?filename=hello.txt"

# Production Recommendations
# ConcernRecommendationAuthenticationAdd an API key, JWT, or session check before send_file()Rate LimitingUse flask-limiter to prevent abuseAllowlistRestrict allowed extensions (e.g., only .pdf, .csv)Large filesUse X-Accel-Redirect (Nginx) or X-Sendfile (Apache) for efficiency/files endpointDisable or protect it — exposing file names can be a privacy risk