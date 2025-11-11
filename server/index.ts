// server/index.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth.routes.js";
import supplierRouter from "./routes/supplier.routes.js";
import { setupSwagger } from "./swagger.js";
import path from "path";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// --- 🌐 Configuration dynamique du domaine ---
const FRONTEND_URLS = [
  "http://localhost:5173",                 // Frontend local
  "https://agrisem.com",                   // Domaine officiel
  "https://agrisem-backend.onrender.com",  // Instance backend Render (fallback)
  "https://agrisem-frontend.onrender.com", // Instance frontend Render
  "https://agrisem.onrender.com"           // Domaine public principal
];

// --- 🔧 CORS configuration ---
app.use(cors({
  origin: FRONTEND_URLS,
  credentials: true,
}));

// --- 🧩 Body parsing ---
app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

// --- 🧠 Logging middleware ---
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  const originalJson = res.json;
  let responseBody: any;

  res.json = function (body: any) {
    responseBody = body;
    return originalJson.call(this, body);
  };

  res.on("finish", () => {
    if (path.startsWith("/api")) {
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (responseBody && typeof responseBody === "object") {
        const preview = JSON.stringify(responseBody).slice(0, 100);
        logLine += ` :: ${preview}${preview.length === 100 ? "…" : ""}`;
      }
      console.log(logLine);
    }
  });

  next();
});

// --- 🧭 Routes principales ---
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/supplier", supplierRouter);

// --- 🖼️ Fichiers publics (uploads) ---
app.use("/uploads", express.static(path.join(process.cwd(), process.env.UPLOAD_ROOT || "uploads")));

// --- 🚨 Gestion des erreurs globales ---
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("❌ Server Error:", err);
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

// --- 📘 Swagger documentation ---
setupSwagger(app);

// --- 🚀 Lancement du serveur ---
const PORT = process.env.PORT || 5001;

// ✅ Détection automatique de l’URL selon l’environnement
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.RENDER_EXTERNAL_URL || "https://agrisem.onrender.com"
    : `http://localhost:${PORT}`;

app.listen(PORT, () => {
  console.log(`[Express] ✅ Server running on ${BASE_URL}`);
  console.log(`📘 Swagger Docs available at ${BASE_URL}/api-docs`);
});
