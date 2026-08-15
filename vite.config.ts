import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import fileURLToPath from "node:url";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  appType: "spa",
  server: {
    port: 8080,
    host: true,
    proxy: {
      "/api": {
        // 👇 Podmień na rzeczywisty URL swojego backendu produkcyjnego:
        target: "https://smile-feedback-boost.vercel.app", 
        changeOrigin: true,
        secure: true,
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    TanStackRouterVite(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "DajOpinie — Panel Menadżera",
        short_name: "DajOpinie",
        description: "System pasywnego pozyskiwania opinii Google dla gastronomii",
        theme_color: "#0b0f17",
        background_color: "#0b0f17",
        display: "standalone",
        orientation: "portrait",
        start_url: "/dashboard",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath.fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});