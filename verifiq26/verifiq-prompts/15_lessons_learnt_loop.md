# 15 · Lessons Learnt Loop

**Use:** The full architecture for continuous improvement of VerifIQ agents based on structured feedback. This is the system's "machine learning loop" — though strictly speaking it's a prompt-engineering feedback loop rather than model retraining (see § "What this is NOT" below).

**Why this exists:** v1.0 agents are competent. v3.0 agents — the ones chartered designers trust — are calibrated against thousands of accepted and rejected findings. The loop is how we get from v1 to v3.

---

## The 7 stages

```
                ┌────────────────────────────────────────────┐
                │                                            │
                ▼                                            │
   1. CAPTURE ──► 2. PERSIST ──► 3. AGGREGATE ──► 4. ANALYSE │
                                                      │     │
                                                      ▼     │
        7. DEPLOY ◄── 6. TEST ◄────── 5. REFINE ─────┘     │
                │                                            │
                └────────────────────────────────────────────┘
                          Quarterly retrospective
```

---

### Stage 1 — Capture

Trigger: design team responds to any released finding.

Captured per `14_feedback_taxonomy.md` schema. Required fields:

- `finding_id` (links back to original)
- `design_team_response` (Accepted / Re-rated / Rejected / Already actioned)
- `rejection_primary_reason` (one of REJ-01 to REJ-12)
- `responding_party` + `responding_party_charter`

UI surface: customer's findings viewer, with structured drop-downs (not free text).

API surface: `POST /api/findings/{id}/feedback` with the feedback object.

---

### Stage 2 — Persist

Database table: `findings_feedback`

Each feedback row carries the audit-log entry ID of the **agent self-check** that produced the finding (see `13_agent_self_check_protocol.md`). This is the key join — it lets us see *what the agent's reasoning was* when it decided to emit.

The feedback row also carries:

- `model_used` (e.g., `claude-sonnet-4-6`)
- `prompt_version` (e.g., `arch-agent-v1.2.3`)
- `corpus_version` (e.g., `irish-corpus-2026-06`)

These three fields are how we attribute outcomes to specific prompt/model/corpus combinations.

---

### Stage 3 — Aggregate

A nightly job rolls feedback up across multiple axes:

| Aggregation axis | What we learn |
|---|---|
| By rejection reason (REJ-01 to REJ-12) | Which agent failure modes dominate |
| By agent | Which agents are most often correct / rejected |
| By model | Which underlying LLM produces better calibrated findings |
| By prompt version | Whether the latest prompt is better than the previous |
| By project sector | Which sectors have systematic agent miscalibration |
| By risk rating | Whether we over-rate or under-rate consistently |
| By finding category (BCAR doc hygiene, contract form, etc.) | Which categories need negative-example library expansion |
| By responding charter (RIAI vs EI vs SCSI) | Whether different charters disagree systematically with us |

Output: weekly aggregation report visible in admin UI.

---

### Stage 4 — Analyse

Weekly cron (Monday 9am Dublin) runs the analyser. For each axis above, the analyser identifies:

1. **Statistically significant deviations** — e.g., agent X has a rejection rate of 35% when the baseline is 18%.
2. **Trending patterns** — e.g., REJ-09 (planning conflict) rejections are rising over time, indicating planning grants aren't being read.
3. **Repeat offenders** — specific finding-text patterns that get rejected >3 times.

Analyser output → an "Improvement Backlog" with proposed prompt refinements ranked by signal strength.

---

### Stage 5 — Refine

Manual step, done weekly by the founder + chartered reviewer panel.

For each backlog item, decide one of:

- **Update agent prompt** — add a new negative example, tighten a self-check question, refine the discipline scope.
- **Update risk rules** — recalibrate Critical/High thresholds for a specific category.
- **Update routing** — change which disciplines the finding belongs to.
- **Update corpus** — add a missing standard or update a stale one.
- **Add to negative-example library** — append to `13_agent_self_check_protocol.md` neg-example section.
- **Hold** — not enough signal yet; revisit in two weeks.

Each refinement gets a version number. Prompt versions follow semver: `agent.major.minor.patch`.

- Patch (e.g., `arch-1.2.3` → `arch-1.2.4`): minor wording, no behaviour change expected.
- Minor (`arch-1.2.x` → `arch-1.3.0`): new self-check, new negative example, expected behaviour shift.
- Major (`arch-1.x.x` → `arch-2.0.0`): structural rewrite of the agent prompt.

---

### Stage 6 — Test

Before any prompt change goes to production, it is A/B tested.

**Holdout set:** 20 historical packs (anonymised) with known accepted / rejected findings. Run the new prompt against the holdout set. Compare:

- Same findings flagged?
- Same findings suppressed?
- Same rejection categories present?
- Net acceptance rate change?

**A/B in production (after holdout passes):**

- Random 50% of incoming packs run the NEW prompt; 50% run the CURRENT prompt.
- 4-week window minimum.
- Required outcome to promote: acceptance rate of new prompt ≥ current AND no regression on critical-finding capture.

**Test gates:**

- If new prompt loses ≥1 Critical finding that the current prompt catches, the new prompt is rejected and goes back to refinement.
- If new prompt's acceptance rate is statistically equal but compute cost is higher, the new prompt is rejected unless it brings other benefits.

---

### Stage 7 — Deploy

Promoted prompts are tagged and deployed:

- Prompt file in `verifiq-prompts/` updated.
- New version recorded in `prompt_versions` database table.
- Customers in mid-pack are NOT switched mid-review — they finish on the old prompt for consistency.
- New customers from deploy date onward use the new prompt.
- Audit log records the deploy event.

Quarterly retrospective: did the deployed change move the metrics? If not, roll back and re-refine.

---

## Quality metrics (the dashboard)

| Metric | Definition | Target (year 1) | Stretch target |
|---|---|---|---|
| **Acceptance rate** | findings accepted ÷ total emitted | ≥ 70% | ≥ 85% |
| **Critical-finding precision** | Critical-rated findings accepted as Critical ÷ all Critical-rated | ≥ 80% | ≥ 95% |
| **False-positive rate (REJ-01)** | REJ-01 rejections ÷ total emitted | ≤ 5% | ≤ 1% |
| **Source mis-citation rate (REJ-02)** | REJ-02 rejections ÷ total emitted | ≤ 3% | 0% |
| **Stage-inappropriateness (REJ-08)** | REJ-08 ÷ total emitted | ≤ 4% | ≤ 1% |
| **Planning-grant conflict (REJ-09)** | REJ-09 ÷ total emitted | ≤ 5% | ≤ 1% |
| **Reviewer override rate** | findings the chartered reviewer downgrades or removes ÷ candidates emitted by agents | Track only — no target |
| **Customer time to feedback** | hours from release to first design-team feedback | < 72h |
| **Counter-rejection rate** | counter-rejections per 100 design-team rejections | Track only |
| **Critical-blocker rediscovery** | % of historically accepted Critical findings that the latest prompt would still flag | ≥ 95% |

---

## Scheduled cadence

| Cadence | Task | Owner |
|---|---|---|
| Real-time | Capture every design-team response to a finding | System |
| Daily | Aggregate feedback into rolling totals | System (nightly cron) |
| **Weekly (Monday 9am)** | Run analyser; produce Improvement Backlog | System cron + founder review |
| Bi-weekly | Refinement decisions made on backlog | Founder + 1–2 panel reviewers |
| Weekly (during A/B) | Compare A/B performance | System |
| Quarterly | Major prompt-version review + holdout re-run | Founder + full panel |
| Annually | Model-provider review (whether to change primary LLM) | Founder + board |

The weekly Monday cron is scheduled as a real task — see `verifiq-monday-review` and a new `verifiq-friday-feedback-roll-up` in the parent repo's scheduled tasks.

---

## What this is NOT — boundaries

- **NOT model retraining.** We do not fine-tune Claude or GPT. The system improves by changing prompts, corpora, routing, and orchestration — not by training new model weights.
- **NOT data sale.** Customer feedback is used only to improve VerifIQ's own prompts. It is not sold to any third party and not used to train any LLM provider's models (confirmed in our DPAs with Anthropic and OpenAI).
- **NOT automatic deployment.** Every prompt change requires human review at Stage 5 and Stage 6. No prompt change reaches production without the founder + at least one chartered reviewer's sign-off.
- **NOT individual-designer scoring.** We track agent calibration, not designer reputation. The system never produces a "designer reliability score" or anything resembling one.

---

## Privacy posture

- Feedback rows reference `finding_id` and `project_id` but the actual document content is NOT replicated into the feedback persistence layer.
- After 14 days the source documents are deleted per the abuse-prevention spec; feedback rows survive but reference deleted document IDs.
- After 18 months, anonymised feedback rows may be aggregated into the negative-example library; identifying project metadata is stripped.
- Customer consent is captured at signup: "Anonymised feedback on your findings may be used to improve VerifIQ's review prompts. No project identifying information is retained beyond 18 months."

---

## The lessons-learnt loop in production — first 90 days

| Window | Expected state |
|---|---|
| Days 0–14 | First 3–5 paid packs run. No statistically meaningful feedback yet — capture only. |
| Days 15–30 | First aggregation reports. Founder + reviewer panel look at every rejection manually. |
| Days 30–60 | First prompt refinements proposed. First A/B in production begins. |
| Days 60–90 | First refinements deployed. Acceptance rate baseline established. |
| Day 90+ | Standard weekly cadence active. Quarterly retrospective produces first major-version prompt iterations. |

---

## Founder-level decisions the loop forces

Every quarter, the loop forces explicit decisions on:

1. **Are we shipping flawed findings to customers?** If acceptance rate < 70% for any agent, that agent is paused pending refinement.
2. **Are we over-claiming chartered authority?** If counter-rejection rate is rising, it means the reviewer is too often disagreeing with the design team — investigate whether the reviewer is calibrated correctly or whether the agent's findings are inflating issues.
3. **Are we using the right LLM provider?** If model-A consistently outperforms model-B on acceptance rate, switch the discipline-primary role.
4. **Is the corpus stale?** If REJ-01 / REJ-02 rejections cluster around specific standards, those standards probably moved.
5. **Are we missing a discipline?** If many rejections are REJ-05 (wrong discipline) and the right discipline is one we don't have an agent for, build that agent.

---

## The single sentence

> *The lessons-learnt loop is what turns "AI that surfaces findings" into "AI that surfaces findings that chartered designers respect" — by treating every rejection as structured training data and refining prompts on a disciplined cadence.*

---

*Begin with Stage 1 capture. Everything else compounds.*
