// 1. Using AWS SDK for JavaScript (Node.js)
// First, install the AWS SDK:

// bash
// npm install @aws-sdk/client-s3
// Basic Upload Code:
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';

// Configure AWS credentials (prefer using environment variables or AWS config)
const s3Client = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

async function uploadFileToS3(filePath, bucketName, keyName) {
  try {
    const fileContent = fs.readFileSync(filePath);
    
    const params = {
      Bucket: bucketName,
      Key: keyName, // File name in S3
      Body: fileContent,
      // Optional metadata
      Metadata: {
        'uploaded-by': 'nodejs-script'
      }
    };

    const command = new PutObjectCommand(params);
    const response = await s3Client.send(command);
    
    console.log(`File uploaded successfully. ETag: ${response.ETag}`);
    return response;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Usage
uploadFileToS3('./myfile.txt', 'my-bucket', 'uploads/myfile.txt');
// Upload with Progress Tracking:

import { Upload } from '@aws-sdk/lib-storage';
import fs from 'fs';

async function uploadWithProgress(filePath, bucketName, keyName) {
  const fileStream = fs.createReadStream(filePath);
  
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucketName,
      Key: keyName,
      Body: fileStream,
    }
  });

  upload.on('httpUploadProgress', (progress) => {
    console.log(`Uploaded: ${progress.loaded} / ${progress.total} bytes`);
  });

  const result = await upload.done();
  console.log('Upload complete:', result.Location);
  return result;
}
// 2. Using Python (boto3)
// First, install boto3:

// bash
// pip install boto3
// python
// import boto3
// from botocore.exceptions import NoCredentialsError

// def upload_file_to_s3(file_name, bucket, object_name=None):
//     """Upload a file to an S3 bucket"""
    
//     # If S3 object_name was not specified, use file_name
//     if object_name is None:
//         object_name = file_name
    
//     # Create S3 client
//     s3_client = boto3.client('s3')
    
//     try:
//         # Upload the file
//         response = s3_client.upload_file(
//             file_name, 
//             bucket, 
//             object_name,
//             ExtraArgs={
//                 'ACL': 'private',  # or 'public-read' for public files
//                 'ContentType': 'text/plain'  # Set appropriate content type
//             }
//         )
//         print(f"File {file_name} uploaded to {bucket}/{object_name}")
//         return True
//     except FileNotFoundError:
//         print(f"The file {file_name} was not found")
//         return False
//     except NoCredentialsError:
//         print("Credentials not available")
//         return False

// # Usage
// upload_file_to_s3('myfile.txt', 'my-bucket', 'uploads/myfile.txt')
// Upload with Metadata and Tags:
// python
// def upload_file_with_metadata(file_name, bucket, object_name):
//     s3_client = boto3.client('s3')
    
//     with open(file_name, 'rb') as file:
//         response = s3_client.put_object(
//             Bucket=bucket,
//             Key=object_name,
//             Body=file,
//             Metadata={
//                 'author': 'john-doe',
//                 'department': 'engineering'
//             },
//             Tagging='Environment=Production&Project=WebApp'
//         )
    
//     return response
// 3. Using AWS CLI
// First, install AWS CLI and configure credentials:

// bash
// aws configure
// Upload a single file:

// bash
// aws s3 cp myfile.txt s3://my-bucket/uploads/myfile.txt
// Upload entire directory:

// bash
// aws s3 sync ./local-folder s3://my-bucket/remote-folder
// 4. Using Presigned URLs (Client-side upload)
// Server-side: Generate presigned URL
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

async function generatePresignedUrl(bucketName, keyName) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: keyName,
    ContentType: 'application/octet-stream'
  });
  
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return url;
}

// Client-side: Upload using fetch
async function uploadToPresignedUrl(file, presignedUrl) {
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type
    }
  });
  
  if (response.ok) {
    console.log('Upload successful');
  } else {
    console.error('Upload failed');
  }
}
// # 5. Multipart Upload for Large Files
import { S3Client, CreateMultipartUploadCommand, 
         UploadPartCommand, CompleteMultipartUploadCommand } from '@aws-sdk/client-s3';

async function uploadLargeFile(filePath, bucketName, keyName) {
  const fileStream = fs.createReadStream(filePath);
  const fileSize = fs.statSync(filePath).size;
  const partSize = 5 * 1024 * 1024; // 5MB parts
  
  // Initiate multipart upload
  const createParams = { Bucket: bucketName, Key: keyName };
  const createCommand = new CreateMultipartUploadCommand(createParams);
  const { UploadId } = await s3Client.send(createCommand);
  
  let partNumber = 1;
  const parts = [];
  
  // Upload parts
  for (let start = 0; start < fileSize; start += partSize) {
    const end = Math.min(start + partSize, fileSize);
    const partBuffer = Buffer.alloc(end - start);
    fileStream.read(partBuffer);
    
    const uploadParams = {
      Bucket: bucketName,
      Key: keyName,
      UploadId,
      PartNumber: partNumber,
      Body: partBuffer
    };
    
    const uploadCommand = new UploadPartCommand(uploadParams);
    const { ETag } = await s3Client.send(uploadCommand);
    
    parts.push({ ETag, PartNumber: partNumber });
    partNumber++;
  }
  
  // Complete upload
  const completeParams = {
    Bucket: bucketName,
    Key: keyName,
    UploadId,
    MultipartUpload: { Parts: parts }
  };
  
  const completeCommand = new CompleteMultipartUploadCommand(completeParams);
  return await s3Client.send(completeCommand);
}
// Environment Variables Setup
// Create a .env file:

// bash
// AWS_ACCESS_KEY_ID=your_access_key
// AWS_SECRET_ACCESS_KEY=your_secret_key
// AWS_REGION=us-east-1
// AWS_BUCKET_NAME=your-bucket-name
// Security Best Practices:
// Never hardcode credentials - Use environment variables or IAM roles

// Use IAM roles for applications running on AWS

// Set appropriate permissions using bucket policies

// Enable encryption for sensitive data

// Validate file types and sizes server-side

// Use presigned URLs for client-side uploads

// Choose the method based on your use case:

// Node.js/Python SDKs: For server-side applications

// AWS CLI: For manual/uploads or scripting

// Presigned URLs: For direct client-to-S3 uploads

// Multipart Upload: For large files (>100MB)