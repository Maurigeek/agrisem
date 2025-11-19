import express from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { addRouteToSwagger } from "../swagger.js";

const prisma = new PrismaClient();
const router = express.Router();

/* ======================================================
   SWAGGER DOCS — PUBLIC CATALOG ROUTES
====================================================== */

/* 🔹 CULTURES */
addRouteToSwagger("/cultures", "get", null, {
  summary: "Lister toutes les cultures disponibles",
  tags: ["Catalog"],
  responses: {
    200: "Liste des cultures retournée",
    500: "Erreur serveur",
  },
});

/* 🔹 VARIETIES */
addRouteToSwagger("/varieties", "get", null, {
  summary: "Lister toutes les variétés disponibles",
  tags: ["Catalog"],
  responses: {
    200: "Liste des variétés retournée",
    500: "Erreur serveur",
  },
});

/* 🔹 PRODUCTS */
addRouteToSwagger("/products", "get", null, {
  summary: "Lister les produits du catalogue (public)",
  tags: ["Catalog"],
  responses: {
    200: "Liste paginée des produits",
    500: "Erreur serveur",
  },
});

/* 🔹 PRODUCT DETAILS */
addRouteToSwagger("/products/{id}", "get", null, {
  summary: "Obtenir le détail d’un produit",
  tags: ["Catalog"],
  responses: {
    200: "Détails du produit",
    404: "Produit non trouvé",
    500: "Erreur serveur",
  },
});

/* ======================================================
   EXPRESS ROUTES — PUBLIC CATALOG
====================================================== */

/* -------------------- CULTURES -------------------- */
router.get("/cultures", async (req, res) => {
  try {
    const cultures = await prisma.culture.findMany({
      orderBy: { name: "asc" },
    });
    res.json(cultures);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur chargement cultures" });
  }
});

/* -------------------- VARIETIES -------------------- */
router.get("/varieties", async (req, res) => {
  try {
    const varieties = await prisma.variety.findMany({
      orderBy: { name: "asc" },
    });
    res.json(varieties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur chargement variétés" });
  }
});

/* -------------------- PRODUCTS LIST -------------------- */
router.get("/products", async (req, res) => {
  try {
    const {
      page = 1,
      page_size = 20,
      cultureId,
      minPrice,
      maxPrice,
      q,
      ordering,
    } = req.query;

    const take = Number(page_size);
    const skip = (Number(page) - 1) * take;

    /* -------------------------------------------------
       FIX : filters DOIT être ProductWhereInput
    --------------------------------------------------*/
    const filters: Prisma.ProductWhereInput = {
      status: "ACTIVE",
    };

    // 🔍 Recherche par titre
    if (q && typeof q === "string") {
      filters.title = {
        contains: q,
        mode: "insensitive",
      };
    }

    // 🔍 Filtre par prix
    if (minPrice || maxPrice) {
      filters.priceCents = {};
      if (minPrice) filters.priceCents.gte = Number(minPrice);
      if (maxPrice) filters.priceCents.lte = Number(maxPrice);
    }

    // 🔍 Filtre culture → variety.cultureId
    if (cultureId) {
      filters.variety = {
        cultureId: Number(cultureId),
      };
    }

    /* ----------- TRI / ORDERING ----------- */
    let orderBy: Prisma.ProductOrderByWithRelationInput = {};

    if (ordering === "name") orderBy = { title: "asc" };
    if (ordering === "price-asc") orderBy = { priceCents: "asc" };
    if (ordering === "price-desc") orderBy = { priceCents: "desc" };
    if (ordering === "newest") orderBy = { createdAt: "desc" };

    /* ----------- QUERY DB ----------- */
    const products = await prisma.product.findMany({
      where: filters,
      include: {
        variety: true,
        supplier: {
          select: {
            id: true,
            orgName: true,
            isSupplierVerified: true,
          },
        },
      },
      orderBy,
      take,
      skip,
    });

    res.json({
      results: products,
      page: Number(page),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur chargement produits" });
  }
});

/* -------------------- PRODUCT DETAILS -------------------- */
router.get("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variety: true,
        supplier: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            orgName: true,
            isSupplierVerified: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Produit non trouvé" });
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur chargement produit" });
  }
});

export default router;
