import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// 🚀 Fonction d’activation des mocks uniquement en mode développement
async function enableMocking() {
  // ✅ On ne démarre MSW qu’en mode dev
  if (!import.meta.env.DEV) {
    console.info("[MSW] Ignoré en production");
    return;
  }

  const swSupported = "serviceWorker" in navigator;
  const secure = window.isSecureContext; // https ou localhost
  const isTop = window.top === window;   // pas dans une iframe

  // Mock uniquement si service worker dispo
  if (swSupported && secure && isTop) {
    const { worker } = await import("./mocks/browser");
    await worker.start({
      serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
      onUnhandledRequest: "bypass",
    });
    console.info("[MSW] Service worker démarré");
  } else {
    console.warn("[MSW] SW non disponible, mocks ignorés");
  }

  // Initialisation éventuelle d'une DB mockée locale
  const { seedDatabase } = await import("./mocks/seed");
  seedDatabase();
}

// ⚙️ Démarrage de l’application après initialisation des mocks
enableMocking()
  .catch((err) => console.error("[MSW] Init error:", err))
  .finally(() => {
    createRoot(document.getElementById("root")!).render(<App />);
  });
