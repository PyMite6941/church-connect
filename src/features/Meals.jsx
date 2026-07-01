import { useState } from "react";
import { useCollection } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { useFeatureOption, useSettings } from "../context/SettingsContext";
import SectionWatchers from "../components/SectionWatchers";

// Fellowship meals / potluck / lunch coordination. Admins create a meal; whoever
// the signup policy allows brings a dish. Each meal record carries its signups[].
export default function Meals() {
  const { items, loading, add, update, remove } = useCollection("meals");
  const { user, isAdmin, canContribute } = useAuth();
  const { allowAnonymous } = useSettings();
  const policy = useFeatureOption("meals", "signups", "members");
  const canSignup = canContribute(policy);
  const [form, setForm] = useState({ title: "", date: "", location: "" });

  if (loading) return <p className="cc-muted">Loading…</p>;

  const addMeal = (e) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    add({ ...form, signups: [] });
    setForm({ title: "", date: "", location: "" });
  };

  return (
    <section>
      <h2>Meals & Potlucks</h2>
      <SectionWatchers featureKey="meals" />
      <ul className="cc-list">
        {items
          .slice()
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((meal) => (
            <MealCard key={meal.id} meal={meal} user={user} isAdmin={isAdmin} canSignup={canSignup} canAnon={allowAnonymous} update={update} remove={remove} />
          ))}
        {items.length === 0 && <li className="cc-muted">No meals scheduled.</li>}
      </ul>

      {isAdmin && (
        <form className="cc-form" onSubmit={addMeal}>
          <h3>Schedule a meal</h3>
          <input placeholder="Title (e.g. Sunday Potluck)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <button className="cc-btn" type="submit">Add</button>
        </form>
      )}
    </section>
  );
}

function MealCard({ meal, user, isAdmin, canSignup, canAnon, update, remove }) {
  const [dish, setDish] = useState("");
  const [anon, setAnon] = useState(false);
  const signups = meal.signups || [];

  const signUp = (e) => {
    e.preventDefault();
    if (!dish.trim()) return;
    const name = canAnon && anon ? "Anonymous" : user?.name || "Someone";
    update(meal.id, { signups: [...signups, { name, dish: dish.trim() }] });
    setDish("");
    setAnon(false);
  };

  const removeSignup = (idx) =>
    update(meal.id, { signups: signups.filter((_, i) => i !== idx) });

  return (
    <li className="cc-card cc-meal">
      <div className="cc-meal-head">
        <div>
          <strong>{meal.title}</strong>
          <div className="cc-muted">{meal.date}{meal.location ? ` · ${meal.location}` : ""}</div>
        </div>
        {isAdmin && <button className="cc-btn-ghost" onClick={() => remove(meal.id)}>Delete</button>}
      </div>

      <ul className="cc-signups">
        {signups.map((s, i) => (
          <li key={i}>
            <span><strong>{s.name}</strong> — {s.dish}</span>
            {(isAdmin || s.name === user?.name) && (
              <button className="cc-btn-ghost" onClick={() => removeSignup(i)} aria-label="Remove">✕</button>
            )}
          </li>
        ))}
        {signups.length === 0 && <li className="cc-muted">No one signed up yet.</li>}
      </ul>

      {canSignup && (
        <form className="cc-signup-form" onSubmit={signUp}>
          <div className="cc-row">
            <input placeholder="What are you bringing?" value={dish} onChange={(e) => setDish(e.target.value)} />
            <button className="cc-btn" type="submit">Bring this</button>
          </div>
          {canAnon && (
            <label className="cc-check">
              <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} />
              Sign up without my name
            </label>
          )}
        </form>
      )}
    </li>
  );
}
