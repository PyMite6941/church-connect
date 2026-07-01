import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useTenant } from "./TenantContext";
import { createAdapter, STORAGE_VERSION } from "../data/adapters";

// Runtime, admin-editable settings that OVERRIDE the static tenant config:
//   enabledFeatures, featureOptions, featureOwners, featureLabels (renames),
//   customChannels (admin-created sections), requirePassword, allowAnonymous.
// Seeded from the tenant's config on first run, then persisted via the adapter
// so an admin can reconfigure the whole app from the UI (Settings page).
const SettingsContext = createContext(null);
const adapter = createAdapter();

const MAX_OWNERS = 4;

export function SettingsProvider({ tenantId, children }) {
  const tenant = useTenant();
  const [settings, setSettings] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    setReady(false);
    (async () => {
      let s = await adapter.getCollection(tenantId, "settings");
      if (s == null || !Array.isArray(s.enabledFeatures)) {
        s = {
          enabledFeatures: [...(tenant.features || [])],
          featureOptions: {},
          featureOwners: {},
          featureLabels: {},
          customChannels: [],
          requirePassword: true,
          allowAnonymous: true,
        };
        await adapter.saveCollection(tenantId, "settings", s);
      }
      if (!active) return;
      setSettings(s);
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, [tenantId, tenant]);

  const persist = useCallback(
    async (next) => {
      setSettings(next);
      await adapter.saveCollection(tenantId, "settings", next);
    },
    [tenantId]
  );

  const toggleFeature = (key, on) => {
    const set = new Set(settings.enabledFeatures);
    if (on) set.add(key);
    else set.delete(key);
    persist({ ...settings, enabledFeatures: [...set] });
  };

  const setFeatureOption = (featureKey, optKey, value) => {
    const featureOptions = { ...(settings.featureOptions || {}) };
    featureOptions[featureKey] = { ...(featureOptions[featureKey] || {}), [optKey]: value };
    persist({ ...settings, featureOptions });
  };

  // Church-wide toggles.
  const setRequirePassword = (on) => persist({ ...settings, requirePassword: on });
  const setAllowAnonymous = (on) => persist({ ...settings, allowAnonymous: on });

  // Rename any channel (built-in or custom). Empty string clears the override.
  const setChannelLabel = (key, label) => {
    const featureLabels = { ...(settings.featureLabels || {}) };
    const custom = (settings.customChannels || []).find((c) => c.key === key);
    if (custom) {
      const customChannels = settings.customChannels.map((c) =>
        c.key === key ? { ...c, label: label || c.label } : c
      );
      persist({ ...settings, customChannels });
      return;
    }
    if (label) featureLabels[key] = label;
    else delete featureLabels[key];
    persist({ ...settings, featureLabels });
  };

  // Custom channels — admin-created generic sections.
  const addCustomChannel = (label, icon) => {
    const key = "ch-" + Math.random().toString(36).slice(2, 8);
    const customChannels = [...(settings.customChannels || []), { key, label: label || "New Channel", icon: icon || "📌" }];
    persist({ ...settings, customChannels, enabledFeatures: [...settings.enabledFeatures, key] });
  };
  const removeCustomChannel = (key) => {
    const customChannels = (settings.customChannels || []).filter((c) => c.key !== key);
    const enabledFeatures = settings.enabledFeatures.filter((k) => k !== key);
    const featureOwners = { ...(settings.featureOwners || {}) };
    delete featureOwners[key];
    persist({ ...settings, customChannels, enabledFeatures, featureOwners });
  };

  // Section watchers — up to MAX_OWNERS people.
  const getFeatureOwners = (featureKey) => settings?.featureOwners?.[featureKey] || [];
  const toggleFeatureOwner = (featureKey, accountId) => {
    const current = getFeatureOwners(featureKey);
    let next;
    if (current.includes(accountId)) next = current.filter((id) => id !== accountId);
    else if (current.length >= MAX_OWNERS) return; // cap reached
    else next = [...current, accountId];
    const featureOwners = { ...(settings.featureOwners || {}), [featureKey]: next };
    persist({ ...settings, featureOwners });
  };

  const isEnabled = (key) => !!settings?.enabledFeatures?.includes(key);

  const getFeatureOption = (featureKey, optKey) =>
    settings?.featureOptions?.[featureKey]?.[optKey];

  // Resolve a channel's display label: settings rename > supplied fallback.
  const channelLabel = (key, fallback) => {
    const override = settings?.featureLabels?.[key];
    if (override) return override;
    const custom = (settings?.customChannels || []).find((c) => c.key === key);
    if (custom) return custom.label;
    return fallback;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        ready,
        enabledFeatures: settings?.enabledFeatures || [],
        customChannels: settings?.customChannels || [],
        requirePassword: settings?.requirePassword !== false,
        allowAnonymous: settings?.allowAnonymous !== false,
        maxOwners: MAX_OWNERS,
        isEnabled,
        toggleFeature,
        setFeatureOption,
        getFeatureOption,
        setRequirePassword,
        setAllowAnonymous,
        setChannelLabel,
        channelLabel,
        addCustomChannel,
        removeCustomChannel,
        getFeatureOwners,
        toggleFeatureOwner,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}

// Convenience hook for feature components: returns the stored option value or
// the supplied fallback default.
export function useFeatureOption(featureKey, optKey, fallback) {
  const { getFeatureOption } = useSettings();
  const v = getFeatureOption(featureKey, optKey);
  return v == null ? fallback : v;
}
