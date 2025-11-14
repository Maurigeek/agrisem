"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const auth_routes_js_1 = __importDefault(require("./routes/auth.routes.js"));
const supplier_routes_js_1 = __importDefault(require("./routes/supplier.routes.js"));
const swagger_js_1 = require("./swagger.js");
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
// --- 🌍 FRONTEND autorisés (production + local)
const allowedOrigins = [
    "http://localhost:5173", // local dev
    "https://agrisem.com", // domaine officiel
    "https://agrisem-frontend.onrender.com", // frontend Render
    "https://agrisem.onrender.com" // backend Render (Swagger)
];
// --- 🔧 Middleware CORS
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Autorise les requêtes sans Origin (Swagger, Postman)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        console.warn("❌ Requête bloquée par CORS:", origin);
        return callback(new Error("CORS non autorisé"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// --- ✅ Parsing JSON normal (pas de verify)
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// --- 🧠 Middleware logging simple
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.path}`);
    next();
});
// --- 🔗 Routes principales
app.use("/api/v1/auth", auth_routes_js_1.default);
app.use("/api/v1/supplier", supplier_routes_js_1.default);
// --- 🖼️ Fichiers publics
app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), process.env.UPLOAD_ROOT || "uploads")));
// --- 🧩 Swagger Docs
(0, swagger_js_1.setupSwagger)(app);
// --- 🛠️ Gestion des erreurs globales
app.use((err, _req, res, _next) => {
    console.error("❌ Erreur serveur:", err.message);
    res.status(500).json({ message: err.message || "Erreur interne du serveur" });
});
// --- 🚀 Lancement du serveur
const PORT = process.env.PORT || 5001;
const BASE_URL = process.env.NODE_ENV === "production"
    ? process.env.RENDER_EXTERNAL_URL || "https://agrisem.onrender.com"
    : `http://localhost:${PORT}`;
app.listen(PORT, () => {
    console.log(`[Express] ✅ Server running on ${BASE_URL}`);
    console.log(`📘 Swagger Docs available at ${BASE_URL}/api-docs`);
});
