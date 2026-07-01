import { NavLink } from "react-router-dom";
import { useTenant } from "../context/TenantContext";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { useI18n } from "../context/LanguageContext";
import { getActiveChannels } from "../features/channels";

export default function Layout({ children }) {
  const tenant = useTenant();
  const { user, isAdmin, signOut } = useAuth();
  const { settings } = useSettings();
  const { t } = useI18n();

  const channels = getActiveChannels(settings, tenant);

  return (
    <div className="cc-app">
      <header className="cc-header">
        <div className="cc-brand">
          {tenant.logoUrl && <img className="cc-logo" src={tenant.logoUrl} alt="" />}
          {tenant.name}
        </div>
        <nav className="cc-nav">
          <NavLink to="/" end>{t("home")}</NavLink>
          {channels.map((ch) => (
            <NavLink key={ch.key} to={`/${ch.key}`}>
              {tenant.showIcons !== false && `${ch.icon} `}
              {ch.label}
            </NavLink>
          ))}
          <NavLink to="/help">{t("help")}</NavLink>
          {isAdmin && <NavLink to="/settings">{t("settings")}</NavLink>}
          {isAdmin && <NavLink to="/accounts">{t("accounts")}</NavLink>}
        </nav>
        <div className="cc-user">
          <NavLink to="/account" className="cc-user-link" title={t("myAccount")}>
            {user.name}{isAdmin ? " (admin)" : ""}
          </NavLink>
          <button className="cc-btn-ghost" onClick={signOut}>{t("signOut")}</button>
        </div>
      </header>
      <main className="cc-main">{children}</main>
      <footer className="cc-footer cc-muted">
        {tenant.footerText || "Powered by Church Connect"}
      </footer>
    </div>
  );
}
