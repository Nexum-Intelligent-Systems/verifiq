# VerifIQ — Data Consolidation Plan

**Version:** v0.1
**Generated:** 2026-06-19
**Owner:** Liam McDonagh
**Status:** draft — supersedes the compliance-product stack question in `verifiq26/docs/27-stack-decision-storage-and-platform.md` and overrides `docs/architecture-adr.md` *for the VerifIQ compliance product only* (FMIQ unchanged).

---

## 1. Decision (locked)

| Decision | Value |
|---|---|
| Canonical compliance app | **`verifiq-app`** (Convex) — gate engine, deliverables, traceability anchors already built |
| Target stack | **Convex** |
| `Document-Parser-ss` | **Dropped.** Salvage only its versioning fields + Findings/Actions concept |
| `CODE/VerifIQ/app` (FMIQ) | **Stays a separate product** (Postgres/Azure, EU residency). NOT merged. Its sensor/CSV ingestion is domain-specific and not reused |
| `corpus/` (standards md + checks YAML) | **Canonical, database-neutral content** — the single source of truth for the review methodology |

## 2. The governing principle — merge data, not code

The two systems share a name, not a runtime. Convex and Postgres share no validators, auth, or function model, so **there is no code merge.** What *is* portable is the content:

- standards prose, clause anchors, the ~500 checks, the 27 Standards Packs, the systems/anchors DataModel, and the Findings Registers.

All of that consolidates into `corpus/` (md + YAML), which is DB-agnostic, then seeds **once** into Convex. This is the entire "merge": **fan every dataset into the corpus, then seed the corpus into verifiq-app.**

```
verifiq-app tables ─┐
DataModel.xlsx ─────┤
Standards_Packs ────┼──►  corpus/ (md + YAML, canonical)  ──seed──►  verifiq-app (Convex)
Findings Registers ─┤        standards/  checks/  packs/                 tables + pipeline
Document-Parser ────┘        (DB-neutral source of truth)
```

## 3. Source → target mapping

| Source artefact | Lives in (today) | Consolidates to | Becomes (Convex) |
|---|---|---|---|
| `traceabilityAnchors` (clauseRef, framework, description) | verifiq-app Convex | `corpus/standards/<code>.md` `## §clause` anchors | `standards` + `standardClauses` |
| Standards_Packs (27 packs, 939 doc map) | `PACK_DOCUMENT_MAPPING.xlsx` + folders | `corpus/standards/*` frontmatter `packs:` + a `packs/` index | `standardsPacks` + `standardDocuments` |
| DataModel `Systems_Master` / `Traceability_Anchors` | `VerifIQ_DT_Tracker_DataModel.xlsx` | check `module:` activation groups + anchors | `systems` (exists) + `checkCatalogue.module` |
| The ~500 checks | `corpus/checks/**/*.yaml` (started) | stays — expand per discipline | `checkCatalogue` |
| Findings Registers v0.1–v0.8 | `CODE/VerifIQ/*.xlsx` | `corpus/fixtures/golden/*` | regression fixtures (not a prod table) |
| Document-Parser versioning + Findings/Actions | `Document-Parser-ss` (Convex) | schema concept only | `findings` + `actions` tables |
| Source PDFs (3,021 files, 5.4 GB) | `Design Team/Standards_Packs/` | **stay binary** | blob/SharePoint pointer rows only — never converted to md for storage |

## 4. New Convex tables to add to verifiq-app

verifiq-app has the *review* spine but no *corpus* spine. Add these (one PR, with `_generated/` regen):

1. `standards` — one row per standard **version** (code, title, issuingBody, versionLabel, effectiveFrom/To, status, supersededById, sourceUrl). Fixes the dead-code/versioning gap (ET 101 → I.S. 10101:2020; TGD B 2024).
2. `standardClauses` — clause-level anchors (`standardId`, `clauseRef`, `anchor`, `text`). This is what `traceabilityAnchors` should have been; migrate anchors here.
3. `standardsPacks` — the 27 packs (code, name, type Core/Conditional/System, activation rule).
4. `standardDocuments` — source-PDF registry (packId, title, version, sha256, blobUrl, confidence). ~939 rows, scripted import.
5. `checkCatalogue` — the executable checks (id, title, discipline, appliesTo, question, authority[clauseAnchors], severity, evidenceKind, crossRef, module). Seeded from `corpus/checks/`.
6. `findings` — per-review finding (reviewId, checkId, status found|clean|na|insufficient_evidence, severity, governingEvidence, downstreamEvidence, sourceRefs, recommendedAction).
7. `actions` — remediation tasks closing findings (verifiq-app has neither findings nor actions today).

These slot beside the existing `systems`, `deliverableTemplates`, `gateReviews`, `igSubmissions` — they do not replace them.

## 5. Phased sequence

- **Phase 0 — Freeze & inventory (0.5 day).** Tag `Document-Parser-ss` read-only. Confirm `corpus/` is the only place new standards/checks get authored from here on.
- **Phase 1 — Schema (1–2 days).** Add the 7 tables to verifiq-app `convex/schema.ts`; regenerate `_generated/`; typecheck. *(I can produce this now.)*
- **Phase 2 — Corpus consolidation (ongoing, demand-driven).** Author `standards/*.md` only as checks need them (do NOT bulk-convert 3,021 PDFs). Migrate `traceabilityAnchors` → `standardClauses`. Encode the 27 packs. Expand `checks/` per discipline toward the 500.
- **Phase 3 — Seed script (1 day).** `corpus/` (md+YAML) + `PACK_DOCUMENT_MAPPING.xlsx` → Convex tables. Keep `confidence` as a column so low-confidence rows surface for human review.
- **Phase 4 — Ingestion + pipeline (the part you like, rebuilt native).** A Convex `action` ingests a tender pack (PDF), classifies documents, runs `checkCatalogue` against them, writes `findings`. This is the corpus README's "Engine B." FMIQ's CSV/sensor ingest is **not** reused — different evidence type.
- **Findings Registers** become the golden fixtures the pipeline is scored against (README's "what I validate by hand is exactly what ships").

## 6. The website

"The website you like" (the FMIQ React/Vite SPA and/or `verifiq26`) is presentation, not data. Whichever look you want lives on top of verifiq-app's Convex backend — port the *visual language* (`docs/design-language-lumen.md`, `design-system.md`), not the Postgres-bound code. Treat it as a UI re-skin task, separate from this data merge.

## 7. Reconciliation debts (log as ADRs — do not fix mid-merge)

1. **Auth divergence.** verifiq-app uses **Clerk**; FMIQ uses **Entra**; GovIQ-Main uses **NextAuth/Azure AD + Convex auth**. For HSE/public-sector, Entra is the likely endpoint. Log; don't refactor now.
2. **Data residency.** FMIQ's `architecture-adr.md` rejected Convex on EU-residency grounds. You chose Convex for the compliance product — **verify Convex's EU data-region posture against HSE requirements** before pilot, or scope what data may not sit in Convex.
3. **Audit shape.** verifiq-app's `auditLog` ≠ GovIQ-Main's `gov_auditEvents` hash chain. Align if VerifIQ ever folds into the GovIQ spine.
4. **Stale decision docs.** Update `verifiq26/docs/27-stack-decision...` and FMIQ `architecture-adr.md` to point at this plan for the compliance product.

## 8. What NOT to do

- Do **not** copy Convex tables into the Postgres app or vice versa.
- Do **not** bulk-convert the 5.4 GB of PDFs to markdown. Author `standards/*.md` on demand; PDFs stay binary behind pointers.
- Do **not** hand-author the 500 checks or the 939 document rows — derive checks into YAML, script the registry import.
- Do **not** keep evolving `Document-Parser-ss`.

---

**Next step:** Phase 1 — write the 7 tables into verifiq-app's `convex/schema.ts` and regenerate. Say the word.
