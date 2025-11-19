// server/routes/order.routes.ts
import { Router } from "express";
import {
  createOrder,
  listOrders,
  getOrder,
  payOrder,
  cancelOrder,
} from "../controllers/order.controller.js";
import { addRouteToSwagger } from "../swagger.js";
import { CreateOrderSchema } from "../schemas/order.schema.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

/* Swagger - keep options as in your auth example */
addRouteToSwagger("/orders", "post", CreateOrderSchema, {
  summary: "Créer une ou plusieurs commandes (un ordre par fournisseur)",
  tags: ["Orders"],
  responses: {
    201: "Commande(s) créée(s)",
    400: "Données invalides",
    401: "Non autorisé",
  },
});

addRouteToSwagger("/orders", "get", null, {
  summary: "Lister les commandes (optionnel: ?buyerId=&supplierId=&page=)",
  tags: ["Orders"],
  responses: { 200: "Liste récupérée" },
});

addRouteToSwagger("/orders/{id}", "get", null, {
  summary: "Détails d'une commande",
  tags: ["Orders"],
  responses: { 200: "Détails récupérés", 404: "Introuvable" },
});

addRouteToSwagger("/orders/{id}/pay", "post", null, {
  summary: "Marquer une commande payée (buyer only)",
  tags: ["Orders"],
  responses: { 200: "Commande mise à jour", 401: "Non autorisé" },
});

addRouteToSwagger("/orders/{id}/cancel", "post", null, {
  summary: "Annuler une commande (buyer only)",
  tags: ["Orders"],
  responses: { 200: "Commande annulée", 400: "Imposible", 401: "Non autorisé" },
});

/* Routes: require auth for creation/pay/cancel; public for list/details */
router.post("/orders", createOrder);
router.get("/orders", listOrders);
router.get("/orders/:id", getOrder);
router.post("/orders/:id/pay", verifyToken, payOrder);
router.post("/orders/:id/cancel", verifyToken, cancelOrder);

export default router;
