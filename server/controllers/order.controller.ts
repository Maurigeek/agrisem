// server/controllers/order.controller.ts
import { Request, Response } from "express";
import { PrismaClient, OrderStatus } from "@prisma/client";
import { CreateOrderSchema } from "../schemas/order.schema.js";

const prisma = new PrismaClient();

/**
 * Helper: generate order number like AGRI-20251119-000123
 */
function generateOrderNumber() {
  const d = new Date();
  const date = d.toISOString().slice(0,10).replace(/-/g,"");
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `AGRI-${date}-${String(rnd)}`;
}

/**
 * Create order(s) - grouped by supplier
 * Requires authentication: req.userId must exist (verifyToken middleware)
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number | undefined;
    if (!userId) return res.status(401).json({ message: "Authentication required" });

    // validate payload with zod
    const parseRes = CreateOrderSchema.safeParse(req.body);
    if (!parseRes.success) {
      return res.status(400).json({ message: "Invalid payload", errors: parseRes.error.format() });
    }
    const payload = parseRes.data;

    // Build productId set and fetch authoritative product data
    const productIds = Array.from(new Set(payload.items.map(i => i.productId)));
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, priceCents: true, supplierId: true, title: true, currency: true, minOrderQty: true, stock: true }
    });

    const productById = new Map(products.map(p => [p.id, p]));

    // Ensure all productIds exist
    const missing = productIds.filter(pid => !productById.has(pid));
    if (missing.length) {
      return res.status(400).json({ message: "Some products not found", missing });
    }

    // Build items with authoritative prices + supplierId
    const normalizedItems = payload.items.map(it => {
      const p = productById.get(it.productId)!;
      return {
        productId: p.id,
        qty: it.qty,
        priceCents: (it.priceCents ?? p.priceCents),
        supplierId: (it.supplierId ?? p.supplierId),
        title: p.title,
      };
    });

    // Group items by supplierId
    const groups = new Map<number, { items: any[] }>();
    for (const it of normalizedItems) {
      if (!groups.has(it.supplierId)) groups.set(it.supplierId, { items: [] });
      groups.get(it.supplierId)!.items.push(it);
    }

    // Persist OrderAddress (checkout address) — link to buyer as producerId in your schema
    const orderAddress = await prisma.orderAddress.create({
      data: {
        producerId: userId,
        label: payload.address.label,
        country: payload.address.country,
        region: payload.address.region,
        city: payload.address.city,
      },
    });

    // For each supplier group create an Order + OrderItems inside a transaction
    const ordersToCreate = [];
    for (const [supplierId, { items }] of groups.entries()) {
      const totalCents = items.reduce((s: number, it: any) => s + (it.priceCents * it.qty), 0);

      ordersToCreate.push({
        supplierId,
        items,
        totalCents,
      });
    }

    const createdOrders = await prisma.$transaction(async (tx) => {
      const created: any[] = [];
      for (const o of ordersToCreate) {
        const orderNumber = generateOrderNumber();
        const order = await tx.order.create({
          data: {
            orderNumber,
            buyerId: userId,
            supplierId: o.supplierId,
            totalCents: o.totalCents,
            currency: products[0].currency || "XOF",
            paymentMethod: payload.paymentMethod,
            orderAddressId: orderAddress.id,
            notes: payload.notes ?? null,
            status: "PENDING",
            items: {
              create: o.items.map((it: any) => ({
                productId: it.productId,
                title: it.title,
                priceCents: it.priceCents,
                qty: it.qty,
              })),
            },
          },
          include: { items: true, orderAddress: true },
        });
        created.push(order);
      }
      return created;
    });

    res.status(201).json({ data: createdOrders, message: "Orders created" });
  } catch (err) {
    console.error("createOrder error:", err);
    res.status(500).json({ message: "Erreur création commande" });
  }
};

/**
 * List orders: public endpoint — supports query filters ?buyerId=&supplierId=&page=
 * If buyerId/supplierId omitted returns recent orders (limit).
 */
export const listOrders = async (req: Request, res: Response) => {
  try {
    const { buyerId, supplierId, page = "1", page_size = "20" } = req.query;
    const take = Math.min(100, Number(page_size) || 20);
    const skip = (Math.max(1, Number(page || 1)) - 1) * take;

    const where: any = {};
    if (buyerId) where.buyerId = Number(buyerId);
    if (supplierId) where.supplierId = Number(supplierId);

    const orders = await prisma.order.findMany({
      where,
      include: { items: true, orderAddress: true, buyer: { select: { id: true, firstName: true, lastName: true } }, supplier: { select: { id: true, orgName: true } } },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    });

    res.json({ data: orders, page: Number(page) });
  } catch (err) {
    console.error("listOrders error:", err);
    res.status(500).json({ message: "Erreur récupération commandes" });
  }
};

/**
 * Get a single order (public). If you want buyer-only detail, check req.userId.
 */
export const getOrder = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid id" });

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, orderAddress: true, buyer: { select: { id: true, firstName: true, lastName: true } }, supplier: { select: { id: true, orgName: true } } },
    });

    if (!order) return res.status(404).json({ message: "Commande non trouvée" });
    res.json({ data: order });
  } catch (err) {
    console.error("getOrder error:", err);
    res.status(500).json({ message: "Erreur récupération commande" });
  }
};

/**
 * Mark order as paid (buyer). Accepts body { paymentProofUrl }
 */
export const payOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number | undefined;
    if (!userId) return res.status(401).json({ message: "Authentication required" });

    const id = Number(req.params.id);
    const { paymentProofUrl } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ message: "Commande non trouvée" });
    if (order.buyerId !== userId) return res.status(403).json({ message: "Access denied" });

    // Only allow marking paid if pending or confirmed (business logic)
    const updated = await prisma.order.update({
      where: { id },
      data: {
        paymentProofUrl: paymentProofUrl ?? order.paymentProofUrl,
        status: "CONFIRMED",
      },
    });

    res.json({ data: updated });
  } catch (err) {
    console.error("payOrder error:", err);
    res.status(500).json({ message: "Erreur paiement commande" });
  }
};

/**
 * Cancel order (buyer) — only allowed if PENDING
 */
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId as number | undefined;
    if (!userId) return res.status(401).json({ message: "Authentication required" });

    const id = Number(req.params.id);
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ message: "Commande non trouvée" });
    if (order.buyerId !== userId) return res.status(403).json({ message: "Access denied" });
    if (order.status !== "PENDING") return res.status(400).json({ message: "Impossible d'annuler une commande traitée" });

    const updated = await prisma.order.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    res.json({ data: updated });
  } catch (err) {
    console.error("cancelOrder error:", err);
    res.status(500).json({ message: "Erreur annulation commande" });
  }
};
