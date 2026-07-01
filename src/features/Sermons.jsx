import { useState } from "react";
import { useCollection } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { useFeatureOption } from "../context/SettingsContext";
import SectionWatchers from "../components/SectionWatchers";

// Sermon / media library — recordings with a speaker and a link to watch/listen.
export default function Sermons() {
  const { items, loading, add, remove } = useCollection("sermons");
  const { isAdmin } = useAuth();
  const sort = useFeatureOption("sermons", "sort", "newest");
  const [form, setForm] = useState({ title: "", speaker: "", date: "", link: "" });

  if (loading) return <p className="cc-muted">Loading…</p>;

  const submit = (e) => {
    e.preventDefault();
    if (!form.title) return;
    add(form);
    setForm({ title: "", speaker: "", date: "", link: "" });
  };

  return (
    <section>
      <h2>Sermons</h2>
      <SectionWatchers featureKey="sermons" />
      <ul className="cc-list">
        {items
          .slice()
          .sort((a, b) =>
            sort === "oldest"
              ? (a.date || "").localeCompare(b.date || "")
              : (b.date || "").localeCompare(a.date || "")
          )
          .map((s) => (
            <li key={s.id} className="cc-card">
              <div className="cc-grow">
                <strong>{s.title}</strong>
                <div className="cc-muted">
                  {s.speaker}{s.speaker && s.date ? " · " : ""}{s.date}
                </div>
                {s.link && (
                  <a className="cc-link" href={s.link} target="_blank" rel="noreferrer">
                    Watch / listen →
                  </a>
                )}
              </div>
              {isAdmin && <button className="cc-btn-ghost" onClick={() => remove(s.id)}>Delete</button>}
            </li>
          ))}
        {items.length === 0 && <li className="cc-muted">No sermons posted yet.</li>}
      </ul>

      {isAdmin && (
        <form className="cc-form" onSubmit={submit}>
          <h3>Add sermon</h3>
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input placeholder="Speaker" value={form.speaker} onChange={(e) => setForm({ ...form, speaker: e.target.value })} />
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <input placeholder="Video / audio link" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          <button className="cc-btn" type="submit">Add</button>
        </form>
      )}
    </section>
  );
}
