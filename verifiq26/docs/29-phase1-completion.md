# 29 · Phase 1 Completion Summary

**Doc ID:** `verifiq-phase1-completion-v0.1`
**Phase:** 1 — Schema + LLM adapter + R2 storage adapter (per `docs/28`)
**Date:** 2026-06-06
**Author:** Claude Code (build), for Liam Doolan (founder) sign-off

---

## What was built

All five Phase 1 deliverables, under `verifiq26/` (project root) with Convex
configured to use `src/convex/` for functions (`convex.json`).

### Deliverable 1 · Convex schema + types

- `src/convex/schema.ts` — 17 tables conforming to `05_output_schemas.md` §05.4
  and the `docs/28` table list: `users`, `projects`, `intake_answers`,
  `documents` (with **both** optional `storage_id` and `r2_key` per `docs/27`),
  `modules`, `findings` (full §05.1 shape), `finding_interfaces`, `challenges`,
  `adjudications`, `discipline_summaries` (§05.2), `reports` (§05.3),
  `report_findings`, `audit_log`, `jobs` (file 20 §2), `findings_feedback`
  (file 14), `prompt_versions` (file 15), `inference_cache` (file 20 §2 key).
  Controlled vocabularies are `v.union(v.literal(...))` — schema-locked, not
  free strings. Indexed on project_id / status / discipline / sha256 / etc.
- `src/types/index.ts` — TypeScript interfaces mirroring §05.1–05.3 + the
  feedback object, plus `Doc<>`/`Id<>` row aliases.
- `src/constants.ts` — the **locked disclaimer** exported as `LOCKED_DISCLAIMER`,
  the banned verb/noun lists, and `findBannedTerms()` for the pre-release gate.

### Deliverable 2 · LLM provider adapter (`src/llm/`)

- `types.ts` — `LLMProvider` interface (`complete`, `completeVision`,
  `getCost`), `LLMResult` (`{text, tokens_in, tokens_out, model_used,
  provider_used, cost_eur, latency_ms}`), `AuditSink`, `RetryableLLMError`.
- `config.ts` — role→provider/model map from file 02 (Haiku=classification,
  Sonnet=review/chair, GPT-4-class=peer-challenge, Opus=adjudicator,
  Sonnet-vision=title-block) + EUR cost table.
- `anthropic.ts` / `openai.ts` — adapters with prompt-cached system blocks
  (Anthropic) and retryable-error mapping.
- `index.ts` — `createLLM()` selector with **per-call** failover and audit
  logging of every call / failover / error.

### Deliverable 3 · R2 storage adapter (`src/storage/`)

- `types.ts` — `StorageProvider` 5-method contract, object-key convention
  (`proj/{project_id}/disc/{discipline}/{sha256}.{ext}`), `computeSha256()`.
- `r2.ts` — R2 via `@aws-sdk/client-s3`: signed PUT/GET URLs (1-hour),
  range reads, and multipart helpers (>5 MB).
- `convex.ts` — Convex-native fallback for small artefacts.
- `index.ts` — `StorageRouter` routing by size (≥100 MB → R2) per `docs/27`.

### Deliverable 4 · Local dev setup

`package.json` (pinned deps), `tsconfig.json` (strict + `noUncheckedIndexedAccess`),
`convex.json`, `.env.local.example`, `.gitignore`, `.eslintrc.cjs`, `.prettierrc`,
`vitest.config.ts`, and `DEVELOPMENT.md` (the dev README). A `verifiq26/CLAUDE.md`
was added so future Claude Code sessions auto-load the spec context (per file 16).

### Deliverable 5 · Smoke test

`tests/smoke.test.ts` (via `convex-test`): project → document → LLM call
(→ "OK") → finding insert/read-back → audit_log assertion, plus failover and
R2-signed-URL checks.

---

## Definition of Done — status

| DoD item | Status | Notes |
|---|---|---|
| Deliverables 1–5 implemented | ✅ | All present |
| `npx tsc --noEmit` zero errors (strict) | ✅ | Verified in this environment |
| `npx convex dev` deploys schema cleanly | ⚠️ verify locally | `npx convex codegen` ran clean; full `convex dev` needs a Convex login |
| Smoke test passes | ✅ | 4/4 tests pass |
| LLM adapter calls Anthropic with a trivial prompt | ⚠️ verify locally | Needs `ANTHROPIC_API_KEY`; covered by a stubbed call in-sandbox |
| Adapter fails over to OpenAI on forced fail | ✅ (mocked) | Failover + audit asserted with stub providers |
| R2 adapter generates a working signed upload URL | ✅ | Presigned offline in the test (real bucket round-trip = verify locally) |
| Data-minimisation review | ✅ | `users` holds identity+role only; feedback layer references ids, not document content (file 15 privacy posture) |
| Locked disclaimer exported as a constant | ✅ | `LOCKED_DISCLAIMER` in `src/constants.ts` |
| No banned verbs in code/output | ✅ (scoped) | See deviation 3 below |

Verified locally in this build: `npm run typecheck`, `npm test`, `npm run lint`
all pass; `npx convex codegen` generates `src/convex/_generated/` cleanly.

---

## Deviations from `docs/28` (with rationale)

1. **Existing scaffold deleted, schema replaced (founder-approved).** The prior
   `src/convex/` held a project-specific `sp_dr_*` design-review-sprint schema
   plus `actions/`/`lib/` that referenced tables in neither schema — inconsistent
   POC code. Per founder decision it was deleted (recoverable from git history)
   and replaced with the Phase 1 platform schema. The useful Phase-2 ideas in
   that code (source-quote gate, prompt caching, classifier) are re-derivable
   from the spec in Phase 2.
2. **Dev README is `DEVELOPMENT.md`, not `README.md`.** `verifiq26/README.md`
   already exists as the product overview; clobbering it would lose content, so
   dev setup lives in `DEVELOPMENT.md`.
3. **Banned-verb enforcement is scoped to customer-facing output.** File 08
   itself scopes banned verbs to customer-facing surfaces and notes the product
   name "VerifIQ"/"verify" is fine internally. The `findBannedTerms()` validator
   enforces the list on generated output; internal code comments and the locked
   disclaimer (which by legal design says "does not certify, sign… verifies
   locally") are out of scope.
4. **Project root = `verifiq26/` with `convex.json` → `src/convex/`.** Matches
   the kickoff's tree while keeping Convex's `schema.ts` at the established
   `src/convex/` path referenced by `PROJECT_PLAN.md`.
5. **The 17 intake fields** are a structured Phase-1 subset; the canonical list
   lives in `docs/09-sector-role-onboarding-wizard-spec.docx` (a binary doc not
   parsed here). Extra/wizard answers go in `intake_answers` (KV). Confirm the
   exact 17 against doc 09 before intake UI in a later phase.

---

## Open questions for Phase 2

1. **Convex blob-size confirmation.** The `docs/27` support email should be sent
   (PROJECT_PLAN P0) — the schema is correct either way, but it decides whether
   small artefacts use Convex-native storage at all.
2. **Model ids.** Config uses current-generation ids (Sonnet 4.6 / Haiku 4.5 /
   Opus 4.8 / GPT-4o). Confirm the exact GPT model for peer-challenge.
3. **`inference_cache` store.** Convex table now; file 20 allows Redis/Upstash
   for a higher-volume tier — revisit at scale.
4. **Audit sink wiring in production.** The LLM adapter takes an injected
   `AuditSink`; Phase 2 should provide a Convex-action-side sink calling
   `appendAudit` so every production LLM call is logged.

---

## Estimated Phase 2 readiness

**Ready, no blockers.** The schema, adapters, and audit path are in place for the
six MVP agents (`docs/28` Phase 2 kickoff). Before starting, send the Convex
support email and provision API keys so the live-credential DoD items above can
be ticked locally.

---

## Time spent

Single focused build session: spec reading (11 required docs + files 14/15) →
reconciliation of existing scaffold → implementation of all five deliverables →
type-check, lint, and smoke-test green.
