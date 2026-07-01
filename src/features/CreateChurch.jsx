import { useState } from "react";
import { FEATURES, ALL_FEATURE_KEYS } from "./registry";
import { saveCustomTenant, slugify, getCustomTenants } from "../config/customTenants";
import PasswordStrength, { scorePassword } from "../components/PasswordStrength";

// Self-serve church creation. Builds a tenant config and saves it (locally by
// default; back it with your API for real hosting — see BACKEND.md), then drops
// you into the new church ready to sign in as its first admin.
const DEFAULT_FEATURES = ["events", "announcements", "sermons", "prayer", "leadership", "groups", "meals", "giving"];

export default function CreateChurch() {
  const [name, setName] = useState("");
  const [admin, setAdmin] = useState({ name: "", username: "", email: "", pin: "" });
  const [primary, setPrimary] = useState("#3b5bdb");
  const [features, setFeatures] = useState(new Set(DEFAULT_FEATURES));
  const [err, setErr] = useState("");

  const id = slugify(name);
  const taken = !!getCustomTenants()[id];

  const toggle = (key) => {
    const next = new Set(features);
    next.has(key) ? next.delete(key) : next.add(key);
    setFeatures(next);
  };

  const submit = (e) => {
    e.preventDefault();
    setErr("");
    if (!name.trim()) return setErr("Give your church a name.");
    if (!id) return setErr("That name can't be turned into a web address. Try adding letters.");
    if (taken) return setErr("A church with that web address already exists on this device.");
    if (!admin.name.trim() || !admin.username.trim()) return setErr("Enter the first admin's name and a username.");
    if (scorePassword(admin.pin) < 2) return setErr("Choose a stronger admin password (8+ chars, mixed types).");

    const config = {
      id,
      name: name.trim(),
      tagline: "Welcome home.",
      theme: { primary },
      features: ALL_FEATURE_KEYS.filter((k) => features.has(k)),
      accounts: [
        {
          id: "u-admin",
          name: admin.name.trim(),
          username: admin.username.trim(),
          email: admin.email.trim(),
          role: "admin",
          pin: admin.pin,
        },
      ],
    };
    saveCustomTenant(config);
    window.location.assign(`${import.meta.env.BASE_URL}?tenant=${id}`);
  };

  return (
    <div className="cc-create">
      <form className="cc-form cc-card cc-create-card" onSubmit={submit}>
        <h2>Create your church</h2>
        <p className="cc-muted">Takes about a minute. You'll be the first admin.</p>

        <label className="cc-muted">Church name</label>
        <input placeholder="e.g. Grace Community Church" value={name} onChange={(e) => setName(e.target.value)} />
        {id && (
          <p className="cc-muted cc-hint">
            Your web address will be <strong>{id}</strong> · you can connect it to{" "}
            <strong>{id}.yourdomain.org</strong> later (see the setup guide).
          </p>
        )}

        <h3>First admin</h3>
        <input placeholder="Admin name" value={admin.name} onChange={(e) => setAdmin({ ...admin, name: e.target.value })} />
        <input placeholder="Username (used to sign in)" value={admin.username} onChange={(e) => setAdmin({ ...admin, username: e.target.value })} autoComplete="username" />
        <input placeholder="Email (optional)" value={admin.email} onChange={(e) => setAdmin({ ...admin, email: e.target.value })} />
        <input type="password" placeholder="Admin password" value={admin.pin} onChange={(e) => setAdmin({ ...admin, pin: e.target.value })} autoComplete="new-password" />
        <PasswordStrength value={admin.pin} />

        <h3>Pick your starting features</h3>
        <p className="cc-muted">You can change these anytime in Settings.</p>
        <div className="cc-owner-chips">
          {ALL_FEATURE_KEYS.map((key) => (
            <label key={key} className={`cc-chip ${features.has(key) ? "cc-chip-on" : ""}`}>
              <input type="checkbox" checked={features.has(key)} onChange={() => toggle(key)} />
              {FEATURES[key].icon} {FEATURES[key].label}
            </label>
          ))}
        </div>

        <h3>Brand color</h3>
        <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} className="cc-color" />

        {err && <p className="cc-error">{err}</p>}
        <button className="cc-btn" type="submit">Create church →</button>
        <p className="cc-muted cc-hint"><a href={import.meta.env.BASE_URL}>← Back</a></p>
      </form>
    </div>
  );
}
