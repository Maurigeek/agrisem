// server/routes/weather.routes.ts
import express, { Request, Response } from "express";
import fetch from "node-fetch";
import { addRouteToSwagger } from "../swagger.js";

const router = express.Router();

/* ======================================================
   PRESET CITIES (you can extend freely)
====================================================== */
const CITY_MAP: Record<
  string,
  { name: string; lat: number; lon: number; country?: string }
> = {
  parakou: { name: "Parakou", lat: 9.3371, lon: 2.6319, country: "Benin" },
  cotonou: { name: "Cotonou", lat: 6.3543, lon: 2.3912, country: "Benin" },
  natitingou: { name: "Natitingou", lat: 10.2986, lon: 1.3839, country: "Benin" },
  bohicon: { name: "Bohicon", lat: 7.1786, lon: 2.0706, country: "Benin" },

  // Togo / Ghana
  dapaong: { name: "Dapaong", lat: 10.8801, lon: 0.232, country: "Togo" },
  accra: { name: "Accra", lat: 5.6037, lon: -0.187, country: "Ghana" },

  // international
  paris: { name: "Paris", lat: 48.8566, lon: 2.3522, country: "France" },
  london: { name: "London", lat: 51.5074, lon: -0.1278, country: "UK" },
};

/* ======================================================
   HELPERS
====================================================== */
function getClientIp(req: Request): string | null {
  const xff = req.headers["x-forwarded-for"];
  if (xff && typeof xff === "string") return xff.split(",")[0].trim();
  return (req.ip as string) || null;
}

// --- Fetch GEO from IP ---
async function fetchGeoFromIp(ip: string | null) {
  try {
    if (!ip) return null;

    const url = `http://ip-api.com/json/${ip}?fields=status,country,city,lat,lon`;
    const r = await fetch(url);
    const j = (await r.json()) as any;

    if (j?.status === "success") {
      return { city: j.city, country: j.country, lat: j.lat, lon: j.lon };
    }
    return null;
  } catch {
    return null;
  }
}

// --- Fetch Weather Forecast ---
async function fetchWeather(lat: number, lon: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;

  const r = await fetch(url);
  if (!r.ok) throw new Error("Open-Meteo fetch failed");

  const data = (await r.json()) as any;

  const days: string[] = data?.daily?.time ?? [];
  const max: number[] = data?.daily?.temperature_2m_max ?? [];
  const min: number[] = data?.daily?.temperature_2m_min ?? [];
  const rain: number[] = data?.daily?.precipitation_sum ?? [];

  const forecast = days.map((d, i) => ({
    date: d,
    tempMax: max[i],
    tempMin: min[i],
    rainfallMm: rain[i],
    condition: rain[i] > 1 ? "rain" : "sunny",
  }));

  const cumulativeRainfall = rain.reduce((a, b) => a + (b || 0), 0);

  return { forecast, cumulativeRainfall };
}

/* ======================================================
   SWAGGER DOCS — CLEAN (parameters removed)
====================================================== */
addRouteToSwagger("/weather", "get", null, {
  summary:
    "Obtenir la météo. Supporte ?city=parakou ou ?lat=..&lon=.. ou vide pour auto-détection",
  tags: ["Weather"],
  responses: {
    200: "Prévisions météo",
    400: "Requête invalide",
    500: "Erreur serveur",
  },
});

addRouteToSwagger("/weather/cities", "get", null, {
  summary: "Obtenir la liste des villes disponibles en sélection rapide",
  tags: ["Weather"],
  responses: {
    200: "Liste des villes",
  },
});

/* ======================================================
   ROUTE : GET /weather
====================================================== */
router.get("/", async (req: Request, res: Response) => {
  try {
    const cityQ = req.query.city as string | undefined;
    const latQ = req.query.lat as string | undefined;
    const lonQ = req.query.lon as string | undefined;

    let lat: number | null = null;
    let lon: number | null = null;
    let cityName = null;
    let country = null;

    /* ----------------------------------------
       1) CITY KEY FROM MAP
    ---------------------------------------- */
    if (cityQ) {
      const key = cityQ.toLowerCase();
      const entry = CITY_MAP[key];

      if (entry) {
        lat = entry.lat;
        lon = entry.lon;
        cityName = entry.name;
        country = entry.country;
      } else {
        // Try geocoding for any global city name
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          cityQ
        )}&count=1`;

        const r = await fetch(url);
        const geo = (await r.json()) as any;

        if (geo?.results?.length > 0) {
          const g = geo.results[0];
          lat = g.latitude;
          lon = g.longitude;
          cityName = g.name;
          country = g.country ?? null;
        } else {
          return res.status(400).json({ message: "City not found" });
        }
      }
    }

    /* ----------------------------------------
       2) LAT / LON PROVIDED MANUALLY
    ---------------------------------------- */
    else if (latQ && lonQ) {
      lat = Number(latQ);
      lon = Number(lonQ);

      // Reverse geocoding for human-readable name
      const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1`;
      const r = await fetch(url);
      const rev = (await r.json()) as any;

      if (rev?.results?.length > 0) {
        cityName = rev.results[0].name ?? null;
        country = rev.results[0].country ?? null;
      }
    }

    /* ----------------------------------------
       3) AUTO-DETECT VIA IP
    ---------------------------------------- */
    else {
      const ip = getClientIp(req);
      const geo = await fetchGeoFromIp(ip);

      if (geo) {
        lat = geo.lat;
        lon = geo.lon;
        cityName = geo.city;
        country = geo.country;
      } else {
        const fb = CITY_MAP.parakou;
        lat = fb.lat;
        lon = fb.lon;
        cityName = fb.name;
        country = fb.country ?? null;
      }
    }

    if (!lat || !lon) {
      return res
        .status(400)
        .json({ message: "Impossible de déterminer les coordonnées" });
    }

    const weather = await fetchWeather(lat, lon);

    res.json({
      city: cityName,
      country,
      lat,
      lon,
      ...weather,
    });
  } catch (err) {
    console.error("Weather route error:", err);
    res.status(500).json({ error: "Failed to fetch weather" });
  }
});

/* ======================================================
   ROUTE : GET /weather/cities
====================================================== */
router.get("/cities", (req: Request, res: Response) => {
  const list = Object.entries(CITY_MAP).map(([key, val]) => ({
    key,
    name: val.name,
    lat: val.lat,
    lon: val.lon,
    country: val.country,
  }));

  res.json(list);
});

export default router;
