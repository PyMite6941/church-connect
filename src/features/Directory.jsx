import { useState } from "react";
import { useCollection } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { useFeatureOption } from "../context/SettingsContext";
import SectionWatchers from "../components/SectionWatchers";
import { fileToResizedDataUrl } from "../utils/image";

export default function Directory() {
  const { items, loading, add, remove } = useCollection("directory");
  const { isAdmin } = useAuth();
  const access = useFeatureOption("directory", "access", "members");
  const [form, setForm] = useState({ name: "", role: "", email: "", photo: "" });
  const [err, setErr] = useState("");

  if (loading) return <p className="cc-muted">Loading…</p>;

  if (access === "admins" && !isAdmin) {
    return (
      <section>
        <h2>Directory</h2>
        <p className="cc-muted">The directory is restricted to administrators.</p>
      </section>
    );
  }

  const pickPhoto = async (file) => {
    setErr("");
    if (!file) return;
    try {
      const photo = await fileToResizedDataUrl(file);
      setForm((f) => ({ ...f, photo }));
    } catch (e) {
      setErr(e.message);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    add(form);
    setForm({ name: "", role: "", email: "", photo: "" });
    setErr("");
  };

  return (
    <section>
      <h2>Directory</h2>
      <SectionWatchers featureKey="directory" />
      <ul className="cc-list">
        {items.map((m) => (
          <li key={m.id} className="cc-card">
            <div className="cc-dir-person">
              {m.photo ? (
                <img className="cc-dir-photo" src={m.photo} alt={m.name} />
              ) : (
                <div className="cc-avatar" aria-hidden>{m.name?.[0] || "?"}</div>
              )}
              <div>
                <strong>{m.name}</strong>
                <div className="cc-muted">{m.role}{m.role && m.email ? " · " : ""}{m.email}</div>
              </div>
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
          <label className="cc-muted">Photo (optional)</label>
          <div className="cc-photo-row">
            {form.photo && <img className="cc-dir-photo" src={form.photo} alt="" />}
            <input type="file" accept="image/*" onChange={(e) => pickPhoto(e.target.files?.[0])} />
            {form.photo && (
              <button type="button" className="cc-btn-ghost" onClick={() => setForm({ ...form, photo: "" })}>Clear</button>
            )}
          </div>
          {err && <p className="cc-error">{err}</p>}
          <button className="cc-btn" type="submit">Add</button>
        </form>
      )}
    </section>
  );
}
