# VerifIQ — Development setup (Phase 1)

Phase 1 is the foundation: the Convex **schema**, the **LLM provider adapter**
(Anthropic + OpenAI with per-call failover), the **R2 storage adapter**, and a
single end-to-end **smoke test**. No agents, orchestrator, or UI yet (Phase 2+).

> The product overview lives in `README.md`. Build context and locked decisions
> live in `CLAUDE.md`. This file is just how to run the code.

## Prerequisites

- Node.js ≥ 20
- A Convex account (for `npx convex dev`) — free tier, EU-West region
- API keys for Anthropic and OpenAI
- A Cloudflare R2 bucket + API keys (see `docs/27`)

## Install

```bash
cd verifiq26
npm install
cp .env.local.example .env.local   # then fill in the values
```

## Generate Convex types (required before type-check)

The Convex client/server types live in `src/convex/_generated/` and are **not**
committed (they're git-ignored). Generate them from the schema:

```bash
npx convex codegen          # offline; produces src/convex/_generated/
# or, to deploy the schema to a dev deployment and watch:
npx convex dev
```

`convex.json` points Convex at `src/convex/` for functions.

## Type-check

```bash
npm run typecheck            # tsc --noEmit, strict mode
```

(`_generated/` must exist first — run `npx convex codegen`.)

## Test

```bash
npm test                     # vitest; runs tests/smoke.test.ts
```

The smoke test stubs the LLM providers and presigns R2 URLs offline, so it
needs no API keys or network.

## Lint / format

```bash
npm run lint
npm run format
```

## What still needs live credentials (verify locally)

These Definition-of-Done items can't run in a credential-less CI sandbox:

- A real Anthropic completion call (`ANTHROPIC_API_KEY`)
- A real OpenAI failover call (`OPENAI_API_KEY`)
- A real R2 upload round-trip against a bucket (`R2_*`)
- `npx convex dev` deploying the schema to a preview deployment

See `docs/29-phase1-completion.md` for the full DoD status.
