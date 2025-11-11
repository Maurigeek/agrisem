// server/utils/s3.client.js
import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

const endpoint = process.env.STORAGES_S3_ENDPOINT; // eg http://minio:9000
const region = process.env.STORAGES_S3_REGION || "us-east-1";
const accessKeyId = process.env.STORAGES_S3_ACCESS_KEY;
const secretAccessKey = process.env.STORAGES_S3_SECRET_KEY;

export const s3Client = new S3Client({
  region,
  endpoint,
  forcePathStyle: true, // required for MinIO
  credentials: { accessKeyId, secretAccessKey },
});
