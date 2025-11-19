import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

router.get("/best", async (req, res) => {
  try {
    const orderStats = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { qty: true },
      orderBy: { _sum: { qty: "desc" } },
      take: 4,
    });

    if (orderStats.length === 0) {
      return res.json([]);  // PAS product not found !!
    }

    const productIds = orderStats.map((s) => s.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, status: "ACTIVE" },
      include: { variety: true },
    });

    const ordered = productIds.map((id) =>
      products.find((p) => p.id === id)
    );

    res.json(ordered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load best products" });
  }
});

export default router;
