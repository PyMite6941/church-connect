import { createContext, useContext, useEffect, useState } from "react";
import { useTenant } from "./TenantContext";
import { useSettings } from "./SettingsContext";
import { createAdapter, STORAGE_VERSION } from "../data/adapters";

const AuthContext = createContext(null);
const adapter = createAdapter();

// Accounts live in the data layer under the "accounts" collection so admins can
// edit them at runtime. Seeded from the tenant config on first run.
// NOTE: PIN auth here is a stand-in for the demo. Swap for real auth (OAuth /
// magic link / your API) by replacing signIn + the accounts source.
export function AuthProvider({ tenantId, children }) {
  const tenant = useTenant();
  const { requirePassword } = useSettings();
  const [accounts, setAccounts] = useState([]);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      let accts = await adapter.getCollection(tenantId, "accounts");
      if (accts == null) {
        accts = tenant.accounts;
        await adapter.saveCollection(tenantId, "accounts", accts);
      }
      if (!active) return;
      setAccounts(accts);
      const saved = localStorage.getItem(`church-connect:${STORAGE_VERSION}:${tenantId}:session`);
      if (saved) setUser(accts.find((a) => a.id === saved) || null);
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, [tenantId, tenant]);

  const saveAccounts = async (next) => {
    setAccounts(next);
    await adapter.saveCollection(tenantId, "accounts", next);
  };

  const signIn = (identifier, pin) => {
    const id = (identifier || "").trim();
    const account = accounts.find((a) => a.username === id || a.email === id);
    if (!account) return { ok: false, error: "We couldn't find that account." };

    // Admins ALWAYS authenticate with a password, even if the church turned off
    // password sign-in for everyone else — admin actions are too sensitive.
    const needsPassword = requirePassword || account.role === "admin";
    if (needsPassword) {
      if (!account.pin) return { ok: false, error: "This admin account has no password set. Ask another admin to set one." };
      if (account.pin !== pin) return { ok: false, error: "Incorrect password." };
    }

    setUser(account);
    localStorage.setItem(`church-connect:${STORAGE_VERSION}:${tenantId}:session`, account.id);
    return { ok: true };
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(`church-connect:${STORAGE_VERSION}:${tenantId}:session`);
  };

  // Let the signed-in user edit their own profile (name / PIN). Updates both the
  // accounts collection and the live session user.
  const updateProfile = async (patch) => {
    if (!user) return { ok: false, error: "Not signed in." };
    const next = accounts.map((a) => (a.id === user.id ? { ...a, ...patch } : a));
    await saveAccounts(next);
    setUser((u) => ({ ...u, ...patch }));
    return { ok: true };
  };

  const role = user?.role || "viewer";
  const isAdmin = role === "admin";
  // Viewers are always read-only. Members can contribute where a feature's policy
  // allows it; admins always can.
  const canContribute = (policy = "members") =>
    isAdmin || (role === "member" && policy === "members");

  // Rich permission check: a role category, or a specific list of people.
  // Admins can always do it. Shape: { mode: 'role'|'users', role, users:[ids] }.
  const canByPermission = (perm) => {
    if (!user) return false;
    if (isAdmin) return true;
    if (!perm) return false;
    if (perm.mode === "users") return (perm.users || []).includes(user.id);
    if (perm.role === "everyone") return true;
    if (perm.role === "members") return role === "member";
    return false; // admins only
  };

  return (
    <AuthContext.Provider
      value={{ user, role, isAdmin, canContribute, canByPermission, ready, accounts, saveAccounts, signIn, signOut, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
