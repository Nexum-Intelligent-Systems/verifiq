# 33 · Pre-Tender Risk Intelligence Module (PTRI) — PRD

**Status:** Draft v1.0 · 2026-06-11
**Owner:** Liam (liam@goviq.ie)
**Pilot:** Hunt tender pack — contractor-side QS team (Abel)
**Depends on:** `verifiq-prompts/05_output_schemas.md`, `04_agent_prompts.md` §04.9, `12_mvp_scope.md`

---

## 1 · Problem statement

A contractor QS pricing an Irish public-works lump-sum tender (PW-CF1 family) carries design-gap risk: any ambiguity, discrepancy, or missing scope not queried before tender close must be either priced as risk premium (bid loses on price) or absorbed (job loses money). Tender periods are 4–6 weeks, packs run to hundreds of documents, addenda land late, and the query deadline arrives before the team has read everything.

PTRI repoints the existing VerifIQ council pipeline (classify → discipline review → cross-challenge → adjudicate → report) from design-team *build readiness* to contractor-side *bid readiness*. Same engine, new lens, new outputs: a triaged gap register, a formal RFI batch, a coverage matrix, and an evidence bank.

**Core principle: verification, not generation.** PTRI never measures, never produces quantities, never prices. It finds what is missing, ambiguous, or contradictory in the tender documents, and routes each finding to a commercial decision. (Evidence basis for excluding automated takeoff: VLM symbol-reading accuracy of 0.09–0.39 on doors/windows per AECV-Bench 2026; full MEP takeoff unreliable even in dedicated CV products.)

---

## 2 · Goals

1. **Catch material gaps before the query deadline.** Pilot pass = Hunt QS team confirms ≥3 findings as material *that they had not already caught*, with full RFI batch drafted ≥3 working days before the query deadline.
2. **Eliminate unpriced scope.** 100% of spec sections carry a coverage status (Covered / Partial / Uncovered / Prov-sum) against the pricing document before submission.
3. **Compress the front end of the tender.** Time from pack upload to first triaged findings queue <24h; trade enquiry packs issued within 48h.
4. **Zero fabricated references.** Every finding cites verbatim filename + page/section per the §05.1 rule. Audit sample of 30 findings per pack: 100% verifiable, or the pack output is not released.
5. **Build the post-award evidence bank.** Every unresolved ambiguity at tender close is logged contemporaneously with document references, ready to substantiate change events post-award.

## 3 · Non-goals

- **No measured quantity takeoff** (lengths, areas, counts off drawings). Different product, unsolved CV problem, dilutes the verification moat. P2 at earliest, and only as assistive counting with confirmation UX.
- **No rates, pricing, or estimating.** PTRI informs the QS's pricing decisions; it never makes them.
- **No bid/no-bid or win-price intelligence** (eTenders award benchmarking). Tier 3, separate spec.
- **No quality-submission writing** (methodology, programme narratives). Tier 3, separate spec.
- **No contract advice.** The amendments scanner flags onerous terms for commercial review; it does not interpret or advise. Locked disclaimer applies to every output.

---

## 4 · Users

- **Managing QS (primary):** owns the bid price; works the disposition queue; approves RFIs.
- **Estimator:** consumes coverage matrix and enquiry packs; prices residual risk.
- **Commercial director:** signs the tender risk register; decides qualify/exclude positions.

## 5 · User stories

**RFI generation (F1)**
- As a managing QS, I want every detected discrepancy drafted as a formal tender query with verbatim document references so that I can submit a complete query batch before the deadline without writing each one by hand.
- As a managing QS, I want queries ranked by cost exposure so that I submit the ones that matter if the buyer caps query counts.

**Gap disposition (F2)**
- As a managing QS, I want a triage queue where each finding gets exactly one disposition — RFI / Price risk / Qualify-Exclude / Hold (post-award) — so that nothing in the pack is left undecided at submission.
- As a commercial director, I want a signed tender risk register exported from the dispositions so that the bid settlement meeting works from one auditable document.

**Coverage matrix (F3)**
- As an estimator, I want every spec section mapped to pricing-document items so that I can see uncovered scope before I finalise allowances.
- As an estimator, I want provisional sums flagged against the level of design detail behind them so that I know where the employer is hiding risk.

**Prelims/statutory catcher (F7)**
- As a managing QS, I want a checklist sweep for unpriced statutory and prelims obligations (BCAR inspections, PSCS duties, temporary works, utility diversions, surveys, commissioning, fire cert conditions) so that six-figure leaks are caught systematically, not by memory.

**Addendum diffing (F4)**
- As a managing QS, I want each addendum auto-diffed against the documents it supersedes, with affected findings, RFIs, and coverage rows flagged, so that a revision landing five days before close doesn't invalidate my pricing silently.

**Variation seed bank (F5)**
- As a commercial director, I want every ambiguity that closed unanswered logged with evidence and date so that post-award change events are substantiated from contemporaneous records.

**Sub enquiry packs (F6)**
- As an estimator, I want per-trade scope packages (relevant drawings, spec sections, extracted schedules) generated automatically so that enquiries go out in day 2 and I get real sub prices instead of lump allowances.

**Contract amendments scanner (F8)**
- As a commercial director, I want schedule amendments and ITT conditions flagged (bond level, PI, LDs, caps) so that onerous terms reach commercial review before submission, not at contract signing.

---

## 6 · Requirements and sequencing

### P0 — pilot cannot run without these (Sprints 1–2)

| ID | Requirement | Notes |
|---|---|---|
| F2 | Gap disposition engine: findings queue with single-disposition workflow, cost-exposure banding, register export (PDF/XLSX per §05.5) | Extends Finding object; new fields below |
| F1 | RFI generator: disposition `RFI` produces draft query (verbatim refs, buyer-format), batch export DOCX | Output format per buyer's clarification template |
| F3 | Spec→BoQ coverage matrix: every spec section → status + pricing-doc refs + confidence | Table extraction + LLM matching; human-confirm UX for `Partial` |
| F7 | Prelims/statutory cost catcher: deterministic checklist (Irish public works) + LLM verification pass per item | Checklist is corpus-versioned, ARM4/CWMF-aware |

### P1 — fast follow (Sprints 3–4, before tender close if pilot timeline allows)

| ID | Requirement | Notes |
|---|---|---|
| F4 | Addendum diff: doc-pair diff (text + drawing rev metadata), impact propagation to findings/RFIs/coverage | Requires document supersession chain in `documents` table |
| F5 | Variation seed bank: auto-created from dispositions `Hold` and RFIs unanswered at close | Status lifecycle: Open → Materialised → Closed |
| F6 | Sub enquiry packs: trade-scoped doc bundles + schedule extracts (JSON + PDF bundle) | Trade taxonomy seeded from spec work sections |
| F8 | Contract amendments scanner: ITT + schedule parse, flagged-term register | Flag-only; no interpretation |

### P2 — future considerations (design for, don't build)

- Assistive symbol counting with confidence scores and confirmation UX (counts only, never lengths).
- eTenders award benchmarking (Tier 3).
- Quality submission accelerator (Tier 3).
- Buyer-portal RFI submission integration.

### Sprint sequence

1. **Sprint 1:** schema extension + F2 triage queue + F1 RFI drafting/export. *Exit: Hunt pack produces a disposition queue and one exportable RFI batch.*
2. **Sprint 2:** F3 coverage matrix + F7 prelims catcher. *Exit: coverage matrix complete on Hunt pack; checklist sweep produces findings into the same queue.*
3. **Sprint 3:** F4 addendum diff + F5 seed bank. *Exit: a real Hunt addendum diffs cleanly and flags affected items.*
4. **Sprint 4:** F6 enquiry packs + F8 amendments scanner + pilot hardening + audit sample.

---

## 7 · Data model (extends §05.4)

```sql
-- Tender context on existing projects table
tender_meta (project_id, contracting_authority, contract_form,   -- 'PW-CF1' etc.
             query_deadline, submission_deadline, tender_ref,
             pricing_doc_type)                                    -- 'BoQ' | 'Pricing document' | 'Schedule of rates'

-- Finding object (§05.1) gains tender fields; stage = 'pre-tender'
--   disposition: 'RFI' | 'Price risk' | 'Qualify/Exclude' | 'Hold'
--   cost_exposure_band: 'A:<10k' | 'B:10-50k' | 'C:50-250k' | 'D:>250k' | 'Unknown'
--   disposition_by, disposition_at

rfis (rfi_id, project_id, status,            -- Draft | Approved | Submitted | Answered | Unanswered_at_close
      draft_text, submitted_at, response_text, response_doc_id)
rfi_findings (rfi_id, issue_id)

coverage_map (row_id, project_id, spec_ref, spec_description,
              status,                        -- Covered | Partial | Uncovered | Prov_sum
              confidence, confirmed_by)
coverage_boq_items (row_id, boq_item_ref)

addendum_diffs (diff_id, project_id, addendum_doc_id, base_doc_id,
                change_type,                 -- Drawing_rev | Spec_change | New_doc | Withdrawal
                change_summary)
diff_impacts (diff_id, target_type,          -- finding | rfi | coverage_row | enquiry_pack
              target_id)

variation_seeds (seed_id, project_id, issue_id, rfi_id,
                 status,                     -- Open | Materialised | Closed
                 logged_at)                  -- contemporaneous timestamp is the value

enquiry_packs (pack_id, project_id, trade, issued_at, schedule_extract_json)
enquiry_pack_docs (pack_id, doc_id, spec_ref)

flagged_terms (term_id, project_id, source_document, source_reference,
               category,                     -- Bond | PI | LDs | Cap | Payment | Other
               verbatim_text, severity)
```

All state transitions write to the existing `audit_log`. Exports carry corpus version, reviewer initials, document hashes, and the locked disclaimer per §05.5 — unchanged.

---

## 8 · Agent changes (extends §04)

**Modified — §04.9 QS Agent (contractor lens).** Add to Assess list: (10) whether each ambiguity is best resolved by query, risk pricing, or qualification given the contract form's risk allocation; (11) whether the pricing document covers every spec work section. Output: Finding objects with `stage: pre-tender` and proposed `disposition` + `cost_exposure_band` (human confirms).

**New agents (prompt skeletons; full prompts to `04_agent_prompts.md` §04.14–04.19):**

- **§04.14 Tender Query Drafter.** Input: finding(s) with disposition RFI. Output: formal clarification text — neutral wording, verbatim source refs, single question per query, no disclosure of pricing intent. Hard rule: no reference invention; if source_reference is missing, refuse and return the finding for repair.
- **§04.15 Coverage Mapper.** Input: spec section list + pricing document. Output: coverage_map rows with confidence. Hard rule: `Covered` requires an explicit pricing-doc item reference; anything inferred is `Partial` max.
- **§04.16 Prelims Checklist Agent.** Input: corpus checklist (versioned) + full pack manifest. Per item: Priced / Not found / Ambiguous, with refs. Deterministic checklist drives the loop; LLM verifies, never extends the list.
- **§04.17 Addendum Differ.** Input: doc pair (base, superseding). Output: change_summary + impact candidates. Drawing diffs are metadata + title-block + revision-cloud description only — no geometric claims.
- **§04.18 Trade Scoper.** Input: pack manifest + trade taxonomy. Output: doc/spec allocation per trade + schedule table extraction.
- **§04.19 Contract Terms Scanner.** Input: ITT + contract schedules. Output: flagged_terms register, verbatim quotes only, severity by deviation from unamended PW-CF baseline. No advice.

Peer-challenge and adjudication stages run unchanged over pre-tender findings — the existing council is the QA layer.

---

## 9 · Acceptance criteria (P0)

**F2 Disposition engine**
- Given a processed pack, when the QS opens the queue, then every finding shows status, risk, cost band, and exactly one disposition action; no finding can be left undispositioned in an exported register.
- Given dispositions complete, when the register is exported, then PDF/XLSX match §05.5 export rules incl. disclaimer, hashes, initials.

**F1 RFI generator**
- Given a finding dispositioned RFI, when the draft is generated, then it contains verbatim filename + page/section for every claim, and zero references that fail manual verification.
- Given 10 approved drafts, when batch-exported, then a single DOCX in buyer clarification format is produced with sequential numbering.

**F3 Coverage matrix**
- Given the Hunt spec and pricing document, when mapping completes, then 100% of spec work sections have a status; every `Covered` row carries ≥1 pricing-doc item ref; all `Partial`/`Uncovered` rows require human confirmation before register export.

**F7 Prelims catcher**
- Given the checklist (≥40 items, corpus-versioned), when the sweep runs, then every item returns Priced / Not found / Ambiguous with source refs, and Not-found items appear as findings in the F2 queue automatically.

**Pilot gate (mirrors §12 first-customer test)**
1. Hunt pack processed end-to-end; queue, RFI batch, coverage matrix, prelims sweep delivered ≥3 working days before query deadline.
2. Hunt QS confirms ≥3 material findings they had not caught.
3. ≥70% of drafted RFIs approved with only minor edits.
4. 30-finding audit sample: 100% source references verify. One fabricated reference = pilot output withheld.

## 10 · Success metrics

**Leading:** findings per pack vs reviewer-hours; RFI approval rate (target ≥70%); upload→queue time (<24h); enquiry packs issued <48h; % coverage rows human-overridden (proxy for mapper precision; target <20%).
**Lagging:** bid submitted on time with zero unpriced spec sections; variations substantiated from seed bank post-award (count + €); repeat packs from Abel; reviewer time per pack trending down.

## 11 · Open questions

- **(Liam/Hunt — blocking):** Hunt query deadline and submission date; confirms whether F4–F8 fit inside the live tender or land post-pilot.
- **(Liam — blocking):** exact contract form and buyer clarification-template format for F1 export.
- **(Commercial — blocking):** who signs the tender risk register (Solo Reviewer Phase rules from `16-solo-reviewer-phase.md` apply?).
- **(Legal — non-blocking):** confidentiality posture for contractor tender docs (commercially sensitive vs design packs); retention and access controls; check against `20-compliance-sops.md`.
- **(Engineering — non-blocking):** drawing revision metadata reliability in current title-block classifier; F4 depends on it.

## 12 · Risks

| Risk | Mitigation |
|---|---|
| Hallucinated references destroy trust in one incident | Full control stack per `34-hallucination-controls-spec.md`: mechanical citation check, adversarial verifier, blocking flags, export gate; 30-sample audit retained as backstop |
| Coverage mapper false `Covered` → unpriced scope ships | `Covered` requires explicit item ref; default to `Partial`; human confirm before export |
| Scanned/low-res pack degrades everything | PDF-only intake gate per `34-hallucination-controls-spec.md` §2 — scans rejected at intake, rejection auto-drafts a native-file re-issue query (feeds F1) |
| Scope creep toward takeoff | Non-goal locked in this PRD; any quantity claim in any output is a release blocker |
| Tender confidentiality breach | Project-level isolation; no cross-project corpus learning from customer docs |

---

*One sentence to hold the module: PTRI turns the VerifIQ council into the contractor QS's pre-tender risk engine — every gap found, dispositioned, queried or logged, with a verbatim audit trail, before the price is set.*
