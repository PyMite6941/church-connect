import { STORAGE_VERSION } from "../data/adapters";

// Churches created in-app (via the Create-a-Church page) are stored here so the
// app works with zero backend. For real multi-church hosting, persist these in
// your backend instead (same shape) — see BACKEND.md.
const KEY = `church-connect:${STORAGE_VERSION}:__tenants__`;

export function getCustomTenants() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export function saveCustomTenant(config) {
  const all = getCustomTenants();
  all[config.id] = config;
  localStorage.setItem(KEY, JSON.stringify(all));
}

// Turn a church name into a safe subdomain-style id, e.g. "Grace Church" -> "grace-church".
export function slugify(name) {
  return (name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
