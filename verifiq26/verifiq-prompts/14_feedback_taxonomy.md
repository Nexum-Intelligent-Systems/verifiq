# 14 · Feedback Taxonomy — Why Design Teams Reject Findings

**Use:** Structured set of reasons a design team may respond to a finding with "Not applicable" / "Already addressed" / "Wrong call". This is the primary input to the lessons-learnt loop in `15_lessons_learnt_loop.md`.

**Why this exists:** the feedback "Not applicable" is the most valuable signal we receive — it tells us where our agent prompts misfire. But "Not applicable" without a reason is useless. This taxonomy turns it into structured training data.

---

## The 12 rejection categories

Every finding rejected by the design team must be tagged with exactly one primary reason from this list. Optionally a secondary reason.

### REJ-01 · False positive — not present in documents

The finding asserts something that does not actually appear in the cited document.

**Examples:**
- Agent claimed "Date for Substantial Completion left blank" but the date is present in Revision B of the Form of Tender.
- Agent claimed "Fire alarm category not specified" but the spec § 3.4 names "L1 to I.S. 3218:2024".

**What this signals:** the agent didn't actually have the latest revision, or hallucinated content. **Highest-priority retraining signal.**

### REJ-02 · Source mis-citation

The issue exists but the cited document or page is wrong.

**Examples:**
- Finding cites M&E Spec § 11.4 page 47 but the hoist brand mismatch is actually in § 11.7 page 51.
- Finding cites the architectural spec but the issue is in the structural spec.

**What this signals:** source-quote verification gate didn't catch the misattribution. **Tighten the verification step.**

### REJ-03 · Already addressed elsewhere in the pack

The finding is real BUT the design team has already addressed it in another document the agent didn't index.

**Examples:**
- Fire compartmentation flagged as missing — but it's shown on a separate Fire Strategy drawing the architect uploaded under a different folder.
- BCAR doc set incomplete — but a Revision-B BCAR pack was uploaded after the scan started.

**What this signals:** the document classifier missed a file, or the agent didn't see the latest revision. **Improve intake + classification.**

### REJ-04 · Out of project scope

The issue is real for a "fully scoped" project but this project explicitly excludes it.

**Examples:**
- "Conservation impact assessment missing" — but the project is not a Protected Structure.
- "Childcare regulation suitability" — but the building is an office.

**What this signals:** the intake form didn't capture an exclusion, or the agent didn't honour the intake. **Strengthen Check 4 (project-context override) in self-check.**

### REJ-05 · Wrong discipline

The finding is real but the agent that flagged it isn't the right one to own it.

**Examples:**
- Architect Agent flagged a structural load issue. Should be the Structural Agent.
- Fire Agent flagged a planning condition issue. Should be the Planning Law Agent.

**What this signals:** discipline-routing rules need tightening. The interface_disciplines field is the right place for cross-references, not the primary discipline.

### REJ-06 · Risk over-rated

The finding is real but the risk rating is too high.

**Examples:**
- Flagged Critical: "I.S. EN 10101 typo in the spec" — the design team agrees it's a typo but rates it Medium because the correct standard is obvious from context.
- Flagged High: "Sanitaryware schedule misnumbered" — agreed but Low.

**What this signals:** risk-rating rules in `06_risk_rules.md` need calibration for this finding category. **Tune the rating thresholds.**

### REJ-07 · Risk under-rated

The finding is real but the risk rating is too LOW.

**Examples:**
- Flagged Medium: "Cause-and-effect matrix missing." Design team says Critical — this is a tender release blocker.
- Flagged Low: "DAC drawings out of date." Design team says High — DAC re-issue needed before construction.

**What this signals:** the agent under-weighted statutory or sector consequence. **Strengthen the Critical override rules in `06_risk_rules.md`.**

### REJ-08 · Stage-inappropriate

The finding demands evidence at a stage where it would not reasonably exist.

**Examples:**
- At pre-tender stage, agent demanded commissioning certificates.
- At concept stage, agent demanded as-built dimensional verification.

**What this signals:** Check 3 (stage appropriateness) in self-check failed. **Strengthen the stage-routing rule — these become Hold Points or Handover Evidence, not Critical Blockers.**

### REJ-09 · Conflicts with planning permission already granted

The finding flags something that conflicts with what was approved in planning, where the planning grant is the controlling document.

**Examples:**
- "Site layout shows car park exceeding TGD M parking standard" — but the planning grant approved the layout exactly as shown, and the local authority's discretion overrides TGD M guidance.
- "Materials non-standard for sector" — but planning specifically approved these materials under a condition.

**What this signals:** the agent didn't read the planning grant + conditions BEFORE issuing findings. **Strengthen planning-precedence rule.**

### REJ-10 · Conflicts with alternative compliance route documented

The design team has chosen a non-TGD alternative compliance route and signed a competent-person rationale that the agent didn't index.

**Examples:**
- Fire strategy uses a BS 9999 timed-evacuation approach instead of TGD B Vol 2 — competent fire engineer signed the rationale.
- Energy strategy uses dynamic simulation modelling instead of DEAP — SEAI-registered EED-consultant signed the rationale.

**What this signals:** the master system prompt's principle on TGD ("evidence of one recognised way") needs application. **Strengthen alternative-compliance recognition.**

### REJ-11 · Duplicate of accepted finding

The finding is real but the same issue is already raised by another discipline and accepted.

**Examples:**
- Architect, Fire, and DAC all separately flag the same fire-door mismatch.
- Civil and Landscape both flag the same SuDS attenuation gap.

**What this signals:** the adjudicator's duplicate-merge logic missed this. **Strengthen Stage 6 deduplication.**

### REJ-12 · Generic / not actionable

The finding is too vague for the design team to act on. They cannot identify what specific change would close it.

**Examples:**
- "Coordination between disciplines is unclear" — but no specific clash identified.
- "Specification needs further detail" — but no specific section called out.

**What this signals:** Check 6 (required evidence) and Check 7 (owner) failed. **Re-train on specificity.**

---

## Feedback object — JSON schema

Persisted to the database when the design team reviews a released finding.

```json
{
  "feedback_id": "string",
  "project_id": "string",
  "finding_id": "string",
  "discipline": "string",
  "original_status": "Compliant | Non-compliant | Not demonstrated | ...",
  "original_risk": "Critical | High | Medium | Low | Advisory",
  "design_team_response": "Accepted | Accepted with risk re-rated | Rejected | Already actioned",
  "rejection_primary_reason": "REJ-01 | REJ-02 | ... | REJ-12",
  "rejection_secondary_reason": "REJ-01 | ... | null",
  "design_team_comment": "string",
  "responding_party": "string (named person + role)",
  "responding_party_charter": "RIAI | EI | SCSI | IFSE | other",
  "responded_at": "ISO-8601 timestamp",
  "agent_audit_log_entry_id": "string (links back to self-check decision)",
  "model_used": "string",
  "corpus_version": "string",
  "prompt_version": "string",
  "reviewer_action": "Promoted to next pack | Held for review | Suppressed in future scans | Re-routed to different agent"
}
```

---

## Feedback capture UI requirements

The customer-facing finding viewer must let the design team:

1. **Accept** the finding (no further action — finding stays in register).
2. **Accept with risk re-rated** — choose new risk level; reason free text.
3. **Reject** — select rejection_primary_reason from the 12 categories; reason free text required; optional secondary reason.
4. **Already actioned** — link to the document or RFI that addresses it.

This is the entire feedback surface. No free-text-only "Not applicable" with no structure — that throws away the training signal.

---

## Worked examples — what good feedback looks like

### Example A · Accepted as flagged

```
Finding: Date for Substantial Completion is left blank (Critical, C-03)
Response: Accepted
Comment: Confirmed at design team meeting. Form of Tender Schedule Part 1 §4.2 reissued as Revision B with completion date inserted (2027-03-31).
Responding party: Sarah Murphy, Architect (RIAI)
```

### Example B · Accepted with risk re-rated

```
Finding: "I.S. EN 10101" typo in Electrical Specification (Medium, H-09)
Response: Accepted with risk re-rated to Low
Comment: Typo confirmed. Electrical engineer will reissue spec as Revision B. Issue is obvious from context — design team and contractors will read I.S. 10101:2020 correctly. Low priority correction.
Responding party: Peter O'Brien, Electrical Engineer (EI CEng)
Rejection primary reason: REJ-06 (Risk over-rated)
```

### Example C · Rejected — REJ-03 already addressed

```
Finding: Cause-and-effect matrix not appended (Critical, H-12)
Response: Rejected — REJ-03 already addressed in pack
Comment: Cause-and-effect matrix is uploaded as a separate PDF (Fire-CE-Matrix-Rev-A.pdf) in the Fire folder. It appears the scan did not include this document — please re-run with the latest folder.
Responding party: Mary Doyle, Fire Safety Engineer (IFSE FSE)
```

### Example D · Rejected — REJ-09 conflicts with planning

```
Finding: Car park layout shows 18 spaces inconsistent with TGD M parking standard requiring 24 (High, H-33)
Response: Rejected — REJ-09 conflicts with planning permission
Comment: Planning grant (Reg Ref 23/12345) explicitly approved 18 spaces under Condition 7. The local authority allowed reduced parking provision in this location. TGD M guidance does not override the approved planning grant.
Responding party: Conor Hennessy, Planning Consultant
```

### Example E · Rejected — REJ-10 alternative compliance documented

```
Finding: Fire strategy does not follow TGD B Vol 2 escape distances (Critical, C-08)
Response: Rejected — REJ-10 alternative compliance route documented
Comment: Fire strategy uses a BS 9999 timed-evacuation approach with movement modelling. Competent Fire Engineer's rationale signed off and submitted with FSC application. Rationale document is in the Fire folder (Fire-Rationale-BS9999-Rev-A.pdf). Please review against alternative compliance route, not TGD B.
Responding party: Mary Doyle, Fire Safety Engineer (IFSE FSE)
```

---

## What the system does with each rejection

Every rejection is automatically:

1. Logged to `audit_log` with the rejection_primary_reason.
2. Routed to the lessons-learnt loop (see `15_lessons_learnt_loop.md`).
3. Tagged against the agent + prompt version + model that produced the finding.
4. Reviewed weekly by the lessons-learnt cron job.
5. Aggregated into the agent's calibration report.

A rejection is NEVER:

- Used as evidence of agent failure for a single instance (one rejection ≠ retrain).
- Used as evidence that the design team is right and the agent is wrong (sometimes the design team rejects valid findings — that's separately tracked).
- Hidden from the chartered reviewer (the chartered reviewer sees the rejection AND the original finding and decides whether the rejection is valid).

---

## Counter-rejection — when the reviewer overrides

A chartered reviewer may **counter-reject** a design team's rejection. Example:

```
Design team rejected REJ-09 — claimed planning grant conflicts.
Chartered reviewer counter-rejection:
  Reason: Planning grant does not actually contain the cited condition. Planning Reg Ref 23/12345 reviewed; Condition 7 reads "[verbatim text]" — does NOT override TGD M parking on this site.
  Original finding reinstated.
  Risk maintained at High.
  Counter-rejection recorded in audit log.
```

Counter-rejections are valuable training signal because they tell us where design teams over-claim "not applicable" — which sectors, which finding categories, which planning authority areas.

---

*Every rejection is a teaching moment. The cost of a "Not applicable" is information, not insult.*
