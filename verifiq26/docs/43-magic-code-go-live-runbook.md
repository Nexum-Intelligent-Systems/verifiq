# 43 · Magic-code + Direct-upload — Go-Live Runbook

**Doc ID:** `verifiq-magic-golive-v0.1`
**Date:** 2026-06-14
**Companion to:** `docs/42` (plan), `website/DEPLOY.md` (site deploy).

The magic-code handoff + direct upload is **built, merged, and proven end-to-end
offline** (`tests/e2e-upload-flow.test.ts`). What remains is wiring it to the
live services — which needs credentials this repo (correctly) does not hold.
This is the exact, ordered checklist to make it work in production.

## Status — what's done vs. what this runbook covers

| Built & CI-green | This runbook (needs your secrets) |
|---|---|
| Magic-code core, `upload_tokens`/`upload_sessions`, issue/verify/session | Set `UPLOAD_TOKEN_PEPPER` |
| `POST /intake` httpAction + honeypot + per-IP/email rate limit | Deploy Convex; point the site at the URL |
| Resend "secure upload link" email (no-op without key) | Set `RESEND_API_KEY` + verified domain |
| `/upload?code=…` route, resumable direct-to-R2 upload, seal | Set `R2_*`; deploy the Next app |
| Convex Auth chosen (no Clerk) | Install `@convex-dev/auth`, set signing keys |
| Full e2e test (intake→code→upload→seal) | Run the **live** smoke (`scripts/smoke-intake.mjs`) |

## Step 1 — Convex deployment + env

```bash
cd verifiq26
npx convex dev          # first run provisions a dev deployment + writes _generated
```

Set these on the deployment (Convex dashboard → Settings → Environment Variables,
or `npx convex env set NAME value`):

| Var | Value |
|---|---|
| `UPLOAD_TOKEN_PEPPER` | a long random secret (e.g. `openssl rand -hex 32`) — **never reuse across envs** |
| `APP_BASE_URL` | `https://app.verifiq.ie` (where the upload link points — D3) |
| `INTAKE_ALLOWED_ORIGIN` | the live site origin, e.g. `https://verifiq.ie` |
| `RESEND_API_KEY` | from resend.com (EU) |
| `EMAIL_FROM` | `VerifIQ <hello@verifiq.ie>` (domain verified in Resend) |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET_NAME` | Cloudflare R2 (EU bucket) |

Deploy: `npx convex deploy`. Note the HTTP Actions URL —
`https://<deployment>.convex.site` — `/intake` lives there.

## Step 2 — Convex Auth (replaces Clerk; docs/42 D1)

```bash
npm i @convex-dev/auth @auth/core
npx @convex-dev/auth        # scaffolds auth.config.ts + signing keys (JWT_PRIVATE_KEY, JWKS)
```

Wire the email magic-link / OTP provider to Resend, and wrap the app in
`ConvexAuthProvider` (replacing the bare `ConvexProvider` in
`src/app/providers.tsx`). The upload code rides on top of the Convex Auth
session; the upload session itself is already enforced server-side.

## Step 3 — Point the website at `/intake`

In the live site (see `website/DEPLOY.md` "After it's live"):

- `first-read.html` → set `window.VERIFIQ_INTAKE_ENDPOINT` to
  `https://<deployment>.convex.site/intake`.
- `verifiq-atelier.js` → set `INTAKE_ENDPOINT` to the same URL (covers
  `three-products.html` etc.).

Until set, the forms fall back to mailto — so this is the switch that flips the
whole site onto the magic-code flow.

## Step 4 — Deploy the app (`/upload`)

Deploy `verifiq26` to Vercel (the `verifiq-app` project already builds it). Set
`NEXT_PUBLIC_CONVEX_URL` to the deployment URL. Confirm `app.verifiq.ie` resolves
to it so the emailed links open the upload page.

## Step 5 — Live smoke (the final "it works")

```bash
# 1. Hit the live front door — issues a real code + sends the email:
node scripts/smoke-intake.mjs https://<deployment>.convex.site/intake you@yourdomain.com

# 2. Open the link in the email → /upload?code=… → drag a few files in →
#    "I'm done — start the read". Confirm in the Convex dashboard:
#      · a project in scan_state "classifying"
#      · documents rows with r2_key set (and objects in the R2 bucket)
#      · audit_log: upload_code_issued → verified → document_uploaded × N → upload_sealed
```

If all three hold, the migration off email-concierge intake is live.

## Out of scope (separate workstreams)

- **The council read itself** runs once the Phase 6 classify + PDF-text-extract
  action is wired (it turns the uploaded PDFs into the per-discipline `RunInput`
  the existing orchestrator consumes) and LLM keys are set. Seal already advances
  the project to `classifying` — the trigger point — so this slots in without
  touching the upload path.
- **Server-side SHA-256 re-verify** of each stored object
  (`R2Provider.verifyUpload`) as a post-upload integrity gate.
