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
    const payload = req.body;
    // convert possible numeric fields
    if (payload.priceCents) payload.priceCents = Number(payload.priceCents);
    if (payload.stock) payload.stock = Number(payload.stock);

    const updated = await prisma.product.update({
      where: { id },
      data: payload,
    });
    res.json({ data: updated });
  } catch (err) {
    console.error(err);
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
          const p = path.join(process.cwd(), rel);
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
