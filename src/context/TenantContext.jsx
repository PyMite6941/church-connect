import { createContext, useContext, useEffect, useMemo } from "react";
import { getTenantConfig } from "../config/tenants";

const TenantContext = createContext(null);

// Every visual knob maps to a CSS variable with a sane default. A tenant only
// needs to set the ones it wants to change (theme: { primary, font, ... }).
const THEME_VARS = {
  primary: "--cc-primary",
  accent: "--cc-accent",
  bg: "--cc-bg",
  text: "--cc-text",
  muted: "--cc-muted",
  border: "--cc-border",
  card: "--cc-card",
  headerBg: "--cc-header-bg",
  radius: "--cc-radius",
  font: "--cc-font",
};

export function TenantProvider({ tenantId, children }) {
  const config = useMemo(() => getTenantConfig(tenantId), [tenantId]);

  // Apply tenant theme as CSS variables so any church's branding flows through.
  useEffect(() => {
    const root = document.documentElement;
    const theme = config.theme || {};
    for (const [key, cssVar] of Object.entries(THEME_VARS)) {
      if (theme[key] != null) root.style.setProperty(cssVar, String(theme[key]));
    }
    if (config.name) document.title = config.name;
  }, [config]);

  return <TenantContext.Provider value={config}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
}
