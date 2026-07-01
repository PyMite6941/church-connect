import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev: app at "/". Production build: app lives under "/demo/" so the marketing
// homepage (landing/index.html, copied to dist/index.html) can own "/".
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/demo/" : "/",
  plugins: [react()],
  build: {
    outDir: "dist/demo",
    emptyOutDir: true,
  },
  server: {
    port: 5180,
    host: true,
  },
}));
