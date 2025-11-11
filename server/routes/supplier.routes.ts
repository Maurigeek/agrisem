// server/routes/supplier.routes.ts
import express from "express";
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductImages,
  listOrders,
  updateOrderStatus,
  uploadOrderProof,
} from "../controllers/supplier.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { uploadProductImages, uploadSingleProof } from "../middlewares/upload.js";
import { addRouteToSwagger } from "../swagger.js";

const router = express.Router();

// --- SWAGGER DOCS ---

// 🔹 LIST PRODUCTS
addRouteToSwagger("/supplier/products", "get", null, {
  summary: "Lister les produits du fournisseur connecté",
  tags: ["Supplier"],
  security: [{ BearerAuth: [] }],
  responses: {
    200: "Liste des produits récupérée avec succès",
    401: "Non autorisé",
    500: "Erreur serveur",
  },
});

// 🔹 CREATE PRODUCT
addRouteToSwagger("/supplier/products", "post", null, {
  summary: "Créer un nouveau produit (avec images optionnelles)",
  tags: ["Supplier"],
  security: [{ BearerAuth: [] }],
  // @ts-ignore
  requestBody: {
    description: "Informations du produit + images (multipart/form-data)",
    required: true,
    content: {
      "multipart/form-data": {
        schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            category: { type: "string" },
            images: {
              type: "array",
              items: { type: "string", format: "binary" },
            },
          },
        },
      },
    },
  },
  responses: {
    201: "Produit créé avec succès",
    400: "Données invalides",
    401: "Non autorisé",
  },
});

// 🔹 UPDATE PRODUCT
addRouteToSwagger("/supplier/products/{id}", "patch", null, {
  summary: "Mettre à jour un produit existant",
  tags: ["Supplier"],
  security: [{ BearerAuth: [] }],
  // @ts-ignore
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      description: "ID du produit à mettre à jour",
      schema: { type: "integer" },
    },
  ],
  responses: {
    200: "Produit mis à jour avec succès",
    400: "Données invalides",
    401: "Non autorisé",
    404: "Produit introuvable",
  },
});

// 🔹 DELETE PRODUCT
addRouteToSwagger("/supplier/products/{id}", "delete", null, {
  summary: "Supprimer un produit",
  tags: ["Supplier"],
  security: [{ BearerAuth: [] }],
  // @ts-ignore
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      description: "ID du produit à supprimer",
      schema: { type: "integer" },
    },
  ],
  responses: {
    204: "Produit supprimé avec succès",
    401: "Non autorisé",
    404: "Produit introuvable",
  },
});

// 🔹 ADD PRODUCT IMAGES
addRouteToSwagger("/supplier/products/{id}/images", "post", null, {
  summary: "Ajouter des images à un produit existant",
  tags: ["Supplier"],
  security: [{ BearerAuth: [] }],
  // @ts-ignore
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      description: "ID du produit",
      schema: { type: "integer" },
    },
  ],
  // @ts-ignore
  requestBody: {
    required: true,
    content: {
      "multipart/form-data": {
        schema: {
          type: "object",
          properties: {
            images: {
              type: "array",
              items: { type: "string", format: "binary" },
            },
          },
        },
      },
    },
  },
  responses: {
    200: "Images ajoutées avec succès",
    400: "Erreur d’envoi",
    401: "Non autorisé",
  },
});

// 🔹 LIST ORDERS
addRouteToSwagger("/supplier/orders", "get", null, {
  summary: "Lister les commandes du fournisseur connecté",
  tags: ["Supplier"],
  security: [{ BearerAuth: [] }],
  responses: {
    200: "Commandes récupérées avec succès",
    401: "Non autorisé",
  },
});

// 🔹 UPDATE ORDER STATUS
addRouteToSwagger("/supplier/orders/{id}/status", "patch", null, {
  summary: "Mettre à jour le statut d’une commande (ex: en cours, livrée)",
  tags: ["Supplier"],
  security: [{ BearerAuth: [] }],
  // @ts-ignore
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      description: "ID de la commande",
      schema: { type: "integer" },
    },
  ],
  responses: {
    200: "Statut mis à jour avec succès",
    400: "Données invalides",
    401: "Non autorisé",
  },
});

// 🔹 UPLOAD ORDER PROOF
addRouteToSwagger("/supplier/orders/{id}/upload-proof", "post", null, {
  summary: "Uploader un justificatif de livraison (preuve, reçu, etc.)",
  tags: ["Supplier"],
  security: [{ BearerAuth: [] }],
  // @ts-ignore
  parameters: [
    {
      name: "id",
      in: "path",
      required: true,
      description: "ID de la commande",
      schema: { type: "integer" },
    },
  ],
  // @ts-ignore
  requestBody: {
    required: true,
    content: {
      "multipart/form-data": {
        schema: {
          type: "object",
          properties: {
            proof: { type: "string", format: "binary" },
          },
        },
      },
    },
  },
  responses: {
    200: "Preuve uploadée avec succès",
    400: "Erreur d’envoi",
    401: "Non autorisé",
  },
});

// --- EXPRESS ROUTES ---
router.use(verifyToken);

// PRODUITS
router.get("/products", listProducts);
router.post("/products", uploadProductImages, createProduct);
router.patch("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);
router.post("/products/:id/images", uploadProductImages, addProductImages);

// COMMANDES
router.get("/orders", listOrders);
router.patch("/orders/:id/status", updateOrderStatus);
router.post("/orders/:id/upload-proof", uploadSingleProof, uploadOrderProof);

export default router;
