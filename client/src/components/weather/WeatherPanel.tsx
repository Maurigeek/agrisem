// src/components/weather/WeatherPanel.tsx
import React, { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowRight, RefreshCw } from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_BASE || "/api/v1").replace(/\/$/, "");

// Cities rotation preset (keys must match backend CITY_MAP keys)
const ROTATION_CITIES = ["parakou", "cotonou", "natitingou", "bohicon", "accra", "paris"];

type WeatherData = {
  city: string;
  country?: string;
  forecast: {
    date: string;
    tempMax?: number;
    tempMin?: number;
    rainfallMm?: number;
    condition?: string;
  }[];
  cumulativeRainfall?: number;
};

export function WeatherPanel() {
  const [selectedCityKey, setSelectedCityKey] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(true);
  const rotationIndex = useRef(0);
  const rotationInterval = useRef<number | null>(null);
  const [useGeoPrompted, setUseGeoPrompted] = useState(false);

  // Load preset cities list from backend
  const { data: cities = [], isLoading: citiesLoading } = useQuery({
    queryKey: ["weather-cities"],
    queryFn: async () => (await fetch(`${API_BASE}/weather/cities`)).json(),
  });

  // Decide which city to load: selectedCityKey OR rotation OR auto-detect (null)
  const buildUrl = () => {
    if (selectedCityKey) {
      return `${API_BASE}/weather?city=${encodeURIComponent(selectedCityKey)}`;
    }
    // if null → auto-detect by IP
    return `${API_BASE}/weather`;
  };

  // Weather fetch query (react-query) depends on URL
  const { data: weatherData, isLoading: weatherLoading, refetch } = useQuery({
    queryKey: ["weather", selectedCityKey],
    queryFn: async () => {
      const url = buildUrl();
      const r = await fetch(url);
      if (!r.ok) throw new Error("Failed to load weather");
      return (await r.json()) as WeatherData;
    },
    // keep previous while refetching for smooth UI
    keepPreviousData: true,
    // don't refetch on window focus too aggressively
    refetchOnWindowFocus: false,
  });

  // Rotation effect
  useEffect(() => {
    if (!isRotating) return;
    // ensure we start with rotationIndex valid
    rotationIndex.current = rotationIndex.current % ROTATION_CITIES.length;
    rotationInterval.current = window.setInterval(() => {
      const key = ROTATION_CITIES[rotationIndex.current % ROTATION_CITIES.length];
      rotationIndex.current = rotationIndex.current + 1;
      setSelectedCityKey(key);
    }, 30000); // every 30s
    return () => {
      if (rotationInterval.current) window.clearInterval(rotationInterval.current);
      rotationInterval.current = null;
    };
  }, [isRotating]);

  // If selectedCityKey changes, refetch
  useEffect(() => {
    refetch();
  }, [selectedCityKey]);

  // Geolocation prompt (optional): user clicks button
  const handleUseBrowserLocation = () => {
    if (!navigator.geolocation) {
      alert("Géolocalisation non disponible");
      return;
    }
    setUseGeoPrompted(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // stop rotation when user picks location
        setIsRotating(false);
        setSelectedCityKey(null);
        // call backend with lat/lon
        fetch(`${API_BASE}/weather?lat=${latitude}&lon=${longitude}`)
          .then((r) => r.json())
          .then(() => refetch())
          .catch(console.error);
      },
      (err) => {
        console.warn("geoloc error", err);
        setUseGeoPrompted(false);
        alert("Impossible d'accéder à la géolocalisation");
      }
    );
  };

  const handleManualSelect = (key: string) => {
    setIsRotating(false);
    setSelectedCityKey(key);
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="bg-white shadow p-6 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold">Prévisions Météo</h3>
          <p className="text-sm text-muted-foreground">
            {weatherData
                ? (
                    weatherData.city
                    ? `${weatherData.city}${weatherData.country ? `, ${weatherData.country}` : ""}`
                    : "Zone détectée automatiquement"
                )
                : "Chargement..."}
            </p>
        </div>

        <div className="text-xs text-muted-foreground mt-1">
        {selectedCityKey
            ? `Prévisions pour ${weatherData?.city ?? selectedCityKey}`
            : "Prévisions basées sur votre position / détection automatique"}
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => { setIsRotating(v => !v); }}>
            {isRotating ? "Pause rotation" : "Reprendre rotation"}
          </Button>

          <Button size="sm" variant="ghost" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <label className="block text-sm text-muted-foreground mb-1">Voir la météo d’une autre ville</label>
            {citiesLoading ? (
              <div className="w-full"><LoadingSpinner /></div>
            ) : (
              <Select
                value={selectedCityKey || "auto"}
                onValueChange={(v) => {
                    setIsRotating(false);

                    if (v === "auto") {
                    setSelectedCityKey(null);
                    } else {
                    setSelectedCityKey(v);
                    }
                }}
                >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choisir une ville" />
                </SelectTrigger>

                <SelectContent>
                    <SelectItem value="auto">Détection automatique (votre zone)</SelectItem>

                    {cities.map((c: any) => (
                    <SelectItem key={c.key} value={c.key}>
                        {c.name}{c.country ? ` — ${c.country}` : ""}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>

            )}
          </div>

          <div className="w-40 flex-shrink-0">
            <Button className="w-full" onClick={handleUseBrowserLocation}>
              Ma position
            </Button>
          </div>
        </div>
      </div>

      {/* Forecast summary */}
      <div>
        {weatherLoading || !weatherData ? (
          <div className="w-full flex justify-center py-8"><LoadingSpinner /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {weatherData.forecast.slice(0, 3).map((d) => (
              <div key={d.date} className="p-4 rounded border">
                <div className="text-sm text-muted-foreground">{new Date(d.date).toLocaleDateString()}</div>
                <div className="font-semibold text-lg mt-2">{d.condition === "rain" ? "Pluie" : "Ensoleillé"}</div>
                <div className="mt-1 text-sm">
                  {d.tempMin != null && d.tempMax != null ? `${d.tempMin}° - ${d.tempMax}°` : "—"}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">Précipitations: {d.rainfallMm ?? 0} mm</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        {weatherData ? `Cumul pluie (période): ${weatherData.cumulativeRainfall ?? 0} mm` : ""}
      </div>
    </div>
  );
}
