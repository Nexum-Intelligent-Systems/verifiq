/**
 * VerifIQ MVP — Convex schema
 *
 * Tables used by the upload → classify → scan → release pipeline.
 * Aligns with actions in convex/actions/ and platform architecture doc.
 */

import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export const PackTier = v.union(
  v.literal("small"),
  v.literal("mid"),
  v.literal("large"),
  v.literal("programme"),
  v.literal("mega"),
);

export const ScanPhase = v.union(
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

export const InvitationStatus = v.union(
  v.literal("sent"),
  v.literal("opened"),
  v.literal("uploaded"),
  v.literal("expired"),
);

export const UploadScanStatus = v.union(
  v.literal("pending"),
  v.literal("queued"),
  v.literal("scanning"),
  v.literal("completed"),
  v.literal("failed"),
);

export const FindingSeverity = v.union(
  v.literal("CRITICAL"),
  v.literal("HIGH"),
  v.literal("MEDIUM"),
  v.literal("LOW"),
);

export const FindingReviewStatus = v.union(
  v.literal("pending_review"),
  v.literal("approved"),
  v.literal("rejected"),
);

export const CouncilDecision = v.union(
  v.literal("Retained"),
  v.literal("Amended"),
  v.literal("Merged"),
  v.literal("Downgraded"),
  v.literal("Escalated"),
  v.literal("Deleted"),
);

export const CouncilPhase = v.union(
  v.literal("pending"),
  v.literal("peer_challenge"),
  v.literal("adjudicate"),
  v.literal("chair"),
  v.literal("complete"),
);

export const PipelineJobType = v.union(
  v.literal("classify"),
  v.literal("review_discipline"),
  v.literal("cross_reference"),
  v.literal("peer_challenge"),
  v.literal("adjudicate"),
  v.literal("council_chair"),
);

export const PipelineJobStatus = v.union(
  v.literal("pending"),
  v.literal("running"),
  v.literal("succeeded"),
  v.literal("failed"),
);

export const BuildReadinessRating = v.union(
  v.literal("Green"),
  v.literal("Amber"),
  v.literal("Red"),
  v.literal("Grey"),
);

export const ExecutiveDecision = v.union(
  v.literal("Proceed"),
  v.literal("Proceed with conditions"),
  v.literal("Pause before build"),
  v.literal("Insufficient information"),
);

export default defineSchema({
  ...authTables,

  organizations: defineTable({
    name: v.string(),
    createdAt: v.number(),
  }),

  projects: defineTable({
    orgId: v.id("organizations"),
    name: v.string(),
    contractType: v.optional(v.string()),
    tier: v.optional(PackTier),
    createdBy: v.string(),
    crossDisciplineCheckId: v.optional(v.id("checks")),
    crossDisciplineComplete: v.optional(v.boolean()),
    crossDisciplineFindingsCount: v.optional(v.number()),
    councilPhase: v.optional(CouncilPhase),
    councilReportId: v.optional(v.id("councilReports")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["orgId"]),

  uploadInvitations: defineTable({
    orgId: v.id("organizations"),
    projectId: v.id("projects"),
    discipline: v.string(),
    tokenHash: v.string(),
    status: InvitationStatus,
    expiresAt: v.number(),
    consultantEmail: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_token_hash", ["tokenHash"])
    .index("by_project", ["projectId"]),

  disciplineUploads: defineTable({
    orgId: v.id("organizations"),
    projectId: v.id("projects"),
    discipline: v.string(),
    invitationId: v.optional(v.id("uploadInvitations")),
    zipStorageId: v.id("_storage"),
    uploadedBy: v.string(),
    uploadedAt: v.number(),
    fileIds: v.array(v.id("files")),
    fileCount: v.number(),
    totalSizeBytes: v.number(),
    estimatedPages: v.number(),
    classificationStatus: v.optional(
      v.union(v.literal("pending"), v.literal("classified")),
    ),
    scanStatus: UploadScanStatus,
    checkId: v.optional(v.id("checks")),
    findingsCount: v.optional(v.number()),
    filesClassified: v.optional(v.number()),
    filesScanned: v.optional(v.number()),
    currentActivity: v.optional(v.string()),
    currentFileName: v.optional(v.string()),
  })
    .index("by_project", ["projectId"])
    .index("by_project_discipline", ["projectId", "discipline"]),

  files: defineTable({
    orgId: v.id("organizations"),
    uploadId: v.optional(v.id("disciplineUploads")),
    packId: v.optional(v.string()),
    fileName: v.string(),
    filePath: v.string(),
    mimeType: v.string(),
    sizeBytes: v.number(),
    storageId: v.id("_storage"),
    estimatedPages: v.number(),
    discipline: v.optional(v.string()),
    docType: v.optional(v.string()),
    classificationConfidence: v.optional(v.number()),
    classificationMethod: v.optional(v.string()),
    checkId: v.optional(v.id("checks")),
    scanStatus: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("classified"),
        v.literal("scanning"),
        v.literal("scanned"),
        v.literal("skipped"),
      ),
    ),
  })
    .index("by_upload", ["uploadId"]),

  findings: defineTable({
    orgId: v.id("organizations"),
    projectId: v.id("projects"),
    checkId: v.optional(v.id("checks")),
    findingId: v.string(),
    discipline: v.string(),
    severity: FindingSeverity,
    category: v.string(),
    oneSentenceIssue: v.string(),
    document: v.string(),
    sectionLocation: v.optional(v.string()),
    regulatoryBasis: v.string(),
    operationalRisk: v.string(),
    recommendedAction: v.string(),
    evidenceQuote: v.string(),
    element: v.optional(v.string()),
    standardCode: v.optional(v.string()),
    status: FindingReviewStatus,
    sourceFile: v.optional(v.string()),
    sourcePageRange: v.optional(v.string()),
    councilDecision: v.optional(CouncilDecision),
    adjudicationRationale: v.optional(v.string()),
    peerChallengeBy: v.optional(v.string()),
    selfCheckPassed: v.optional(v.boolean()),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_status", ["projectId", "status"])
    .index("by_check", ["checkId"]),

  checks: defineTable({
    orgId: v.id("organizations"),
    packId: v.optional(v.string()),
    initiatedBy: v.string(),
    tier: PackTier,
    corpusVersion: v.string(),
    skillsRun: v.array(v.string()),
    status: v.union(v.literal("running"), v.literal("completed")),
    findingCount: v.optional(v.number()),
    inputTokensConsumed: v.optional(v.number()),
    outputTokensConsumed: v.optional(v.number()),
    inferenceCost_cents: v.optional(v.number()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_org", ["orgId"]),

  scanStates: defineTable({
    projectId: v.id("projects"),
    phase: ScanPhase,
    progressPct: v.number(),
    etaMs: v.optional(v.number()),
    filesProcessed: v.optional(v.number()),
    filesTotal: v.optional(v.number()),
    filesClassified: v.optional(v.number()),
    findingsCount: v.optional(v.number()),
    councilProgressPct: v.optional(v.number()),
    activeStage: v.optional(v.string()),
    activeDetail: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_project", ["projectId"]),

  pipelineEvents: defineTable({
    projectId: v.id("projects"),
    stage: v.string(),
    discipline: v.optional(v.string()),
    message: v.string(),
    detail: v.optional(v.string()),
    progressPct: v.optional(v.number()),
    fileName: v.optional(v.string()),
    occurredAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_time", ["projectId", "occurredAt"]),

  pipelineJobs: defineTable({
    projectId: v.id("projects"),
    jobType: PipelineJobType,
    status: PipelineJobStatus,
    discipline: v.optional(v.string()),
    payloadJson: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_project", ["projectId"])
    .index("by_project_status", ["projectId", "status"]),

  peerChallenges: defineTable({
    projectId: v.id("projects"),
    findingId: v.string(),
    challengerDiscipline: v.string(),
    decision: CouncilDecision,
    reason: v.string(),
    revisedRisk: v.optional(FindingSeverity),
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),

  councilReports: defineTable({
    projectId: v.id("projects"),
    buildReadinessRating: BuildReadinessRating,
    executiveDecision: ExecutiveDecision,
    summary: v.string(),
    reportMarkdown: v.string(),
    criticalBlockers: v.number(),
    highRiskConditions: v.number(),
    corpusVersion: v.string(),
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),

  auditLog: defineTable({
    orgId: v.optional(v.id("organizations")),
    projectId: v.optional(v.id("projects")),
    actor: v.string(),
    action: v.string(),
    targetType: v.string(),
    targetId: v.optional(v.string()),
    payloadJson: v.optional(v.string()),
    occurredAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_occurred", ["occurredAt"]),
});
