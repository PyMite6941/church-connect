// Pluggable storage adapters. The app talks to this interface only, so the
// backing store can be swapped without touching feature code.
//
//   getCollection(tenantId, name)            -> array | object | null
//   saveCollection(tenantId, name, items)    -> void
//
// A real backend is REQUIRED by default (see BACKEND.md). Configure one of:
//   • Supabase:  VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY   (recommended, free)
//   • Any REST:  VITE_API_BASE_URL                            (GET/PUT /{tenant}/{name})
// For local demos only, set VITE_ALLOW_LOCAL=true to fall back to localStorage.

export const STORAGE_VERSION = "v3";

const SUPA_URL = import.meta.env?.VITE_SUPABASE_URL;
const SUPA_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY;
const API_BASE = import.meta.env?.VITE_API_BASE_URL;

export const ALLOW_LOCAL = import.meta.env?.VITE_ALLOW_LOCAL === "true";
// Backend is mandatory unless local demo mode is explicitly enabled.
export const BACKEND_REQUIRED = !ALLOW_LOCAL;

export function isBackendConfigured() {
  return !!((SUPA_URL && SUPA_KEY) || API_BASE);
}

class LocalStorageAdapter {
  key(tenantId, name) {
    return `church-connect:${STORAGE_VERSION}:${tenantId}:${name}`;
  }
  async getCollection(tenantId, name) {
    const raw = localStorage.getItem(this.key(tenantId, name));
    return raw ? JSON.parse(raw) : null;
  }
  async saveCollection(tenantId, name, items) {
    localStorage.setItem(this.key(tenantId, name), JSON.stringify(items));
  }
}

class ApiAdapter {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }
  async getCollection(tenantId, name) {
    const res = await fetch(`${this.baseUrl}/${tenantId}/${name}`);
    if (!res.ok) return null;
    return res.json();
  }
  async saveCollection(tenantId, name, items) {
    await fetch(`${this.baseUrl}/${tenantId}/${name}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(items),
    });
  }
}

// Talks directly to Supabase's REST API (PostgREST) against a single table:
//   create table collections (
//     tenant text, name text, data jsonb,
//     primary key (tenant, name)
//   );
// No serverless function needed — the anon key + RLS is enough. See BACKEND.md.
class SupabaseAdapter {
  constructor(url, anonKey) {
    this.rest = `${url.replace(/\/$/, "")}/rest/v1/collections`;
    this.headers = {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
    };
  }
  async getCollection(tenantId, name) {
    const url = `${this.rest}?tenant=eq.${encodeURIComponent(tenantId)}&name=eq.${encodeURIComponent(name)}&select=data`;
    const res = await fetch(url, { headers: this.headers });
    if (!res.ok) return null;
    const rows = await res.json();
    return rows[0]?.data ?? null;
  }
  async saveCollection(tenantId, name, items) {
    // Upsert on the (tenant, name) primary key.
    await fetch(`${this.rest}?on_conflict=tenant,name`, {
      method: "POST",
      headers: { ...this.headers, Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ tenant: tenantId, name, data: items }),
    });
  }
}

export function createAdapter() {
  if (SUPA_URL && SUPA_KEY) return new SupabaseAdapter(SUPA_URL, SUPA_KEY);
  if (API_BASE) return new ApiAdapter(API_BASE);
  return new LocalStorageAdapter(); // demo only; gated by BACKEND_REQUIRED
}
