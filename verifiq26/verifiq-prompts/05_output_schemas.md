# 05 · Output Schemas

**Use:** Canonical JSON schemas for every structured output. The database tables, API responses, and report templates must conform to these.

---

## 05.1 · Finding object

Single discipline-agent finding. The atomic unit of the system.

```json
{
  "issue_id": "string",
  "discipline_origin": "string",
  "interface_disciplines": ["string"],
  "stage": "design | pre-tender | pre-build | construction | handover",
  "project_area": "string",
  "location": "string",
  "source_document": "string",
  "source_reference": "string",
  "related_documents": ["string"],
  "requirement": "string",
  "finding": "string",
  "status": "Compliant | Non-compliant | Not demonstrated | Clarification required | Coordination issue | Construction evidence required | Handover evidence required | Outside current scope",
  "risk": "Critical | High | Medium | Low | Advisory",
  "build_readiness_impact": "Build blocker | Proceed with condition | Pre-tender close-out | Pre-construction close-out | Construction hold point | Handover requirement | Advisory",
  "question": "string",
  "required_evidence": ["string"],
  "owner": "string",
  "secondary_owner": "string",
  "close_out_stage": "string",
  "council_decision": "Retained | Amended | Merged | Downgraded | Escalated | Deleted",
  "rationale": "string"
}
```

### Field rules

- `issue_id`: Stable identifier across stages. Format: `{discipline_code}-{stage_code}-{sequence}`, e.g., `ARCH-PRE-0001`.
- `source_document` + `source_reference`: Required. Verbatim filename + page/section. No paraphrase.
- `finding`: Should be drawn directly from the document where possible. If quoting verbatim, mark in source_reference.
- `council_decision`: Populated only after Stage 6 (Adjudication). Empty during Stage 4–5.
- `rationale`: Required when `council_decision` is not `Retained`.

---

## 05.2 · Discipline summary object

One per discipline, after the discipline review completes.

```json
{
  "discipline": "string",
  "documents_reviewed": ["string"],
  "documents_missing": ["string"],
  "overall_status": "Acceptable | Partial | Not demonstrated | High risk | Critical risk",
  "critical_findings_count": 0,
  "high_findings_count": 0,
  "medium_findings_count": 0,
  "key_risks": ["string"],
  "questions_for_other_disciplines": [
    {
      "target_discipline": "string",
      "question": "string",
      "reason": "string",
      "risk": "string"
    }
  ],
  "evidence_required_before_build": ["string"],
  "construction_hold_points": ["string"],
  "handover_evidence": ["string"]
}
```

### Field rules

- `questions_for_other_disciplines`: This drives the Stage 5 cross-discipline challenge matrix. Each entry seeds a challenge run.

---

## 05.3 · Build Readiness Report object

The canonical Stage 7 output. One per pack, version-stamped.

```json
{
  "project_name": "string",
  "project_stage": "string",
  "building_type": "string",
  "review_date": "string",
  "regulatory_modules_activated": ["string"],
  "disciplines_reviewed": ["string"],
  "build_readiness_rating": "Green | Amber | Red | Grey",
  "executive_decision": "Proceed | Proceed with conditions | Pause before build | Insufficient information",
  "council_summary": "string",
  "critical_blockers": [],
  "high_risk_conditions": [],
  "discipline_action_matrix": [],
  "interface_risk_matrix": [],
  "statutory_approval_risks": [],
  "planning_condition_risks": [],
  "tender_cost_risks": [],
  "construction_hold_points": [],
  "handover_evidence_requirements": [],
  "final_recommendation": "string"
}
```

### Field rules

- `executive_decision`: Exactly one of the four values. No "Proceed with caveats" or other variants.
- `build_readiness_rating` ↔ `executive_decision` mapping enforced per file `06_risk_rules.md`:
  - Green → Proceed
  - Amber → Proceed with conditions
  - Red → Pause before build
  - Grey → Insufficient information
- All array fields are populated by references to Finding objects (issue_id), not duplicated content.

---

## 05.4 · Database mapping (recommended schema)

```sql
-- Core tables
projects (project_id, name, address, building_type, stage, ...)
intake_answers (project_id, key, value)
documents (doc_id, project_id, filename, discipline, doc_type, drawing_number, revision, date, status, stage, author, sha256_hash)
modules (project_id, module_name, activated_at, activated_by)
findings (issue_id, project_id, discipline_origin, status, risk, ...)
finding_interfaces (issue_id, interface_discipline)
challenges (challenge_id, issue_id, challenger_discipline, decision, revised_risk, rationale, created_at)
adjudications (issue_id, council_decision, rationale, adjudicator_model, adjudicated_at)
discipline_summaries (summary_id, project_id, discipline, ...)
reports (report_id, project_id, version, build_readiness_rating, executive_decision, created_at, reviewer_initials)
report_findings (report_id, issue_id, section)  -- which findings appear in which report section
audit_log (entry_id, project_id, actor, action, target_type, target_id, payload_json, occurred_at)
```

### Audit log

Every finding state transition, every adjudicator decision, every chair-report-publication writes to `audit_log`. This is non-negotiable — the reviewer-signed audit log is the customer's primary trust artefact.

---

## 05.5 · Export formats

The application must export the Build Readiness Report in:

- **PDF** — branded with VerifIQ engineering register (see parent repo `website/verifiq-system.css`). Cover sheet carries locked disclaimer.
- **DOCX** — Word document for design-team RFI integration.
- **XLSX** — Findings register as a spreadsheet with one row per finding, columns matching the Finding object schema.
- **CSV** — Same as XLSX but headless / machine-readable.
- **JSON** — Raw report object per § 05.3 for API consumers.

All exports must carry corpus version, reviewer initials, document hashes, and the locked disclaimer.
