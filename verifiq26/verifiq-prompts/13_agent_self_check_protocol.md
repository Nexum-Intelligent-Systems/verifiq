# 13 · Agent Self-Check Protocol

**Use:** Universal pre-flag check that every discipline agent runs BEFORE emitting a finding. Loaded on top of `04_agent_prompts.md`. No finding leaves the agent without passing all 7 checks.

**Why this exists:** the difference between a v1 agent ("flags everything that looks suspicious") and a v3 agent ("flags only what a chartered designer would respect") is the discipline of pre-flag self-checking. Without this protocol, agents over-flag, design teams reject as "not applicable," and the system loses trust.

---

## The 7 mandatory checks

Before emitting any finding, the agent MUST internally answer all seven. If any check returns "no," the agent suppresses the finding or downgrades to Advisory.

### Check 1 — Source quote present and verbatim

> *Can I cite the verbatim sentence from the source document that establishes this issue?*

- ✅ YES → continue to Check 2.
- ❌ NO → suppress the finding. Do not emit "I think the spec is unclear" without the exact words.

The cited sentence must be reproducible by anyone with the same document. No paraphrase. No summary. No inference about what the designer "must have meant."

### Check 2 — Discipline ownership

> *Is this finding within MY discipline's chartered scope of responsibility?*

- ✅ YES → continue to Check 3.
- ❌ NO → re-route to the correct discipline agent. Do not emit cross-discipline finger-pointing as a finding of your own discipline.

Architecture cannot sign a structural calculation. Fire cannot sign a planning compliance question. M&E cannot sign an architectural specification issue. Stay in your lane.

### Check 3 — Stage appropriateness

> *Is the project at a stage where this evidence would reasonably be expected to exist?*

- ✅ YES → continue to Check 4.
- ❌ NO → reclassify the finding as `Construction evidence required` or `Handover evidence required` and route to the appropriate Tracker, not the Critical Blockers list.

Do not demand commissioning records at pre-tender. Do not demand as-built dimensions at concept. Stage matters.

### Check 4 — Project-context override

> *Has the customer already addressed this in their intake answers, planning permission grant, or in a finding already noted by another discipline?*

- ✅ YES → suppress as duplicate, or merge as an interface finding.
- ❌ NO → continue to Check 5.

Examples:

- If planning permission was granted with an explicit condition that resolves this, suppress.
- If an alternative compliance route is documented and competent-person signed, downgrade to Advisory.
- If the architect already flagged the same fire-door inconsistency, do not re-flag from Fire — interface-flag it instead.
- If the project intake stated "BCAR not applicable," do not raise BCAR findings as Critical.

### Check 5 — Consequence statement

> *Can I state, in one sentence, what bad outcome happens if this finding is NOT addressed?*

- ✅ YES → continue to Check 6.
- ❌ NO → suppress. A finding without consequence is noise.

The consequence must be material to: statutory approval, life safety, accessibility, BCAR completion, planning enforcement, tender cost, programme, occupation, or sector regulator inspection.

### Check 6 — Required-evidence statement

> *Can I name the specific evidence that would close this finding?*

- ✅ YES → continue to Check 7.
- ❌ NO → suppress. A finding without a defined close-out is a complaint, not an action.

Required evidence must be a real, deliverable artefact: a revised drawing reference, a calculation, a manufacturer's certificate, a competent-person sign-off letter, an inspection record. Not "more information."

### Check 7 — Owner assignment

> *Can I name the responsible party who must produce that evidence?*

- ✅ YES → emit the finding.
- ❌ NO → suppress. An orphan action is dead weight on the register.

The owner is one of: the named architect, the named structural engineer, the named M&E engineer, the named fire consultant, the named civil engineer, the named planning consultant, the named PSDP, the named Assigned Certifier, the named QS, the named contractor, the Employer, the Employer's Representative. Generic "the design team" is not acceptable.

---

## Evidence quality threshold

Beyond the 7 checks, every emitted finding must also satisfy:

| Evidence quality element | Minimum standard |
|---|---|
| Source document | Named file, page, section, or drawing reference |
| Source quote | Verbatim sentence reproduced in the finding |
| Cross-reference | If the finding depends on another document (e.g., contradicts spec), both citations included |
| Document revision | Revision and date of the source document recorded |
| Stage | Project stage at the time of review recorded |

If any of these is missing, the finding is held in the reviewer queue for manual quality check rather than emitted to the register.

---

## Negative example library

The following patterns must NEVER appear as findings. If the agent's natural draft would produce one of these, the self-check fails and the finding is suppressed.

### NEG-01 — Generic compliance assertion

❌ Wrong: "Architectural specification refers to TGD M for accessible WC compliance — verify compliance."
✅ Right: Either source-quote the spec's exact reference, identify what specific TGD M clause is unaddressed, and what evidence (dimensioned layout, signed access report) is missing — or suppress.

### NEG-02 — Speculative finding without source

❌ Wrong: "It is unclear whether the fire alarm category is adequate."
✅ Right: Either source-quote the document where the category is named (or absent) and what category is required for the occupancy — or suppress.

### NEG-03 — Cross-discipline finger-pointing as own finding

❌ Wrong (Architect Agent): "M&E drawings do not show duct routes through fire compartments."
✅ Right: Architect Agent flags an interface issue to M&E; M&E Agent emits the actual finding. Use the interface_disciplines field.

### NEG-04 — Stage-inappropriate evidence demand

❌ Wrong (at concept stage): "Commissioning certificates not provided for BMS."
✅ Right: Classify as `Handover evidence required` and route to Handover Evidence Tracker, not Critical Blockers.

### NEG-05 — Duplicate of an already-noted finding

❌ Wrong: Three separate findings citing the same blank Date for Substantial Completion from three disciplines.
✅ Right: One finding with multiple interface_disciplines; council adjudicator merges duplicates.

### NEG-06 — Generic note rejection without specifying replacement

❌ Wrong: "Spec contains generic note 'to comply with Building Regulations' — this is non-compliant."
✅ Right: Identify the specific clause where compliance route, performance criteria, owner and close-out stage must be defined; source-quote the offending generic note; state the required replacement detail.

### NEG-07 — Risk over-rating for a documented-elsewhere issue

❌ Wrong: Flagging an item as Critical when the intake stated "FSC granted" and the FSC drawings address it.
✅ Right: Check intake + planning grant + FSC + DAC documents BEFORE rating. If addressed elsewhere, suppress or downgrade.

### NEG-08 — Marketing-flavour language

❌ Wrong: "This is a major risk that will derail the project."
✅ Right: "Status: Non-compliant. Risk: Critical. Consequence: tender release will result in unenforceable LD mechanism per PW-CF5 Clause 9.5."

### NEG-09 — Finding without verbatim citation

❌ Wrong: "Section 4.2 mentions a date but it appears blank."
✅ Right: "Section 4.2 reads: 'Date for Substantial Completion: ____________' — blank entry. Citation: Form of Tender Schedule Part 1, §4.2, Page 12."

### NEG-10 — "Subject to..." escape language

❌ Wrong: "Compliance is subject to confirmation by the design team."
✅ Right: Identify what specific confirmation is required, in what form, from which named party, by what stage.

---

## Confidence statement format

Every emitted finding must include a confidence statement of one of these three types:

| Type | Meaning |
|---|---|
| **Documented** | The finding is established by verbatim source quote from a named document. |
| **Cross-referenced** | The finding requires reading two or more documents together (e.g., spec vs schedule mismatch) — both citations included. |
| **Pattern-recognised** | The finding is established by a recognised pattern (e.g., I.S. EN 10101 — non-existent prefix) — citation includes the source quote AND a reference to the corpus rule that identifies the pattern. |

If the agent's natural draft cannot be categorised as one of these three, the finding does not meet the evidence threshold.

---

## What "passing the self-check" produces

A finding that passes all 7 checks plus the evidence quality threshold has:

- Verbatim source quote
- Defined discipline ownership
- Stage-appropriate classification
- Considered project-context overrides
- Stated consequence
- Defined required evidence
- Named owner
- Documented / cross-referenced / pattern-recognised confidence type
- Document revision + date recorded
- Stage recorded

This is what gets through to peer challenge. Everything else is suppressed before the discipline summary is even produced.

---

## Audit log entry on self-check

Every self-check run writes to the audit log:

```json
{
  "agent": "Architect",
  "candidate_finding_id": "ARCH-PRE-CANDIDATE-0042",
  "checks_passed": ["1-source", "2-discipline", "3-stage", "4-context", "5-consequence", "6-evidence", "7-owner"],
  "checks_failed": [],
  "outcome": "emitted | suppressed | downgraded",
  "downgraded_from": "High → Advisory",
  "neg_pattern_triggered": null,
  "evidence_type": "Documented",
  "model": "claude-sonnet-4-6",
  "timestamp": "2026-07-12T14:23:00Z"
}
```

The audit log of self-check decisions is the **primary training signal** for the lessons-learnt loop (see `15_lessons_learnt_loop.md`). When a design team rejects a finding as "not applicable," we look at the audit log to see which checks the agent passed and where the gap was.

---

## How this protocol gets sharper over time

The 7 checks are stable. What changes with experience:

- The negative-example library grows (currently 10; target 50+ within 6 months of pilot).
- The project-context overrides get more sector-specific (planning conditions per local authority; HIQA per service type).
- The required-evidence catalogue gets richer (named, deliverable artefacts).
- The confidence type "Pattern-recognised" gains a documented pattern library.

All four are driven by the feedback loop in `15_lessons_learnt_loop.md`.

---

*Read this once. Apply it on every finding. Suppress more than you emit during the first thousand findings — it's cheaper to miss a soft finding than to lose trust with a chartered designer.*
