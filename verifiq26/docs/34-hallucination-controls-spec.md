# 34 · Hallucination Controls, Intake Policy & Corpus Pipeline

**Status:** Draft v1.0 · 2026-06-11
**Owner:** Liam (liam@goviq.ie)
**Companion to:** `33-pretender-risk-intelligence-prd.md` · extends `05_output_schemas.md`, `13_agent_self_check_protocol.md`, `15_lessons_learnt_loop.md`

Three parts: (1) human verification flags, (2) document intake policy, (3) token-efficient corpus pipeline. They interlock — the intake policy guarantees a text layer, the pipeline preserves page anchors, and the flags depend on both to make verification mechanical.

---

## 1 · Verification flags

### 1.1 Pipeline position

```
agent output
  → schema validation (reject malformed)
  → mechanical citation check (code, not LLM: fuzzy-match quote vs extracted page text)
  → adversarial verifier (second model, cited page only, "does this support the claim?")
  → flag assignment
  → human queue (flagged items) / clean queue (unflagged)
  → export gate (flag rules below)
```

A finding with a blocking flag **cannot be exported**. This is enforced in the export code path, not by reviewer discipline.

### 1.2 Flag taxonomy

Add to Finding object (§05.1): `flags: ["string"]`, `verification_state: "Verified | Flagged | Quarantined"`, `citation_match_score: 0-100`.

| Flag | Trigger | Human action required | Export rule |
|---|---|---|---|
| `CITATION_UNVERIFIED` | Quote fails mechanical match after 2 repair retries | None — not human-fixable | **Quarantined. Never exports.** Logged for telemetry |
| `CITATION_FUZZY` | Match score 85–97 (exact ≥98) | View source page side-by-side with highlighted quote; Confirm or Reject | Blocks export until confirmed |
| `VERIFIER_DISPUTED` | Adversarial verifier says cited page does not support the claim | Arbitrate: read page, uphold finding or kill it; rationale mandatory | Blocks export until arbitrated |
| `INFERENCE` | Finding has no single direct quote — derived from 2+ sources | Review all linked quote_ids; confirm the chain holds | Blocks export until confirmed |
| `NUMERIC_CLAIM` | Finding contains transcribed numbers (dimensions, sums, counts, clause numbers) | Digit-check against highlighted source | Blocks export until confirmed |
| `CROSS_DOC` | Discrepancy claim spans 2+ documents | Both citations must individually verify; human views both pages | Blocks export until confirmed |
| `VISION_DERIVED` | Any claim sourced from a drawing image (title-block fields only — see §3.5) | Confirm against title-block thumbnail | Blocks export until confirmed |
| `LOW_CONFIDENCE` | Agent self-reports confidence < 0.7, or verifier confidence is marginal | Standard review; may downgrade to Advisory | Exports only with reviewer confirmation |
| `STALE_REV` | Citation targets a document superseded by an addendum (supersession chain, PRD §7) | Re-point citation to current rev or mark finding addendum-affected | Blocks export until resolved |
| `ABSTAIN_ADJACENT` | Agent flagged the area as "could not fully assess" | Decide: human review of that section, or record as scope limitation in report | Non-blocking; appears in report limitations section |

### 1.3 Human verification UX (requirements)

- **Side-by-side viewer:** finding text left, source PDF page right with the matched quote highlighted at stored char offsets. Target: <30 seconds per flag resolution.
- **One-keystroke actions:** Confirm / Reject / Edit-and-confirm. Every action writes to `audit_log` with reviewer initials.
- **Queue ordering:** blocking flags first, ordered by risk rating, then cost_exposure_band.
- **No bulk-confirm.** Flags are confirmed individually. Bulk operations defeat the control and will fail an audit.
- **Telemetry dashboard:** weekly flag rates per agent per flag type. A rising `CITATION_UNVERIFIED` rate is the early warning that a model/prompt/corpus change broke grounding — alert at 2× trailing-4-week baseline.

### 1.4 What this buys

Fabricated evidence becomes structurally non-exportable (Class 1, eliminated mechanically). Misinterpretation (Class 2) is funnelled into a short, ordered human queue instead of hiding in a 300-finding register. The auditable claim: *every exported finding either passed exact citation match or carries a named reviewer's confirmation in the audit log.*

---

## 2 · Document intake policy

### 2.1 Policy statement (customer-facing)

> VerifIQ accepts **native PDF documents only** — files exported directly from authoring software (CAD, Word, spec tools) with a machine-readable text layer. **Scanned documents, photographs of documents, and raster-image PDFs are not accepted.** Files that fail the intake gate are listed in the intake report with the reason; the pack is processed only on the accepted set, and the report records the exclusion as a scope limitation.

Rationale (internal): OCR on scans produces unreliable text, which silently corrupts the mechanical citation check — the foundation of every control in §1. A wrong OCR'd character can both create false findings and mask real ones. PDF-only is not a convenience; it is a precondition of the verification guarantee.

### 2.2 Intake gate (per file, per page — deterministic code)

1. **Decrypt/validity check:** password-protected, corrupt, or XFA-form PDFs → reject (`REJECT_UNREADABLE`).
2. **Text-layer test per page:** extract text; compute chars-per-page and image-area ratio. Page fails if chars < 50 AND image coverage > 70% (tunable; drawings legitimately have low text density — see step 4).
3. **Scan heuristics:** single full-page image object, JBIG2/CCITT fax compression, skew detection → mark page as scanned.
4. **Classification fork:** pages classified as *drawings* (title-block detected, vector content present) are exempt from the text-density threshold but must be **vector PDFs** — rasterized drawing scans are rejected like any scan.
5. **File verdict:** >10% of pages scanned/failed → `REJECT_SCANNED`. Otherwise accept; any individually failed pages are listed as excluded pages.
6. **Manifest entry:** every file gets Accepted / Rejected(reason) + sha256 + page count in the intake report.

### 2.3 Turn rejections into product

When tender-pack files are rejected as scans, auto-draft a **native-file re-issue request** to the contracting authority (it is a legitimate tender query: "Drawing X issued as raster scan; please re-issue native PDF to permit accurate pricing"). The intake gate thus feeds the F1 RFI generator instead of being a dead end. Buyers under CWMF transparency expectations generally comply.

### 2.4 Explicit non-capability

No OCR fallback in v1. If a customer insists on processing scans, the answer is no — a degraded-mode tier would carry the VerifIQ name on unverifiable output. Revisit only if rejection telemetry shows >25% of real packs blocked (then spec a separate, clearly-labelled OCR tier with its own disclaimer).

---

## 3 · Corpus pipeline — token-efficient scanning

### 3.1 Principle

**Tokens are spent on reasoning, never on parsing.** All extraction is deterministic code (free, repeatable, testable). The LLM sees a cleaned, structured, page-anchored markdown corpus — and only the slices it needs.

### 3.2 Pipeline

```
native PDF (accepted at intake)
  1. Extract   — PyMuPDF: per-page text + char offsets + fonts/positions. Stored raw. Zero tokens.
  2. Clean     — strip repeated page furniture (headers/footers/borders detected by
                 cross-page repetition), dehyphenate, normalise whitespace.
  3. Structure — heading detection (font size/weight/numbering patterns) → md headings;
                 tables → md tables (pdfplumber lattice/stream); lists preserved.
  4. Chunk     — split on section boundaries (~2–4k tokens/chunk) with YAML front-matter:
                 doc_id, sha256, source_pages: [n..m], section_ref, chunk_id.
  5. Anchor    — every md line maps back to (page, char_offset) in the raw extraction.
                 This mapping is what makes the §1 citation check work from md.
  6. Index     — chunk_id → manifest registry; embeddings optional later, deterministic
                 routing first (see 3.3).
```

Output: one `.md` corpus per pack, chunked, hashed, page-anchored. The raw per-page extraction is retained as the citation ground truth — **the mechanical check always verifies against raw extraction, never against the cleaned md** (cleaning must not be able to manufacture a match).

### 3.3 Routing — the bigger token lever than format

Format conversion saves 2–4×; **selective retrieval saves 10–50×.** Agents never receive the whole pack:

- The document manifest (classifier output) routes chunks by discipline and doc type: the Fire agent gets fire strategy + relevant spec sections + relevant GA chunks, not the landscape spec.
- The Coverage Mapper (PRD §04.15) iterates spec-section-by-section: one section's chunks + the pricing-document index per call.
- The Prelims Checklist agent (§04.16) runs per checklist item against a keyword-prefiltered chunk set.

### 3.4 Prompt caching

The static prefix — system prompt, agent prompt, corpus rules, checklist — is identical across hundreds of calls per pack. Use Claude prompt caching on this prefix: cached input tokens are ~10× cheaper. Structure every agent call as `[cached: prompts + rules] + [variable: chunk slice + task]`. This alone keeps the §12 MVP cost targets (<€5 free / <€30 paid per scan) achievable.

### 3.5 Drawings — never rasterize whole sheets into the context

- Title-block crop only (deterministic: bottom-right region or detected block) sent as image for classification → drawing_number, rev, date, title. Cross-checked against vector text layer.
- Drawing *text* (notes, schedules on drawings, legends) comes from the vector text layer like any document — it's searchable text, not vision.
- Full-sheet vision calls are forbidden in v1 (per PRD non-goals); a full A1 sheet at readable DPI costs ~1.5–2k vision tokens and produces claims we cannot mechanically verify.

### 3.6 Indicative economics (200-page spec document)

| Approach | Approx. input tokens | Relative cost |
|---|---|---|
| Page images to vision model | 300k–400k | 20–30× |
| Raw extracted text, whole doc per call | ~150k | 10× |
| Cleaned md, whole doc per call | ~100k | 7× |
| Cleaned md + routed chunks per agent call | 10–30k | **1× (baseline)** |
| + prompt caching on static prefix | — | further ~3–5× off blended rate |

Numbers are planning-grade; validate on the Hunt pack in Sprint 1 and record actuals in the cost telemetry.

### 3.7 Build order

1. Sprint 1: extract + clean + chunk + anchor (steps 1–5), manifest routing for the six agents, prompt caching. Citation check wired to raw extraction.
2. Sprint 2: structure-aware tables (pricing docs need this for F3), per-section Coverage Mapper loop.
3. Later: embeddings retrieval only if deterministic routing proves insufficient (measure first).

---

## 4 · Acceptance criteria

- Intake: a test set of 20 files (native, scanned, hybrid, encrypted, raster-drawing) classifies with zero false accepts of scans; intake report lists every rejection with reason.
- Pipeline: round-trip test — for 100 random md lines, the page/offset anchor resolves to raw text containing that line's content.
- Citation check: seeded test — 20 findings with deliberately corrupted quotes are 100% caught (`CITATION_UNVERIFIED`); 20 genuine quotes pass at ≥98 score.
- Flags: export attempt with any blocking flag fails at the code level (unit test, not policy).
- Cost: full Hunt pack scan lands within MVP cost targets; actuals logged.

---

*One sentence: deterministic extraction guarantees the ground truth, routing and caching keep tokens for reasoning, the intake gate refuses anything that would break verification, and no claim leaves the system unverified or unconfirmed.*
