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

// Age from a birthday, or null if unknown/invalid.
function ageFrom(birthday) {
  if (!birthday) return null;
  const b = new Date(birthday + "T00:00:00");
  if (isNaN(b)) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age >= 0 && age < 130 ? age : null;
}
// Birthday display with age when known, e.g. "April 12 · age 35".
function birthdayText(birthday) {
  if (!birthday) return "";
  const age = ageFrom(birthday);
  return age == null ? fmtDay(birthday) : `${fmtDay(birthday)} · age ${age}`;
}

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

  const age = ageFrom(form.birthday);
  const isMinor = age != null && age < 18;

  const submit = (e) => {
    e.preventDefault();
    setErr("");
    if (!form.name) return;
    // Membership presupposes baptism: a member must have a baptism date, on or
    // before the date they became a member.
    if (form.joined) {
      if (!form.baptized) return setErr("Membership requires a baptism date — members are baptized first.");
      if (form.baptized > form.joined) return setErr("Baptism date must be on or before the membership date.");
    }
    // Don't save adult-only fields for a minor.
    const record = isMinor ? { ...form, anniversary: "" } : form;
    add(record);
    setForm(EMPTY);
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
                  <Detail label="Birthday" value={birthdayText(m.birthday)} />
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
          <input placeholder="Name (required)" value={form.name} onChange={(e) => set("name", e.target.value)} />

          <p className="cc-muted cc-hint">Everything below is optional — fill in only what applies.</p>

          <input placeholder="Role / ministry" value={form.role} onChange={(e) => set("role", e.target.value)} />
          <input placeholder="Email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          <input placeholder="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          <input placeholder="Household / family (e.g. spouse & kids)" value={form.household} onChange={(e) => set("household", e.target.value)} />
          <input placeholder="Address" value={form.address} onChange={(e) => set("address", e.target.value)} />

          <label className="cc-muted">Birthday{age != null ? ` · age ${age}` : ""}</label>
          <input type="date" value={form.birthday} onChange={(e) => set("birthday", e.target.value)} />

          {/* Wedding anniversary only makes sense for adults. */}
          {!isMinor && (
            <>
              <label className="cc-muted">Wedding anniversary</label>
              <input type="date" value={form.anniversary} onChange={(e) => set("anniversary", e.target.value)} />
            </>
          )}

          {/* Baptism precedes membership. */}
          <label className="cc-muted">Baptism date{form.joined ? " (required for members)" : ""}</label>
          <input type="date" value={form.baptized} onChange={(e) => set("baptized", e.target.value)} />
          <label className="cc-muted">Member since <span className="cc-hint">(requires a baptism date)</span></label>
          <input type="date" value={form.joined} onChange={(e) => set("joined", e.target.value)} />

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
