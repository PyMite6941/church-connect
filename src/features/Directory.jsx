import { useState } from "react";
import { useCollection } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { useFeatureOption } from "../context/SettingsContext";
import SectionWatchers from "../components/SectionWatchers";
import { fileToResizedDataUrl } from "../utils/image";

const EMPTY = {
  name: "", role: "", email: "", phone: "", photo: "",
  birthday: "", anniversary: "", address: "", household: "",
  joined: "", baptized: "", notes: "",
};

// Format an ISO date (yyyy-mm-dd) for display; blank if empty.
const fmt = (d) => (d ? new Date(d + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "");
// Birthday/anniversary usually shown without the year (recurring dates).
const fmtDay = (d) => (d ? new Date(d + "T00:00:00").toLocaleDateString(undefined, { month: "long", day: "numeric" }) : "");

function Detail({ label, value }) {
  if (!value) return null;
  return (
    <div className="cc-dir-detail">
      <span className="cc-dir-label">{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default function Directory() {
  const { items, loading, add, remove } = useCollection("directory");
  const { isAdmin } = useAuth();
  const access = useFeatureOption("directory", "access", "members");
  const [form, setForm] = useState(EMPTY);
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

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const pickPhoto = async (file) => {
    setErr("");
    if (!file) return;
    try {
      set("photo", await fileToResizedDataUrl(file));
    } catch (e) {
      setErr(e.message);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    add(form);
    setForm(EMPTY);
    setErr("");
  };

  return (
    <section>
      <h2>Directory</h2>
      <SectionWatchers featureKey="directory" />
      <ul className="cc-list">
        {items.map((m) => (
          <li key={m.id} className="cc-card cc-dir-card">
            <div className="cc-dir-person">
              {m.photo ? (
                <img className="cc-dir-photo" src={m.photo} alt={m.name} />
              ) : (
                <div className="cc-avatar" aria-hidden>{m.name?.[0] || "?"}</div>
              )}
              <div className="cc-grow">
                <strong>{m.name}</strong>
                <div className="cc-muted">{m.role}{m.role && m.email ? " · " : ""}{m.email}</div>
                <div className="cc-dir-details">
                  <Detail label="Phone" value={m.phone} />
                  <Detail label="Birthday" value={fmtDay(m.birthday)} />
                  <Detail label="Anniversary" value={fmtDay(m.anniversary)} />
                  <Detail label="Household" value={m.household} />
                  <Detail label="Address" value={m.address} />
                  <Detail label="Member since" value={fmt(m.joined)} />
                  <Detail label="Baptized" value={fmt(m.baptized)} />
                  {/* Pastoral notes are sensitive — admins only. */}
                  {isAdmin && <Detail label="Notes" value={m.notes} />}
                </div>
              </div>
              {isAdmin && <button className="cc-btn-ghost" onClick={() => remove(m.id)}>Remove</button>}
            </div>
          </li>
        ))}
        {items.length === 0 && <li className="cc-muted">Directory is empty.</li>}
      </ul>

      {isAdmin && (
        <form className="cc-form" onSubmit={submit}>
          <h3>Add member</h3>
          <input placeholder="Name" value={form.name} onChange={(e) => set("name", e.target.value)} />
          <input placeholder="Role / ministry" value={form.role} onChange={(e) => set("role", e.target.value)} />
          <input placeholder="Email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          <input placeholder="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          <input placeholder="Household / family (e.g. spouse & kids)" value={form.household} onChange={(e) => set("household", e.target.value)} />
          <input placeholder="Address" value={form.address} onChange={(e) => set("address", e.target.value)} />

          <label className="cc-muted">Birthday</label>
          <input type="date" value={form.birthday} onChange={(e) => set("birthday", e.target.value)} />
          <label className="cc-muted">Wedding anniversary</label>
          <input type="date" value={form.anniversary} onChange={(e) => set("anniversary", e.target.value)} />
          <label className="cc-muted">Member since</label>
          <input type="date" value={form.joined} onChange={(e) => set("joined", e.target.value)} />
          <label className="cc-muted">Baptism date</label>
          <input type="date" value={form.baptized} onChange={(e) => set("baptized", e.target.value)} />

          <label className="cc-muted">Pastoral notes (visible to admins only)</label>
          <textarea placeholder="Care notes, prayer needs, etc." value={form.notes} onChange={(e) => set("notes", e.target.value)} />

          <label className="cc-muted">Photo (optional)</label>
          <div className="cc-photo-row">
            {form.photo && <img className="cc-dir-photo" src={form.photo} alt="" />}
            <input type="file" accept="image/*" onChange={(e) => pickPhoto(e.target.files?.[0])} />
            {form.photo && (
              <button type="button" className="cc-btn-ghost" onClick={() => set("photo", "")}>Clear</button>
            )}
          </div>
          {err && <p className="cc-error">{err}</p>}
          <button className="cc-btn" type="submit">Add</button>
        </form>
      )}
    </section>
  );
}
