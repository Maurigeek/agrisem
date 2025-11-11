// server/middlewares/upload.js
import multer from "multer";
import fs from "fs";
import path from "path";

// Ensure folders exist
const ensureDir = (p) => {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
};

const UPLOAD_ROOT = process.env.UPLOAD_ROOT || path.join(process.cwd(), "uploads");
ensureDir(UPLOAD_ROOT);
ensureDir(path.join(UPLOAD_ROOT, "products"));
ensureDir(path.join(UPLOAD_ROOT, "payment-proofs"));

const storageDisk = (subfolder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(UPLOAD_ROOT, subfolder);
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
      cb(null, name);
    },
  });

export const uploadProductImages = multer({ storage: storageDisk("products") }).array("images", 6);
export const uploadSingleProof = multer({ storage: storageDisk("payment-proofs") }).single("proof");
