/**
 * VerifIQ — TypeScript type-mirror of the Convex schema (Phase 1)
 *
 * Purpose: Single import surface for application code. Enum types are derived
 *   from the schema validators with `Infer<>` so they can never drift from
 *   `src/convex/schema.ts`. Row types use the standard Convex `Doc<"table">`
 *   pattern from the generated data model. The 05.x JSON-shape interfaces are
 *   the canonical structured-output contracts for the agent/report layers.
 *
 * Implements: 05_output_schemas.md § 05.1–05.3.
 * Version: phase1-v0.1
 */

import type { Infer } from "convex/values";
import type { Doc, Id } from "../convex/_generated/dataModel";
import type {
  vStage,
  vFindingStatus,
  vRisk,
  vBuildReadinessImpact,
  vCouncilDecision,
  vOverallStatus,
  vBuildReadinessRating,
  vExecutiveDecision,
  vScanState,
  vJobType,
  vJobStatus,
  vDesignTeamResponse,
  vRejectionReason,
  vChangeType,
  vPromptVersionStatus,
} from "../convex/schema";

// ---------------------------------------------------------------------------
// Enum types — inferred from schema validators (no manual duplication).
// ---------------------------------------------------------------------------

export type Stage = Infer<typeof vStage>;
export type FindingStatus = Infer<typeof vFindingStatus>;
export type Risk = Infer<typeof vRisk>;
export type BuildReadinessImpact = Infer<typeof vBuildReadinessImpact>;
export type CouncilDecision = Infer<typeof vCouncilDecision>;
export type OverallStatus = Infer<typeof vOverallStatus>;
export type BuildReadinessRating = Infer<typeof vBuildReadinessRating>;
export type ExecutiveDecision = Infer<typeof vExecutiveDecision>;
export type ScanState = Infer<typeof vScanState>;
export type JobType = Infer<typeof vJobType>;
export type JobStatus = Infer<typeof vJobStatus>;
export type DesignTeamResponse = Infer<typeof vDesignTeamResponse>;
export type RejectionReason = Infer<typeof vRejectionReason>;
export type ChangeType = Infer<typeof vChangeType>;
export type PromptVersionStatus = Infer<typeof vPromptVersionStatus>;

// ---------------------------------------------------------------------------
// Row types — standard Convex Doc<> pattern. These mirror the schema exactly.
// ---------------------------------------------------------------------------

export type UserDoc = Doc<"users">;
export type ProjectDoc = Doc<"projects">;
export type IntakeAnswerDoc = Doc<"intake_answers">;
export type DocumentDoc = Doc<"documents">;
export type ModuleDoc = Doc<"modules">;
export type FindingDoc = Doc<"findings">;
export type FindingInterfaceDoc = Doc<"finding_interfaces">;
export type ChallengeDoc = Doc<"challenges">;
export type AdjudicationDoc = Doc<"adjudications">;
export type DisciplineSummaryDoc = Doc<"discipline_summaries">;
export type ReportDoc = Doc<"reports">;
export type ReportFindingDoc = Doc<"report_findings">;
export type AuditLogDoc = Doc<"audit_log">;
export type JobDoc = Doc<"jobs">;
export type FindingsFeedbackDoc = Doc<"findings_feedback">;
export type PromptVersionDoc = Doc<"prompt_versions">;
export type InferenceCacheDoc = Doc<"inference_cache">;

export type { Doc, Id };

// ---------------------------------------------------------------------------
// 05.1 · Finding object — canonical structured-output contract.
// Agents emit this shape; it is persisted into the `findings` table.
// ---------------------------------------------------------------------------

export interface Finding {
  issue_id: string;
  discipline_origin: string;
  interface_disciplines: string[];
  stage: Stage;
  project_area: string;
  location: string;
  source_document: string;
  source_reference: string;
  related_documents: string[];
  requirement: string;
  finding: string;
  status: FindingStatus;
  risk: Risk;
  build_readiness_impact: BuildReadinessImpact;
  question: string;
  required_evidence: string[];
  owner: string;
  secondary_owner: string;
  close_out_stage: string;
  /** Populated only after Stage 6 (Adjudication). */
  council_decision?: CouncilDecision;
  /** Required when council_decision is not "Retained". */
  rationale?: string;
}

// ---------------------------------------------------------------------------
// 05.2 · Discipline summary object.
// ---------------------------------------------------------------------------

export interface CrossDisciplineQuestion {
  target_discipline: string;
  question: string;
  reason: string;
  risk: string;
}

export interface DisciplineSummary {
  discipline: string;
  documents_reviewed: string[];
  documents_missing: string[];
  overall_status: OverallStatus;
  critical_findings_count: number;
  high_findings_count: number;
  medium_findings_count: number;
  key_risks: string[];
  questions_for_other_disciplines: CrossDisciplineQuestion[];
  evidence_required_before_build: string[];
  construction_hold_points: string[];
  handover_evidence: string[];
}

// ---------------------------------------------------------------------------
// 05.3 · Build Readiness Report object.
// ---------------------------------------------------------------------------

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
}
