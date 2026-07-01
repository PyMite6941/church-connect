import { useState } from "react";
import { useCollection } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { useFeatureOption } from "../context/SettingsContext";
import SectionWatchers from "../components/SectionWatchers";

export default function Announcements() {
  const { items, loading, add, update, remove } = useCollection("announcements");
  const { isAdmin } = useAuth();
  const order = useFeatureOption("announcements", "order", "pinned");
  const [form, setForm] = useState({ title: "", body: "" });

  if (loading) return <p className="cc-muted">Loading…</p>;

  const submit = (e) => {
    e.preventDefault();
    if (!form.title) return;
    add({ ...form, pinned: false });
    setForm({ title: "", body: "" });
  };

  return (
    <section>
      <h2>Announcements</h2>
      <SectionWatchers featureKey="announcements" />
      <ul className="cc-list">
        {items
          .slice()
          .reverse() // newest (last added) first
          .sort((a, b) => (order === "pinned" ? Number(b.pinned) - Number(a.pinned) : 0))
          .map((a) => (
            <li key={a.id} className="cc-card">
              <div>
                <strong>{a.pinned ? "📌 " : ""}{a.title}</strong>
                <div className="cc-muted">{a.body}</div>
              </div>
              {isAdmin && (
                <div className="cc-row">
                  <button className="cc-btn-ghost" onClick={() => update(a.id, { pinned: !a.pinned })}>
                    {a.pinned ? "Unpin" : "Pin"}
                  </button>
                  <button className="cc-btn-ghost" onClick={() => remove(a.id)}>Delete</button>
                </div>
              )}
            </li>
          ))}
        {items.length === 0 && <li className="cc-muted">No announcements.</li>}
      </ul>

      {isAdmin && (
        <form className="cc-form" onSubmit={submit}>
          <h3>Post announcement</h3>
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea placeholder="Message" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <button className="cc-btn" type="submit">Post</button>
        </form>
      )}
    </section>
  );
}
