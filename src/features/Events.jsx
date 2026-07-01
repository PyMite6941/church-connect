import { useState } from "react";
import { useCollection } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { useFeatureOption, useFeaturePermission } from "../context/SettingsContext";
import SectionWatchers from "../components/SectionWatchers";

export default function Events() {
  const { items, loading, add, remove } = useCollection("events");
  const { isAdmin, canByPermission } = useAuth();
  const sort = useFeatureOption("events", "sort", "soonest");
  const addPerm = useFeaturePermission("events", { mode: "role", role: "admins" });
  const canAdd = canByPermission(addPerm);
  const [form, setForm] = useState({ title: "", date: "", time: "", location: "" });

  if (loading) return <p className="cc-muted">Loading events…</p>;

  const submit = (e) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    add(form);
    setForm({ title: "", date: "", time: "", location: "" });
  };

  return (
    <section>
      <h2>Events</h2>
      <SectionWatchers featureKey="events" />
      <ul className="cc-list">
        {items
          .slice()
          .sort((a, b) => (sort === "latest" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)))
          .map((ev) => (
            <li key={ev.id} className="cc-card">
              <div>
                <strong>{ev.title}</strong>
                <div className="cc-muted">
                  {ev.date} {ev.time} · {ev.location || "TBD"}
                </div>
              </div>
              {isAdmin && (
                <button className="cc-btn-ghost" onClick={() => remove(ev.id)}>
                  Delete
                </button>
              )}
            </li>
          ))}
        {items.length === 0 && <li className="cc-muted">No events yet.</li>}
      </ul>

      {canAdd && (
        <form className="cc-form" onSubmit={submit}>
          <h3>Add event</h3>
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <button className="cc-btn" type="submit">Add</button>
        </form>
      )}
    </section>
  );
}
