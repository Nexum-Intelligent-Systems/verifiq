# CLAUDE.md — Top-level agent instructions

You are an AI coding agent (Codex, Claude Code, or similar) tasked with building **VerifIQ**, an Irish pre-build design compliance assurance platform.

This file is the orientation pack. Read every numbered file in this directory before generating code.

---

## Reading order

1. `README.md` — orientation + table of contents
2. `01_master_system_prompt.md` — core identity and principles
3. `02_agent_architecture.md` — the multi-agent Council structure
4. `03_review_workflow.md` — the 7-stage workflow
5. `04_agent_prompts.md` — discipline-specific prompts
6. `05_output_schemas.md` — JSON output schemas
7. `06_risk_rules.md` — risk + decision rules
8. `07_council_prompts.md` — peer challenge + adjudicator + chair prompts
9. `08_guardrails.md` — what VerifIQ must never do
10. `09_app_frontend_prompt.md` — customer-facing copy
11. `10_developer_task_prompt.md` — build spec for the application
12. `11_source_anchors.md` — regulatory source anchors
13. `12_mvp_scope.md` — MVP scope and brutal product note

---

## The single principle

VerifIQ exists to answer one question for Irish project teams:

> **Are we actually ready to build?**

Every architectural decision, every database schema, every UI screen, every agent prompt must serve that question. If you find yourself building something that doesn't, stop and reread file 12.

---

## What VerifIQ is NOT

- Not a generic AI document reviewer.
- Not a chat interface for compliance questions.
- Not a checklist application.
- Not a substitute for chartered professionals.
- Not a certification service.
- Not a regulator.

What it IS:

- A multi-agent Pre-Build Compliance Council.
- An evidence-led structured review system.
- An adjudicated decision producer (Proceed / Conditions / Pause / Insufficient).
- A reporting platform that consolidates discipline findings into one council report.

---

## Build philosophy

- **Evidence-led:** never accept a generic note as compliant. Use "Not demonstrated" liberally.
- **Council-driven:** no agent reports findings unchallenged. Every finding goes through peer challenge → adjudication → chair.
- **Schema-locked:** every finding, summary, and report conforms to the JSON schemas in file 05.
- **Irish-context:** Building Regulations Parts A–M, BCAR SI 9/2014, CWMF, PW-CF, HIQA, MHC, Tusla, HSE, Conservation, etc.
- **Locked legal posture:** disclaimers shipped on every output. See file 08.
- **Multi-LLM:** discipline agents use one model; peer challenge uses another; adjudicator uses a third. Never let one model carry all three roles in the same review.

---

## Modular architecture (non-negotiable)

Build the application with these separations:

| Module | Responsibility |
|---|---|
| Prompt templates | Loaded from files in `verifiq-prompts/`. Not in code. |
| Business logic | Workflow orchestration: intake → classify → review → challenge → adjudicate → report |
| LLM providers | Pluggable adapter pattern. Anthropic, OpenAI, Gemini all supported. |
| Findings schema | Locked schema per file 05. Database tables mirror it. |
| UI layer | Reads/writes findings; never calls LLMs directly. |
| Reports | Generated from adjudicated findings only — not raw model output. |

If any of these blur together in your generated code, refactor before declaring done.

---

## Multi-LLM configuration (mandatory)

For each discipline review:

1. **Primary Reviewer LLM** — reviews the evidence, produces candidate findings.
2. **Challenge Reviewer LLM** (different provider/model) — challenges every finding from another discipline's perspective.
3. **Adjudicator LLM** (third provider/model) — verifies, downgrades, escalates, merges, deletes.

The customer never sees raw model output. They see only the adjudicated council position.

Suggested initial wiring:
- Primary: Anthropic Claude Sonnet
- Challenge: OpenAI GPT-4-class
- Adjudicator: Anthropic Claude Opus (or Sonnet with explicit adjudicator prompt)

---

## MVP scope guardrail

Build only the MVP first:

1. Project intake.
2. Document upload by discipline.
3. Six agents: Architect, Fire, Access, M&E, QS, Chair.
4. Findings table.
5. Peer challenge.
6. Adjudicated issue register.
7. Build Readiness Report.

Do NOT build:
- All 13 discipline agents (Phase 2).
- All 13 regulatory modules (Phase 2).
- API access for third parties (Phase 3).
- Mobile reviewer app (Phase 3).
- Outcome-pricing for Tier V (post-month-9).

---

## When you finish

Before declaring the MVP done:

1. Run an end-to-end review on a sample pack (the parent repo has a 327-finding validation pack at `verifiq26/evidence/findings-register-v0.8-scan-view.xlsx`).
2. Verify the locked disclaimer appears on every output surface.
3. Verify findings carry verbatim source quotes — not paraphrases.
4. Verify the Build Readiness Report produces exactly one of: Proceed / Proceed with conditions / Pause before build / Insufficient information.
5. Verify the audit log includes reviewer initials, source document references, and corpus versions.

---

*Begin with file 01.*
