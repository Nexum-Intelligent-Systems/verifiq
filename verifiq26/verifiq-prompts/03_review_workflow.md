# 03 · Review Workflow

**Use:** The 7-stage orchestration workflow from project intake to council report.

---

## Stage 1 — Project Intake

Ask the user for:

- Project name
- Project address
- Building type
- Project stage
- New build / refurbishment / extension / change of use / material alteration / maintenance
- Sector use
- Occupant profile
- Vulnerable users
- Sleeping risk
- Public access
- Workplace use
- Healthcare use
- Disability service use
- Mental health service use
- Childcare / Tusla-related use
- HIQA relevance
- Mental Health Commission relevance
- Tusla relevance
- Planning status
- Fire Safety Certificate status
- Disability Access Certificate status
- BCAR applicability
- Conservation status
- Landscape / ecology / SuDS conditions
- Disciplines appointed

---

## Stage 2 — Document Upload and Classification

Classify each uploaded document by:

- Discipline
- Document type
- Drawing number
- Revision
- Date
- Status
- Stage
- Author
- Level / zone / building
- Related discipline
- Approval status

---

## Stage 3 — Regulatory Triggering

Activate modules based on intake and document evidence:

- Building Regulations module
- Fire Safety Certificate module
- DAC / Part M module
- BCAR module
- Planning Conditions module
- HIQA module
- Mental Health Commission module
- Tusla module
- Landscape module
- Conservation module
- Civil / drainage / SuDS module
- Tender Risk module
- Construction Hold Point module
- Handover Evidence module

---

## Stage 4 — Discipline Review

Each discipline agent reviews:

- Completeness
- Compliance
- Coordination
- Buildability
- Tender clarity
- Risk allocation
- Required evidence
- Construction hold points
- Handover requirements

---

## Stage 5 — Cross-Discipline Challenge

Relevant disciplines challenge each other's findings.

**Examples:**

- Fire challenges mechanical penetrations.
- DAC challenges civil external gradients.
- Architect challenges fire door schedules.
- QS challenges scope omissions.
- Assigned Certifier challenges inspection and certification evidence.
- Planning challenges landscape, materials and site layout compliance.
- PSDP challenges residual design risk.

---

## Stage 6 — Adjudication

The Adjudicator Agent:

- Removes duplicates
- Removes unsupported findings
- Removes irrelevant comments
- Corrects ownership
- Corrects risk rating
- Assigns close-out stage
- Identifies build-readiness impact

---

## Stage 7 — Council Report

The Council Chair Agent issues:

- Build Readiness Rating
- Executive Decision
- Critical Blockers
- High-Risk Conditions
- Discipline Action Matrix
- Interface Risk Matrix
- Missing Evidence Schedule
- Planning Condition Tracker
- Statutory Approval Tracker
- Tender Risk Register
- Construction Hold Points
- Handover Evidence Requirements
- Final Recommendation

---

## Orchestration sequencing notes

- Stages 1–3 are sequential and gating: cannot run Stage 4 without intake + classification + module activation complete.
- Stage 4 is parallel across all activated disciplines.
- Stage 5 is structured: define the interface-challenge matrix at activation and run challenges in parallel within each matrix cell.
- Stage 6 runs after ALL Stage 5 outputs are in. No early adjudication.
- Stage 7 runs once and only once per pack. The Chair's output is canonical.

## State persistence

Every stage's output is persisted to the database (see `05_output_schemas.md`). Resumability is required — a review may run for 24–72 hours; the system must survive restarts mid-review.
