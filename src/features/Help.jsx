import { useTenant } from "../context/TenantContext";
import { FEATURES, ALL_FEATURE_KEYS, featureLabel } from "./registry";

// Plain-language guide for non-technical leaders (pastors, deacons, volunteers).
// Explains what every feature and role is for — and when it might NOT help — so a
// church can decide what to turn on. Feature list is driven by the registry so it
// never drifts from what's actually in the app.
const HELP = {
  events:
    "A simple calendar of what's happening — services, meetings, youth nights. Helps newcomers and busy families see what's coming up. Skip it if you already keep everything on another calendar.",
  announcements:
    "Short notices for the whole church, with the ability to 'pin' the most important one to the top. Good for weekly bulletins or urgent news. Less useful if your congregation rarely opens the app.",
  sermons:
    "A library of past sermons with links to watch or listen. Helps people catch up on a message they missed and share it with friends. Only worth turning on if you record your sermons.",
  prayer:
    "A place for people to share prayer requests and mark them answered. Encourages the congregation to pray for one another. You can let everyone submit or limit it to staff, and keep names anonymous if your people prefer privacy.",
  leadership:
    "Introduces your pastors, elders, and ministry leaders with a short bio. Helps visitors know who's who and how to reach them. You can hide email addresses if you'd rather not list them.",
  groups:
    "A directory of small groups and ministries people can join, with meeting times and a contact. Helps people get connected beyond Sunday. Skip it if you don't run small groups.",
  meals:
    "Coordinates potlucks and fellowship lunches — an admin schedules a meal and people sign up to bring a dish, so you don't end up with twelve desserts and no main course. Great for community meals; unnecessary if everything is catered.",
  directory:
    "A member directory with names, ministries, and contact info. Helps the congregation stay connected. Because it lists personal details, you can restrict it to admins only.",
  giving:
    "A button that links to your existing online giving page (Tithe.ly, Stripe, PayPal, and the like). Church Connect never handles money itself — it simply points people to where they already give.",
};

const ROLES = [
  ["Admin", "Full control — can edit every page, manage accounts, and change settings. Give this to pastors or staff who run the app."],
  ["Member", "Can take part — submit prayer requests, sign up for meals, and view everything. Most of your congregation will be members."],
  ["Viewer", "Read-only — can see the pages but not post or sign up. Good for the wider public, or people you want to keep informed without letting them contribute."],
];

export default function Help() {
  const tenant = useTenant();

  return (
    <section className="cc-help">
      <h2>Help & Guide</h2>
      <p className="cc-muted">
        A quick, jargon-free tour of {tenant.name}'s tools — what each one is for,
        and when it may not be needed. Admins choose which to turn on under
        <strong> Settings</strong>.
      </p>

      <h3>The features</h3>
      <ul className="cc-list">
        {ALL_FEATURE_KEYS.map((key) => (
          <li key={key} className="cc-card cc-help-item">
            <div className="cc-help-ico" aria-hidden>{FEATURES[key].icon}</div>
            <div className="cc-grow">
              <strong>{featureLabel(key, tenant)}</strong>
              <p className="cc-bio">{HELP[key]}</p>
            </div>
          </li>
        ))}
      </ul>

      <h3>Who can do what — roles</h3>
      <p className="cc-muted">
        Every account is <strong>invite-only</strong>: there is no public sign-up.
        An admin adds each person on the <strong>Accounts</strong> page and shares
        their sign-in details. There are three roles:
      </p>
      <ul className="cc-list">
        {ROLES.map(([name, desc]) => (
          <li key={name} className="cc-card cc-help-item">
            <div className="cc-grow">
              <strong>{name}</strong>
              <p className="cc-bio">{desc}</p>
            </div>
          </li>
        ))}
      </ul>

      <h3>Customizing your app</h3>
      <p className="cc-muted">
        On the <strong>Settings</strong> page, admins switch each feature on or off,
        and each feature has a few simple choices (a dropdown) — for example,
        whether members or only admins can submit prayer requests, or how events are
        ordered. Turn on only what serves your church.
      </p>

      <h3>Language</h3>
      <p className="cc-muted">
        Each person can choose their own language from <strong>My Account</strong>
        (click your name in the top-right corner). The app translates its menus and
        buttons; the words your church writes stay exactly as you type them.
      </p>
    </section>
  );
}
