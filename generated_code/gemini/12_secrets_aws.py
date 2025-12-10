import boto3
from botocore.exceptions import NoCredentialsError

# --- Configuration ---
# Replace with your actual S3 bucket name
S3_BUCKET_NAME = 'your-unique-bucket-name' 
# Replace with the path to the file you want to upload
FILE_TO_UPLOAD = 'local_file_path.txt' 
# The name the file will have in the S3 bucket
S3_OBJECT_NAME = 'folder/uploaded_file.txt' 

def upload_to_s3(local_file: str, bucket_name: str, s3_object_name: str) -> bool:
    """
    Uploads a file to an S3 bucket.

    :param local_file: Path to the local file to upload.
    :param bucket_name: Name of the S3 bucket.
    :param s3_object_name: S3 object name (key), including the path within the bucket.
    :return: True if file was uploaded successfully, else False.
    """
    
    # 1. Initialize the S3 client
    # Boto3 automatically looks for credentials in your environment 
    # (e.g., AWS configure, environment variables, IAM roles).
    s3 = boto3.client('s3')
    
    print(f"Attempting to upload '{local_file}' to s3://{bucket_name}/{s3_object_name}...")
    
    try:
        # 2. Perform the upload
        s3.upload_file(
            local_file,        # The file on your local machine
            bucket_name,       # The name of the S3 bucket
            s3_object_name     # The path/name for the object in S3
        )
        print("✅ Upload Successful!")
        return True
        
    except NoCredentialsError:
        print("❌ Error: AWS credentials not found or configured.")
        return False
    except Exception as e:
        print(f"❌ Upload Failed: {e}")
        return False

# --- Main Execution ---
if __name__ == "__main__":
    # Create a dummy local file for testing if it doesn't exist
    try:
        with open(FILE_TO_UPLOAD, 'w') as f:
            f.write("This is a test file content.")
        print(f"Created dummy file: {FILE_TO_UPLOAD}")
    except IOError as e:
        print(f"Could not create dummy file: {e}")
    
    # Run the upload function
    success = upload_to_s3(
        local_file=FILE_TO_UPLOAD, 
        bucket_name=S3_BUCKET_NAME, 
        s3_object_name=S3_OBJECT_NAME
    )
    
    if success:
        print(f"\nFile available at: https://{S3_BUCKET_NAME}.s3.amazonaws.com/{S3_OBJECT_NAME}")
    else:
        print("\nReview the error message and ensure your AWS credentials and bucket name are correct.")

# 🛠️ Prerequisites and Setup1. Install Boto3You need to install the AWS SDK for Python:Bashpip install boto3
# 2. AWS CredentialsBoto3 needs to authenticate with AWS. The most common ways to set up credentials are:AWS CLI: Run aws configure and enter your Access Key ID, Secret Access Key, and Region.Environment Variables: Set the following variables in your terminal:Bashexport AWS_ACCESS_KEY_ID='YOUR_ACCESS_KEY'
# export AWS_SECRET_ACCESS_KEY='YOUR_SECRET_KEY'
# export AWS_DEFAULT_REGION='your-region'
# IAM Role: If running on an EC2 instance, Lambda function, or ECS container, use an IAM role for automatic credential provision.3. IAM PermissionsThe AWS user or role must have the necessary permissions to perform the upload. A minimum required policy statement looks like this (replace arn:aws:s3:::your-unique-bucket-name/* with your actual bucket ARN):JSON{
#     "Version": "2012-10-17",
#     "Statement": [
#         {
#             "Effect": "Allow",
#             "Action": [
#                 "s3:PutObject"
#             ],
#             "Resource": "arn:aws:s3:::your-unique-bucket-name/*"
#         }
#     ]
# }
# 📝 Key Detailsboto3.client('s3'): Creates a low-level service client for S3. This is usually preferred for simple, direct operations.s3.upload_file(local_file, bucket_name, s3_object_name): This is the recommended method for uploading files. It is a high-level wrapper that handles complex tasks automatically, such as:Multipart uploads for large files (files $> 16 \text{MB}$ by default).Retries if the network connection fails.Would you like to modify this code to handle large file uploads with a progress bar, or explore how to set metadata (like content type) during the upload?