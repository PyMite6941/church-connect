import { useState } from "react";
import { useCollection } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import SectionWatchers from "../components/SectionWatchers";

// Generic admin-created channel: a simple titled-post board. Admins post; the
// data lives under the channel's own collection so each channel is independent.
export default function CustomChannel({ channelKey }) {
  const { items, loading, add, remove } = useCollection(channelKey);
  const { isAdmin } = useAuth();
  const { channelLabel } = useSettings();
  const [form, setForm] = useState({ title: "", body: "" });

  const title = channelLabel(channelKey, "Channel");

  if (loading) return <p className="cc-muted">Loading…</p>;

  const submit = (e) => {
    e.preventDefault();
    if (!form.title) return;
    add(form);
    setForm({ title: "", body: "" });
  };

  return (
    <section>
      <h2>{title}</h2>
      <SectionWatchers featureKey={channelKey} />
      <ul className="cc-list">
        {items
          .slice()
          .reverse()
          .map((p) => (
            <li key={p.id} className="cc-card">
              <div className="cc-grow">
                <strong>{p.title}</strong>
                {p.body && <p className="cc-bio">{p.body}</p>}
              </div>
              {isAdmin && <button className="cc-btn-ghost" onClick={() => remove(p.id)}>Delete</button>}
            </li>
          ))}
        {items.length === 0 && <li className="cc-muted">Nothing posted yet.</li>}
      </ul>

      {isAdmin && (
        <form className="cc-form" onSubmit={submit}>
          <h3>Add post</h3>
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea placeholder="Details (optional)" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <button className="cc-btn" type="submit">Post</button>
        </form>
      )}
    </section>
  );
}
