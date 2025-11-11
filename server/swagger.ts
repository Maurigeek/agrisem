import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { zodToJsonSchema } from "zod-to-json-schema";

// Dictionnaires dynamiques
const paths: Record<string, any> = {};
const components: any = { 
  schemas: {},
  securitySchemes: {
    BearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      description: "Entrez votre token JWT ici (sans 'Bearer ')"
    }
  }
};

/**
 * Ajoute une route automatiquement à Swagger
 */
/**
 * Ajoute une route automatiquement à Swagger
 */
export const addRouteToSwagger = (
  path: string,
  method: string,
  zodSchema: any,
  options: {
    summary?: string;
    security?: any;
    tags?: string[];
    responses?: Record<number | string, string>;
  } = {}
) => {
  // Nom Swagger-compatible (pas de /)
  const safeName = path.replace(/\//g, "_").replace(/^_/, "");

  let jsonSchema = null;

  // ✅ Conversion Zod → JSON Schema uniquement si un schéma est fourni
  if (zodSchema) {
    const jsonResult = zodToJsonSchema(zodSchema, safeName);
    jsonSchema =
      jsonResult.definitions && jsonResult.definitions[safeName]
        ? jsonResult.definitions[safeName]
        : jsonResult;

    // Enregistre le schéma dans components
    components.schemas[safeName] = jsonSchema;
  }

  // Formater les réponses
  const formattedResponses = Object.entries(options.responses || {}).reduce(
    (acc, [code, desc]) => {
      acc[code] = { description: desc };
      return acc;
    },
    {} as Record<string, any>
  );

  // Ajouter dynamiquement la route dans paths
  if (!paths[path]) paths[path] = {};

  // ✅ Construction de la définition Swagger
  const routeDef: any = {
    tags: options.tags || ["API"],
    summary: options.summary || "Endpoint",
    security: options.security || undefined,
    responses: formattedResponses,
  };

  // ✅ Ajoute le requestBody uniquement si un schéma existe
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


/**
 * Initialise Swagger avec toutes les routes collectées
 */
export const setupSwagger = (app: Express) => {
  const openApiDoc = {
    openapi: "3.0.0",
    info: {
      title: "AgriSem API",
      version: "1.0.0",
      description:
        "Documentation interactive de l’API AgriSem (Express + Prisma + Zod)",
    },
    servers: [
      {
        url: "http://localhost:5001/api/v1",
        description: "Serveur de développement",
      },
    ],
    paths,
    components,
  };

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDoc));
  console.log("📘 Swagger disponible sur http://localhost:5001/api-docs");
};
