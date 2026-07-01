import { useState } from "react";
import { useCollection } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { useFeatureOption } from "../context/SettingsContext";
import SectionWatchers from "../components/SectionWatchers";

export default function Directory() {
  const { items, loading, add, remove } = useCollection("directory");
  const { isAdmin } = useAuth();
  const access = useFeatureOption("directory", "access", "members");
  const [form, setForm] = useState({ name: "", role: "", email: "" });

  if (loading) return <p className="cc-muted">Loading…</p>;

  if (access === "admins" && !isAdmin) {
    return (
      <section>
        <h2>Directory</h2>
        <p className="cc-muted">The directory is restricted to administrators.</p>
      </section>
    );
  }

  const submit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    add(form);
    setForm({ name: "", role: "", email: "" });
  };

  return (
    <section>
      <h2>Directory</h2>
      <SectionWatchers featureKey="directory" />
      <ul className="cc-list">
        {items.map((m) => (
          <li key={m.id} className="cc-card">
            <div>
              <strong>{m.name}</strong>
              <div className="cc-muted">{m.role} · {m.email}</div>
            </div>
            {isAdmin && <button className="cc-btn-ghost" onClick={() => remove(m.id)}>Remove</button>}
          </li>
        ))}
        {items.length === 0 && <li className="cc-muted">Directory is empty.</li>}
      </ul>

      {isAdmin && (
        <form className="cc-form" onSubmit={submit}>
          <h3>Add member</h3>
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Role / ministry" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <button className="cc-btn" type="submit">Add</button>
        </form>
      )}
    </section>
  );
}
