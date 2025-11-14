"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = exports.addRouteToSwagger = void 0;
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const zod_to_json_schema_1 = require("zod-to-json-schema");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// --- Dictionnaires dynamiques ---
const paths = {};
const components = {
    schemas: {},
    securitySchemes: {
        BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Entrez votre token JWT ici (sans 'Bearer ')",
        },
    },
};
// --- Détection automatique de l’environnement ---
const BASE_URL = process.env.NODE_ENV === "production"
    ? process.env.SWAGGER_BASE_URL || "https://agrisem.onrender.com/api/v1"
    : "http://localhost:5001/api/v1";
/**
 * Ajoute une route automatiquement à Swagger
 */
const addRouteToSwagger = (path, method, zodSchema, options = {}) => {
    const safeName = path.replace(/\//g, "_").replace(/^_/, "");
    let jsonSchema = null;
    // ✅ Conversion Zod → JSON Schema uniquement si un schéma est fourni
    if (zodSchema) {
        const jsonResult = (0, zod_to_json_schema_1.zodToJsonSchema)(zodSchema, safeName);
        jsonSchema =
            jsonResult.definitions && jsonResult.definitions[safeName]
                ? jsonResult.definitions[safeName]
                : jsonResult;
        // Enregistre le schéma dans components
        components.schemas[safeName] = jsonSchema;
    }
    // ✅ Formater les réponses
    const formattedResponses = Object.entries(options.responses || {}).reduce((acc, [code, desc]) => {
        acc[code] = { description: desc };
        return acc;
    }, {});
    if (!paths[path])
        paths[path] = {};
    // ✅ Définition de la route Swagger
    const routeDef = {
        tags: options.tags || ["API"],
        summary: options.summary || "Endpoint",
        security: options.security || undefined,
        responses: formattedResponses,
    };
    // ✅ Ajout du corps de requête si un schéma est fourni
    if (jsonSchema) {
        routeDef.requestBody = {
            required: true,
            content: {
                "application/json": {
                    schema: { $ref: `#/components/schemas/${safeName}` },
                },
            },
        };
    }
    paths[path][method] = routeDef;
};
exports.addRouteToSwagger = addRouteToSwagger;
/**
 * Initialise Swagger avec toutes les routes collectées
 */
const setupSwagger = (app) => {
    const openApiDoc = {
        openapi: "3.0.0",
        info: {
            title: "AgriSem API",
            version: "1.0.0",
            description: "Documentation interactive de l’API AgriSem (Express + Prisma + Zod)",
        },
        servers: [
            {
                url: BASE_URL,
                description: process.env.NODE_ENV === "production"
                    ? "Serveur de production Render"
                    : "Serveur de développement local",
            },
        ],
        paths,
        components,
    };
    app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(openApiDoc));
    console.log(`📘 Swagger disponible sur ${BASE_URL.replace('/api/v1', '')}/api-docs`);
};
exports.setupSwagger = setupSwagger;
