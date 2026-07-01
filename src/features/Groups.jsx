import { useState } from "react";
import { useCollection } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { useFeatureOption } from "../context/SettingsContext";
import SectionWatchers from "../components/SectionWatchers";

// Small groups / ministries directory people can browse and reach out to.
export default function Groups() {
  const { items, loading, add, remove } = useCollection("groups");
  const { isAdmin } = useAuth();
  const sort = useFeatureOption("groups", "sort", "name");
  const ordered =
    sort === "name"
      ? items.slice().sort((a, b) => (a.name || "").localeCompare(b.name || ""))
      : items.slice().reverse();
  const [form, setForm] = useState({ name: "", schedule: "", leader: "", contact: "", description: "" });

  if (loading) return <p className="cc-muted">Loading…</p>;

  const submit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    add(form);
    setForm({ name: "", schedule: "", leader: "", contact: "", description: "" });
  };

  return (
    <section>
      <h2>Small Groups</h2>
      <SectionWatchers featureKey="groups" />
      <ul className="cc-list">
        {ordered.map((g) => (
          <li key={g.id} className="cc-card">
            <div className="cc-grow">
              <strong>{g.name}</strong>
              <div className="cc-muted">
                {g.schedule}{g.schedule && g.leader ? " · " : ""}{g.leader ? `Led by ${g.leader}` : ""}
              </div>
              {g.description && <p className="cc-bio">{g.description}</p>}
              {g.contact && <div className="cc-muted">Contact: {g.contact}</div>}
            </div>
            {isAdmin && <button className="cc-btn-ghost" onClick={() => remove(g.id)}>Delete</button>}
          </li>
        ))}
        {items.length === 0 && <li className="cc-muted">No groups listed yet.</li>}
      </ul>

      {isAdmin && (
        <form className="cc-form" onSubmit={submit}>
          <h3>Add group</h3>
          <input placeholder="Group name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Schedule (e.g. Wed 7pm)" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} />
          <input placeholder="Leader" value={form.leader} onChange={(e) => setForm({ ...form, leader: e.target.value })} />
          <input placeholder="Contact (email / phone)" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button className="cc-btn" type="submit">Add</button>
        </form>
      )}
    </section>
  );
}
