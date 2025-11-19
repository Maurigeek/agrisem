import { PrismaClient } from "@prisma/client";
import { orderCreateSchema } from "../validators/order.schema.js";

const prisma = new PrismaClient();

// Génère un numéro unique du style ORD-2025-000123
const generateOrderNumber = async () => {
  const count = await prisma.order.count();
  const seq = String(count + 1).padStart(6, "0");
  return `ORD-${new Date().getFullYear()}-${seq}`;
};

export const createOrders = async (req, res) => {
  try {
    const buyerId = req.userId;

    // 1) Validation du payload
    const parsed = orderCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        message: "Données invalides", 
        errors: parsed.error.flatten() 
      });
    }

    const { items, address, paymentMethod, notes } = parsed.data;

    // 2) Vérifier les produits + fetch
    const productIds = items.map(i => i.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { supplier: true }
    });

    if (products.length !== items.length) {
      return res.status(404).json({ message: "Un des produits n'existe pas" });
    }

    // 3) Regrouper par fournisseur
    const groupedBySupplier = {};
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) continue;

      const supplierId = product.supplierId;
      if (!groupedBySupplier[supplierId]) {
        groupedBySupplier[supplierId] = [];
      }
      groupedBySupplier[supplierId].push({
        product,
        qty: item.qty,
      });
    }

    // 4) Créer l’adresse
    const shippingAddress = await prisma.address.create({
      data: {
        userId: buyerId,
        ...address
      }
    });

    // 5) Création des commandes → une par fournisseur
    const createdOrders = [];

    for (const supplierId of Object.keys(groupedBySupplier)) {
      const supplierItems = groupedBySupplier[supplierId];

      // total
      const totalCents = supplierItems.reduce(
        (sum, it) => sum + it.product.priceCents * it.qty,
        0
      );

      // numéro de commande
      const orderNumber = await generateOrderNumber();

      // créer la commande
      const newOrder = await prisma.order.create({
        data: {
          orderNumber,
          buyerId,
          supplierId: Number(supplierId),
          totalCents,
          currency: "XOF",
          paymentMethod,
          notes: notes || null,
          shippingAddressId: shippingAddress.id,
          items: {
            create: supplierItems.map(it => ({
              productId: it.product.id,
              title: it.product.title,
              priceCents: it.product.priceCents,
              qty: it.qty
            }))
          }
        },
        include: { items: true }
      });

      // décrémenter le stock
      for (const it of supplierItems) {
        await prisma.product.update({
          where: { id: it.product.id },
          data: { stock: { decrement: it.qty } }
        });
      }

      createdOrders.push(newOrder);
    }

    res.status(201).json({
      message: "Commandes créées avec succès",
      data: createdOrders,
    });

  } catch (err) {
    console.error("❌ createOrders error:", err);
    res.status(500).json({ message: "Erreur création commande" });
  }
};
