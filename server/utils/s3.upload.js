"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBufferToS3 = void 0;
// server/utils/s3.upload.js
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_client_js_1 = require("./s3.client.js");
const uuid_1 = require("uuid");
const BUCKET = process.env.STORAGES_S3_BUCKET;
const uploadBufferToS3 = async ({ buffer, contentType, originalName, prefix = "uploads" }) => {
    const key = `${prefix}/${Date.now()}-${(0, uuid_1.v4)()}-${originalName.replace(/\s+/g, "_")}`;
    const cmd = new client_s3_1.PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
    });
    await s3_client_js_1.s3Client.send(cmd);
    // return public URL pattern (S3-like)
    const base = process.env.STORAGES_S3_ENDPOINT?.replace(/\/$/, "") || "";
    return `${base}/${BUCKET}/${key}`;
};
exports.uploadBufferToS3 = uploadBufferToS3;
