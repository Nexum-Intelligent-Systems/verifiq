# VerifIQ — Stack Decision · Storage + Platform

**Doc ID:** `verifiq-stack-decision-v0.1`  
**Purpose:** Honest comparison of the platform options for the MVP, with a recommendation. To be decided BEFORE Phase 1 build commences.  
**Status:** Decision pack for founder · review with technical advisor if available  
**Date:** 2026-06-01

---

## What this decision is about

The prompt pack (`verifiq-prompts/10_developer_task_prompt.md` § Suggested stack) currently nominates:

- **Convex** as the backend (DB + functions + file storage)
- **Next.js 14** on Vercel as the frontend
- **Clerk** for auth
- **Stripe** for billing
- **Resend** for transactional email

The Implementation Review Council (`docs/25`) and the platform architecture spec (`verifiq-prompts/20`) both flag a **specific unknown**:

> *Can Convex hold the 100+ MB drawings that a Tier III pack typically contains?*

If yes → the stack is right and we proceed as planned.

If no → we need an object-storage layer (S3-compatible) sitting alongside Convex.

If we get this wrong and don't discover it until Phase 4 → we lose 4 weeks of build and have to refactor the entire upload + scan pipeline.

**This document recommends a path that is correct under either answer**, plus a draft email to confirm the answer with Convex directly.

---

## What I know for certain

- **Convex** is a TypeScript-first reactive database + functions platform. Excellent DX. Convex Pro tier supports EU residency. Built-in scheduled functions. Reactive queries replace polling for live dashboards. Founder-friendly pricing for early stage.
- **Convex file storage** exists. Files are stored via a `storage` API. Per-blob size limits depend on tier — Convex documentation publishes these, but they change, and I do not have authoritative confirmation of the current per-blob ceiling.
- **Vercel** has hard payload limits on serverless functions (4.5 MB by default; configurable upward but with caps). This affects how files get from browser → backend. Direct-to-storage upload (browser → Convex storage URL) bypasses Vercel entirely, which is the right pattern regardless.
- **Cloudflare R2** is S3-compatible object storage with **zero egress fees** — meaning customers download files we serve back to them at no marginal cost to us. Storage cost is competitive ($0.015/GB/month). No per-blob size limit issues.
- **Postgres + S3-compatible** (e.g., Supabase) is the conventional alternative — Postgres has decades of operational maturity, S3 has unlimited file storage. Trade-off: more setup, less reactive-by-default behaviour, no built-in scheduled functions UX (use cron jobs or pg_cron).

## What I don't know for certain

- **The exact current per-blob limit on Convex Pro tier.** Likely sufficient for typical PDFs but unconfirmed for the 100–500 MB drawings that occasionally appear in tender packs.
- **Convex pricing at the volume profile we'll hit by month 6–9.** Need to model against expected ~10 paying customers × ~3 packs/month × ~600 files/pack × ~25 MB/file.
- **Convex storage egress pricing at scale.** R2's zero-egress is a known advantage; Convex's pricing on storage download needs confirmation.

---

## The four options

### Option 1 · Convex-native (current plan)

**Architecture:** Convex holds the database, the functions, AND the files.

**Pros:**
- Simplest. Single platform. Single billing surface.
- Reactive queries native. Real-time dashboard "just works."
- TypeScript-first matches the agent system DX.
- EU residency.
- Lowest cognitive overhead for the founder + Claude Code build.

**Cons:**
- Per-blob file size limit may bind on large drawings.
- Lock-in: harder to swap out later if Convex pricing changes.
- Egress cost at scale unconfirmed.

**Decision risk:** medium. If file-size limit binds, refactor cost is significant.

---

### Option 2 · Convex + Cloudflare R2 hybrid · **RECOMMENDED**

**Architecture:** Convex holds the database, functions, audit log, findings, metadata. Cloudflare R2 holds the actual document files. Convex `documents` table holds a `r2_key` pointing to the file in R2.

**Pros:**
- **No file-size ceiling.** R2 handles multi-GB files natively.
- **Zero egress.** When customers download the report PDFs / register XLSX / re-download their own files, we pay nothing for bandwidth.
- Keeps Convex's reactive query advantage for the live dashboard.
- Migrates cleanly if we ever swap Convex itself.
- Direct-to-storage uploads via R2 signed URLs (tus.io compatible).
- R2 cost at the volume profile is trivial: ~$2-3/month for the first year.

**Cons:**
- Two platforms to manage (Convex + R2).
- One extra IAM key + bucket policy to maintain.
- Slightly more setup work in Phase 1 (~1 day).

**Decision risk:** low. R2 is mature, the integration pattern is well-trodden.

---

### Option 3 · Supabase (Postgres + S3-like storage + auth + realtime)

**Architecture:** Supabase replaces Convex AND Clerk. Postgres handles the database, Supabase Storage handles files, Supabase Auth handles users.

**Pros:**
- Postgres is the most operationally mature option. Decades of patterns, every engineer knows it.
- Includes auth — drops Clerk from the stack.
- EU residency via Frankfurt region.
- Cheaper at high scale than Convex.
- Realtime subscriptions for live dashboard (postgres LISTEN/NOTIFY pattern).
- Postgres connection pooling is well-understood.

**Cons:**
- More setup. More schema migrations to write by hand. More plumbing.
- Realtime is good but not as ergonomic as Convex's reactive queries.
- Scheduled functions less polished than Convex's built-in scheduling.
- Auth migration cost is real if we ever swap.

**Decision risk:** low (Postgres is bulletproof) but build-time risk is medium higher (more code to write).

---

### Option 4 · Full custom (Postgres + S3 + Inngest queue + custom auth)

**Architecture:** Roll your own. Postgres on Neon/Railway, files in R2/S3, jobs in Inngest, auth in Clerk or NextAuth.

**Pros:**
- Maximum flexibility.
- No vendor lock-in.
- Each layer can be swapped independently.

**Cons:**
- Much more setup work (estimated +3-4 weeks in Phase 1).
- More moving parts to operate.
- Higher cognitive load for the founder.
- More surface area for things to break.

**Decision risk:** high — by Phase 4 we're managing 4 separate platforms.

---

## Decision matrix

| Criterion | Convex-native | **Convex + R2 (Rec.)** | Supabase | Full custom |
|---|---|---|---|---|
| Setup speed | Fastest | Fast (+1d) | Medium | Slowest |
| Reactive dashboard ergonomics | Excellent | Excellent | Good | Custom — variable |
| File-size ceiling risk | Medium | None | None | None |
| Egress cost at scale | Unknown | Zero | Low | Low |
| Operational maturity (Postgres-grade) | Newer | Newer | Yes | Yes |
| Lock-in risk | Medium-high | Medium | Low | None |
| Cognitive load on founder | Low | Low+ | Medium | High |
| Cost at 10 customers/month | ~€100 | ~€105 | ~€80 | ~€90 |
| Cost at 100 customers/month | Unknown | ~€350 | ~€280 | ~€320 |
| Build-time risk | Medium (if limits bind) | Low | Medium-low | High |
| Refactor cost if wrong | High | Low | Medium | Low |

---

## Recommendation

**Adopt Option 2 — Convex + Cloudflare R2 hybrid — from Phase 1.**

Reasons:

1. **It is correct under either Convex storage answer.** If Convex storage turns out to be perfectly capable of 500 MB drawings, R2 still costs nothing meaningful and gives us zero-egress as a permanent advantage. If Convex storage binds, we've already architected around it.
2. **R2 zero-egress** is genuinely significant. Once paying customers are downloading the same reports we've delivered (which they will, repeatedly), zero egress saves real money at scale.
3. **The build cost difference is one day.** Convex `documents` table holds a `r2_key` field instead of a Convex `storage_id`. Upload pattern uses an R2 signed URL via the AWS S3 client instead of Convex's. Everything else is identical.
4. **Migration path remains open.** If Convex starts handling 1GB blobs in a year, swap R2 for Convex storage in one schema migration. If Convex becomes more expensive at scale and we want to move to Supabase, R2 can stay — the storage layer is decoupled.

**Defer Postgres/Supabase migration as a Phase 3+ decision** based on actual cost data once we have 50+ customers.

---

## The Convex-support email (draft)

Send to `support@convex.dev` immediately. Reply expected within 24-48 hours.

**Subject:** Pre-build technical question — file storage limits and EU residency for VerifIQ

```
Hi Convex team,

I'm Liam Doolan, director at GovIQ Ltd (Dublin). We're building VerifIQ — an Irish pre-build compliance review service for design teams — and want to use Convex as the database + functions layer.

Three quick questions before we commit to the stack for Phase 1 build (kicking off in week 1 of June).

1. **Per-blob file storage size limit.** Our typical workload is multi-discipline construction tender packs. A Tier III pack averages 600 files, with individual PDFs ranging from 1 MB to occasionally 500 MB (large CAD-exported drawings). What is the current per-blob storage limit on Convex Pro? Is there an enterprise tier with higher limits?

2. **EU residency confirmation.** Customer documents are Irish design-team property and must remain in EU data residency. Can you confirm the EU region(s) currently offered for Convex Pro deployments, and whether storage residency is co-located with the functions deployment?

3. **Storage egress pricing.** Customers download their own packs back, and we deliver report PDFs / Excel registers (typically 10-50 MB) via our application. What is the egress pricing per GB at the Pro tier?

For context: expected MVP volume is ~10 paying customers × ~3 packs/month × ~600 files/pack × ~25 MB/file average. Growing to ~100 customers within 18 months.

We're considering a hybrid pattern where Convex holds metadata + functions + reactive queries, and Cloudflare R2 holds the large file blobs — primarily because R2 has zero egress and no per-blob limit concerns. Happy to use Convex-native storage instead if the answers above support it.

Quick reply appreciated. Pre-build customer demo planned for end of July.

— Liam Doolan
Director, GovIQ Ltd
liam@goviq.ie · +353 {{phone}}
verifiq.ie
```

---

## What we do while we wait for their reply

**Do not block on this email.** Phase 1 (schema + LLM adapter) can proceed regardless — the schema for `documents` table works the same whether the file lives in Convex storage or R2; we just have `r2_key` as a string field either way.

**Build pattern that works under either answer:**

```typescript
// schema.ts
documents: defineTable({
  project_id: v.id("projects"),
  filename: v.string(),
  sha256: v.string(),
  size_bytes: v.number(),
  // Use ONE of these depending on Convex's answer:
  storage_id: v.optional(v.id("_storage")),  // if Convex storage holds it
  r2_key: v.optional(v.string()),            // if R2 holds it
  // Plus the rest of the document metadata
  discipline: v.string(),
  doc_type: v.string(),
  // ...
})
```

Code reads the right field at runtime. Migration between the two is a one-day operation if needed.

---

## What to decide on the founder's side this week

Before Phase 1 kick-off:

- [ ] Send the Convex support email (above).
- [ ] Sign up for Cloudflare R2 account (free tier covers month 1; ~$2/month after).
- [ ] Create the R2 bucket: `verifiq-prod-eu-west` in the EU region.
- [ ] Generate R2 API keys; store in 1Password.
- [ ] Add R2 credentials as environment variables to the local dev environment (and later to Vercel + Convex prod).

These take a combined 30 minutes. They commit you to nothing — if Convex's reply makes Option 1 (native) the right call, the R2 setup sits idle costing $0.

---

## What changes if Convex's answer is unfavourable

If Convex says "150 MB per blob max" (the most likely binding scenario):

- We use R2 for files >100 MB (or for ALL files, for consistency).
- We use Convex storage for small artefacts (report exports, audit log PDFs, signed forms).
- The architecture in `verifiq-prompts/20_platform_architecture.md` already accommodates this.
- Zero refactor cost.

If Convex says "egress is $0.30/GB" (the most likely cost-concerning scenario):

- We use R2 for all customer-facing file delivery (zero egress).
- Convex for the reactive query layer + scheduled jobs + database.
- Slight bias toward putting more in R2 over time.

If Convex says "we don't offer EU residency at the tier you need":

- Major change. Consider Supabase as primary backend (Option 3). 
- Would slip Phase 1 by ~1 week to retool the schema in Postgres.
- Communicate the slip immediately in PROJECT_PLAN.md.

---

## What to NOT decide this week

- **Final billing arrangement with Convex.** Wait until MVP load is real.
- **Whether to migrate auth from Clerk to Supabase Auth.** Defer to Phase 3 review.
- **Whether to move to a queue system separate from Convex.** Convex scheduled functions are sufficient for MVP; reassess at customer 50.

---

## Open decisions for the founder

| # | Decision | Recommended | When to decide |
|---|---|---|---|
| 1 | Adopt Convex + R2 hybrid for Phase 1 | YES | This week, before Phase 1 |
| 2 | Send Convex support email | YES (today) | Today |
| 3 | Create R2 account + bucket | YES (today) | Today |
| 4 | Defer Supabase / Postgres as Phase 3 option | YES | Standing decision |
| 5 | Re-evaluate stack at customer 50 | YES | Standing trigger |

---

## The single sentence

> *Adopt the Convex + Cloudflare R2 hybrid from Phase 1 — it's correct under any answer Convex gives, costs one day of additional setup, and removes the file-size ceiling and egress-cost risks before they can bite.*

---

*Send the Convex email today. Create the R2 account today. Phase 1 kick-off does not depend on the reply.*
