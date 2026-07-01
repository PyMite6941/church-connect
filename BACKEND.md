# Backend setup (required)

Church Connect stores real church data, so a hosted database is **required** for
any real deployment. The public Vercel demo is the only exception — it runs in
local-browser mode (`VITE_ALLOW_LOCAL=true`) so anyone can try it instantly.

The app talks to a tiny storage interface (`src/data/adapters.js`):

```
getCollection(tenant, name)        -> array | object | null
saveCollection(tenant, name, data) -> void
```

You can back it two ways:

| Option | Env vars | Notes |
|---|---|---|
| **Supabase** (recommended, free) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | No server code — talks straight to Supabase REST |
| Any REST API | `VITE_API_BASE_URL` | Implement `GET`/`PUT /{tenant}/{name}` yourself |

---

## Free option — Supabase (≈10 minutes)

Supabase's free tier (500 MB Postgres, REST API, auth, RLS) is plenty for a
church.

### 1. Create a project
Go to [supabase.com](https://supabase.com) → **New project** (free). Pick a name
and a strong database password.

### 2. Create the table
Open **SQL Editor** → **New query**, paste this, and **Run**:

```sql
create table if not exists collections (
  tenant     text not null,
  name       text not null,
  data       jsonb,
  updated_at timestamptz default now(),
  primary key (tenant, name)
);

alter table collections enable row level security;

-- DEMO policy: anyone with the anon key can read/write. Fine for testing.
-- TIGHTEN before launch (see "Securing it" below).
create policy "public read"   on collections for select using (true);
create policy "public insert" on collections for insert with check (true);
create policy "public update" on collections for update using (true);
```

### 3. Get your keys
**Project Settings → API**, copy:
- **Project URL** → `VITE_SUPABASE_URL`
- **anon public** key → `VITE_SUPABASE_ANON_KEY`

The anon key is meant to be public (shipped in the frontend) — your data is
protected by **RLS policies**, not by hiding the key.

### 4. Add the env vars
Locally, put them in `.env`:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key...
```

On **Vercel**: Project → **Settings → Environment Variables** → add the same two,
then redeploy. (Remove `VITE_ALLOW_LOCAL` there so the backend is enforced.)

Done — Church Connect now reads/writes the `collections` table.

### Securing it (before launch)
The demo policies above are wide open. For production, do **one** of:
- Add Supabase **Auth** and scope rows to authenticated users; or
- Move writes behind a **Supabase Edge Function** using the service-role key
  (never put the service key in the frontend); or
- At minimum, add a per-tenant secret check in the policies.

Church Connect's own roles (admin/member/viewer) gate the **UI**; real row-level
security must live in the database.

---

## Paid cloud storage / scaling

When a church outgrows the free tier (storage, backups, no auto-pause, more
bandwidth):

- **Supabase Pro** — ~$25/mo: daily backups, 8 GB+ storage, no project pausing,
  email support. Same code, no migration — just upgrade the project.
- **Supabase Team / dedicated** — for many churches on one deployment.
- **Alternatives** (all have free + paid tiers, all REST-friendly):
  Neon (Postgres), Vercel Postgres, Upstash Redis. Use `VITE_API_BASE_URL` with a
  thin serverless function if you pick a non-Supabase store.

A simple per-church paid model: one Supabase project per church on Pro, or one
shared Pro project partitioned by the `tenant` column (already how the schema
works).
