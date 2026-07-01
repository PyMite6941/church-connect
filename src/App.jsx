import { Routes, Route, Navigate } from "react-router-dom";
import { TenantProvider, useTenant } from "./context/TenantContext";
import { DataProvider } from "./context/DataContext";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import Layout from "./components/Layout";
import SignIn from "./components/SignIn";
import Dashboard from "./features/Dashboard";
import Accounts from "./features/Accounts";
import MyAccount from "./features/MyAccount";
import Settings from "./features/Settings";
import Help from "./features/Help";
import CustomChannel from "./features/CustomChannel";
import BackendRequired from "./components/BackendRequired";
import { FEATURES } from "./features/registry";
import { getActiveChannels } from "./features/channels";
import { BACKEND_REQUIRED, isBackendConfigured } from "./data/adapters";

function Shell() {
  const { user, ready: authReady } = useAuth();
  const { settings, ready: settingsReady } = useSettings();
  const tenant = useTenant();
  if (!authReady || !settingsReady) return <div className="cc-loading">Loading…</div>;
  if (!user) return <SignIn />;

  // Routes for every active channel — built-in features + custom channels.
  const channels = getActiveChannels(settings, tenant);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {channels.map((ch) => {
          const Comp = ch.custom ? null : FEATURES[ch.key].component;
          return (
            <Route
              key={ch.key}
              path={`/${ch.key}`}
              element={ch.custom ? <CustomChannel channelKey={ch.key} /> : <Comp />}
            />
          );
        })}
        <Route path="/help" element={<Help />} />
        <Route path="/account" element={<MyAccount />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

// Root component. tenantId is resolved once at mount (main.jsx / embed.jsx) and
// threaded through every provider so the whole tree is scoped to one church.
export default function App({ tenantId }) {
  // A hosted database is mandatory unless local demo mode is enabled.
  if (BACKEND_REQUIRED && !isBackendConfigured()) return <BackendRequired />;

  return (
    <TenantProvider tenantId={tenantId}>
      <DataProvider tenantId={tenantId}>
        <SettingsProvider tenantId={tenantId}>
          <AuthProvider tenantId={tenantId}>
            <LanguageProvider>
              <Shell />
            </LanguageProvider>
          </AuthProvider>
        </SettingsProvider>
      </DataProvider>
    </TenantProvider>
  );
}
