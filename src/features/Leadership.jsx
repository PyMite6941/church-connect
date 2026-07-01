import { useState } from "react";
import { useCollection } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { useFeatureOption } from "../context/SettingsContext";
import SectionWatchers from "../components/SectionWatchers";

// Church leadership / staff — pastors, elders, ministry leaders. Admin-editable.
export default function Leadership() {
  const { items, loading, add, update, remove } = useCollection("leadership");
  const { isAdmin } = useAuth();
  const showEmails = useFeatureOption("leadership", "emails", "show") === "show";
  const [form, setForm] = useState({ name: "", title: "", email: "", bio: "" });

  if (loading) return <p className="cc-muted">Loading…</p>;

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.title) return;
    add(form);
    setForm({ name: "", title: "", email: "", bio: "" });
  };

  return (
    <section>
      <h2>Leadership</h2>
      <SectionWatchers featureKey="leadership" />
      <ul className="cc-list">
        {items.map((l) => (
          <li key={l.id} className="cc-card cc-leader">
            <div className="cc-avatar" aria-hidden>{l.name?.[0] || "?"}</div>
            <div className="cc-grow">
              <strong>{l.name}</strong>
              <div className="cc-muted">{l.title}{showEmails && l.email ? ` · ${l.email}` : ""}</div>
              {l.bio && <p className="cc-bio">{l.bio}</p>}
            </div>
            {isAdmin && <button className="cc-btn-ghost" onClick={() => remove(l.id)}>Remove</button>}
          </li>
        ))}
        {items.length === 0 && <li className="cc-muted">No leaders listed yet.</li>}
      </ul>

      {isAdmin && (
        <form className="cc-form" onSubmit={submit}>
          <h3>Add leader</h3>
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Title / role (e.g. Lead Pastor)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <textarea placeholder="Short bio (optional)" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <button className="cc-btn" type="submit">Add</button>
        </form>
      )}
    </section>
  );
}
