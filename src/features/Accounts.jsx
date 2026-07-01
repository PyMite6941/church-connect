import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import PasswordStrength, { scorePassword } from "../components/PasswordStrength";

// Admin-only: add / edit / remove accounts at runtime. This satisfies the
// "accounts can be changed as necessary" requirement — changes persist through
// the active data adapter.
export default function Accounts() {
  const { isAdmin, accounts, saveAccounts } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", role: "member", pin: "" });

  if (!isAdmin) return <p className="cc-muted">Admins only.</p>;

  const uid = () => "u-" + Math.random().toString(36).slice(2, 8);

  const [err, setErr] = useState("");
  const addAccount = (e) => {
    e.preventDefault();
    setErr("");
    if (!form.name || !form.email) return;
    // Admins must have a strong password; members/viewers may use any (or none).
    if (form.role === "admin" && scorePassword(form.pin) < 2)
      return setErr("Admin accounts need a stronger password (8+ chars, mixed types).");
    saveAccounts([...accounts, { id: uid(), ...form }]);
    setForm({ name: "", email: "", role: "member", pin: "" });
  };

  const setRole = (id, role) =>
    saveAccounts(accounts.map((a) => (a.id === id ? { ...a, role } : a)));

  const removeAccount = (id) => saveAccounts(accounts.filter((a) => a.id !== id));

  return (
    <section>
      <h2>Accounts</h2>
      <p className="cc-muted">
        Accounts are invite-only — there is no public sign-up. Add people here and
        share their sign-in details. Roles: <strong>viewer</strong> (read-only),
        <strong> member</strong> (can participate), <strong>admin</strong> (full control).
      </p>
      <ul className="cc-list">
        {accounts.map((a) => (
          <li key={a.id} className="cc-card">
            <div>
              <strong>{a.name}</strong>
              <div className="cc-muted">{a.email}</div>
            </div>
            <div className="cc-row">
              <select value={a.role} onChange={(e) => setRole(a.id, e.target.value)}>
                <option value="viewer">viewer</option>
                <option value="member">member</option>
                <option value="admin">admin</option>
              </select>
              <button className="cc-btn-ghost" onClick={() => removeAccount(a.id)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>

      <form className="cc-form" onSubmit={addAccount}>
        <h3>Add account</h3>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Password" value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value })} autoComplete="new-password" />
        <PasswordStrength value={form.pin} />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="viewer">viewer</option>
          <option value="member">member</option>
          <option value="admin">admin</option>
        </select>
        {err && <p className="cc-error">{err}</p>}
        <button className="cc-btn" type="submit">Add</button>
      </form>
    </section>
  );
}
