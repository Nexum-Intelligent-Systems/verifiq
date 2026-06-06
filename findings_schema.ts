/**
 * GovIQ — Design Review Findings Schema (Convex)
 * Project: 57 Rathbeale Road / CRC Omni Unit 48A
 * Sprint:  Full Multi-Disciplinary Design Review (27-May → 10-Jun-2026)
 *
 * Drop-in schema for the 10-skill chartered review output (arch / cs / ee /
 * 5x mech / qs-cwmf / contract-admin-pwcf). One row per finding; one row per
 * RFI; pre_contract_actions track the 14-item sequenced checklist; the live
 * variation_exposure rolls up € impact across CRITICAL + HIGH findings.
 *
 * Conventions:
 *   - finding_id format: <DISC>-<3-digit seq>  e.g. A-001, S-007, M-014, E-002, Q-019, C-003
 *   - rfi_id format:     RFI-<3-digit seq>      e.g. RFI-001
 *   - All € values stored in CENTS (integer) to avoid float drift
 *   - All dates stored as ISO-8601 strings (yyyy-mm-dd) or epoch ms (v.number())
 *
 * Place at: convex/sp_designReview/schema.ts  (or merge into existing sp_* schema)
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// =================================================================
// ENUMS (as v.union literals — Convex pattern)
// =================================================================

export const Severity = v.union(
  v.literal("CRITICAL"),
  v.literal("HIGH"),
  v.literal("MEDIUM"),
  v.literal("LOW"),
);

export const Discipline = v.union(
  v.literal("ARCHITECTURAL"),    // A-
  v.literal("STRUCTURAL"),       // S-
  v.literal("MECHANICAL"),       // M-
  v.literal("ELECTRICAL"),       // E-
  v.literal("QUANTITY_SURVEYING"), // Q-
  v.literal("CONTRACT_ADMIN"),   // C-
);

export const FindingCategory = v.union(
  v.literal("COMPLIANCE"),       // breach of TGD / IS / EN / BCAR / HIQA etc.
  v.literal("COST"),             // variation exposure, pricing error
  v.literal("PROGRAMME"),        // schedule risk, sequencing
  v.literal("CONTRACT"),         // enforceability, ambiguity in PW-CF clauses
  v.literal("DOCUMENT_HYGIENE"), // wrong references, blank fields, typos affecting interpretation
  v.literal("OPERATIONAL"),      // future O&M / HIQA / clinical use impact
);

export const FindingStatus = v.union(
  v.literal("OPEN"),
  v.literal("STAKEHOLDER_REVIEW"),
  v.literal("ACCEPTED"),
  v.literal("REJECTED"),
  v.literal("DEFERRED"),
  v.literal("CLOSED"),
);

export const RfiStatus = v.union(
  v.literal("DRAFT"),
  v.literal("READY_TO_SUBMIT"),
  v.literal("SUBMITTED"),
  v.literal("RESPONDED"),
  v.literal("CLOSED"),
);

export const RfiDirection = v.union(
  v.literal("PRE_ISSUE_INTERNAL"),  // change request to Employer/ER before tender issue
  v.literal("POST_ISSUE_BIDDER"),   // formal RFI to CA via eTenders during query window
);

export const OwnerParty = v.union(
  v.literal("EMPLOYER"),
  v.literal("CONTRACTING_AUTHORITY"),
  v.literal("ER"),                  // Employer's Representative
  v.literal("LEAD_DESIGNER"),
  v.literal("ARCH_DESIGNER"),
  v.literal("CS_DESIGNER"),
  v.literal("ME_DESIGNER"),
  v.literal("EE_DESIGNER"),
  v.literal("QS"),
  v.literal("PSDP"),
  v.literal("ASSIGNED_CERTIFIER"),
  v.literal("CONTRACTOR"),          // post-LoA only
);

export const SkillSource = v.union(
  v.literal("arch-review-ireland"),
  v.literal("cs-review-ireland"),
  v.literal("ee-review-ireland"),
  v.literal("mech-review-hvac-ireland"),
  v.literal("mech-review-plumbing-ireland"),
  v.literal("mech-review-bms-ireland"),
  v.literal("mech-review-fire-ireland"),
  v.literal("mech-review-medgas-ireland"),
  v.literal("qs-review-cwmf-ireland"),
  v.literal("contract-admin-pwcf-ireland"),
  v.literal("MANUAL"),              // human-entered (e.g. stakeholder review session)
);

// =================================================================
// TABLES
// =================================================================

export default defineSchema({

  // -----------------------------------------------------------------
  // sp_dr_projects — one row per design review engagement
  // -----------------------------------------------------------------
  sp_dr_projects: defineTable({
    projectCode: v.string(),              // e.g. "RBR-CRC-48A"
    projectName: v.string(),              // "57 Rathbeale Road — CRC Omni Unit 48A"
    employerLegalEntity: v.optional(v.string()),   // confirmed Day-1
    caLegalEntity: v.optional(v.string()),
    buildingOwnerLegalEntity: v.optional(v.string()),
    contractForm: v.string(),             // "PW-CF5"
    deliveryModel: v.string(),            // "Employer-Designed"
    rfiDirection: v.optional(RfiDirection), // locked Day-1
    rfiDeadline: v.string(),              // ISO date — e.g. "2026-06-10"
    sprintStart: v.string(),
    sprintEnd: v.string(),
    contractSumEstimate_cents: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_projectCode", ["projectCode"]),

  // -----------------------------------------------------------------
  // sp_dr_review_metadata — one row per skill run on a project
  // mirrors review_metadata block from chartered-design-team skills
  // -----------------------------------------------------------------
  sp_dr_review_metadata: defineTable({
    projectId: v.id("sp_dr_projects"),
    skill: SkillSource,
    reviewer: v.string(),                 // "Liam Dunne" or "AI-orchestrated"
    runStarted: v.number(),               // epoch ms
    runCompleted: v.optional(v.number()),
    packVersion: v.string(),              // tender pack version reviewed
    documentsReviewed: v.array(v.string()), // list of source doc identifiers
    standardsCorpus: v.array(v.string()), // citations applicable to this run
    sprintDay: v.number(),                // 1..10
    notes: v.optional(v.string()),
  })
    .index("by_project", ["projectId"])
    .index("by_project_skill", ["projectId", "skill"]),

  // -----------------------------------------------------------------
  // sp_dr_findings — the master discrepancy register
  // -----------------------------------------------------------------
  sp_dr_findings: defineTable({
    projectId: v.id("sp_dr_projects"),
    reviewMetadataId: v.optional(v.id("sp_dr_review_metadata")),

    // Identity
    findingId: v.string(),                // "A-001" etc — unique within project
    discipline: Discipline,

    // Severity & category
    severity: Severity,
    category: FindingCategory,

    // Source location
    document: v.string(),                 // "ITT Volume 2"
    documentVersion: v.optional(v.string()),
    section: v.string(),                  // "Section 4.3, Clause 4.3.7"

    // Authority basis
    regulatory_basis: v.string(),         // "SI 9/2014 Reg 5; TGD B Vol 2 (2024) §B1.2.3"

    // Risk + action
    operational_risk: v.string(),         // single-line impact if uncorrected
    recommended_action: v.string(),       // drafted correction text, not commentary
    evidence_quote: v.string(),           // verbatim quote from source

    // Linkage
    rfiId: v.optional(v.id("sp_dr_rfi_register")),
    variationExposureId: v.optional(v.id("sp_dr_variation_exposure")),
    preContractActionIds: v.array(v.id("sp_dr_pre_contract_actions")),

    // Ownership
    owner: OwnerParty,
    ownerNamed: v.optional(v.string()),   // specific named individual

    // Workflow
    status: FindingStatus,
    statusReason: v.optional(v.string()),
    raisedAt: v.number(),
    updatedAt: v.number(),
    closedAt: v.optional(v.number()),

    // Stakeholder decision (Day 8–9)
    stakeholderDecision: v.optional(v.object({
      decidedBy: v.string(),
      decidedAt: v.number(),
      decision: v.union(v.literal("ACCEPT"), v.literal("REJECT"), v.literal("DEFER"), v.literal("AMEND")),
      amendedAction: v.optional(v.string()),
      rationale: v.optional(v.string()),
    })),

    // Sprint tracking
    sprintDay: v.number(),                // day this finding was logged
  })
    .index("by_project", ["projectId"])
    .index("by_project_findingId", ["projectId", "findingId"])
    .index("by_project_severity", ["projectId", "severity"])
    .index("by_project_status", ["projectId", "status"])
    .index("by_project_discipline", ["projectId", "discipline"])
    .index("by_owner", ["owner"]),

  // -----------------------------------------------------------------
  // sp_dr_rfi_register — RFI / internal change request log
  // -----------------------------------------------------------------
  sp_dr_rfi_register: defineTable({
    projectId: v.id("sp_dr_projects"),
    rfiId: v.string(),                    // "RFI-001"
    direction: RfiDirection,
    severity: Severity,                   // propagates from highest source finding
    sourceFindingIds: v.array(v.id("sp_dr_findings")),

    // RFI body
    addressedTo: OwnerParty,              // typically CONTRACTING_AUTHORITY or EMPLOYER
    documentRef: v.string(),
    sectionRef: v.string(),
    query: v.string(),                    // closed clarification or proposed change
    proposedCorrection: v.string(),       // mandatory — every RFI states its fix
    responseRequiredBy: v.string(),       // ISO date

    // Lifecycle
    status: RfiStatus,
    submittedAt: v.optional(v.number()),
    submittedVia: v.optional(v.string()), // "eTenders" / "Employer DocControl" / "Email"
    submissionEvidence: v.optional(v.string()), // file storage ID or URL

    // Response
    caResponse: v.optional(v.string()),
    caRespondedAt: v.optional(v.number()),
    caRespondedBy: v.optional(v.string()),
    responseAccepted: v.optional(v.boolean()),

    raisedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_rfiId", ["projectId", "rfiId"])
    .index("by_project_status", ["projectId", "status"])
    .index("by_project_severity", ["projectId", "severity"]),

  // -----------------------------------------------------------------
  // sp_dr_pre_contract_actions — 14-item sequenced checklist
  // -----------------------------------------------------------------
  sp_dr_pre_contract_actions: defineTable({
    projectId: v.id("sp_dr_projects"),
    actionId: v.string(),                 // "PCA-01"
    sequence: v.number(),                 // 1..14 — Employer → ER → Designers → Contractor
    owner: OwnerParty,
    ownerNamed: v.optional(v.string()),
    action: v.string(),                   // what must be done
    closes: v.array(v.string()),          // finding_ids this action closes
    precondition: v.optional(v.string()), // what must happen before this can start
    targetDate: v.string(),               // ISO date
    status: v.union(
      v.literal("PENDING"),
      v.literal("IN_PROGRESS"),
      v.literal("COMPLETE"),
      v.literal("BLOCKED"),
    ),
    completedAt: v.optional(v.number()),
    evidence: v.optional(v.string()),
    notes: v.optional(v.string()),
    raisedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_sequence", ["projectId", "sequence"])
    .index("by_project_status", ["projectId", "status"]),

  // -----------------------------------------------------------------
  // sp_dr_variation_exposure — per-finding € impact, live model
  // -----------------------------------------------------------------
  sp_dr_variation_exposure: defineTable({
    projectId: v.id("sp_dr_projects"),
    findingId: v.id("sp_dr_findings"),

    // Banded estimate (cents)
    low_cents: v.number(),
    central_cents: v.number(),
    high_cents: v.number(),

    // Basis for the estimate
    basis: v.string(),                    // CWMF variation typology, CESMM4 ref, comparable rate, etc.
    assumptions: v.array(v.string()),
    confidence: v.union(
      v.literal("HIGH"),
      v.literal("MEDIUM"),
      v.literal("LOW"),
    ),

    // QS attribution
    estimatedBy: v.string(),
    estimatedAt: v.number(),
    reviewedBy: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),

    // If finding closed before award, exposure crystallises or is avoided
    crystallised: v.optional(v.boolean()),
    crystallisedAmount_cents: v.optional(v.number()),
  })
    .index("by_project", ["projectId"])
    .index("by_finding", ["findingId"]),

  // -----------------------------------------------------------------
  // sp_dr_summary_counts — denormalised severity rollup per project
  // updated by mutation on every finding insert/update
  // -----------------------------------------------------------------
  sp_dr_summary_counts: defineTable({
    projectId: v.id("sp_dr_projects"),
    critical: v.number(),
    high: v.number(),
    medium: v.number(),
    low: v.number(),
    total: v.number(),
    openCount: v.number(),
    closedCount: v.number(),
    deferredCount: v.number(),
    variationExposureLow_cents: v.number(),
    variationExposureCentral_cents: v.number(),
    variationExposureHigh_cents: v.number(),
    rfiCount: v.number(),
    rfiSubmittedCount: v.number(),
    preContractActionCount: v.number(),
    preContractActionCompleteCount: v.number(),
    lastRecalculatedAt: v.number(),
  })
    .index("by_project", ["projectId"]),

  // -----------------------------------------------------------------
  // sp_dr_stakeholder_log — audit trail for Day-8 review session decisions
  // -----------------------------------------------------------------
  sp_dr_stakeholder_log: defineTable({
    projectId: v.id("sp_dr_projects"),
    findingId: v.optional(v.id("sp_dr_findings")),
    rfiId: v.optional(v.id("sp_dr_rfi_register")),
    sessionDate: v.string(),
    actor: v.string(),
    role: OwnerParty,
    action: v.string(),                   // e.g. "ACCEPTED", "REJECTED with rationale", "AMENDED text"
    rationale: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_finding", ["findingId"]),

});

// =================================================================
// TYPES (for use in queries/mutations)
// =================================================================

export type SeverityT = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type DisciplineT = "ARCHITECTURAL" | "STRUCTURAL" | "MECHANICAL" | "ELECTRICAL" | "QUANTITY_SURVEYING" | "CONTRACT_ADMIN";
export type FindingStatusT = "OPEN" | "STAKEHOLDER_REVIEW" | "ACCEPTED" | "REJECTED" | "DEFERRED" | "CLOSED";
export type RfiDirectionT = "PRE_ISSUE_INTERNAL" | "POST_ISSUE_BIDDER";

// Severity → numeric weight (for sorting + summary rollups)
export const SEVERITY_WEIGHT: Record<SeverityT, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

// Discipline → finding_id prefix
export const DISCIPLINE_PREFIX: Record<DisciplineT, string> = {
  ARCHITECTURAL: "A",
  STRUCTURAL: "S",
  MECHANICAL: "M",
  ELECTRICAL: "E",
  QUANTITY_SURVEYING: "Q",
  CONTRACT_ADMIN: "C",
};

/**
 * Validate a finding_id matches its discipline.
 * Example: assertFindingIdMatchesDiscipline("A-001", "ARCHITECTURAL") → ok
 */
export function assertFindingIdMatchesDiscipline(
  findingId: string,
  discipline: DisciplineT,
): void {
  const prefix = DISCIPLINE_PREFIX[discipline];
  const expected = new RegExp(`^${prefix}-\\d{3}$`);
  if (!expected.test(findingId)) {
    throw new Error(
      `finding_id "${findingId}" does not match discipline ${discipline} ` +
      `(expected pattern ${prefix}-NNN)`,
    );
  }
}
