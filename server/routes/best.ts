import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/best", async (req, res) => {
  try {
    let orderStats = [];

    try {
      orderStats = await prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { qty: true },
        orderBy: [
          { _sum: { qty: "desc" } },  // <- 🔥 Correction principale
        ],
        take: 4,
      });
    } catch (err) {
      console.warn("⚠️ Prisma groupBy failed (probably empty table):", err.message);
      orderStats = [];
    }

    // 🔥 Si aucune vente → prendre les derniers produits actifs
    if (orderStats.length === 0) {
      const fallback = await prisma.product.findMany({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 4,
      });
      return res.json(fallback);
    }

    const productIds = orderStats.map((s) => s.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "ACTIVE" },
      include: { variety: true },
    });

    // Reordonner selon les ventes
    const ordered = productIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean);

    res.json(ordered);

  } catch (err) {
    console.error("❌ Best products fatal error:", err);
    res.json([]); // On renvoie toujours un tableau
  }
});

export default router;
