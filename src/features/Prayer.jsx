import { useState } from "react";
import { useCollection } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { useFeatureOption, useSettings } from "../context/SettingsContext";
import SectionWatchers from "../components/SectionWatchers";

// Submit policy is configurable; admins can mark answered. Viewers are read-only.
export default function Prayer() {
  const { items, loading, add, update, remove } = useCollection("prayer");
  const { user, isAdmin, canContribute } = useAuth();
  const { allowAnonymous } = useSettings();
  const submitters = useFeatureOption("prayer", "submitters", "members");
  const namePolicy = useFeatureOption("prayer", "names", "shown");
  const canSubmit = canContribute(submitters);
  const forcedAnon = namePolicy === "anonymous";
  const canChooseAnon = allowAnonymous && !forcedAnon; // church allows hiding your name
  const [form, setForm] = useState({ name: "", request: "" });
  const [anon, setAnon] = useState(false);

  if (loading) return <p className="cc-muted">Loading…</p>;

  const submit = (e) => {
    e.preventDefault();
    if (!form.request) return;
    let name;
    if (forcedAnon || (canChooseAnon && anon)) name = "Anonymous";
    else name = form.name || user?.name || "Someone"; // name always attached
    add({ name, request: form.request, answered: false });
    setForm({ name: "", request: "" });
    setAnon(false);
  };

  return (
    <section>
      <h2>Prayer Requests</h2>
      <SectionWatchers featureKey="prayer" />
      <ul className="cc-list">
        {items.map((p) => (
          <li key={p.id} className={`cc-card ${p.answered ? "cc-done" : ""}`}>
            <div>
              <strong>{p.name}</strong>
              <div className="cc-muted">{p.request}</div>
            </div>
            <div className="cc-row">
              {canSubmit && (
                <button className="cc-btn-ghost" onClick={() => update(p.id, { answered: !p.answered })}>
                  {p.answered ? "Answered ✓" : "Mark answered"}
                </button>
              )}
              {isAdmin && <button className="cc-btn-ghost" onClick={() => remove(p.id)}>Delete</button>}
            </div>
          </li>
        ))}
        {items.length === 0 && <li className="cc-muted">No requests yet.</li>}
      </ul>

      {canSubmit ? (
        <form className="cc-form" onSubmit={submit}>
          <h3>Submit a request</h3>
          {!forcedAnon && !anon && (
            <input placeholder="Your name (optional)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          )}
          <textarea placeholder="How can we pray for you?" value={form.request} onChange={(e) => setForm({ ...form, request: e.target.value })} />
          {forcedAnon && <p className="cc-muted">This church posts prayer requests anonymously.</p>}
          {canChooseAnon && (
            <label className="cc-check">
              <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} />
              Submit without my name
            </label>
          )}
          <button className="cc-btn" type="submit">Submit</button>
        </form>
      ) : (
        <p className="cc-muted">You have read-only access to prayer requests.</p>
      )}
    </section>
  );
}
