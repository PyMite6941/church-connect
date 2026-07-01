// Tenant registry. Each church is one entry. In production this can be replaced
// by a fetch from your API (see resolveTenant) — the shape stays the same.
//
// EVERYTHING here is customizable per church:
//   name / tagline / logoUrl / footerText  — branding & copy
//   theme { primary, accent, bg, text, muted, border, card, headerBg,
//           radius, font }                  — full visual restyle (all optional)
//   features[]                              — which functions are offered
//   featureLabels { key: "Custom name" }    — rename any function
//   showIcons                               — show/hide nav emoji icons
//   accounts[]                              — seed accounts (editable at runtime)
//   givingUrl                               — external giving link

export const TENANTS = {
  "grace-community": {
    id: "grace-community",
    name: "Grace Community Church",
    tagline: "Loving God, loving people.",
    footerText: "Grace Community Church · Powered by Church Connect",
    theme: {
      primary: "#3b5bdb",
      accent: "#f59f00",
      bg: "#f8f9fb",
      font: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      radius: "10px",
    },
    features: ["events", "announcements", "sermons", "prayer", "leadership", "groups", "meals", "directory", "giving"],
    featureLabels: { meals: "Potlucks" },
    showIcons: true,
    accounts: [
      { id: "u-admin", name: "Grace Church", username: "GraceChurch", email: "dan@grace.org", role: "admin", pin: "John3:16!!" },
      { id: "u-member", name: "Maria Lopez", username: "Member", email: "maria@grace.org", role: "member", pin: "0000" },
      { id: "u-viewer", name: "Sam Visitor", username: "Visitor", email: "visitor@grace.org", role: "viewer", pin: "0000" },
    ],
  },
  "riverside-chapel": {
    id: "riverside-chapel",
    name: "Riverside Chapel",
    tagline: "A place to belong.",
    theme: {
      primary: "#2b8a3e",
      accent: "#e8590c",
      bg: "#f7faf7",
      headerBg: "#ffffff",
      radius: "16px",
      font: "Georgia, 'Times New Roman', serif",
    },
    // A leaner church — fewer functions enabled, "Meals" renamed to "Lunch".
    features: ["events", "announcements", "prayer", "leadership", "meals"],
    featureLabels: { meals: "Lunch" },
    showIcons: false,
    accounts: [
      { id: "u-admin", name: "Rev. Amelia", email: "amelia@riverside.org", role: "admin", pin: "1234" },
    ],
  },
};

import { getCustomTenants } from "./customTenants";

export const DEFAULT_TENANT_ID = import.meta.env?.VITE_DEFAULT_TENANT || "grace-community";

// Built-in sample churches + any created in-app (Create-a-Church page).
function allTenants() {
  return { ...TENANTS, ...getCustomTenants() };
}

// Resolve which tenant to load. Priority:
//   1. explicit override (embed option / #root[data-tenant])
//   2. subdomain  ->  connect.<tenant>.org  or  <tenant>.connect.app
//   3. ?tenant= query param (handy for previews)
//   4. DEFAULT_TENANT_ID
export function resolveTenantId(override) {
  const tenants = allTenants();
  if (override && tenants[override]) return override;

  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("tenant");
  if (fromQuery && tenants[fromQuery]) return fromQuery;

  const host = window.location.hostname; // e.g. grace-community.connect.app
  const sub = host.split(".")[0];
  if (sub && tenants[sub]) return sub;

  return DEFAULT_TENANT_ID;
}

export function getTenantConfig(id) {
  const tenants = allTenants();
  return tenants[id] || tenants[DEFAULT_TENANT_ID];
}
