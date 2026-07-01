import { FEATURES, featureLabel } from "./registry";

// Resolve the ordered list of active channels (built-in enabled features +
// admin-created custom channels) for routing and navigation. Each entry:
//   { key, icon, label, custom }
// `label` honors settings renames; built-in components come from the registry,
// custom channels render via <CustomChannel channelKey=...> (handled by callers).
export function getActiveChannels(settings, tenant) {
  const enabled = settings?.enabledFeatures || [];
  const custom = settings?.customChannels || [];

  const builtIn = enabled
    .filter((key) => FEATURES[key])
    .map((key) => ({
      key,
      icon: FEATURES[key].icon,
      label: settings?.featureLabels?.[key] || featureLabel(key, tenant),
      custom: false,
    }));

  const customChannels = custom
    .filter((c) => enabled.includes(c.key))
    .map((c) => ({ key: c.key, icon: c.icon || "📌", label: c.label, custom: true }));

  return [...builtIn, ...customChannels];
}
