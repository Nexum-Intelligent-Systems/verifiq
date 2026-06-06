# 29 · Phase 1 Completion Summary

**Doc ID:** `verifiq-phase1-completion-v0.1`
**Phase:** 1 — Schema + LLM adapter + R2 storage adapter
**Date:** 2026-06-06
**Branch:** `claude/tender-cannon-Jkx1N`

---

## What was built

All five Phase 1 deliverables from `docs/28-claude-code-phase1-kickoff.md`.

### Deliverable 1 · Convex schema (`src/convex/schema.ts`)

All 18 MVP tables, conforming to `verifiq-prompts/05_output_schemas.md`:
`users`, `projects`, `intake_answers`, `documents`, `modules`, `findings`,
`finding_interfaces`, `challenges`, `adjudications`, `discipline_summaries`,
`reports`, `report_findings`, `audit_log`, `jobs`, `findings_feedback`,
`prompt_versions`, `inference_cache`.

- `findings` mirrors § 05.1 field-for-field; `discipline_summaries` mirrors
  § 05.2; `reports` mirrors § 05.3 (array fields hold `issue_id` references, not
  duplicated content).
- `documents` carries **both** `convex_storage_id?` and `r2_key?` per `docs/27`.
- `jobs` + `inference_cache` follow `20_platform_architecture.md` § 2
  (idempotency key = `hash(model + prompt_version + document_sha256 + agent_id +
  corpus_version)`, implemented in `src/lib/hash.ts`).
- Enum literals are defined once as exported `v.union` validators and reused by
  the mutations and the TypeScript mirror.
- Indexes added in this phase (not deferred) on `project_id`, `status`,
  `risk`, `discipline_origin`, `sha256`, `idempotency_key`, `cache_key`, etc.
- TypeScript types in `src/types/index.ts` mirror the schema via the standard
  `Doc<"table">` pattern, with enum types derived through `Infer<>` so they can
  never drift from the schema.

### Deliverable 2 · LLM provider adapter (`src/llm/`)

- `types.ts` — `LLMProvider` interface (`complete`, `completeVision`,
  `getCost`), the structured `CompletionResult`
  (`{ text, tokens_in, tokens_out, model_used, provider_used, cost_eur,
  latency_ms }`), the `AuditSink` contract, and a `ProviderError` carrying
  retryability.
- `config.ts` — role→provider chains + model mapping per
  `02_agent_architecture.md` (peer-challenge leads with OpenAI deliberately).
  All models env-overridable; pricing table centralised for `getCost`.
- `anthropic.ts` — Anthropic adapter with system-prompt caching headers and
  role-based model selection.
- `openai.ts` — OpenAI adapter (fallback family; primary for peer-challenge).
- `index.ts` — router that selects the provider for a role and **fails over
  per-call** (not per-scan) on retryable errors, emitting one audit record per
  call to the injected sink. Providers are injectable for testing.

### Deliverable 3 · R2 storage adapter (`src/storage/`)

- `types.ts` — `StorageProvider` interface (`getUploadUrl`, `getDownloadUrl`,
  `getObject`, `deleteObject`, `headObject`) + deterministic object-key builder
  (`proj/{project_id}/disc/{discipline}/{sha256}.{ext}`).
- `r2.ts` — R2 adapter via `@aws-sdk/client-s3`: presigned single-PUT upload
  URLs, presigned multipart for files >5 MB, 1-hour download URLs, ranged reads
  for streaming PDFs, and SHA-256 verify-on-completion.
- `convex.ts` — Convex-native fallback for small artefacts (wraps an injected
  Convex storage context, since Convex storage is only reachable inside a Convex
  function).
- `index.ts` — selector routing by file size (≥100 MB → R2, smaller → Convex;
  threshold env-overridable).

### Deliverable 4 · Local dev setup

`package.json`, `tsconfig.json` (strict + `noUncheckedIndexedAccess`),
`convex.json`, `.env.local.example`, `.gitignore`, `.prettierrc.json`,
`.prettierignore`, `eslint.config.js`, and a developer-setup section appended to
`README.md`. A `logger` abstraction (`src/lib/logger.ts`) is the only sanctioned
`console` sink.

### Deliverable 5 · Smoke test (`tests/smoke.test.ts`)

Runs the Convex schema + functions in-process via `convex-test`: creates a
project, adds a document, calls the LLM router (injected fake provider — no
network/keys), inserts and reads back a finding, and asserts the `audit_log`
LLM-call entry was written. Adds a unit-level OpenAI-failover test and a
guardrail test (locked disclaimer exported; banned-verb scanner works).

### Guardrails (DoD items)

`src/lib/guardrails.ts` exports the **locked disclaimer verbatim** from
`08_guardrails.md` as `LOCKED_DISCLAIMER`, plus `BANNED_VERBS`/`BANNED_NOUNS`
and a `findBannedTerms()` validator for the future pre-release check. No banned
verbs appear in code comments, error messages, or generated output.

---

## Definition of Done — status

| DoD item | Status | Notes |
|---|---|---|
| Deliverables 1–5 implemented | ✅ | |
| `tsc --noEmit` zero errors (strict) | ✅ verified | See "Verification" below |
| `npx convex dev` deploys schema cleanly | ⏳ needs Liam | Requires Convex cloud login (not available in the build sandbox) |
| Smoke test passes | ✅ verified | 3/3 passing |
| LLM adapter calls Anthropic with a trivial prompt | ⏳ needs Liam | Requires `ANTHROPIC_API_KEY` — run locally |
| LLM adapter fails over to OpenAI on forced-fail | ✅ verified (unit) | Live cross-provider failover needs both keys |
| R2 adapter generates a working signed upload URL | ⏳ needs Liam | Single-PUT presign is local; needs R2 creds to exercise |
| Data-minimisation review | ✅ | Customer tables hold only required fields; doc content is never copied into feedback rows |
| Locked disclaimer exported as a constant | ✅ | `LOCKED_DISCLAIMER` |
| No banned verbs in code/comments/output | ✅ | enforced by `findBannedTerms` + reviewed |

### Verification performed in the build environment

- `npm install` — OK (242 packages)
- `npx tsc --noEmit` — **0 errors** (strict mode)
- `npx vitest run` — **3/3 tests pass**
- `npx eslint` — **0 errors**
- `npx prettier --check` — clean

The three ⏳ items are live-credential / cloud gates. They cannot run in the
ephemeral build sandbox (no Convex login, no provider/R2 keys, restricted
network). The code is written to pass them; run them locally with `.env.local`
populated:

```bash
npm install
npx convex dev          # deploys schema + writes src/convex/_generated/
npm run typecheck
npm test
```

---

## Deviations from the spec (with rationale)

1. **Project root location.** The kickoff tree shows `verifiq26/` as the app
   root. The repo already had `verifiq26/src/package.json`; I created the
   canonical `package.json`/`tsconfig.json`/`convex.json` at `verifiq26/` (per
   the spec tree) and moved the old `src/package.json` to
   `src/_legacy_poc/package.json.bak`.

2. **Archived pre-existing POC code.** The repo already contained a *different*
   schema (`src/convex/schema.ts` was the GovIQ `sp_dr_*` design-review schema
   for the Rathbeale Road project) and Phase-2+ POC actions/lib (`classify`,
   `scan`, `coordinate`, ZIP `uploads`, an `anthropic-client`). These contradict
   the Phase 1 brief (which says *build the VerifIQ MVP schema* and *do not build
   agents/orchestrator*) and referenced tables/functions that don't exist, so
   they broke `tsc`/`convex dev`. **Nothing was deleted** — they were moved to
   `src/_legacy_poc/` (recoverable in git) and excluded from the build. **Please
   confirm this is the right call**; if any of that POC should be carried
   forward, say so and I'll fold it into Phase 2.

3. **Adjudicator default model.** `02` allows "Opus, or Sonnet with an explicit
   adjudicator system prompt." The default is Sonnet, overridable via
   `ANTHROPIC_MODEL_ADJUDICATOR` to point at a higher-reasoning model without a
   code change.

4. **`audit_log` writes via Convex mutation.** Per `20`, the LLM router does not
   write to Convex directly; it emits to an injected `AuditSink`, wired to the
   `logLlmCall` mutation. This keeps the adapter free of a Convex dependency and
   keeps audit writes atomic across action retries.

5. **`_generated` stand-in (build sandbox only).** To run `tsc`/`vitest` without
   Convex cloud access, I generated the standard `src/convex/_generated/` files
   locally. They are **gitignored** (not committed) and are overwritten by your
   real `convex dev`/`convex codegen`.

---

## Open questions for Phase 2

1. **Convex per-blob limit / EU residency / egress** — the support email in
   `docs/27` should be sent; the storage router threshold (currently 100 MB) is
   set from that decision but the answer firms it up.
2. **Legacy POC** — keep archived, or port any of `classify`/`scan`/extraction
   into the Phase 2 agents + job queue?
3. **`projects` intake modelling** — core Stage-1 fields are columns; the
   long-tail questionnaire (sleeping risk, HIQA/MHC/Tusla relevance, etc.) is
   designed for `intake_answers` key/value. Confirm the split is acceptable, or
   promote specific booleans to columns for indexing.
4. **Real model IDs** — defaults are env-overridable placeholders; confirm the
   exact production model IDs and EUR pricing for `getCost`.

---

## Time spent

Single focused build session: read the 11 required docs, archived the
conflicting POC, implemented Deliverables 1–5, and verified
typecheck/tests/lint/format green.

## Estimated Phase 2 readiness

**Ready**, pending the three live-credential gates above (Convex deploy,
Anthropic live call, R2 signed-URL exercise) — all expected to pass once
`.env.local` is populated. No architectural blockers. The schema, LLM router,
and storage router give Phase 2 (the six MVP agents) a clean foundation to build
on.

---

*Awaiting Liam's sign-off (and a decision on the archived POC) before Phase 2.*
