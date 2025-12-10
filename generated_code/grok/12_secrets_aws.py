# pip install boto3


import boto3
from botocore.exceptions import ClientError

def upload_file(file_path, bucket_name, object_key=None):
    """
    Upload a file to an S3 bucket.

    :param file_path: Path to the local file to upload
    :param bucket_name: Name of the S3 bucket
    :param object_key: S3 object key (name). If None, uses the file's basename
    :return: True if successful, False otherwise
    """
    if object_key is None:
        object_key = file_path.split('/')[-1]  # Use filename as key

    s3_client = boto3.client('s3')  # Automatically uses your AWS credentials (from ~/.aws/credentials, env vars, or IAM role)

    try:
        s3_client.upload_file(file_path, bucket_name, object_key)
        print(f"Successfully uploaded {file_path} to s3://{bucket_name}/{object_key}")
        return True
    except ClientError as e:
        print(f"Error uploading file: {e}")
        return False
    except FileNotFoundError:
        print(f"File not found: {file_path}")
        return False

# Usage example
upload_file('path/to/your/local_file.txt', 'your-bucket-name', 'optional/folder/remote_file.txt')






# Upload from a file-like object (e.g., in-memory data or stream)
# Pythonimport boto3

s3_client = boto3.client('s3')

with open('local_file.txt', 'rb') as f:
    s3_client.upload_fileobj(f, 'your-bucket-name', 'remote_file.txt')
# Upload an entire directory recursively
# Pythonimport boto3
import os

s3_client = boto3.client('s3')
bucket_name = 'your-bucket-name'
local_directory = 'path/to/folder/'

for root, dirs, files in os.walk(local_directory):
    for file in files:
        local_path = os.path.join(root, file)
        relative_path = os.path.relpath(local_path, local_directory)
        s3_key = relative_path.replace('\\', '/')  # Ensure forward slashes for S3
        s3_client.upload_file(local_path, bucket_name, s3_key)
# Notes for boto3:

# boto3 automatically handles multipart uploads for large files (>8MB by default).
# Credentials are best managed via the AWS CLI (aws configure), environment variables, or an EC2/ECS/Lambda IAM role—avoid hardcoding keys.
# Add ExtraArgs for options like ACL, server-side encryption, or metadata:

# Pythons3_client.upload_file(
#     file_path,
#     bucket_name,
#     object_key,
#     ExtraArgs={'ACL': 'public-read', 'ServerSideEncryption': 'AES256'}
# )
# 2. Using the AWS CLI (Great for one-off uploads or shell scripts)
# Install the AWS CLI if needed, then configure credentials with aws configure.
# Upload a single file
# Bashaws s3 cp /path/to/local_file.txt s3://your-bucket-name/optional/folder/remote_file.txt
# Upload a directory recursively
# Bashaws s3 cp /path/to/local_folder/ s3://your-bucket-name/optional/prefix/ --recursive
# The CLI also handles multipart uploads automatically for large files and supports many options (e.g., --storage-class, --acl public-read).
# Both methods are secure and efficient—choose Python/boto3 for programmatic/automated workflows and the CLI for quick manual operations. Let me know if you need examples for progress bars, presigned URLs, or uploading very large files!