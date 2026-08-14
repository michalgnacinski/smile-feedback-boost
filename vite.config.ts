import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import fileURLToPath from "node:url";

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
    tailwindcss(),
    TanStackRouterVite(),
    react(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath.fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});