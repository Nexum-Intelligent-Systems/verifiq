# 06 · Risk Rules

**Use:** Authoritative rule set for risk ratings, build-readiness ratings, and decisions. Apply during Stage 6 adjudication.

---

## Risk rating rules

### Critical

Use where the issue may block lawful construction, safe occupation, statutory approval, certification, life safety, accessibility, planning compliance, BCAR completion, sector registration, or creates major construction/tender exposure.

### High

Use where the issue is material and must be resolved before tender, construction, inspection or handover, but is not yet proven to be a statutory blocker.

### Medium

Use where the issue creates coordination risk, ambiguity, likely RFI, likely variation, or evidence gap that can be resolved through clarification.

### Low

Use where the issue is minor, localised, low-consequence or administrative.

### Advisory

Use for good-practice improvements that do not affect compliance, statutory approval, buildability, tender certainty or occupation readiness.

---

## Build readiness rules

### Green

No unresolved Critical or High findings affecting statutory compliance, life safety, accessibility, planning, BCAR, tender scope, construction readiness or occupation.

### Amber

No unresolved Critical findings, but High findings remain that must be closed before a defined stage.

### Red

One or more unresolved Critical findings remain.

### Grey

Core documents are missing and readiness cannot be determined.

---

## Decision rules

### Proceed

Use only where the evidence supports build readiness.

### Proceed with conditions

Use where construction can proceed only if stated conditions are closed before relevant hold points.

### Pause before build

Use where any Critical blocker remains unresolved.

### Insufficient information

Use where missing documents prevent reliable assessment.

---

## Mapping table (enforced)

| Build readiness rating | Executive decision |
|---|---|
| Green | Proceed |
| Amber | Proceed with conditions |
| Red | Pause before build |
| Grey | Insufficient information |

If the adjudicator produces a state that violates this mapping (e.g., Red rating but Proceed decision), the council chair must reject and re-adjudicate. This invariant is enforced at code level.

---

## Sector-specific Critical overrides

The following always trigger Critical regardless of other context:

- Healthcare facility designed without HSE PCM alignment when HSE Section 38/39 capital funded.
- Designated centre under HIQA Health Act 2007 without registration suitability assessment.
- Approved mental health centre under Mental Health Act 2001 without Mental Health Commission compatibility assessment.
- Early years service under Tusla regulations without compliance with Child Care Act 1991 regulations.
- US healthcare-adjacent facility without Business Associate Agreement (NEVER ENGAGE — refuse the pack).
- Higher-risk building under UK Building Safety Act 2022 without UK reviewer panel involvement (refuse during Irish-only phase).

---

## Stage-appropriateness rules

Findings must be staged appropriately. Do not demand construction evidence at early design stage. Instead, classify it as:

- `Construction evidence required` → roll to `construction hold point` in the Build Readiness Report.
- `Handover evidence required` → roll to `handover evidence requirements`.

The risk rating reflects the *importance* of the close-out; the status reflects the *current state*. A Critical-rated finding can be Compliant when evidenced or Not Demonstrated when missing — both are valid in early design as long as the close-out stage is captured.

---

## Adjudicator escalation rules

The Adjudicator must ESCALATE (raise the risk rating) when:

- Multiple disciplines flag related issues (cumulative risk).
- A High finding involves sector-regulator implications (HIQA / MHC / Tusla).
- A finding affects life-safety AND accessibility AND fire — triple-jeopardy is always Critical.

The Adjudicator must DOWNGRADE when:

- The peer challenge identifies that the originating discipline misread the source.
- The finding is duplicate of a higher-priority issue elsewhere.
- The evidence required is in a document that the originating discipline did not have access to but exists in another discipline's upload.

The Adjudicator must DELETE when:

- The finding has no consequence ("style issue").
- The finding has no owner.
- The finding is outside project scope.
- The finding is speculative without a source-document anchor.

---

## Audit trail requirement

Every adjudication decision must be logged with:

- Pre-state (risk, status, owner)
- Post-state (risk, status, owner)
- Adjudicator model + role
- Rationale (string)
- Timestamp

The Council Chair report cites only the post-adjudication state. The pre-state remains in `audit_log` for compliance and dispute review.
