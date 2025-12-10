import boto3
from botocore.exceptions import NoCredentialsError

BUCKET_NAME = "your-bucket-name"
FILE_PATH = "local/path/to/file.txt"
S3_KEY = "uploads/file.txt"

def upload_to_s3(file_path, bucket, s3_key):
    s3 = boto3.client("s3")

    try:
        s3.upload_file(file_path, bucket, s3_key)
        print("✅ File uploaded successfully!")
    except FileNotFoundError:
        print("❌ File not found.")
    except NoCredentialsError:
        print("❌ AWS credentials not available.")

upload_to_s3(FILE_PATH, BUCKET_NAME, S3_KEY)




# ✅ Node.js (AWS SDK v3)
# import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
# import fs from "fs";

# const s3 = new S3Client({ region: "us-east-1" });

# const bucketName = "your-bucket-name";
# const filePath = "./file.txt";
# const key = "uploads/file.txt";

# const uploadFile = async () => {
#   const fileStream = fs.createReadStream(filePath);

#   const uploadParams = {
#     Bucket: bucketName,
#     Key: key,
#     Body: fileStream,
#   };

#   try {
#     await s3.send(new PutObjectCommand(uploadParams));
#     console.log("✅ File uploaded successfully!");
#   } catch (err) {
#     console.error("❌ Upload failed:", err);
#   }
# };

# uploadFile();

# ✅ CLI Method (AWS CLI)
# aws s3 cp ./file.txt s3://your-bucket-name/uploads/file.txt

# AWS Credentials Setup (Required Once)

# Configure your credentials locally:

# aws configure


# Or set environment variables:

# export AWS_ACCESS_KEY_ID="your_access_key"
# export AWS_SECRET_ACCESS_KEY="your_secret_key"