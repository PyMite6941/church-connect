// Central feature registry — the single place a "function" is defined.
//
// To add a new offered function: build a feature component, then add one entry
// here. Tenants opt in by listing the key in their `features[]`, and admins can
// turn any of them on/off and customize them from the Settings page.
//
// Each feature may declare `options`: dropdowns shown on the Settings page that
// customize how that feature behaves. Features read the chosen value with
// useFeatureOption(featureKey, optionKey, default).
import Events from "./Events";
import Announcements from "./Announcements";
import Prayer from "./Prayer";
import Directory from "./Directory";
import Leadership from "./Leadership";
import Meals from "./Meals";
import Sermons from "./Sermons";
import Groups from "./Groups";
import Giving from "./Giving";

// Reusable choice sets
const SORT_DATE = [
  { value: "soonest", label: "Soonest first" },
  { value: "latest", label: "Latest first" },
];
// Who may contribute to a feature. (Viewers are always read-only.)
const CONTRIBUTORS = [
  { value: "members", label: "Members & admins" },
  { value: "admins", label: "Admins only" },
];

export const FEATURES = {
  events: {
    label: "Events", icon: "📅", component: Events,
    options: [
      { key: "sort", label: "Order events by", choices: SORT_DATE, default: "soonest" },
      {
        key: "pastEvents", label: "Past events", default: "keep",
        choices: [
          { value: "keep", label: "Keep them" },
          { value: "delete", label: "Auto-delete when past" },
        ],
      },
    ],
    // Who may ADD events — a role category, or specific selected people.
    permission: { label: "Who can add events", default: { mode: "role", role: "admins" } },
  },
  announcements: {
    label: "Announcements", icon: "📣", component: Announcements,
    options: [{
      key: "order", label: "Show announcements", default: "pinned",
      choices: [
        { value: "pinned", label: "Pinned first" },
        { value: "newest", label: "Newest first" },
      ],
    }],
  },
  sermons: {
    label: "Sermons", icon: "🎧", component: Sermons,
    options: [{
      key: "sort", label: "Order sermons by", default: "newest",
      choices: [
        { value: "newest", label: "Newest first" },
        { value: "oldest", label: "Oldest first" },
      ],
    }],
  },
  prayer: {
    label: "Prayer", icon: "🙏", component: Prayer,
    options: [
      { key: "submitters", label: "Who can submit requests", choices: CONTRIBUTORS, default: "members" },
      {
        key: "names", label: "Submitter names", default: "shown",
        choices: [
          { value: "shown", label: "Shown" },
          { value: "anonymous", label: "Always anonymous" },
        ],
      },
    ],
  },
  leadership: {
    label: "Leadership", icon: "👥", component: Leadership,
    options: [{
      key: "emails", label: "Show leader emails", default: "show",
      choices: [
        { value: "show", label: "Show" },
        { value: "hide", label: "Hide" },
      ],
    }],
  },
  groups: {
    label: "Small Groups", icon: "🌱", component: Groups,
    options: [{
      key: "sort", label: "Order groups by", default: "name",
      choices: [
        { value: "name", label: "Name (A–Z)" },
        { value: "added", label: "Recently added" },
      ],
    }],
  },
  meals: {
    label: "Meals", icon: "🍽️", component: Meals,
    options: [{ key: "signups", label: "Who can sign up to bring food", choices: CONTRIBUTORS, default: "members" }],
  },
  directory: {
    label: "Directory", icon: "📖", component: Directory,
    options: [{
      key: "access", label: "Who can view the directory", default: "members",
      choices: [
        { value: "members", label: "All signed-in users" },
        { value: "admins", label: "Admins only" },
      ],
    }],
  },
  giving: {
    label: "Giving", icon: "💝", component: Giving,
    options: [],
  },
};

// All feature keys a tenant *could* enable — used by the Settings page.
export const ALL_FEATURE_KEYS = Object.keys(FEATURES);

// Resolve a display label, honoring per-tenant overrides (featureLabels).
export function featureLabel(key, tenant) {
  return tenant?.featureLabels?.[key] || FEATURES[key]?.label || key;
}
