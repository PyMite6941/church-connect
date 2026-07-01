# Church Connect

An **embeddable, multi-tenant church engagement tool**. Deploy it once and serve
any church from its own subdomain — `connect.gracechurch.org`,
`riverside.connect.app`, etc. Each church (tenant) has its own branding,
accounts, and data, all changeable at runtime.

Built with **React 19 + Vite**.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5180
```

Demo sign-in: use an admin email from the active tenant (e.g.
`dan@grace.org`) with PIN `1234`.

## How multi-tenancy works

A **tenant** = one church. The active tenant is resolved at mount time
(`src/config/tenants.js → resolveTenantId`) in priority order:

1. Explicit override — embed option or `#root[data-tenant]`
2. **Subdomain** — `grace-community.connect.app` → tenant `grace-community`
3. `?tenant=` query param (previews)
4. `VITE_DEFAULT_TENANT`

Add a church by adding an entry to `TENANTS` in `src/config/tenants.js`
(branding theme, enabled `features`, and seed `accounts`). In production you can
swap that registry for a fetch from your API — the shape is unchanged.

## Offered functions are customizable per church

Functions live in one registry (`src/features/registry.jsx`). A church enables
them by listing keys in `features[]` and can **rename** any via `featureLabels`
(e.g. "Meals" → "Potlucks" or "Lunch"). Built-in functions:

**Events · Announcements · Sermons · Prayer · Leadership · Small Groups · Meals**
(potluck/lunch sign-ups) **· Directory · Giving** — plus the always-on Dashboard,
per-user My Account, and admin Accounts pages.

Add a new function = drop a component in `features/` + one registry entry;
routing and nav pick it up automatically.

## Landing / home page

`landing/index.html` is a standalone, self-contained onboarding page (no build
step) for hosting at your apex domain. It walks a church through connecting its
own instance to a subdomain in 5 steps (tenant config → theme → build → DNS
CNAME → go live) and covers both deploy modes. Open it directly or host it
anywhere static.

## Styling is fully customizable per church

Each tenant's `theme` overrides any of (all optional, sane defaults):
`primary`, `accent`, `bg`, `text`, `muted`, `border`, `card`, `headerBg`,
`radius`, `font`. They map to CSS variables applied at runtime — a church can go
from blue/sans-serif to green/serif with no code change. Also configurable:
`logoUrl`, `footerText`, `showIcons` (nav emoji on/off). The two sample tenants
in `tenants.js` show contrasting looks.

## Accounts & data are editable at runtime

- **Accounts** — admins manage them on the **Accounts** page (add/remove, set
  roles). Persisted via the data adapter.
- **Content** — Events, Announcements, Prayer, Leadership, Meals, Directory are
  all CRUD-editable by admins. Members can read, submit prayer requests, and sign
  up to bring dishes to meals.

## Swappable data layer

All persistence goes through an adapter (`src/data/adapters.js`):

- **LocalStorageAdapter** (default) — zero-config demo, runs with no backend.
- **ApiAdapter** — set `VITE_API_BASE_URL` and it `GET`/`PUT`s collections at
  `/{tenantId}/{collection}`. Implement that REST contract on any backend.

## Two ways to ship

### 1. Standalone SPA (per-subdomain deploy)

```bash
npm run build        # -> dist/
```

Deploy `dist/` to a subdomain. Point multiple church subdomains at the same
build; each resolves its own tenant.

### 2. Embed widget (drop into any existing site)

```bash
npm run build:embed  # -> dist-embed/church-connect.js
```

```html
<div id="church-connect" data-tenant="grace-community"></div>
<script src="https://yourcdn/church-connect.js"></script>
```

Or programmatically:

```js
import { mount } from "church-connect";
const unmount = mount(document.querySelector("#cc"), { tenant: "grace-community" });
```

The embed build uses `MemoryRouter` + inline styles so it never touches the host
page's URL or stylesheet.

## Layout

```
src/
  config/tenants.js       tenant registry + subdomain resolution
  data/adapters.js        localStorage / API storage adapters
  data/seed.js            first-run demo content
  context/                Tenant, Auth, Data providers
  features/               Dashboard, Events, Announcements, Prayer, Directory, Giving, Accounts
  components/             Layout (nav), SignIn
  main.jsx                standalone SPA entry
  embed.jsx               widget entry (mount + auto-mount)
```

## Status

Scaffold — functional end to end on the localStorage adapter. Replace the demo
PIN auth and wire `ApiAdapter` to a real backend before production use.
