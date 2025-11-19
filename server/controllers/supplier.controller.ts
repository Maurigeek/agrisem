// server/controllers/supplier.controller.js
import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

const publicUrlForFile = (filePath: any): any => {
  if (!filePath) return "";
  const rel = path.relative(process.cwd(), filePath).replace(/\\/g, "/");
  return `/${rel}`;
};

/**
 * GET /supplier/products
 * - returns products for logged supplier
 */
export const listProducts = async (req, res) => {
  try {
    const supplierId = req.userId;
    const products = await prisma.product.findMany({
      where: { supplierId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ data: products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/**
 * POST /supplier/products (multipart may include images)
 */
export const createProduct = async (req, res) => {
  try {
    const supplierId = req.userId;
    const { title, sku, priceCents, currency = "XOF", stock = 0, varietyId } = req.body;

    // images uploaded by multer -> req.files (array)
    const images = [];
    if (req.files && Array.isArray(req.files)) {
      for (const f of req.files) {
        images.push(publicUrlForFile(f.path));
      }
    }

    const product = await prisma.product.create({
      data: {
        supplierId,
        title,
        sku,
        priceCents: Number(priceCents),
        currency,
        stock: Number(stock || 0),
        images: images as any,
        varietyId: varietyId ? Number(varietyId) : null,
      },
    });

    res.status(201).json({ data: product, message: "Produit créé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur création produit" });
  }
};

/**
 * PATCH /supplier/products/:id
 */
export const updateProduct = async (req, res) => {
  try {
    const supplierId = req.userId;
    const id = Number(req.params.id);

    const existing = await prisma.product.findUnique({ where: { id } });

    if (!existing || existing.supplierId !== supplierId) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    const payload = { ...req.body };

    // 🔥 Filtrer les champs undefined
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });


    //  Sécuriser les champs numériques
    const numericFields = ["priceCents", "stock", "minOrderQty"];
    for (const f of numericFields) {
      if (payload[f] !== undefined) {
        const val = Number(payload[f]);
        payload[f] = isNaN(val) ? existing[f] : val;
      }
    }

    //  Sécurisation des images → éviter plantage Prisma
    let finalImages = [];

    if (Array.isArray(existing.images)) {
      finalImages = [...existing.images];
    }

    //  Suppression totale
    if (payload.removeAllImages === "true") {
      for (const img of finalImages) {
        try {
          const abs = path.join(process.cwd(), img);
          if (fs.existsSync(abs)) fs.unlinkSync(abs);
        } catch {}
      }
      finalImages = [];
    }

    //  Suppression d’une seule image
    if (payload.removeImageUrl) {
      finalImages = finalImages.filter((img) => img !== payload.removeImageUrl);
      try {
        const abs = path.join(process.cwd(), payload.removeImageUrl);
        if (fs.existsSync(abs)) fs.unlinkSync(abs);
      } catch {}
    }

    delete payload.removeAllImages;
    delete payload.removeImageUrl;

    //  Mise à jour finale PRISMA
    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...payload,
        images: finalImages, // toujours un ARRAY JSON valide
      },
    });

    res.json({ data: updated });

  } catch (err) {
    console.error("❌ updateProduct error:", err);
    res.status(500).json({ message: "Erreur mise à jour produit" });
  }
};



/**
 * DELETE /supplier/products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    const supplierId = req.userId;
    const id = Number(req.params.id);
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.supplierId !== supplierId) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    // Optionnel: supprimer fichiers images du disque
    if (Array.isArray(existing.images)) {
      for (const rel of existing.images) {
        try {
          const p = path.join(process.cwd(), String(rel));
          if (fs.existsSync(p)) fs.unlinkSync(p);
        } catch (e) { /* ignore */ }
      }
    }
    await prisma.product.delete({ where: { id } });
    res.json({ message: "Produit supprimé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur suppression produit" });
  }
};

/**
 * POST /supplier/products/:id/images  -> upload additional images (multipart form field "image" or "images")
 */
export const addProductImages = async (req, res) => {
  try {
    const supplierId = req.userId;
    const id = Number(req.params.id);
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing || existing.supplierId !== supplierId) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    const newImages = [];
    if (req.files && Array.isArray(req.files)) {
      for (const f of req.files) {
        newImages.push(publicUrlForFile(f.path));
      }
    } else if (req.file) {
      newImages.push(publicUrlForFile(req.file.path));
    }
    const finalImages = Array.isArray(existing.images) ? [...existing.images, ...newImages] : newImages;
    const updated = await prisma.product.update({
      where: { id },
      data: { images: finalImages },
    });
    res.json({ data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur upload images" });
  }
};

/* ---------------- Orders for supplier ---------------- */

export const listOrders = async (req, res) => {
  try {
    const supplierId = req.userId;
    const orders = await prisma.order.findMany({
      where: { supplierId },
      include: { items: true, buyer: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ data: orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur récupération commandes" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const supplierId = req.userId;
    const id = Number(req.params.id);
    const { status } = req.body;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order || order.supplierId !== supplierId) return res.status(404).json({ message: "Commande non trouvée" });

    const updated = await prisma.order.update({ where: { id }, data: { status } });
    res.json({ data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur mise à jour commande" });
  }
};

/* ---------------- Upload proof ---------------- */

export const uploadOrderProof = async (req, res) => {
  try {
    const supplierId = req.userId;
    const id = Number(req.params.id);
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order || order.supplierId !== supplierId) return res.status(404).json({ message: "Commande non trouvée" });

    if (!req.file) return res.status(400).json({ message: "Fichier manquant" });
    const proofUrl = publicUrlForFile(req.file.path);

    const updated = await prisma.order.update({
      where: { id },
      data: { paymentProofUrl: proofUrl },
    });
    res.json({ data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur upload preuve" });
  }
};


// Stats Product 

export const getSupplierStats = async (req, res) => {
  try {
    const supplierId = req.userId;

    // 1️⃣ Produits
    const totalProducts = await prisma.product.count({
      where: { supplierId },
    });

    const activeProducts = await prisma.product.count({
      where: { supplierId, status: "ACTIVE" },
    });

    const outOfStock = await prisma.product.count({
      where: { supplierId, stock: 0 },
    });

    // 2️⃣ Commandes
    const totalOrders = await prisma.order.count({
      where: { supplierId },
    });

    const pendingOrders = await prisma.order.count({
      where: { supplierId, status: "PENDING" },
    });

    // 3️⃣ Revenu total
    const revenue = await prisma.order.aggregate({
      where: { supplierId, status: { in: ["CONFIRMED", "DELIVERED"] } },
      _sum: { totalCents: true },
    });

    const totalRevenue = revenue._sum.totalCents || 0;

    // 4️⃣ Sales by day (7 derniers jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesRaw = await prisma.order.findMany({
      where: {
        supplierId,
        createdAt: { gte: sevenDaysAgo },
        status: { in: ["CONFIRMED", "DELIVERED"] }
      },
      select: {
        createdAt: true,
        totalCents: true,
      },
    });

    const salesByDay = {};

    for (const sale of salesRaw) {
      const day = sale.createdAt.toISOString().split("T")[0];
      salesByDay[day] = (salesByDay[day] || 0) + sale.totalCents;
    }

    const salesArray = Object.entries(salesByDay).map(([date, total]) => ({
      date,
      total,
    }));

    // Final response
    res.json({
      data: {
        totalProducts,
        activeProducts,
        outOfStock,
        totalOrders,
        pendingOrders,
        totalRevenue,
        salesByDay: salesArray
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur stats fournisseur" });
  }
};


export const deleteProductImage = async (req, res) => {
  try {
    const supplierId = req.userId;
    const id = Number(req.params.id);
    const { imageUrl } = req.body;

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product || product.supplierId !== supplierId) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    // Convertir JSON Prisma → tableau de strings
    const images: string[] = Array.isArray(product.images)
      ? product.images as string[]
      : [];

    const updatedImages = images.filter((img) => img !== imageUrl);

    // Supprimer physiquement le fichier
    try {
      const absolutePath = path.join(process.cwd(), imageUrl);
      if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
    } catch (e) {
      console.warn("⚠ Impossible de supprimer physiquement:", e);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { images: updatedImages },
    });

    res.json({ data: updated });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur suppression image" });
  }
};

