import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Démarrage des mocks en dev, avec garde SW + chemin correct
async function enableMocking() {
  if (!import.meta.env.DEV) return;

  const swSupported = "serviceWorker" in navigator;
  const secure = window.isSecureContext;       // https: ou localhost
  const isTop = window.top === window;         // évite iframes/overlays

  // Seed toujours (même en fallback)
  const { seedDatabase } = await import("./mocks/seed");
  seedDatabase();

  if (swSupported && secure && isTop) {
    const { worker } = await import("./mocks/browser");
    // IMPORTANT: base path en fonction de Vite (root=client → public à la racine)
    await worker.start({
      serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
      onUnhandledRequest: "bypass",
    });
    console.info("[MSW] Service worker started");
  } else {
    console.warn("[MSW] SW indisponible (iframe/insecure/unsupported). Fallback.");
    // Optionnel : mettre un fallback fetch mock si besoin
    // const { startFallbackMocks } = await import("./mocks/fallback");
    // startFallbackMocks();
  }
}

enableMocking().finally(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});



