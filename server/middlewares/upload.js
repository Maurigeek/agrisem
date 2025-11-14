"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSingleProof = exports.uploadProductImages = void 0;
// server/middlewares/upload.js
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Ensure folders exist
const ensureDir = (p) => {
    if (!fs_1.default.existsSync(p))
        fs_1.default.mkdirSync(p, { recursive: true });
};
const UPLOAD_ROOT = process.env.UPLOAD_ROOT || path_1.default.join(process.cwd(), "uploads");
ensureDir(UPLOAD_ROOT);
ensureDir(path_1.default.join(UPLOAD_ROOT, "products"));
ensureDir(path_1.default.join(UPLOAD_ROOT, "payment-proofs"));
const storageDisk = (subfolder) => multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const dir = path_1.default.join(UPLOAD_ROOT, subfolder);
        ensureDir(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const name = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
        cb(null, name);
    },
});
exports.uploadProductImages = (0, multer_1.default)({ storage: storageDisk("products") }).array("images", 6);
exports.uploadSingleProof = (0, multer_1.default)({ storage: storageDisk("payment-proofs") }).single("proof");
