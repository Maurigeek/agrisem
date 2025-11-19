import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// Dapeoua / Parakou default coordinates
const LAT = 9.34;  
const LON = 2.62;

router.get("/weather", async (req, res) => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Africa%2FLagos`;

    const response = await fetch(url);
    const data = (await response.json()) as any;  // 👈 ICI

    const days = data.daily.time;
    const max = data.daily.temperature_2m_max;
    const min = data.daily.temperature_2m_min;
    const rain = data.daily.precipitation_sum;

    const forecast = days.map((day: string, i: number) => ({
      date: day,
      condition: rain[i] > 1 ? "rain" : "sunny",
      tempMax: max[i],
      tempMin: min[i],
      rainfallMm: rain[i],
    }));

    const cumulativeRainfall = rain.reduce((s: number, x: number) => s + x, 0);

    res.json({
      forecast,
      cumulativeRainfall,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

export default router;
