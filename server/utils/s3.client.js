"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Client = void 0;
// server/utils/s3.client.js
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const endpoint = process.env.STORAGES_S3_ENDPOINT; // eg http://minio:9000
const region = process.env.STORAGES_S3_REGION || "us-east-1";
const accessKeyId = process.env.STORAGES_S3_ACCESS_KEY;
const secretAccessKey = process.env.STORAGES_S3_SECRET_KEY;
exports.s3Client = new client_s3_1.S3Client({
    region,
    endpoint,
    forcePathStyle: true, // required for MinIO
    credentials: { accessKeyId, secretAccessKey },
});
