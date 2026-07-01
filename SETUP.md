# Setup guide — get your church online

The simplest path from zero to **connect.yourchurch.org**. No coding required
after the first deploy.

> On screenshots: the DNS/host dashboards belong to third-party sites (Vercel,
> your domain registrar), so this guide uses their exact menu names and click
> paths instead of embedded images. If you'd like, send me screenshots of your
> registrar and I'll annotate the exact spots.

---

## What you'll end up with

```
  yourchurch.org              ← your normal website (unchanged)
  connect.yourchurch.org      ← Church Connect, your church's hub
```

---

## Step 1 — Create your church (1 min)

Open the demo and click **Get started** (or go to `/demo/create`). Fill in:
- Church name → becomes your web address id (e.g. `grace-church`)
- First admin name, username, and a strong password
- Pick which features to start with

That's your church. (For a real, shared deployment, connect a database first —
see **BACKEND.md**. The demo stores data in your browser only.)

## Step 2 — Put it on the web (2 min)

You only do this once. Using **Vercel** (free):

1. Push this project to a GitHub repo.
2. Go to [vercel.com](https://vercel.com) → **Add New… → Project** → import the repo.
3. Framework preset: **Vite**. Leave the defaults (this repo ships a `vercel.json`).
4. Click **Deploy**.

You'll get a live URL like `church-connect.vercel.app`:
- `/` → the homepage
- `/demo` → the app

## Step 3 — Add your subdomain (2 min)

In Vercel: open your project → **Settings → Domains** → type
`connect.yourchurch.org` → **Add**.

Vercel will show you **one DNS record** to create. It looks like:

```
Type    Name      Value
CNAME   connect   cname.vercel-dns.com
```

## Step 4 — Create that record at your domain (2 min)

Log in wherever you bought your domain (GoDaddy, Namecheap, Cloudflare, Google
Domains, etc.) → find **DNS** / **DNS Records** → **Add record**:

| Field | Put this |
|---|---|
| Type | `CNAME` |
| Name / Host | `connect` |
| Value / Target / Points to | the value Vercel showed (`cname.vercel-dns.com`) |
| TTL | leave default / Auto |

Save it.

## Step 5 — Wait a few minutes ✅

Vercel auto-detects the record (usually 1–10 minutes) and turns on HTTPS for free.
When the domain shows a green check in Vercel, visit:

```
https://connect.yourchurch.org
```

Your church's admin signs in, and you're live.

---

## Common questions

**Do I need a separate site per church?** No — one deployment serves every
church. Each church's subdomain (or `?tenant=` link) loads its own data and
branding. Add more churches anytime via `/demo/create`.

**It says "Connect your storage."** That's the backend-required gate — set the
Supabase env vars from **BACKEND.md**, or set `VITE_ALLOW_LOCAL=true` to keep
testing on local storage.

**My subdomain isn't working.** DNS can take up to an hour. Double-check the
record **Name** is just `connect` (not the full domain) and the **Type** is
`CNAME`. Vercel's Domains page tells you exactly what's missing.
