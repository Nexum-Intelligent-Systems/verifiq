/**
 * VerifIQ — shared TypeScript types.
 *
 * Purpose: canonical domain types that mirror the schema and the JSON shapes in
 * `verifiq-prompts/05_output_schemas.md` (§05.1 Finding, §05.2 DisciplineSummary,
 * §05.3 BuildReadinessReport) and the feedback object in
 * `verifiq-prompts/14_feedback_taxonomy.md`.
 *
 * Convex-stored rows are reached via `Doc<"table">` / `Id<"table">` from the
 * generated data model (run `npx convex codegen` to produce it). The interfaces
 * below describe the wire/JSON shapes used by agents, exports and the API, which
 * intentionally use the business `issue_id` rather than the Convex `_id`.
 *
 * Version: 0.3.0-phase1
 */

import type { Doc, Id } from "../convex/_generated/dataModel";

export type { Doc, Id };

// Convenience row aliases.
export type UserDoc = Doc<"users">;
export type ProjectDoc = Doc<"projects">;
export type DocumentDoc = Doc<"documents">;
export type FindingDoc = Doc<"findings">;
export type AuditLogDoc = Doc<"audit_log">;
export type JobDoc = Doc<"jobs">;

// ── Controlled vocabularies (kept in lockstep with schema.ts) ───────────────

export type Stage = "design" | "pre-tender" | "pre-build" | "construction" | "handover";

export type FindingStatus =
  | "Compliant"
  | "Non-compliant"
  | "Not demonstrated"
  | "Clarification required"
  | "Coordination issue"
  | "Construction evidence required"
  | "Handover evidence required"
  | "Outside current scope";

export type Risk = "Critical" | "High" | "Medium" | "Low" | "Advisory";

export type BuildReadinessImpact =
  | "Build blocker"
  | "Proceed with condition"
  | "Pre-tender close-out"
  | "Pre-construction close-out"
  | "Construction hold point"
  | "Handover requirement"
  | "Advisory";

export type CouncilDecision =
  | "Retained"
  | "Amended"
  | "Merged"
  | "Downgraded"
  | "Escalated"
  | "Deleted";

export type DisciplineOverallStatus =
  | "Acceptable"
  | "Partial"
  | "Not demonstrated"
  | "High risk"
  | "Critical risk";

export type BuildReadinessRating = "Green" | "Amber" | "Red" | "Grey";

export type ExecutiveDecision =
  | "Proceed"
  | "Proceed with conditions"
  | "Pause before build"
  | "Insufficient information";

export type DesignTeamResponse =
  | "Accepted"
  | "Accepted with risk re-rated"
  | "Rejected"
  | "Already actioned";

export type RejectionReason =
  | "REJ-01" | "REJ-02" | "REJ-03" | "REJ-04" | "REJ-05" | "REJ-06"
  | "REJ-07" | "REJ-08" | "REJ-09" | "REJ-10" | "REJ-11" | "REJ-12";

// ── §05.1 Finding (the atomic unit) ─────────────────────────────────────────

export interface Finding {
  issue_id: string;
  discipline_origin: string;
  interface_disciplines: string[];
  stage: Stage;
  project_area?: string;
  location?: string;
  source_document: string;
  source_reference: string;
  related_documents: string[];
  requirement: string;
  finding: string;
  status: FindingStatus;
  risk: Risk;
  build_readiness_impact: BuildReadinessImpact;
  question?: string;
  required_evidence: string[];
  owner: string;
  secondary_owner?: string;
  close_out_stage?: string;
  /** Set only after Stage 6 adjudication. */
  council_decision?: CouncilDecision;
  /** Required when council_decision is not "Retained". */
  rationale?: string;
}

// ── §05.2 Discipline summary ─────────────────────────────────────────────────

export interface DisciplineQuestion {
  target_discipline: string;
  question: string;
  reason: string;
  risk: string;
}

export interface DisciplineSummary {
  discipline: string;
  documents_reviewed: string[];
  documents_missing: string[];
  overall_status: DisciplineOverallStatus;
  critical_findings_count: number;
  high_findings_count: number;
  medium_findings_count: number;
  key_risks: string[];
  questions_for_other_disciplines: DisciplineQuestion[];
  evidence_required_before_build: string[];
  construction_hold_points: string[];
  handover_evidence: string[];
}

// ── §05.3 Build Readiness Report ─────────────────────────────────────────────

export interface BuildReadinessReport {
  project_name: string;
  project_stage: string;
  building_type: string;
  review_date: string;
  regulatory_modules_activated: string[];
  disciplines_reviewed: string[];
  build_readiness_rating: BuildReadinessRating;
  executive_decision: ExecutiveDecision;
  council_summary: string;
  /** Array sections reference findings by issue_id (see report_findings). */
  critical_blockers: string[];
  high_risk_conditions: string[];
  discipline_action_matrix: string[];
  interface_risk_matrix: string[];
  statutory_approval_risks: string[];
  planning_condition_risks: string[];
  tender_cost_risks: string[];
  construction_hold_points: string[];
  handover_evidence_requirements: string[];
  final_recommendation: string;
  /** Carried on every export per file 08. */
  disclaimer: string;
}

// ── §14 Feedback object ──────────────────────────────────────────────────────

export interface FindingFeedback {
  feedback_id: string;
  project_id: string;
  finding_id: string;
  discipline: string;
  original_status: FindingStatus;
  original_risk: Risk;
  design_team_response: DesignTeamResponse;
  rejection_primary_reason?: RejectionReason;
  rejection_secondary_reason?: RejectionReason;
  design_team_comment?: string;
  responding_party: string;
  responding_party_charter?: string;
  responded_at: string;
  agent_audit_log_entry_id?: string;
  model_used?: string;
  corpus_version?: string;
  prompt_version?: string;
  reviewer_action?: string;
}

/**
 * The id of an Id<"audit_log"> row, surfaced for callers that need to link a
 * finding back to its self-check audit entry (files 13 + 15).
 */
export type AuditLogId = Id<"audit_log">;
