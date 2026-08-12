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
  },
  plugins: [
    tailwindcss(), // 👈 TO JEST KLUCZ: Dedykowana wtyczka Tailwinda v4!
    TanStackRouterVite(),
    react(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath.fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});