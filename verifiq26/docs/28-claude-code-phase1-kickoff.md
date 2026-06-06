# VerifIQ — Claude Code Phase 1 Kickoff Prompt

**Doc ID:** `verifiq-cc-phase1-v0.1`  
**Purpose:** Copy-pasteable prompt for Claude Code to begin the Phase 1 build of the VerifIQ application. Self-contained — incorporates every architectural decision we've made.  
**Date:** 2026-06-01

---

## How to use this

1. **Copy the entire `verifiq26/` repo** (or whatever target repo you've set up) to your local machine.
2. **Open it in Claude Code** (or your IDE with Claude Code CLI ready).
3. **Set your environment variables** (see § Required environment variables below).
4. **Paste the prompt** in § "The kickoff prompt" below into Claude Code.
5. **Stay at your laptop** for the first 30 minutes — Claude Code will ask clarifying questions or pause for confirmation. Don't leave it unattended on a major architectural decision.
6. **Review at end of Phase 1** before authorising Phase 2. The Definition of Done in the prompt is the gate.

---

## Required environment variables

Before pasting the prompt, ensure these are loaded in your shell or `.env.local`:

```
# AI providers
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...

# Convex (will be filled in by `npx convex dev` first run)
CONVEX_DEPLOYMENT=...
NEXT_PUBLIC_CONVEX_URL=...

# Cloudflare R2 (from your R2 bucket — see docs/27)
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=verifiq-prod-eu-west
R2_PUBLIC_URL=https://verifiq-prod-eu-west.r2.dev   # or your custom domain

# Clerk (for auth — set up later in Phase 2, optional for Phase 1)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

If you don't yet have R2 set up, run through `docs/27-stack-decision-storage-and-platform.md` § "What to do this week" first — 30 minutes including bucket creation.

---

## The kickoff prompt

Paste everything between the `---START---` and `---END---` markers into Claude Code. The markers themselves are NOT part of the prompt.

---START---

You are tasked with building **Phase 1** of VerifIQ — an Irish pre-build compliance review platform. The full project specification lives in this repo. Your job is to read it, then implement the foundation.

## Repository overview

The repo at the working directory contains:

- `verifiq-prompts/` — the canonical specification (24 files: README + CLAUDE.md + 01–21 numbered + 19 cross-reference)
- `docs/` — strategic and operational documents (27 numbered files)
- `website/` — the customer-facing marketing site (already built — do not modify)
- `evidence/` — sample data for testing including a 327-finding validation pack
- `PROJECT_PLAN.md` — pinned master schedule with the 12-week build programme

## Required reading — in this order, before writing any code

1. `verifiq-prompts/CLAUDE.md` — top-level agent instructions
2. `verifiq-prompts/README.md` — orientation and table of contents
3. `verifiq-prompts/12_mvp_scope.md` — the seven features + seven platform mandatories
4. `verifiq-prompts/01_master_system_prompt.md` — core product identity
5. `verifiq-prompts/02_agent_architecture.md` — the multi-agent Council structure
6. `verifiq-prompts/05_output_schemas.md` — the JSON schemas you MUST conform to
7. `verifiq-prompts/13_agent_self_check_protocol.md` — every agent's pre-emit checks
8. `verifiq-prompts/20_platform_architecture.md` — platform spec including upload, job queue, classifier, observability, CI/CD
9. `PROJECT_PLAN.md` § "Build Programme — 12 Weeks to First Paid Pack" — your timeline
10. `docs/27-stack-decision-storage-and-platform.md` — the locked Convex + R2 hybrid decision
11. `verifiq-prompts/16_issuance_commands.md` § "Phase 1 — Skeleton + schema only" — the canonical Phase 1 brief

Read all eleven. Do not skim.

## Architectural decisions locked — do not propose alternatives

- **Backend:** Convex (database + functions + reactive queries + scheduled jobs)
- **File storage:** Cloudflare R2 (S3-compatible, zero egress, EU region)
- **Frontend:** Next.js 14 App Router on Vercel
- **Auth:** Clerk (multi-tenant)
- **Billing:** Stripe + Stripe Tax (Phase 2 wiring)
- **Email:** Resend (Phase 2 wiring)
- **LLM provider primary:** Anthropic Claude (Sonnet for review, Haiku for classification, vision-capable Sonnet for title-block extraction)
- **LLM provider fallback:** OpenAI GPT-4-class
- **Region:** Convex EU-West, R2 EU jurisdiction
- **Auth library for Phase 1:** can defer real Clerk integration if it blocks progress; use stub auth + a `current_user_id` query param for local development

If anything in the spec contradicts these decisions, the decisions win. Raise it with me before changing anything.

## Phase 1 scope — build only this, nothing else

This is the **schema + LLM adapter + R2 storage adapter** phase. Do NOT build agents, do NOT build UI, do NOT build the workflow orchestrator. Those come in Phase 2+.

### Deliverable 1 · Convex schema

Create `src/convex/schema.ts` defining all tables required for VerifIQ MVP. The schema must conform exactly to the JSON shapes in `verifiq-prompts/05_output_schemas.md` § 05.4. Tables:

- `users` (linked to Clerk user_id eventually; for Phase 1, a stub)
- `projects` — core project record (the 17 intake fields)
- `intake_answers` — key-value pairs from the project intake form
- `documents` — uploaded files. Include BOTH `convex_storage_id` (optional) AND `r2_key` (optional) per `docs/27` schema pattern. Other fields: filename, sha256, size_bytes, discipline, doc_type, drawing_number, revision, date, status, stage, author, classifier_confidence
- `modules` — activated regulatory modules per project
- `findings` — the atomic finding object per `05_output_schemas.md` § 05.1. Include all fields listed there.
- `finding_interfaces` — many-to-many: which findings interface with which disciplines
- `challenges` — peer challenge records
- `adjudications` — adjudicator decisions
- `discipline_summaries` — one per discipline per project per `05_output_schemas.md` § 05.2
- `reports` — Build Readiness Report records per `05_output_schemas.md` § 05.3
- `report_findings` — many-to-many: which findings appear in which report sections
- `audit_log` — every state transition. Include: entry_id, project_id, actor, action, target_type, target_id, payload_json, occurred_at
- `jobs` — the job queue table per `20_platform_architecture.md` § 2
- `findings_feedback` — customer rejection feedback per `verifiq-prompts/14_feedback_taxonomy.md`
- `prompt_versions` — version registry for the lessons-learnt loop per `verifiq-prompts/15_lessons_learnt_loop.md`
- `inference_cache` — LLM call cache keyed by `hash(model + prompt_version + document_sha256 + agent_id + corpus_version)`

All tables must:

- Use Convex's `defineTable()` and `v.*` validators
- Have appropriate indexes (especially on project_id, status, discipline, sha256)
- Conform to TypeScript strict mode

Generate the corresponding TypeScript types as a separate file: `src/types/index.ts` — these must mirror the schema exactly. Use the standard Convex pattern (`Doc<"findings">` etc.).

### Deliverable 2 · LLM provider adapter

Create `src/llm/` directory with:

- `src/llm/types.ts` — interface `LLMProvider` with methods: `complete(role, prompt, options)`, `completeVision(role, image_buffer, prompt, options)`, `getCost(role, tokens)`
- `src/llm/anthropic.ts` — Anthropic adapter using `@anthropic-ai/sdk`. Implement prompt caching headers for system prompts. Default models: Sonnet for review roles, Haiku for classification, vision-Sonnet for title-block extraction.
- `src/llm/openai.ts` — OpenAI adapter using `openai` SDK. Default model: GPT-4-class for peer challenge role.
- `src/llm/index.ts` — provider selector that reads env vars to determine primary vs fallback. Fails over per-call (not per-scan) on retryable errors.
- `src/llm/config.ts` — role-to-provider mapping per `verifiq-prompts/02_agent_architecture.md` § Multi-LLM configuration.

The adapter must:

- Accept a "role" string (e.g., "classification", "discipline-primary-review", "peer-challenge", "adjudicator", "council-chair", "title-block-extraction")
- Look up the configured provider for that role
- Call the right provider with the right model
- On retryable error (rate limit, network), retry on fallback provider
- Return a structured result: `{ text, tokens_in, tokens_out, model_used, provider_used, cost_eur, latency_ms }`
- Log every call to `audit_log` via a Convex mutation

### Deliverable 3 · R2 storage adapter

Create `src/storage/` directory with:

- `src/storage/types.ts` — interface `StorageProvider` with methods: `getUploadUrl(file_meta)`, `getDownloadUrl(key)`, `getObject(key)`, `deleteObject(key)`, `headObject(key)`
- `src/storage/r2.ts` — R2 adapter using `@aws-sdk/client-s3` configured for R2's endpoint
- `src/storage/convex.ts` — fallback Convex-native storage adapter (for small artefacts like generated reports)
- `src/storage/index.ts` — selector that routes by file size: files >100MB go to R2, smaller go to Convex (decision-aware per `docs/27`)

The storage layer must:

- Generate signed upload URLs for direct browser-to-R2 upload (tus.io compatible)
- Generate signed download URLs with 1-hour expiry
- Support range requests for streaming PDF reads
- Handle multipart uploads for files >5MB
- Compute SHA-256 on upload and verify on completion

### Deliverable 4 · Local dev setup

- `package.json` with all dependencies pinned
- `tsconfig.json` for strict TypeScript
- `convex.json` for Convex configuration
- `.env.local.example` with placeholder values for every required env var
- `README.md` (in the new code, not the prompt-pack README) with: prerequisites, `npm install`, `npx convex dev`, how to run the type-check
- `.gitignore` covering Convex generated files, env files, node_modules

### Deliverable 5 · A single end-to-end smoke test

Write `tests/smoke.test.ts` that:

1. Creates a test project via the schema
2. Adds a fake document record
3. Calls the LLM adapter with a trivial prompt ("respond with the word 'OK'")
4. Verifies a finding can be inserted and read back
5. Verifies the audit_log entry was written

This proves the foundation works before we add complexity.

## Phase 1 Definition of Done

You may declare Phase 1 complete when ALL of these are true:

- [ ] All Deliverables 1–5 above are implemented
- [ ] `npx tsc --noEmit` passes with zero TypeScript errors in strict mode
- [ ] `npx convex dev` starts cleanly and the schema deploys to a preview Convex environment
- [ ] The smoke test in `tests/smoke.test.ts` passes
- [ ] The LLM adapter successfully calls Anthropic with a trivial prompt
- [ ] The LLM adapter falls over to OpenAI when given a forced-fail scenario
- [ ] The R2 adapter generates a working signed upload URL
- [ ] No customer-data table holds anything not strictly required (data minimisation review)
- [ ] The locked disclaimer string (from `verifiq-prompts/08_guardrails.md`) is exported as a constant for later use
- [ ] No banned verbs (per `verifiq-prompts/08_guardrails.md`) appear in any code comments, error messages, or generated output

When all checked, stop. Write a one-page summary in `docs/29-phase1-completion.md` listing:

- What was built
- Any deviations from this spec (with rationale)
- Any open questions for Phase 2
- Time spent
- Estimated Phase 2 readiness (any blockers)

Then wait for my sign-off before starting Phase 2.

## Anti-patterns — explicit refusals

Do not do any of the following:

- ❌ Inline prompts in source code. Prompts live in `verifiq-prompts/`. Code reads them at startup.
- ❌ Hardcode LLM provider names in non-adapter code. Always go through the `LLMProvider` interface.
- ❌ Hardcode storage location in non-adapter code. Always go through the `StorageProvider` interface.
- ❌ Add an "AI chat" interface for users to ask questions about findings. The product is a Council, not a chatbot.
- ❌ Add a "compliance score 0–100." Banned permanently per `verifiq-prompts/08_guardrails.md`.
- ❌ Skip schema indexes "for now." Add them in Phase 1; retrofitting on a live table is painful.
- ❌ Skip the audit_log writes "for the smoke test." The audit log is the customer trust artefact — it must work from day 1.
- ❌ Start building the discipline agents. Phase 2.
- ❌ Start building the UI. Phase 2.
- ❌ Start building the workflow orchestrator. Phase 2.
- ❌ Wire up Stripe billing. Phase 2.
- ❌ Wire up Resend email. Phase 2.

## File output structure

Place all generated code under `src/` and `tests/`. Do not modify `verifiq-prompts/`, `docs/`, `website/`, or `PROJECT_PLAN.md` except to create `docs/29-phase1-completion.md` at the end.

Final tree under the repo root should look like:

```
verifiq26/
├─ src/
│  ├─ convex/
│  │  ├─ schema.ts
│  │  ├─ _generated/  (auto)
│  │  └─ mutations.ts (minimal — only what the smoke test needs)
│  ├─ llm/
│  │  ├─ types.ts
│  │  ├─ anthropic.ts
│  │  ├─ openai.ts
│  │  ├─ config.ts
│  │  └─ index.ts
│  ├─ storage/
│  │  ├─ types.ts
│  │  ├─ r2.ts
│  │  ├─ convex.ts
│  │  └─ index.ts
│  └─ types/
│     └─ index.ts
├─ tests/
│  └─ smoke.test.ts
├─ package.json
├─ tsconfig.json
├─ convex.json
├─ .env.local.example
├─ .gitignore
└─ docs/29-phase1-completion.md  (at end)
```

## Style + quality requirements

- TypeScript strict mode. No `any` unless absolutely necessary (and commented why).
- Every public function has a JSDoc comment describing intent.
- Every file has a header comment with: purpose, references to the spec file it implements, version.
- No `console.log` in committed code; use a `logger` abstraction that wraps Convex's logging.
- Format with Prettier; lint with ESLint default + `@typescript-eslint/recommended`.
- Never commit `.env.local`. Add to `.gitignore`.
- Never hardcode API keys. Always read from env vars.

## Time and pace

The spec estimates Phase 1 takes 1 week of focused work for Claude Code. Hold to that. If you find yourself going down a rabbit hole (e.g., trying to implement a complex queue when the queue isn't part of Phase 1), stop and re-read this prompt.

Pause and ask me before:

- Choosing a different stack component than locked above
- Skipping any Phase 1 deliverable
- Adding any feature not in this prompt
- Making a tradeoff that would create future technical debt I'd later regret

## Begin

Start by reading the 11 required documents listed above. Confirm to me when you've read them by listing one key insight from each. Then propose your implementation order for the 5 deliverables. Then build.

I am the founder. My name is Liam. I'm available for clarifying questions throughout. I'd rather you ask than guess.

---END---

---

## What to expect from Claude Code

**First 30 minutes** — Claude Code will read the required documents and confirm comprehension. It will ask 2–5 clarifying questions. Answer them clearly. Don't push it to start coding until it has read the spec.

**First 2 hours** — schema + types should be done. Review the schema before approving the full Phase 1.

**First day** — LLM adapter + R2 adapter complete and unit-tested.

**First 2–3 days** — everything in the Definition of Done complete.

**End of Phase 1** — review `docs/29-phase1-completion.md` and the `src/` directory. If everything looks right, authorise Phase 2 with the prompt below.

## The Phase 2 kickoff (when Phase 1 is approved)

When you're ready for Phase 2, paste this into a NEW Claude Code session (do not continue Phase 1 session — clean slate):

```
You are continuing the VerifIQ build. Phase 1 (schema + LLM adapter + R2 adapter) is complete and approved.

Read:
1. docs/29-phase1-completion.md (what was built in Phase 1)
2. verifiq-prompts/CLAUDE.md
3. verifiq-prompts/16_issuance_commands.md (the issuance plan — Phase 3 = six MVP agents)
4. verifiq-prompts/04_agent_prompts.md (the six MVP agents: Architect, Fire, Access, M&E, QS, Chair)
5. verifiq-prompts/13_agent_self_check_protocol.md (the pre-emit validator each agent must apply)
6. verifiq-prompts/19_cross_reference_protocol.md (cross-discipline cross-checking)

Phase 2 scope: build the six MVP agents using the LLM adapter from Phase 1. Each agent:
- Loads the master system prompt + the self-check protocol + its discipline prompt
- Implements the 7 self-check questions as a pre-emit validator (rejecting findings missing source quotes)
- Returns Finding objects conforming to verifiq-prompts/05_output_schemas.md § 05.1
- Logs every self-check decision to audit_log

Definition of Done for Phase 2 in verifiq-prompts/16_issuance_commands.md § Phase 3. Do not start the workflow orchestrator (that's Phase 3 of the issuance plan).

Same architectural decisions, anti-patterns, and quality requirements as Phase 1. Same pause-and-ask discipline.

Begin by listing the six agents and confirming you understand each one's discipline scope from file 04.
```

## Suggested kickoff sequence

| Day | Activity |
|---|---|
| **Today** | Send the Convex support email (`docs/27`). Set up R2 bucket. Send first 3 panel-chair outreach messages (`docs/26`). |
| **Tomorrow morning** | Paste the Phase 1 prompt above into Claude Code. Review its 30-min comprehension responses. Approve the implementation order. Let it run for 2 hours, check progress, repeat. |
| **Day 2** | Daily progress check. Review the schema before approving. |
| **Day 3** | Phase 1 should be complete. Review `docs/29-phase1-completion.md`. Approve Phase 2. |
| **Day 4–10** | Phases 2–3 (agents + orchestration). Same pattern: clean session, clear scope, definition of done. |
| **Day 11–14** | Phase 4 (UI). |
| **Day 15+** | End-to-end test on the 327-finding validation pack. |

## What to do if Claude Code drifts

If at any point you see Claude Code:

- Inventing UI before the schema is done → STOP, point to the anti-pattern list, restart the relevant section.
- Adding "smart suggestions" or chat features → STOP, banned per file 12 and this prompt.
- Hardcoding Anthropic-specific calls in non-adapter code → STOP, refactor before continuing.
- Skipping the self-check protocol implementation → STOP, this is the entire point of the system.

Each STOP is cheap. Letting drift compound across phases is expensive.

## When Claude Code is done

You will have:

- A working Convex schema deployed to a preview environment
- An LLM adapter that calls Anthropic with OpenAI failover
- An R2 storage adapter generating signed URLs
- A passing smoke test
- A one-page Phase 1 completion summary
- Confidence to authorise Phase 2

That is the entire Phase 1 deliverable. Eight days of work, done in three.

---

*The kickoff prompt is the single most important artefact in the build — it's the contract between you and the AI engineer. If it's clear and constrained, the build flows. If it's vague or contradictory, weeks burn. Re-read it once more before pasting.*
