# Church Connect — Project Log

Central work doc for `portfolio/church-connect/`. (User-facing usage lives in
`README.md`; this file is the build/architecture log.)

## Repo & hosting
- **GitHub: https://github.com/PyMite6941/church-connect** (public, pushed 2026-06-30).
- Vercel: config ready (homepage `/` + demo `/demo`); import the repo in Vercel to deploy.

## Update — 2026-06-30 (directory photos)
- Directory entries take an optional **photo** (file picker → downscaled JPEG data
  URL via `utils/image.js`, stored inline in the data layer; initial-avatar
  fallback). No separate file host needed.

## Known issues / TODO
- [x] Landing "Get started" button bad font — fixed (`font-family: inherit` on `.btn`).
- [ ] Custom tenants (Create-a-Church) persist to localStorage only; move to
  backend for real multi-church hosting.
- [ ] Supabase RLS demo policies are wide-open — tighten before launch (BACKEND.md).

## Update — 2026-06-30 (privacy toggle, channels, security, hosting, backend)
- **Anonymous posting toggle** (church-wide `allowAnonymous`): Prayer + Meals get
  an opt-in "without my name" checkbox; off = name always attached; prayer's
  forced-anonymous option still overrides.
- **Channels**: admins can **rename** any channel (`featureLabels` override) and
  **add custom channels** (`customChannels` → generic `CustomChannel` board).
  `channels.js#getActiveChannels` unifies built-in + custom for nav/routes.
- **Login security**: admins ALWAYS need a password even when church password
  sign-in is off (`signIn` checks `role==='admin'`). Password field always shown.
  **Password-strength meter** (`components/PasswordStrength`, `scorePassword`)
  on every password field; admin passwords must score ≥2.
- **Create-a-Church** (`features/CreateChurch.jsx`, `/create` / `?create`):
  self-serve tenant creation (name→slug, admin account, feature picks, brand
  color), saved via `config/customTenants.js` (localStorage); merged into tenant
  resolution. Linked from landing + SignIn.
- **Backend now REQUIRED** by default (`adapters.js` `BACKEND_REQUIRED`,
  `isBackendConfigured`). New **`SupabaseAdapter`** (REST → `collections(tenant,
  name, data jsonb)` table) + existing `ApiAdapter`. If unconfigured, app shows
  `BackendRequired` gate. `VITE_ALLOW_LOCAL=true` relaxes for the demo.
- **Vercel hosting = homepage + free demo**: prod build uses `base:/demo/`,
  outputs SPA → `dist/demo/`, copies `landing/index.html` → `dist/index.html`
  (homepage at `/`, app at `/demo`). `vercel.json` (SPA rewrite), `.env.production`
  sets demo local mode. Router `basename` + `import.meta.env.BASE_URL` make links
  base-aware. **Not yet deployed** — push to GitHub + import in Vercel.
- Docs: **BACKEND.md** (free Supabase + paid scaling), **SETUP.md** (5-step
  subdomain guide). Build verified ✓ (74 modules; dist/index.html + dist/demo/).

## Update — 2026-06-30 (admin control panel, roles, i18n, watchers)
A large self-serve pass so any church runs the app from the UI:
- **Admin Settings page** (`features/Settings.jsx`, `/settings`, admin-only) +
  new **`SettingsContext`** — runtime, persisted, overrides static config:
  - Toggle **every** feature on/off (drives nav + routes live).
  - Per-feature **dropdown options** (defined in `registry.jsx`, read via
    `useFeatureOption`): events sort, announcements order, sermons sort, prayer
    submitters + name anonymity, leadership emails show/hide, groups sort, meals
    signup policy, directory view-access. All wired to real behavior.
  - **Optional password sign-in** (`requirePassword`) — admin can let people in
    with just a name; `SignIn` hides the password field, `AuthContext.signIn`
    skips the check.
  - **Section watchers** — assign up to **4** users to "watch" each section
    (`featureOwners`, capped); shown on each page via `components/SectionWatchers`.
- **Roles**: admin / member / **viewer** (read-only). Added to Accounts dropdowns.
  `AuthContext` exposes `role` + `canContribute(policy)`; Prayer/Meals gate
  contribution accordingly. All roles are **invite-only** (no public sign-up;
  note added to Accounts page).
- **Per-user language / i18n**: `i18n/translations.js` (en/es/fr/pt/ko, extensible;
  English fallback) + `LanguageContext` (`useI18n().t`). Language is each user's
  own setting, chosen on **My Account**, persisted on their account. Chrome
  (nav, sign-in, account/settings titles) translated; church-authored content
  stays as typed.
- **Help page** (`features/Help.jsx`, `/help`, all users) — plain-language guide
  to every feature + roles + settings + language, for pastors/deacons. Feature
  list generated from the registry so it can't drift.
- Username sits **top-right** and links to My Account; admin Settings + Accounts
  live in the admin nav.
- Provider order: Tenant → Data → Settings → Auth → Language → Shell (Auth reads
  Settings for `requirePassword`; Language reads Auth for the user's lang).
- Build verified ✓ (68 modules, ~275 kB).

## What it is
Embeddable, **multi-tenant** church engagement tool. One React+Vite build serves
any church from its own subdomain; each church (tenant) has its own branding,
accounts, and data, all changeable at runtime. Stack: **React 19 + Vite 6 +
react-router-dom 7**, JSX (no TS).

## Status — 2026-06-27
Scaffold complete and **verified building**:
- `npm install` → 69 packages, 0 vulnerabilities
- `npm run build` (SPA) → ✓ dist/ (~248 kB js)
- `npm run build:embed` (widget) → ✓ dist-embed/church-connect.js (~643 kB iife)
- Runs fully on the localStorage adapter with **zero backend**.

## Architecture decisions
- **Tenant resolution** (`src/config/tenants.js`): override → subdomain → `?tenant=`
  → `VITE_DEFAULT_TENANT`. Registry is a plain object; swap for an API fetch later
  without changing shape.
- **Swappable data layer** (`src/data/adapters.js`): `LocalStorageAdapter`
  (default) vs `ApiAdapter` (when `VITE_API_BASE_URL` set; REST contract
  `GET/PUT /{tenantId}/{collection}`). All feature code talks only to
  `useCollection(name)` in `DataContext`.
- **Accounts editable at runtime**: stored in the `accounts` collection (seeded
  from tenant config), managed on the admin-only Accounts page → satisfies
  "accounts + data can be changed as necessary."
- **Two entry points**: `main.jsx` (standalone SPA, BrowserRouter) and
  `embed.jsx` (widget — `mount()` + auto-mount, MemoryRouter + inline CSS so it
  never hijacks the host page's URL or styles).
- **Theming**: tenant theme pushed to CSS variables in `TenantContext`.
- **Auth**: demo PIN auth (`AuthContext`) — explicitly a stand-in; replace with
  real auth before production.

## Offered functions (per-tenant toggleable via `features[]`)
Dashboard (always on) · Events · Announcements · Prayer · **Leadership** ·
**Meals** (potluck/lunch sign-ups) · Directory · Giving · Accounts (admin).
All defined in one place: `src/features/registry.jsx`. Tenants enable by key and
can rename via `featureLabels`. Adding a function = component + one registry
entry; App routing + Layout nav read the registry, nothing else changes.

## Update — 2026-06-27 (functions + customization pass)
- Added **Leadership** (staff/elders, admin CRUD, avatar initials) and **Meals**
  (potluck/lunch — admin schedules a meal, members sign up dishes; per-meal
  `signups[]`).
- Introduced **central feature registry** (`registry.jsx`); refactored App.jsx +
  Layout.jsx to consume it (removed hardcoded route/label maps).
- **Expanded theming**: theme now drives 10 CSS vars (primary, accent, bg, text,
  muted, border, card, headerBg, radius, font) — all optional w/ defaults.
  Added `logoUrl`, `footerText`, `showIcons`, `featureLabels` to tenant config.
- Sample tenants now show contrasting looks (blue/sans vs green/serif) + renamed
  Meals → "Potlucks" / "Lunch" to demonstrate full customizability.
- Both builds re-verified ✓ (SPA ~253 kB, embed ~649 kB).

## Update — 2026-06-27 (account pages)
Two distinct account surfaces now exist:
- **My Account** (`features/MyAccount.jsx`, route `/account`) — for EVERY signed-in
  user: view profile, edit display name, change PIN, sign out. Nav link + the
  header username both point here. Backed by new `updateProfile()` in AuthContext
  (patches the user's own record in the accounts collection + live session).
- **Accounts** (`features/Accounts.jsx`, route `/accounts`) — admin-only org-wide
  management (add/remove users, set roles).
- SPA build re-verified ✓ (~255 kB).

## Update — 2026-06-27 (more functions + landing page)
- Added **Sermons** (`features/Sermons.jsx`, media library w/ links) and **Small
  Groups** (`features/Groups.jsx`, browsable groups + contacts). Registered in
  `registry.jsx`, seeded, enabled on grace-community. Functions now: Events,
  Announcements, Sermons, Prayer, Leadership, Groups, Meals, Directory, Giving.
- Future function ideas (listed as "soon" on landing): Serve/Volunteer,
  Resources, Connect Card, Calendar view, Kids Check-in.
- **Landing/home page** — `landing/index.html`, fully self-contained static HTML
  (inline CSS, no build). Hostable anywhere at the apex domain while churches run
  on subdomains. Sections: hero, functions grid, **5-step "connect your church"**
  guide (tenant config → theme → build → DNS CNAME → go live), two deploy modes
  (subdomain vs embed), and the data/backend note. Demo link → `?tenant=`.
- SPA build re-verified ✓ (~259 kB).

## Next steps / before production
- [ ] Replace demo PIN auth with real auth (OAuth / magic link / API).
- [ ] Implement a backend matching the `ApiAdapter` REST contract.
- [ ] Move tenant registry to a fetched config.
- [ ] Wire each tenant's `givingUrl`.
- [ ] Deploy: SPA per subdomain, or publish the embed `church-connect.js` to a CDN.
