import express, { Request, Response } from "express";
import fetch from "node-fetch";
import { addRouteToSwagger } from "../swagger.js";

const router = express.Router();

/* ======================================================
   SWAGGER: WEATHER — deprecated local weather,
   mais route maintenue pour compatibilité.
====================================================== */
addRouteToSwagger("/weather", "get", null, {
  summary: "Récupérer la météo agricole (via /api/v1/weather)",
  tags: ["Weather"],
  responses: {
    200: "Prévision météo",
    500: "Erreur serveur",
  },
});

/**
 * Cette route agit simplement comme un PROXY
 * pour la vraie route météo dynamique.
 */
router.get("/weather", async (req: Request, res: Response) => {
  try {
    const params = new URLSearchParams();

    if (req.query.city) params.append("city", String(req.query.city));
    if (req.query.lat) params.append("lat", String(req.query.lat));
    if (req.query.lon) params.append("lon", String(req.query.lon));

    const apiBase =
      process.env.API_BASE_URL || "http://localhost:4000/api/v1";

    const url = `${apiBase}/weather?${params.toString()}`;

    const response = await fetch(url);
    const raw = await response.json();

    // 🔥 Correction : garantir que raw est UN OBJET avant de le spread
    const data =
      raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};

    return res.json({
      source: "legacy-proxy",
      ...data, // <-- OK maintenant, car data est forcé comme objet
    });
  } catch (err) {
    console.error("❌ WEATHER PROXY ERROR:", err);
    return res.status(500).json({ error: "Internal error fetching weather" });
  }
});

export default router;
