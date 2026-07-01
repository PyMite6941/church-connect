// Post-build: place the marketing homepage at the site root (dist/index.html)
// so "/" serves the landing page and "/demo/" serves the SPA.
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

mkdirSync(resolve(root, "dist"), { recursive: true });
copyFileSync(resolve(root, "landing/index.html"), resolve(root, "dist/index.html"));
console.log("✓ landing page copied to dist/index.html (homepage)");
