# 35 · Pre-Tender Risk Intelligence — Product Plan & Roadmap

**Status:** Draft v1.0 · 2026-06-11
**Owner:** Liam (liam@goviq.ie)
**Pilot:** Hunt tender pack — contractor-side QS (Abel)
**Consolidates:** `33-pretender-risk-intelligence-prd.md` (PRD) · `34-hallucination-controls-spec.md` (controls/intake/pipeline) · `14-setup-costs-pricing-council.md` (tiers) · `15-shoestring-bootstrap-ireland.md` (cost base) · `12_mvp_scope.md` (MVP discipline)

This is the umbrella document. It states the strategy, the build sequence, the commercial model, the economics, and the long-range structured-input roadmap in one place. Detailed specs live in docs 33 and 34; this maps how they fit together and when each piece lands.

---

## 1 · The strategic decision (what we are and are not building)

**We are building pre-tender risk intelligence for the contractor's QS — verification, not generation.**

The original ambition was automated takeoff: parse drawings, recognise symbols, measure walls/pipe/steel, output a priceable Bill of Quantities. The evidence killed the generation version for now: frontier vision-language models score 0.09–0.39 on reading doors/windows from line-art (AECV-Bench 2026), full MEP takeoff is unreliable even in dedicated CV products, and an Irish public BoQ must follow ARM4 measurement rules that no tool satisfies. Chasing it dilutes the moat and bets on an unsolved problem.

The defensible product is the verification mirror image: **find every gap, ambiguity, and contradiction across drawings, spec and pricing document before the QS prices the job** — so the contractor removes risk premium, queries before the deadline, prices more competitively, and banks evidence for post-award variations. This reuses the existing VerifIQ council pipeline (classify → discipline review → cross-challenge → adjudicate → report) pointed at a new outcome.

**Value mechanism (why a contractor pays):** under PW-CF1 lump-sum contracts the contractor carries design-gap risk unless queried before tender close. Every gap caught is either a risk premium removed from the bid (more competitive) or a documented position for a later change event (margin protection).

The takeoff dream is not dead — it returns through **structured CAD/BIM input** (§7), which delivers real quantities deterministically and sidesteps the vision problem entirely. That is Phase 3–4+, supply-permitting.

---

## 2 · Feature set (the three tiers of ideas)

### Tier 1 — Direct bid-price impact (build first)

1. **RFI / Tender Query generator (F1)** — every discrepancy auto-drafted as a formal query with verbatim references, ranked by cost exposure, batched before the deadline.
2. **Gap disposition engine (F2)** — triage queue; each finding gets exactly one disposition: *RFI / Price risk / Qualify-Exclude / Hold (post-award)*. Exports a signed tender risk register.
3. **Variation seed bank (F5)** — ambiguities unresolved at close logged contemporaneously with evidence and date, ready to substantiate post-award change events.
4. **Addendum diffing (F4)** — late revisions auto-diffed against superseded docs; affected findings/RFIs/coverage flagged.

### Tier 2 — Speed and robustness

5. **Spec→BoQ coverage matrix (F3)** — every spec section mapped to pricing-document items; uncovered clauses = unpriced scope.
6. **Subcontractor enquiry packs (F6)** — per-trade scope bundles (drawings, spec sections, extracted schedules) so enquiries go out day 2, not week 2.
7. **Prelims & statutory cost catcher (F7)** — checklist sweep for unpriced obligations: BCAR inspections, PSCS duties, temporary works, utility diversions, surveys, commissioning, fire-cert conditions.
8. **Contract amendments scanner (F8)** — ITT + schedule amendments flagged for onerous terms (bond, PI, LDs, caps). Flag-only, no advice.

### Tier 3 — Competitive intelligence (separate specs, later)

9. **Win-price benchmarking** — eTenders award notices → historical award values, competitor patterns, €/m² benchmarks.
10. **Quality submission accelerator** — templatable methodology/programme/safety narratives from past bids.

Full specs and acceptance criteria for F1–F8 are in doc 33. Tier 3 is out of scope until Tier 1–2 prove on the Hunt pilot.

---

## 3 · Trust architecture (why anyone believes the output)

The whole product collapses on one hallucinated reference shown to a QS. Doc 34 makes fabrication **structurally non-exportable**, splitting the problem in two:

- **Class 1 — fabricated evidence (eliminated mechanically):** quote-first extraction → deterministic citation check (code fuzzy-matches every quote against raw page text) → adversarial verifier (second model, cited page only) → blocking flags → export gate. A finding that fails citation match is quarantined and *cannot* be exported.
- **Class 2 — misinterpretation (contained):** peer-challenge stage, confidence + human-confirm gates, and a golden-pack regression eval feeding the lessons-learnt loop (`15_lessons_learnt_loop.md`).

**Human verification flags** (doc 34 §1.2): a 10-flag taxonomy (`CITATION_UNVERIFIED`, `CITATION_FUZZY`, `VERIFIER_DISPUTED`, `INFERENCE`, `NUMERIC_CLAIM`, `CROSS_DOC`, `VISION_DERIVED`, `LOW_CONFIDENCE`, `STALE_REV`, `ABSTAIN_ADJACENT`). Blocking flags fail export in code, not by reviewer discipline; resolution is a side-by-side viewer with one-keystroke confirm, no bulk-confirm, every action audit-logged.

**The auditable claim:** every exported finding either passed exact citation match or carries a named reviewer's confirmation in the audit log.

---

## 4 · Intake & corpus pipeline (the cost and trust spine)

**Intake policy (doc 34 §2): native PDF only.** Scanned/raster documents are rejected at intake because OCR corrupts the citation check that underpins every control in §3. Rejections are turned into product: a rejected scan auto-drafts a native-file re-issue query to the contracting authority (feeds F1). Vector drawings are exempt from text-density thresholds but raster drawing scans are rejected like any scan. No OCR fallback in v1; revisit only if telemetry shows >25% of real packs blocked.

**Corpus pipeline (doc 34 §3): tokens are spent on reasoning, never on parsing.**

```
native PDF → [code] extract (per-page text + offsets) → clean → structure (md headings/tables)
           → chunk (2–4k tokens, YAML front-matter, page-anchored) → route to agents
```

The cleaned md is what agents reason over; the **citation check always verifies against raw page extraction**, never the md, so cleaning can never manufacture a match.

---

## 5 · Token-economics stack (how the €29 tier survives)

Ranked by impact. Stacked, these hold compute at ~€1–2.50/scan instead of €20–35.

| Lever | Saving | Customer-visible? |
|---|---|---|
| **Routing / selective retrieval** — agents get their chunks, never the whole pack | 10–50× | No (better input) |
| **Prompt caching** — static prefix (prompts, rules, checklist) cached at ~90% off | ~3–5× blended | No |
| **Batch API** — 50% off; non-interactive tiers run "ready in a few hours" | 2× | Latency only |
| **Model tiering** — Haiku for plumbing, premium model for judgment | large | Judgment layer only |
| **Extract-once, reason-many** — 25 checks reason over one structured quote layer | moderate | No (better input) |
| **Schedule/table pre-extraction** — code pulls schedules to JSON tables | moderate (schedule-heavy packs) | No (better input) |
| **Deterministic pre-filters** — keyword-prefilter chunks before the LLM sees them | moderate | No |
| **md conversion** — strip PDF furniture | 2–4× | No |

**Key principle (from the "Rolls Royce" decision):** cost optimization and output quality are mostly *orthogonal*. The extraction/routing/caching levers are invisible — they make the *same or better* output cheaper. Only **model tiering** and **batch latency** are perceptible dials. So we optimize the invisible levers always, and spend deliberately on the two that the customer can feel (§6).

---

## 6 · The "wow" / quality strategy (where we deliberately do not cheap out)

The differentiator is not the biggest API budget — competitors can match that. It is **(a) judgment-layer model quality where the QS reads it, and (b) the chartered reviewer's signature.**

| Layer | Cheap tier (taster) | Premium tiers (paid) |
|---|---|---|
| Extraction / classification / verification | Haiku | Haiku |
| **Judgment + RFI drafting** | Sonnet | **Opus** (perceptible quality) |
| Latency | **Live** (eat the batch premium; ~€1 buys the "it just did it" wow) | Batched ("ready this afternoon" signals considered review) |
| Human reviewer | None — zero-touch, locked disclaimer, 1-in-10 QA audit | **Chartered reviewer initials in audit log** (the real moat) |

**Guardrails on premiumness:** (1) don't make the taster so good it cannibalizes paid tiers — the taster wows on *speed + catching 3 real things*, then leaves them wanting the signed full-discipline version; (2) the €29 tier must be genuinely zero-touch (no human time — 20 min of review exceeds the ticket); (3) reviewer-signed output starts at Tier I (€290).

---

## 7 · Structured-input roadmap (the path back to real takeoff)

PDF/md is the Phase-2 spine. CAD and BIM are the legitimate route to *quantities* — because geometry is already structured data, parsed by deterministic code (zero vision tokens), sidestepping the symbol-recognition problem that killed generation in §1.

| Input | Format / tooling | What it unlocks | Phase | Trigger |
|---|---|---|---|---|
| **Native PDF** | PyMuPDF / pdfplumber → md | Verification, coverage, RFIs (F1–F8) | Phase 2 (now) | — |
| **DXF / DWG (2D CAD)** | DXF open + `ezdxf`; DWG→DXF via ODA converter | **Deterministic counts & lengths** — door/window blocks counted by type, wall/pipe runs measured from polylines. Assistive takeoff without vision. | Phase 3–4 | Contractors who hold CAD (D&B, repeat/negotiated work) request it |
| **IFC / BIM** | IFC open (ISO 16739) + `IfcOpenShell` | **Model-vs-BoQ reconciliation** — quantities + classifications + element coverage. Verification play, robust to model imperfection (comparing two sources). | Phase 4+ | CWMF BIM mandate puts federated models in bidders' hands; telemetry shows packs arriving with models |

**Discipline:** quantity accuracy from BIM depends on model quality — so we lead with *reconciliation* (compare model to BoQ, flag mismatches) not *generation* (trust the model's numbers). Same verification stance as the PDF product. Assistive symbol *counting* from PDFs (counts only, never lengths, with confirmation UX) remains a P2 fallback only where CAD is unavailable.

---

## 8 · Commercial model

**Meter packs, not drawings.** Cost scales with pages/complexity and value scales with the tender event — never with drawing count (a customer could hammer compute with huge specs while "under a drawing limit"). The atomic unit is the **pack**, sized by project scale (existing Tier I–V, doc 14).

**Two motions:**
- **Per-pack** (€29 taster → €290 / €590 / €890 / €1,950 / €2,500+ Tier I–V) — the on-ramp and trial.
- **Annual seat** (€2,800 / €5,800 / €11,400 / €19,800) — for engaged practices (6–12 packs/yr); predictable revenue, the conversion-from-experimentation moment. Per doc 14, price so a >4-packs/year practice clearly wins by switching.

**Allowance logic (if seats use a cap):**
- Seat = N packs/year of a tier band (e.g. Tier III seat: up to ~15 large packs/yr).
- **Soft overage** — pack N+1 bills at a discounted per-pack rate, never blocked. Never create friction mid-tender.
- **Fair-use page cap per pack** (e.g. €29 tier: ~150 pages / 15 docs) protects single-scan compute; overflow upsells to the next tier.
- **No "unlimited"** at this stage — marginal cost (compute + reviewer honorarium on signed tiers) is real.

---

## 9 · Unit economics & break-even

**Per-scan compute (pipeline as specced):**

| Tier | Approx compute | Notes |
|---|---|---|
| €29 taster | ~€1–2.50 (live) / ~€1.10–1.30 (if batched) | zero-touch |
| Tier III €890 | ~€4–8 (Opus judgment) + ~€250 reviewer honorarium | signed |

**Contribution:** €29 taster ≈ ~€25 (≈89%, ex-VAT — confirm VAT treatment). Tier III ≈ ~€590 after compute, honorarium, fees.

**Break-even against doc-15 cost base:**

| Cost base | Monthly fixed | Break-even |
|---|---|---|
| Phase 2 (insurance rider, infra) | ~€500–600 | ~22 tasters/mo, or 1 Tier III |
| Phase 3 (accountant, honorariums, marketing) | ~€3,000–3,500 | ~6 Tier III packs/mo |
| Year-1 incremental ~€87k | ~€7,250/mo | **~145 Tier III packs/yr (~12/mo), or ~8 annual Tier III seats** |

**The honest conclusion:** the €29 tier **cannot carry the business and shouldn't try** — it is self-funding lead generation (pays its own marginal cost ~10×, feeds the funnel). Break-even lives in the signed tiers and seats. **The number to watch weekly is taster→paid conversion (doc 12 target 8–12%).** At 10%, 12 paid packs/month needs ~120 tasters/month — that is the real growth constraint.

---

## 10 · Roadmap & timeline

Aligned to doc 12 phasing. PTRI is built as a lens on the existing council; the six discipline agents and orchestration are prerequisites.

### Phase 2 — PTRI pilot (the focus)

| Sprint | Build | Exit gate |
|---|---|---|
| **1** | Corpus pipeline (extract/clean/chunk/anchor) + routing + prompt caching; citation check wired to raw extraction; schema extension; **F2** disposition queue; **F1** RFI draft/export | Hunt pack → disposition queue + one exportable RFI batch; citation check live |
| **2** | **F3** coverage matrix + **F7** prelims catcher; structure-aware table extraction; intake gate (PDF-only) | Coverage matrix complete on Hunt pack; prelims sweep feeds the F2 queue; scans rejected with re-issue query drafted |
| **3** | **F4** addendum diff + **F5** variation seed bank; document supersession chain | A real Hunt addendum diffs and flags affected items |
| **4** | **F6** enquiry packs + **F8** amendments scanner; flag UX hardening; **30-finding audit** | Pilot gate (below) met |

**Pilot gate (mirrors doc 12 first-customer test):**
1. Hunt pack end-to-end; queue + RFI batch + coverage matrix + prelims sweep delivered ≥3 working days before query deadline.
2. Hunt QS confirms ≥3 material findings they had not caught.
3. ≥70% of drafted RFIs approved with minor edits only.
4. 30-finding audit: 100% references verify. One fabricated reference = output withheld.

### Phase 3 — Harden & commercialise (Months 4–9)

Reviewer-signed tiers operational; annual seats live with allowance + soft overage; Tier 1–2 features production-grade; telemetry dashboard (flag rates, cost/scan, conversion); first case study. **DXF/DWG ingestion** begins as optional input for CAD-holding contractors.

### Phase 4+ — Structured-input & scale (Months 9–24)

DXF/DWG assistive takeoff matured; **IFC model-vs-BoQ reconciliation** when BIM supply lands; Tier 3 competitive-intelligence features (win-price benchmarking, quality-submission accelerator) specced separately; multi-region per doc 12.

---

## 11 · Metrics

**Leading:** taster→paid conversion (8–12%); findings/pack vs reviewer-hours; RFI approval rate (≥70%); upload→queue time (<24h, taster live); coverage-row human-override rate (<20%); compute cost/scan (within doc-12 targets); citation-check failure rate per agent (alert at 2× baseline).

**Lagging:** bids submitted on time with zero unpriced spec sections; variations substantiated from seed bank post-award (count + €); repeat packs / seat conversions from Abel and others; reviewer time/pack trending down.

---

## 12 · Open questions & risks

**Blocking before Sprint 1:** Hunt query/submission deadlines (decides if F4–F8 fit the live tender); buyer's clarification-template format (F1 export); who signs the tender risk register under Solo Reviewer Phase rules; VAT treatment of the €29 price.

**Top risks:** one hallucinated reference (mitigated by doc-34 control stack + audit gate); coverage-mapper false `Covered` shipping unpriced scope (mitigated — `Covered` needs explicit item ref, defaults to `Partial`, human confirm); scanned packs (PDF-only gate + re-issue query); scope creep toward takeoff (any quantity claim in any output is a release blocker until CAD/BIM phase); tender confidentiality (project-level isolation, no cross-project corpus learning from customer docs); taster cannibalising paid tiers (taster scoped to speed + 3 findings, no signature).

---

*One line: turn the VerifIQ council into the contractor QS's pre-tender risk engine — every gap found, dispositioned, queried or banked, with a verbatim audit trail, before the price is set — funded by a zero-touch taster, monetised through signed tiers and seats, and extended to real takeoff via CAD/BIM when supply allows.*
