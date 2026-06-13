# OPS-01 · Deployment — two Vercel projects, one brand (subdomain split)

**Status:** Active · **Date:** 2026-06 · **Owner:** Liam

VerifIQ ships as **two Vercel projects** off the **same GitHub repo** (`main`),
presented under one brand via subdomains:

| Site | Content | Vercel root dir | Framework | Domain |
|------|---------|-----------------|-----------|--------|
| **Marketing** | static `website/` | `verifiq26/website` | Other (no build) | `verifiq.ie` (+ `www`) |
| **App** | Next.js slice | `verifiq26` | Next.js | `app.verifiq.ie` |

The marketing site links to the app via an **Open app ↗** nav link
(`verifiq-atelier.js` → `window.VERIFIQ_APP_URL`, default `https://app.verifiq.ie`).

---

## 0. The build error you hit — fix first

```
npm error path /vercel/path0/verifiq26/package.json
npm error enoent ... Command "npm install" exited with 254
```

Root cause: the **app** Vercel project was building branch
`backup/local-docs-2026-06-10` — an **old repo layout** that has no `verifiq26/`
folder (its code lives in `app/` + `convex/` at the repo root). With Root
Directory = `verifiq26`, Vercel looked for `verifiq26/package.json`, which
doesn't exist on that branch → ENOENT.

**Fix (Vercel dashboard → the app project → Settings):**
1. **Git → Production Branch → `main`** (never the `backup/*` branch).
2. **Build & Development → Root Directory → `verifiq26`**, Framework **Next.js**.
3. **Deployments →** redeploy (or push to `main`). Build now finds
   `verifiq26/package.json`.

> The `backup/local-docs-2026-06-10` branch is a snapshot of the pre-`verifiq26`
> layout. Don't point any Vercel project at it. Consider deleting it once
> confirmed unneeded, so it can't be auto-selected again.

---

## 1. Marketing project — `verifiq.ie`

- **Root Directory:** `verifiq26/website`
- **Framework Preset:** Other · **Build Command:** *(none)* · **Output Directory:** `.`
  (the `website/` folder is plain static HTML/CSS/JS — no build step).
- **Production Branch:** `main`.
- **Domains:** `verifiq.ie` (primary) + `www.verifiq.ie` (redirect to apex).

**DNS (at your registrar / wherever `verifiq.ie` is hosted):**
- Apex `verifiq.ie` → **A** record `76.76.21.21` (Vercel), or an ALIAS/ANAME to
  `cname.vercel-dns.com` if your DNS supports it.
- `www` → **CNAME** `cname.vercel-dns.com`.
- Vercel shows the exact records under the project's **Domains** tab — use what
  it shows; the above are the current Vercel defaults.

## 2. App project — `app.verifiq.ie`

- **Root Directory:** `verifiq26` · **Framework:** Next.js (auto build:
  `next build`, uses `next.config.mjs` → `tsconfig.app.json`).
- **Production Branch:** `main`.
- **Environment variables:**
  - `NEXT_PUBLIC_CONVEX_URL` = your Convex deployment URL (from `npx convex dev`
    / `npx convex deploy`).
  - *(later)* Clerk keys when auth is wired.
- **Domain:** add `app.verifiq.ie`.

**DNS:**
- `app` → **CNAME** `cname.vercel-dns.com`.

> First app deploy needs Convex live (see `docs/35-backend-provisioning-runbook.md`):
> `npx convex deploy`, then set `NEXT_PUBLIC_CONVEX_URL` on the app project.

## 3. Wiring marketing → app

`verifiq-atelier.js` injects **Open app ↗** into every page's nav (desktop nav +
mobile sheet drawer), pointing at `window.VERIFIQ_APP_URL` (default
`https://app.verifiq.ie`). To override (e.g. a preview URL), set it before the
script loads on any page:

```html
<script>window.VERIFIQ_APP_URL = "https://app.verifiq.ie";</script>
```

The First Read CTAs are separate: they go to Stripe (`VERIFIQ_FIRST_READ_URL`)
or the concierge intake dialog — not the app — until self-serve checkout lands.

## 4. Why subdomain (not one project)

The marketing site is static and deploys with zero build; the app is a Next.js
build with its own env + Convex client. Keeping them as two projects on
`verifiq.ie` / `app.verifiq.ie` means independent deploys, no build coupling, and
the standard SaaS shape (marketing on the apex, product on `app.`). If we later
want everything under one URL path (`verifiq.ie/app`), we'd fold the static site
into the Next app's `public/` with a `basePath` — deferred; not needed now.
