import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Widget build: produces a single church-connect.js any external site can import:
//   <div id="church-connect"></div>
//   <script src="https://cdn.yoursite/church-connect.js" data-tenant="grace-community"></script>
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: "src/embed.jsx",
      name: "ChurchConnect",
      fileName: () => "church-connect.js",
      formats: ["iife"],
    },
    outDir: "dist-embed",
    emptyOutDir: true,
  },
});
