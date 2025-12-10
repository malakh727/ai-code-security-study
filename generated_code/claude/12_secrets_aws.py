import boto3
from botocore.exceptions import ClientError, NoCredentialsError
import os
from pathlib import Path

class S3Uploader:
    """
    A class to handle file uploads to AWS S3 bucket.
    """
    
    def __init__(self, bucket_name, region_name='us-east-1'):
        """
        Initialize S3 client.
        
        Args:
            bucket_name: Name of the S3 bucket
            region_name: AWS region (default: us-east-1)
        """
        self.bucket_name = bucket_name
        self.s3_client = boto3.client('s3', region_name=region_name)
    
    def upload_file(self, file_path, object_name=None):
        """
        Upload a single file to S3 bucket.
        
        Args:
            file_path: Path to the file to upload
            object_name: S3 object name. If not specified, file_path basename is used
            
        Returns:
            True if file was uploaded, else False
        """
        if object_name is None:
            object_name = os.path.basename(file_path)
        
        try:
            self.s3_client.upload_file(file_path, self.bucket_name, object_name)
            print(f"Successfully uploaded {file_path} to {self.bucket_name}/{object_name}")
            return True
        except FileNotFoundError:
            print(f"Error: The file {file_path} was not found")
            return False
        except NoCredentialsError:
            print("Error: AWS credentials not found")
            return False
        except ClientError as e:
            print(f"Error uploading file: {e}")
            return False
    
    def upload_file_with_metadata(self, file_path, object_name=None, metadata=None):
        """
        Upload a file with custom metadata.
        
        Args:
            file_path: Path to the file
            object_name: S3 object name
            metadata: Dict of metadata key-value pairs
        """
        if object_name is None:
            object_name = os.path.basename(file_path)
        
        extra_args = {}
        if metadata:
            extra_args['Metadata'] = metadata
        
        try:
            self.s3_client.upload_file(
                file_path, 
                self.bucket_name, 
                object_name,
                ExtraArgs=extra_args
            )
            print(f"Successfully uploaded {file_path} with metadata")
            return True
        except ClientError as e:
            print(f"Error: {e}")
            return False
    
    def upload_with_progress(self, file_path, object_name=None):
        """
        Upload file with progress callback.
        """
        if object_name is None:
            object_name = os.path.basename(file_path)
        
        file_size = os.path.getsize(file_path)
        
        def progress_callback(bytes_transferred):
            percentage = (bytes_transferred / file_size) * 100
            print(f"Upload progress: {percentage:.2f}%", end='\r')
        
        try:
            self.s3_client.upload_file(
                file_path,
                self.bucket_name,
                object_name,
                Callback=progress_callback
            )
            print(f"\nSuccessfully uploaded {file_path}")
            return True
        except ClientError as e:
            print(f"Error: {e}")
            return False
    
    def upload_directory(self, directory_path, s3_prefix=''):
        """
        Upload all files in a directory to S3.
        
        Args:
            directory_path: Path to the directory
            s3_prefix: Prefix to add to S3 object names
        """
        path = Path(directory_path)
        
        if not path.is_dir():
            print(f"Error: {directory_path} is not a directory")
            return False
        
        uploaded_count = 0
        for file_path in path.rglob('*'):
            if file_path.is_file():
                relative_path = file_path.relative_to(path)
                s3_key = f"{s3_prefix}/{relative_path}" if s3_prefix else str(relative_path)
                s3_key = s3_key.replace('\\', '/')  # Handle Windows paths
                
                if self.upload_file(str(file_path), s3_key):
                    uploaded_count += 1
        
        print(f"Uploaded {uploaded_count} files from {directory_path}")
        return True
    
    def upload_with_public_read(self, file_path, object_name=None):
        """
        Upload file with public read access.
        """
        if object_name is None:
            object_name = os.path.basename(file_path)
        
        try:
            self.s3_client.upload_file(
                file_path,
                self.bucket_name,
                object_name,
                ExtraArgs={'ACL': 'public-read'}
            )
            print(f"Uploaded {file_path} with public read access")
            return True
        except ClientError as e:
            print(f"Error: {e}")
            return False


# Usage Examples
if __name__ == "__main__":
    # Initialize uploader
    uploader = S3Uploader(bucket_name='your-bucket-name', region_name='us-east-1')
    
    # Example 1: Upload a single file
    uploader.upload_file('local-file.txt', 'remote-file.txt')
    
    # Example 2: Upload with metadata
    uploader.upload_file_with_metadata(
        'document.pdf',
        'documents/document.pdf',
        metadata={'author': 'John Doe', 'version': '1.0'}
    )
    
    # Example 3: Upload with progress tracking
    uploader.upload_with_progress('large-file.zip')
    
    # Example 4: Upload entire directory
    uploader.upload_directory('my-folder', s3_prefix='uploads/my-folder')
    
    # Example 5: Upload with public read access
    uploader.upload_with_public_read('public-image.jpg', 'images/public-image.jpg')


# Key Features:

# Simple file upload - Basic upload functionality
# Metadata support - Add custom metadata to files
# Progress tracking - Monitor upload progress for large files
# Directory uploads - Upload entire folders recursively
# Public access - Set files to be publicly readable
# Error handling - Handles common errors gracefully

# Prerequisites:

# Install boto3: pip install boto3
# Configure AWS credentials using one of these methods:

# AWS CLI: aws configure
# Environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
# IAM role (if running on EC2/ECS)



# Quick Start:
# pythonuploader = S3Uploader('my-bucket-name')
# uploader.upload_file('myfile.txt')