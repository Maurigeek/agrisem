
import express from "express";
import { PrismaClient } from "@prisma/client";
import fetch from "node-fetch";
import { addRouteToSwagger } from "../swagger.js";

const prisma = new PrismaClient();
const router = express.Router();

/* ======================================================
   SWAGGER: BEST PRODUCTS
====================================================== */
addRouteToSwagger("/products/best", "get", null, {
  summary: "Obtenir les meilleurs produits (TOP VENTES)",
  tags: ["Products"],
  responses: {
    200: "Liste des produits les plus vendus",
    500: "Erreur serveur",
  },
});

/* ======================================================
   GET /catalog/best
   Retourne les 4 produits les plus vendus
====================================================== */
router.get("/best", async (req, res) => {
  try {
    const stats = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { qty: true },
      orderBy: { _sum: { qty: "desc" } },
      take: 4,
    });

    if (stats.length === 0) return res.json([]);

    const productIds = stats.map((s) => s.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "ACTIVE" },
      include: { variety: true },
    });

    const ordered = productIds.map((id) =>
      products.find((p) => p.id === id)
    );

    res.json(ordered);
  } catch (err) {
    console.error("❌ BEST PRODUCTS ERROR:", err);
    res.status(500).json({ error: "Failed to load best products" });
  }
});


export default router;
