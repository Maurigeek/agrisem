import express from "express";
import { createOrders } from "../controllers/order.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { addRouteToSwagger } from "../swagger.js";

const router = express.Router();

// SWAGGER DOC
addRouteToSwagger("/orders", "post", null, {
  summary: "Créer une ou plusieurs commandes (Producteur)",
  tags: ["Orders"],
  security: [{ BearerAuth: [] }],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: { 
                type: "object",
                properties: {
                  productId: { type: "integer" },
                  qty: { type: "integer" }
                }
              }
            },
            address: {
              type: "object",
              properties: {
                label: { type: "string" },
                country: { type: "string" },
                region: { type: "string" },
                city: { type: "string" }
              }
            },
            paymentMethod: { type: "string" },
            notes: { type: "string" }
          },
        },
      },
    },
  },
  responses: { 201: "Commandes créées", 400: "Données invalides" }
});

// ROUTE
router.post("/orders", verifyToken, createOrders);

export default router;
