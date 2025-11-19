// server/index.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth.routes.js";
import supplierRouter from "./routes/supplier.routes.js";
import weatherRoutes from "./routes/weather.js";
import bestProductsRoutes from "./routes/best.js";

import { setupSwagger } from "./swagger.js";
import path from "path";

dotenv.config();
const app = express();
const prisma = new PrismaClient();

// --- FRONTEND autorisés (production + local)
const allowedOrigins = [
  "http://localhost:5173", 
  "http://localhost:5001",              // local dev
  "/^http:\/\/localhost:\d+$/",
  "https://agrisem.com",                  // domaine officiel
  "https://agrisem-frontend.onrender.com",// frontend Render
  "https://agrisem.onrender.com"          // backend Render (Swagger)
];

// --- Middleware CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); 

    const allowed = [
      /^http:\/\/localhost:\d+$/,
      /^https:\/\/agrisem\.com$/,
      /^https:\/\/agrisem-frontend\.onrender\.com$/,
      /^https:\/\/agrisem\.onrender\.com$/
    ];

    if (allowed.some((r) => r.test(origin))) {
      return callback(null, true);
    }

    console.warn("CORS BLOCKED :", origin);
    return callback(new Error("CORS non autorisé"), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));


// --- Parsing JSON normal (pas de verify)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Middleware logging simple
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${req.method}] ${req.path}`);
  next();
});

// --- Routes principales
app.use("/api/v1", weatherRoutes);
app.use("/api/v1/products", bestProductsRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/supplier", supplierRouter);

// --- Fichiers publics
app.use("/uploads", express.static(path.join(process.cwd(), process.env.UPLOAD_ROOT || "uploads")));

// --- Swagger Docs
setupSwagger(app);

// --- Gestion des erreurs globales
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Erreur serveur:", err.message);
  res.status(500).json({ message: err.message || "Erreur interne du serveur" });
});

// --- 🚀 Lancement du serveur
const PORT = process.env.PORT || 5001;
const BASE_URL =
  process.env.NODE_ENV === "production"
    ? process.env.RENDER_EXTERNAL_URL || "https://agrisem.onrender.com"
    : `http://localhost:${PORT}`;

app.listen(PORT, () => {
  console.log(`[Express] ✅ Server running on ${BASE_URL}`);
  console.log(`📘 Swagger Docs available at ${BASE_URL}/api-docs`);
});
