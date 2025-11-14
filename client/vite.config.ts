import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Détection automatique : local vs production
const API_TARGET =
  process.env.NODE_ENV === "production"
    ? "https://agrisem.onrender.com"
    : "http://localhost:5001";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "../attached_assets"),
    },
  },

  root: ".",

  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },

  server: {
    port: 5173,
    hmr: { overlay: false },
    fs: { strict: true, deny: ["**/.*"] },

    proxy: {
      "/api": {
        target: API_TARGET,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
