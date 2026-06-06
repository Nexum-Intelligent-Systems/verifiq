# 10 · Developer Task Prompt (Codex / Claude Code)

**Use:** Paste this into Codex or Claude Code as the top-level task brief. It expects the agent to have already read files 00–09 and 11–12.

---

Build a web application called **VerifIQ**.

VerifIQ is an Irish pre-build design compliance assurance platform.

The application allows users to create a construction project, upload design-team documentation, classify documents by discipline, run a multi-agent compliance review, conduct peer challenge between discipline agents, adjudicate findings, and generate a Build Readiness Report.

**Core product promise:**

> *"VerifIQ gives Irish project teams a structured, evidence-based answer to one critical question: are we actually ready to build?"*

---

## Required features

### 1. Project creation

Fields:

- Project name
- Address
- Building type
- Project stage
- Project type
- Sector use
- Occupant type
- Planning status
- FSC status
- DAC status
- BCAR applicability
- HIQA relevance
- Mental Health Commission relevance
- Tusla relevance
- Conservation relevance
- Landscape/ecology/SuDS relevance
- Disciplines appointed

### 2. Document upload

Allow users to upload documents into discipline folders:

- Architecture
- Fire
- Access / DAC
- Mechanical
- Electrical
- Structural
- Civil
- Planning
- Landscape
- Conservation
- PSDP
- BCAR / Assigned Certifier
- QS
- Contractor
- Specialist systems
- Handover

### 3. Document metadata

Capture:

- File name
- Discipline
- Document type
- Drawing number
- Revision
- Date
- Status
- Author
- Stage
- Notes

### 4. Regulatory trigger engine

Based on intake answers, activate relevant modules:

- Building Regulations
- Planning Conditions
- Fire Safety Certificate
- Disability Access Certificate
- BCAR
- HIQA
- Mental Health Commission
- Tusla
- Landscape
- Conservation
- Civil / SuDS
- Tender Risk
- Handover

### 5. Agent review engine

Implement discipline-specific prompt templates (see `04_agent_prompts.md`).

Each agent produces structured findings using the Finding JSON schema (see `05_output_schemas.md` § 05.1).

### 6. Peer challenge engine

Allow findings from one discipline to be challenged by another discipline agent (see `07_council_prompts.md` § 07.1).

### 7. Adjudication engine

Merge, remove, downgrade, escalate and assign findings (see `07_council_prompts.md` § 07.2).

### 8. Build readiness engine

Determine:

- Green / Amber / Red / Grey
- Proceed / Proceed with conditions / Pause before build / Insufficient information

Per the mapping rules in `06_risk_rules.md`.

### 9. Reports

Generate:

- Build Readiness Report
- Discipline Action Matrix
- Interface Risk Matrix
- Missing Evidence Schedule
- Planning Condition Tracker
- Statutory Approval Tracker
- Tender Risk Register
- Construction Hold Points
- Handover Evidence Tracker

### 10. Database

Create tables or collections for:

- Users
- Projects
- Disciplines
- Documents
- Regulatory modules
- Findings
- Peer challenges
- Adjudicated findings
- Reports
- Actions
- Evidence requirements
- Risk ratings

See `05_output_schemas.md` § 05.4 for recommended SQL schema.

### 11. UI

Create screens:

- Dashboard
- Create project
- Project intake questionnaire
- Document upload by discipline
- Module activation summary
- Review run screen
- Findings table
- Peer challenge table
- Adjudicated issue register
- Build readiness dashboard
- Report export page

See `09_app_frontend_prompt.md` for copy.

Visual aesthetic: bone-paper engineering register — `verifiq-system.css` + `verifiq-cad.css` in the parent repo's `website/`.

### 12. Export

Allow export to:

- PDF
- Word (DOCX)
- CSV issue register
- Excel (XLSX) tracker
- JSON

---

## Non-functional requirements

- Clean professional UI.
- Irish construction terminology throughout.
- Strong audit trail.
- Revision tracking.
- Evidence-first outputs.
- No unsupported compliance claims.
- Clear disclaimer that VerifIQ is assurance support and not statutory certification.
- EU data residency (Convex EU-West / equivalent).
- Document SHA-256 hash dedup (abuse prevention).
- 14-day document deletion, 90-day hash retention, 30-day inference log retention.
- No model training on customer documents.

---

## Architectural rules

Use modular architecture.

- **Separate prompt templates from business logic.** Prompts live in `verifiq-prompts/` (this directory). Code reads them at startup. Never inline prompts in source files.
- **Separate findings schema from UI.** Schema definitions live in a single source of truth (`schema.ts` or `schema.py`); UI components import the types.
- **Make it easy to plug in different LLM providers** such as OpenAI, Anthropic Claude and Google Gemini. Implement a provider-agnostic adapter.

---

## Suggested stack

| Layer | Stack | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router) on Vercel | Already used in parent repo's `website/` |
| Backend | Convex (TypeScript, reactive queries, file storage) | POC scaffold exists in parent repo `src/convex/` |
| Auth | Clerk multi-tenant | EU residency option, B2B native |
| Payments | Stripe + Stripe Tax | EU VAT handling |
| LLM | Anthropic Claude (primary) + OpenAI (fallback) | Multi-provider per file 02 |
| Email | Resend | EU-hosted transactional |
| Analytics | Plausible | Cookie-free, EU-hosted |
| Storage | Convex file storage (EU-West) | EU residency |
| Hosting | Vercel EU edge | Latency for Irish customers |

---

## MVP scope (build this first)

1. Project intake.
2. Document upload by discipline.
3. Six agents: Architect, Fire, Access, M&E, QS, Chair.
4. Findings table.
5. Peer challenge.
6. Adjudicated issue register.
7. Build Readiness Report.

Everything else is Phase 2. See `12_mvp_scope.md`.

---

## Definition of Done — MVP

Before declaring MVP complete:

- [ ] Project intake form captures all fields above.
- [ ] Document upload accepts ZIP per discipline gate, extracts files, computes SHA-256, stores manifest.
- [ ] Six agents produce findings conforming to schema § 05.1.
- [ ] Findings table renders all findings with filters by discipline / status / risk.
- [ ] Peer challenge runs at least one cross-discipline challenge per finding flagged as Critical or High.
- [ ] Adjudicator produces a final issue register with `council_decision` populated on every finding.
- [ ] Build Readiness Report generates per schema § 05.3 with all 13 sections present.
- [ ] PDF + XLSX + JSON exports of the report work.
- [ ] Locked disclaimer appears on every report cover, every email, every UI page footer.
- [ ] Audit log captures every state transition.
- [ ] 14-day document deletion job runs.
- [ ] No model training on customer documents (verified in provider DPAs).

---

## What NOT to build for MVP

- All 13 disciplines (only 6 for MVP).
- All 13 regulatory modules (only the 4 most material — Building Regulations, FSC, DAC, BCAR).
- Mobile app.
- API for third parties.
- Outcome-priced billing.
- Multi-region (Ireland only).
- All export formats (PDF + XLSX + JSON only).

---

## Anti-patterns (these will be rejected on review)

- A chat interface to ask compliance questions. **No.** This is not a chatbot.
- A generic "AI document Q&A" UI. **No.** Read file 12.
- Plain-text findings without structure. **No.** Findings are schema-locked.
- "Smart suggestions" mixed into review output. **No.** Output is council-adjudicated, not model-suggested.
- A "score" or "confidence percentage" on findings. **No.** Findings are categorical, not probabilistic.
- Marketing language in product output. **No.** Sober Irish professional voice.

---

## Begin

Read `12_mvp_scope.md` next, then start with the database schema, then the LLM provider adapter, then the project intake screen.
