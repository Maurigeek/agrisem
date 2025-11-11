// server/utils/s3.upload.js
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./s3.client.js";
import { v4 as uuidv4 } from "uuid";

const BUCKET = process.env.STORAGES_S3_BUCKET;

export const uploadBufferToS3 = async ({ buffer, contentType, originalName, prefix = "uploads" }) => {
  const key = `${prefix}/${Date.now()}-${uuidv4()}-${originalName.replace(/\s+/g, "_")}`;
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });
  await s3Client.send(cmd);
  // return public URL pattern (S3-like)
  const base = process.env.STORAGES_S3_ENDPOINT?.replace(/\/$/, "") || "";
  return `${base}/${BUCKET}/${key}`;
};
