import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTenant } from "../context/TenantContext";
import { useSettings } from "../context/SettingsContext";
import { useI18n } from "../context/LanguageContext";

export default function SignIn() {
  const { signIn } = useAuth();
  const tenant = useTenant();
  const { requirePassword } = useSettings();
  const { t } = useI18n();
  const [identifier, setIdentifier] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const res = signIn(identifier.trim(), pin);
    if (!res.ok) setError(res.error);
  };

  // One-click demo sign-in for the sample church.
  const quick = (idv, pw) => {
    const res = signIn(idv, pw);
    if (!res.ok) setError(res.error);
  };

  return (
    <div className="cc-signin">
      <form className="cc-form cc-card" onSubmit={submit}>
        <h2>{tenant.name}</h2>
        <p className="cc-muted">{t("signInToContinue")}</p>
        <input placeholder={t("usernameOrEmail")} value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" />
        {/* Always available: even when the church turns off passwords for members,
            admins must sign in with theirs. */}
        <input placeholder={t("password")} type="password" value={pin} onChange={(e) => setPin(e.target.value)} autoComplete="current-password" />
        {!requirePassword && (
          <p className="cc-muted cc-hint">Members can leave the password blank. Admins must enter theirs.</p>
        )}
        {error && <p className="cc-error">{error}</p>}
        <button className="cc-btn" type="submit">{t("signIn")}</button>
        {tenant.id === "grace-community" && (
          <div className="cc-demo-logins cc-hint">
            <div className="cc-muted">Try a demo view:</div>
            <button type="button" className="cc-btn-ghost" onClick={() => quick("GraceChurch", "John3:16!!")}>Admin</button>
            <button type="button" className="cc-btn-ghost" onClick={() => quick("Member", "0000")}>Member</button>
            <button type="button" className="cc-btn-ghost" onClick={() => quick("Visitor", "0000")}>Visitor</button>
          </div>
        )}
        <p className="cc-muted cc-hint">Starting a new church? <a href={`${import.meta.env.BASE_URL}create`}>Create one →</a></p>
      </form>
    </div>
  );
}
