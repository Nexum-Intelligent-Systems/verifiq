/**
 * VerifIQ — Convex database schema (Phase 1)
 *
 * Purpose: Defines every table required for the VerifIQ MVP. The structured
 *   tables (`findings`, `discipline_summaries`, `reports`) mirror the canonical
 *   JSON shapes in `verifiq-prompts/05_output_schemas.md` (§ 05.1–05.3) exactly.
 *   The platform tables (`jobs`, `inference_cache`) follow
 *   `verifiq-prompts/20_platform_architecture.md` § 2. The `documents` table
 *   carries BOTH `convex_storage_id` and `r2_key` per the hybrid storage
 *   decision in `docs/27-stack-decision-storage-and-platform.md`.
 *
 * Implements: 05_output_schemas.md, 20_platform_architecture.md,
 *   14_feedback_taxonomy.md, 15_lessons_learnt_loop.md, docs/27.
 * Version: phase1-v0.1
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ===========================================================================
// SHARED VALIDATORS (single source of truth for enum literals)
// Re-exported so application code + the TypeScript type-mirror in
// `src/types/index.ts` derive from exactly these definitions.
// ===========================================================================

/** Finding stage — 05.1 `stage`. */
export const vStage = v.union(
  v.literal("design"),
  v.literal("pre-tender"),
  v.literal("pre-build"),
  v.literal("construction"),
  v.literal("handover"),
);

/** Finding status — 05.1 `status`. */
export const vFindingStatus = v.union(
  v.literal("Compliant"),
  v.literal("Non-compliant"),
  v.literal("Not demonstrated"),
  v.literal("Clarification required"),
  v.literal("Coordination issue"),
  v.literal("Construction evidence required"),
  v.literal("Handover evidence required"),
  v.literal("Outside current scope"),
);

/** Risk rating — 05.1 `risk`. */
export const vRisk = v.union(
  v.literal("Critical"),
  v.literal("High"),
  v.literal("Medium"),
  v.literal("Low"),
  v.literal("Advisory"),
);

/** Build-readiness impact — 05.1 `build_readiness_impact`. */
export const vBuildReadinessImpact = v.union(
  v.literal("Build blocker"),
  v.literal("Proceed with condition"),
  v.literal("Pre-tender close-out"),
  v.literal("Pre-construction close-out"),
  v.literal("Construction hold point"),
  v.literal("Handover requirement"),
  v.literal("Advisory"),
);

/** Council decision — 05.1 `council_decision`. Populated only after Stage 6. */
export const vCouncilDecision = v.union(
  v.literal("Retained"),
  v.literal("Amended"),
  v.literal("Merged"),
  v.literal("Downgraded"),
  v.literal("Escalated"),
  v.literal("Deleted"),
);

/** Discipline summary overall status — 05.2 `overall_status`. */
export const vOverallStatus = v.union(
  v.literal("Acceptable"),
  v.literal("Partial"),
  v.literal("Not demonstrated"),
  v.literal("High risk"),
  v.literal("Critical risk"),
);

/** Build readiness rating — 05.3 `build_readiness_rating`. */
export const vBuildReadinessRating = v.union(
  v.literal("Green"),
  v.literal("Amber"),
  v.literal("Red"),
  v.literal("Grey"),
);

/** Executive decision — 05.3 `executive_decision`. Exactly one of four. */
export const vExecutiveDecision = v.union(
  v.literal("Proceed"),
  v.literal("Proceed with conditions"),
  v.literal("Pause before build"),
  v.literal("Insufficient information"),
);

/** Long-running scan-state machine — 20_platform_architecture.md § 5. */
export const vScanState = v.union(
  v.literal("pending"),
  v.literal("uploading"),
  v.literal("classifying"),
  v.literal("confirm_classify"),
  v.literal("scanning"),
  v.literal("cross_ref"),
  v.literal("peer_challenge"),
  v.literal("adjudicate"),
  v.literal("reviewer_queue"),
  v.literal("released"),
);

/** Job type — 20_platform_architecture.md § 2. */
export const vJobType = v.union(
  v.literal("classify"),
  v.literal("review_discipline"),
  v.literal("cross_reference"),
  v.literal("peer_challenge"),
  v.literal("adjudicate"),
  v.literal("report"),
);

/** Job status — 20_platform_architecture.md § 2. */
export const vJobStatus = v.union(
  v.literal("pending"),
  v.literal("running"),
  v.literal("succeeded"),
  v.literal("failed"),
  v.literal("retrying"),
);

/** Design-team response to a released finding — 14_feedback_taxonomy.md. */
export const vDesignTeamResponse = v.union(
  v.literal("Accepted"),
  v.literal("Accepted with risk re-rated"),
  v.literal("Rejected"),
  v.literal("Already actioned"),
);

/** Rejection reason — 14_feedback_taxonomy.md REJ-01 .. REJ-12. */
export const vRejectionReason = v.union(
  v.literal("REJ-01"),
  v.literal("REJ-02"),
  v.literal("REJ-03"),
  v.literal("REJ-04"),
  v.literal("REJ-05"),
  v.literal("REJ-06"),
  v.literal("REJ-07"),
  v.literal("REJ-08"),
  v.literal("REJ-09"),
  v.literal("REJ-10"),
  v.literal("REJ-11"),
  v.literal("REJ-12"),
);

/** Prompt-version change type — 15_lessons_learnt_loop.md (semver class). */
export const vChangeType = v.union(v.literal("patch"), v.literal("minor"), v.literal("major"));

/** Prompt-version lifecycle — 15_lessons_learnt_loop.md. */
export const vPromptVersionStatus = v.union(
  v.literal("active"),
  v.literal("testing"),
  v.literal("retired"),
);

// ===========================================================================
// SCHEMA
// ===========================================================================

export default defineSchema({
  // -------------------------------------------------------------------------
  // users — linked to Clerk eventually; Phase 1 stub (clerk_user_id optional).
  // Data-minimised: only what auth + audit attribution requires.
  // -------------------------------------------------------------------------
  users: defineTable({
    clerk_user_id: v.optional(v.string()),
    email: v.string(),
    name: v.optional(v.string()),
    org_id: v.optional(v.string()),
    // Reviewer charter where relevant (RIAI / EI / SCSI / IFSE / other).
    charter: v.optional(v.string()),
    created_at: v.number(),
  })
    .index("by_clerk_user_id", ["clerk_user_id"])
    .index("by_email", ["email"]),

  // -------------------------------------------------------------------------
  // projects — core project record. The structured intake fields
  // (03_review_workflow.md Stage 1); long-tail answers live in intake_answers.
  // -------------------------------------------------------------------------
  projects: defineTable({
    name: v.string(),
    address: v.optional(v.string()),
    building_type: v.optional(v.string()),
    stage: v.optional(vStage),
    // New build / refurbishment / extension / change of use / material
    // alteration / maintenance.
    project_type: v.optional(v.string()),
    sector_use: v.optional(v.string()),
    occupant_profile: v.optional(v.string()),
    planning_status: v.optional(v.string()),
    fsc_status: v.optional(v.string()),
    dac_status: v.optional(v.string()),
    bcar_applicable: v.optional(v.boolean()),
    conservation_status: v.optional(v.string()),
    disciplines_appointed: v.optional(v.array(v.string())),
    // Live scan-state machine (20 § 5).
    state: vScanState,
    created_by: v.optional(v.id("users")),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_state", ["state"])
    .index("by_created_by", ["created_by"]),

  // -------------------------------------------------------------------------
  // intake_answers — key/value pairs from the project intake form. Captures
  // the full Stage-1 questionnaire (sleeping risk, HIQA relevance, etc.).
  // -------------------------------------------------------------------------
  intake_answers: defineTable({
    project_id: v.id("projects"),
    key: v.string(),
    value: v.string(),
    answered_at: v.number(),
  })
    .index("by_project", ["project_id"])
    .index("by_project_key", ["project_id", "key"]),

  // -------------------------------------------------------------------------
  // documents — uploaded files. Carries BOTH storage references per docs/27;
  // exactly one is populated at runtime depending on file size routing.
  // -------------------------------------------------------------------------
  documents: defineTable({
    project_id: v.id("projects"),
    filename: v.string(),
    sha256: v.string(),
    size_bytes: v.number(),
    mime_type: v.optional(v.string()),
    // Hybrid storage — docs/27. One of these is set.
    convex_storage_id: v.optional(v.id("_storage")),
    r2_key: v.optional(v.string()),
    // Classification output (02 § Document Classification; 20 § 3).
    discipline: v.optional(v.string()),
    doc_type: v.optional(v.string()),
    drawing_number: v.optional(v.string()),
    revision: v.optional(v.string()),
    date: v.optional(v.string()),
    status: v.optional(v.string()),
    stage: v.optional(vStage),
    author: v.optional(v.string()),
    classifier_confidence: v.optional(v.number()),
    uploaded_at: v.number(),
  })
    .index("by_project", ["project_id"])
    .index("by_sha256", ["sha256"])
    .index("by_project_discipline", ["project_id", "discipline"]),

  // -------------------------------------------------------------------------
  // modules — activated regulatory modules per project (03 Stage 3).
  // -------------------------------------------------------------------------
  modules: defineTable({
    project_id: v.id("projects"),
    module_name: v.string(),
    trigger_reason: v.optional(v.string()),
    activated_by: v.optional(v.string()),
    activated_at: v.number(),
  })
    .index("by_project", ["project_id"])
    .index("by_project_module", ["project_id", "module_name"]),

  // -------------------------------------------------------------------------
  // findings — the atomic finding object. Mirrors 05_output_schemas.md § 05.1
  // field-for-field, plus operational fields for the lessons-learnt loop.
  // -------------------------------------------------------------------------
  findings: defineTable({
    project_id: v.id("projects"),
    // Stable business identifier: {discipline_code}-{stage_code}-{sequence}.
    issue_id: v.string(),
    discipline_origin: v.string(),
    interface_disciplines: v.array(v.string()),
    stage: vStage,
    project_area: v.optional(v.string()),
    location: v.optional(v.string()),
    source_document: v.string(),
    source_reference: v.string(),
    related_documents: v.array(v.string()),
    requirement: v.string(),
    finding: v.string(),
    status: vFindingStatus,
    risk: vRisk,
    build_readiness_impact: vBuildReadinessImpact,
    question: v.optional(v.string()),
    required_evidence: v.array(v.string()),
    owner: v.string(),
    secondary_owner: v.optional(v.string()),
    close_out_stage: v.optional(v.string()),
    // Populated only after Stage 6 (Adjudication).
    council_decision: v.optional(vCouncilDecision),
    // Required when council_decision is not "Retained".
    rationale: v.optional(v.string()),
    // Verbatim quote from the source document (guardrail 13 / 08).
    source_quote: v.optional(v.string()),
    // Lessons-learnt attribution (15 § 2).
    model_used: v.optional(v.string()),
    prompt_version: v.optional(v.string()),
    corpus_version: v.optional(v.string()),
    // Links back to the agent self-check audit entry (13).
    self_check_audit_entry_id: v.optional(v.id("audit_log")),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_project", ["project_id"])
    .index("by_project_issue_id", ["project_id", "issue_id"])
    .index("by_project_status", ["project_id", "status"])
    .index("by_project_risk", ["project_id", "risk"])
    .index("by_project_discipline", ["project_id", "discipline_origin"]),

  // -------------------------------------------------------------------------
  // finding_interfaces — many-to-many: which findings interface with which
  // disciplines (drives the Stage-5 cross-discipline challenge matrix).
  // -------------------------------------------------------------------------
  finding_interfaces: defineTable({
    project_id: v.id("projects"),
    finding_id: v.id("findings"),
    interface_discipline: v.string(),
  })
    .index("by_finding", ["finding_id"])
    .index("by_project_discipline", ["project_id", "interface_discipline"]),

  // -------------------------------------------------------------------------
  // challenges — peer challenge records (Stage 5; 07 § peer challenge).
  // -------------------------------------------------------------------------
  challenges: defineTable({
    project_id: v.id("projects"),
    finding_id: v.id("findings"),
    challenger_discipline: v.string(),
    decision: v.string(),
    revised_risk: v.optional(vRisk),
    rationale: v.string(),
    model_used: v.optional(v.string()),
    created_at: v.number(),
  })
    .index("by_project", ["project_id"])
    .index("by_finding", ["finding_id"]),

  // -------------------------------------------------------------------------
  // adjudications — adjudicator decisions (Stage 6). Immutable once made;
  // pre-state remains in audit_log.
  // -------------------------------------------------------------------------
  adjudications: defineTable({
    project_id: v.id("projects"),
    finding_id: v.id("findings"),
    council_decision: vCouncilDecision,
    rationale: v.string(),
    revised_risk: v.optional(vRisk),
    revised_owner: v.optional(v.string()),
    adjudicator_model: v.string(),
    adjudicated_at: v.number(),
  })
    .index("by_project", ["project_id"])
    .index("by_finding", ["finding_id"]),

  // -------------------------------------------------------------------------
  // discipline_summaries — one per discipline per project. Mirrors § 05.2.
  // -------------------------------------------------------------------------
  discipline_summaries: defineTable({
    project_id: v.id("projects"),
    discipline: v.string(),
    documents_reviewed: v.array(v.string()),
    documents_missing: v.array(v.string()),
    overall_status: vOverallStatus,
    critical_findings_count: v.number(),
    high_findings_count: v.number(),
    medium_findings_count: v.number(),
    key_risks: v.array(v.string()),
    questions_for_other_disciplines: v.array(
      v.object({
        target_discipline: v.string(),
        question: v.string(),
        reason: v.string(),
        risk: v.string(),
      }),
    ),
    evidence_required_before_build: v.array(v.string()),
    construction_hold_points: v.array(v.string()),
    handover_evidence: v.array(v.string()),
    created_at: v.number(),
  })
    .index("by_project", ["project_id"])
    .index("by_project_discipline", ["project_id", "discipline"]),

  // -------------------------------------------------------------------------
  // reports — Build Readiness Report records. Mirrors § 05.3. Array fields
  // hold issue_id references (not duplicated content), per § 05.3 field rules.
  // -------------------------------------------------------------------------
  reports: defineTable({
    project_id: v.id("projects"),
    version: v.string(),
    project_name: v.string(),
    project_stage: v.optional(v.string()),
    building_type: v.optional(v.string()),
    review_date: v.string(),
    regulatory_modules_activated: v.array(v.string()),
    disciplines_reviewed: v.array(v.string()),
    build_readiness_rating: vBuildReadinessRating,
    executive_decision: vExecutiveDecision,
    council_summary: v.string(),
    // The following arrays carry issue_id references into report sections.
    critical_blockers: v.array(v.string()),
    high_risk_conditions: v.array(v.string()),
    discipline_action_matrix: v.array(v.string()),
    interface_risk_matrix: v.array(v.string()),
    statutory_approval_risks: v.array(v.string()),
    planning_condition_risks: v.array(v.string()),
    tender_cost_risks: v.array(v.string()),
    construction_hold_points: v.array(v.string()),
    handover_evidence_requirements: v.array(v.string()),
    final_recommendation: v.string(),
    // Export provenance (05.5 / CLAUDE.md): every export carries these.
    corpus_version: v.optional(v.string()),
    reviewer_initials: v.optional(v.string()),
    document_hashes: v.array(v.string()),
    created_at: v.number(),
  })
    .index("by_project", ["project_id"])
    .index("by_project_version", ["project_id", "version"]),

  // -------------------------------------------------------------------------
  // report_findings — many-to-many: which findings appear in which report
  // section (drives § 05.3 reference-not-duplicate rule).
  // -------------------------------------------------------------------------
  report_findings: defineTable({
    report_id: v.id("reports"),
    finding_id: v.id("findings"),
    section: v.string(),
  })
    .index("by_report", ["report_id"])
    .index("by_finding", ["finding_id"]),

  // -------------------------------------------------------------------------
  // audit_log — every state transition. The customer's primary trust artefact
  // (05 § Audit log). Writes happen via mutations so they survive action
  // retries (20 § "Audit-log writes are mutations, never actions").
  // -------------------------------------------------------------------------
  audit_log: defineTable({
    project_id: v.optional(v.id("projects")),
    actor: v.string(),
    action: v.string(),
    target_type: v.string(),
    target_id: v.optional(v.string()),
    payload_json: v.string(),
    occurred_at: v.number(),
  })
    .index("by_project", ["project_id"])
    .index("by_target", ["target_type", "target_id"])
    .index("by_occurred_at", ["occurred_at"]),

  // -------------------------------------------------------------------------
  // jobs — the job queue. Mirrors 20_platform_architecture.md § 2.
  // -------------------------------------------------------------------------
  jobs: defineTable({
    project_id: v.id("projects"),
    job_type: vJobType,
    payload_json: v.string(),
    status: vJobStatus,
    attempts: v.number(),
    idempotency_key: v.string(),
    depends_on: v.array(v.id("jobs")),
    scheduled_for: v.number(),
    started_at: v.optional(v.number()),
    completed_at: v.optional(v.number()),
    error: v.optional(v.string()),
    result_ref: v.optional(v.string()),
  })
    .index("by_project", ["project_id"])
    .index("by_status", ["status"])
    .index("by_idempotency_key", ["idempotency_key"])
    .index("by_status_scheduled", ["status", "scheduled_for"]),

  // -------------------------------------------------------------------------
  // findings_feedback — customer rejection feedback. Mirrors the feedback
  // object in 14_feedback_taxonomy.md; primary input to the lessons-learnt
  // loop (15).
  // -------------------------------------------------------------------------
  findings_feedback: defineTable({
    project_id: v.id("projects"),
    finding_id: v.id("findings"),
    discipline: v.string(),
    original_status: vFindingStatus,
    original_risk: vRisk,
    design_team_response: vDesignTeamResponse,
    rejection_primary_reason: v.optional(vRejectionReason),
    rejection_secondary_reason: v.optional(vRejectionReason),
    design_team_comment: v.optional(v.string()),
    responding_party: v.optional(v.string()),
    responding_party_charter: v.optional(v.string()),
    responded_at: v.number(),
    // Join key back to the agent self-check decision (15 § 2).
    agent_audit_log_entry_id: v.optional(v.id("audit_log")),
    model_used: v.optional(v.string()),
    corpus_version: v.optional(v.string()),
    prompt_version: v.optional(v.string()),
    reviewer_action: v.optional(v.string()),
  })
    .index("by_project", ["project_id"])
    .index("by_finding", ["finding_id"])
    .index("by_rejection_reason", ["rejection_primary_reason"]),

  // -------------------------------------------------------------------------
  // prompt_versions — version registry for the lessons-learnt loop (15 § 7).
  // -------------------------------------------------------------------------
  prompt_versions: defineTable({
    agent_id: v.string(),
    version: v.string(),
    change_type: vChangeType,
    status: vPromptVersionStatus,
    notes: v.optional(v.string()),
    created_by: v.optional(v.string()),
    created_at: v.number(),
    deployed_at: v.optional(v.number()),
  })
    .index("by_agent", ["agent_id"])
    .index("by_agent_version", ["agent_id", "version"])
    .index("by_status", ["status"]),

  // -------------------------------------------------------------------------
  // inference_cache — LLM call cache keyed by
  // hash(model + prompt_version + document_sha256 + agent_id + corpus_version)
  // per 20 § Idempotency. TTL 30 days (matches inference-log retention).
  // -------------------------------------------------------------------------
  inference_cache: defineTable({
    cache_key: v.string(),
    model: v.string(),
    prompt_version: v.string(),
    document_sha256: v.string(),
    agent_id: v.string(),
    corpus_version: v.string(),
    response_text: v.string(),
    tokens_in: v.number(),
    tokens_out: v.number(),
    cost_eur: v.number(),
    created_at: v.number(),
    expires_at: v.number(),
  })
    .index("by_cache_key", ["cache_key"])
    .index("by_expires_at", ["expires_at"]),
});
