import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTenant } from "../context/TenantContext";
import { useI18n } from "../context/LanguageContext";
import { LANGUAGES } from "../i18n/translations";
import PasswordStrength, { scorePassword } from "../components/PasswordStrength";

// Personal account page — available to every signed-in user. View profile, edit
// name, change password, and pick the language the app shows for them. (Admin
// org-wide account management lives on the separate Accounts page.)
export default function MyAccount() {
  const { user, role, isAdmin, updateProfile, signOut } = useAuth();
  const tenant = useTenant();
  const { t, lang, setLang } = useI18n();

  const [name, setName] = useState(user.name);
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");

  const roleLabel = isAdmin ? t("administrator") : t(role) || role;

  const saveName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await updateProfile({ name: name.trim() });
    setMsg(t("saveName"));
  };

  const savePin = async (e) => {
    e.preventDefault();
    setMsg("");
    if (scorePassword(pin) < 2) return setMsg("Please choose a stronger password (8+ chars, mix of letters, numbers, symbols).");
    if (pin !== confirm) return setMsg("Passwords don't match.");
    await updateProfile({ pin });
    setPin("");
    setConfirm("");
    setMsg(t("updatePassword"));
  };

  return (
    <section>
      <h2>{t("myAccount")}</h2>

      <div className="cc-card cc-account-summary">
        <div className="cc-avatar" aria-hidden>{user.name?.[0] || "?"}</div>
        <div className="cc-grow">
          <strong>{user.name}</strong>
          <div className="cc-muted">{user.email}</div>
          <div className="cc-muted">{tenant.name} · {roleLabel}</div>
        </div>
      </div>

      {msg && <p className="cc-muted cc-account-msg">{msg}</p>}

      {/* Language — applies to this user only, persisted on their account. */}
      <div className="cc-form">
        <h3>{t("language")}</h3>
        <select value={lang} onChange={(e) => setLang(e.target.value)}>
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
      </div>

      {/* Accessibility — per-user preferences. */}
      <div className="cc-form">
        <h3>{t("accessibility")}</h3>
        <label className="cc-check">
          <input
            type="checkbox"
            checked={!!user.dyslexiaFont}
            onChange={(e) => updateProfile({ dyslexiaFont: e.target.checked })}
          />
          {t("dyslexiaFont")}
        </label>
      </div>

      <form className="cc-form" onSubmit={saveName}>
        <h3>{t("profile")}</h3>
        <label className="cc-muted">{t("displayName")}</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <button className="cc-btn" type="submit">{t("saveName")}</button>
      </form>

      <form className="cc-form" onSubmit={savePin}>
        <h3>{t("changePassword")}</h3>
        <input type="password" placeholder={t("newPassword")} value={pin} onChange={(e) => setPin(e.target.value)} autoComplete="new-password" />
        <PasswordStrength value={pin} />
        <input type="password" placeholder={t("confirmPassword")} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
        <button className="cc-btn" type="submit">{t("updatePassword")}</button>
      </form>

      <div className="cc-form">
        <h3>{t("session")}</h3>
        <button className="cc-btn-ghost" onClick={signOut}>{t("signOut")}</button>
      </div>
    </section>
  );
}
