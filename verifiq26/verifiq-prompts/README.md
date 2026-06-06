# VerifIQ — Prompt Pack for Codex / Claude Code

**Purpose:** Foundation prompt pack for building VerifIQ as a multi-agent Pre-Build Compliance Council.  
**Audience:** Codex, Claude Code, or any agent that will write the VerifIQ application.  
**Status:** v1.0 · Ready for issue · 2026-06-01

---

## What is VerifIQ

VerifIQ gives Irish project teams a structured, evidence-based answer to one critical question:

> **Are we actually ready to build?**

Tagline: **Know before you build.**

VerifIQ checks whether your design is genuinely ready for construction by reviewing compliance, coordination, tender risk and missing evidence across the full project team. Output: **Proceed**, **Proceed with conditions**, **Pause before build**, or **Insufficient information**.

---

## How to use this pack

If you are an AI agent (Codex, Claude Code, or similar) tasked with building VerifIQ, read every file in this directory **in numerical order**:

| # | File | Purpose |
|---|---|---|
| 00 | `CLAUDE.md` | Top-level agent instructions (read first if you are an LLM coding agent) |
| 01 | `01_master_system_prompt.md` | Core identity, principles, scope, output classifications |
| 02 | `02_agent_architecture.md` | The Council — 7 agent types + multi-LLM configuration |
| 03 | `03_review_workflow.md` | 7-stage review workflow from intake to council report |
| 04 | `04_agent_prompts.md` | Discipline-specific agent prompts (12 disciplines + sector regulator) |
| 05 | `05_output_schemas.md` | Finding, discipline summary, and report JSON schemas |
| 06 | `06_risk_rules.md` | Risk rating rules, build-readiness rules, decision rules |
| 07 | `07_council_prompts.md` | Peer challenge, adjudicator, council chair prompts |
| 08 | `08_guardrails.md` | What VerifIQ must never do — 16 guardrails |
| 09 | `09_app_frontend_prompt.md` | Customer-facing app copy |
| 10 | `10_developer_task_prompt.md` | Build specification for the application itself |
| 11 | `11_source_anchors.md` | Legal/regulatory source anchors |
| 12 | `12_mvp_scope.md` | Brutal product note + MVP scope guardrail |

---

## Critical product principle

> **Do not build this as a generic "AI document reviewer".**
>
> The repo must be organised around evidence, findings, disciplines, interfaces, risk, adjudication and build-readiness. That is the system.

If your generated code is not organised around those concepts, you are building the wrong thing. Re-read file 12 before continuing.

---

## MVP scope (minimum acceptable Phase 1)

1. Project intake.
2. Document upload by discipline.
3. Six agents: Architect, Fire, Access, M&E, QS, Chair.
4. Findings table.
5. Peer challenge.
6. Adjudicated issue register.
7. Build Readiness Report.

Everything else is Phase 2.

---

## Locked language — non-negotiable

VerifIQ does NOT certify. The locked posture is the same across this build:

> *VerifIQ is a software-based reading aid. It surfaces, in the documents' own words, what a registered professional may wish to read closely. It does not certify, sign, opine, or substitute for professional judgement. The registered designer reads our output, exercises their own judgement, verifies locally, and signs. The professional indemnity remains theirs. We carry product-quality risk only.*

Every output, every report, every email must carry this. See file 08 (guardrails) and the parent repo's `website/legal-notice.html`.

---

## Context this pack lives in

This prompt pack is part of the VerifIQ repo (`verifiq26/`). The customer-facing surface (website, legal notices, financial model, pitch deck) is already built and lives in:

- `verifiq26/website/` — public-facing pages
- `verifiq26/docs/` — strategic + operational docs (15 numbered docs)
- `verifiq26/src/convex/` — POC scaffolding (early)
- `verifiq26/PROJECT_PLAN.md` — pinned master schedule

The prompt pack here is the **AI-agent-side** build spec — what Codex / Claude Code must produce when building the multi-agent platform itself.

---

## Update cadence

- Treat this prompt pack as code: version control every change.
- When a prompt is materially updated, bump the version line in the affected file's header.
- Changes to the locked language (file 08) require solicitor review.
- Changes to discipline prompts (file 04) should be reviewed by the relevant chartered professional before production deployment.

---

*Liam Doolan · Founder · VerifIQ (a GovIQ Ltd product) · Dublin · 2026*
