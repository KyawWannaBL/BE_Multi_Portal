import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

/**
 * Production config:
 * - @ alias -> /src
 * - react-router-dom-original alias -> react-router-dom (safe for legacy proxy files)
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "react-router-dom-original": "react-router-dom",
    },
  },
});
