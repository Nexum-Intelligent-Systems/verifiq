import { internalMutation, internalQuery, query } from "./_generated/server";
import { v } from "convex/values";
import { FindingReviewStatus, FindingSeverity } from "./schema";
import { requireAuthUserId } from "./lib/requireAuth";

const findingPayload = v.object({
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
  selfCheckPassed: v.optional(v.boolean()),
});

export const create = internalMutation({
  args: {
    orgId: v.id("organizations"),
    projectId: v.id("projects"),
    checkId: v.optional(v.id("checks")),
    finding: findingPayload,
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("findings", {
      orgId: args.orgId,
      projectId: args.projectId,
      checkId: args.checkId,
      ...args.finding,
      createdAt: Date.now(),
    });
  },
});

export const listByProjectAllStatuses = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("findings")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const listByProject = query({
  args: {
    projectId: v.id("projects"),
    status: v.optional(FindingReviewStatus),
  },
  handler: async (ctx, args) => {
    await requireAuthUserId(ctx);

    if (args.status !== undefined) {
      return await ctx.db
        .query("findings")
        .withIndex("by_project_status", (q) =>
          q.eq("projectId", args.projectId).eq("status", args.status!),
        )
        .collect();
    }

    return await ctx.db
      .query("findings")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const summaryByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await requireAuthUserId(ctx);

    const findings = await ctx.db
      .query("findings")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    return {
      total: findings.length,
      critical: findings.filter((f) => f.severity === "CRITICAL").length,
      high: findings.filter((f) => f.severity === "HIGH").length,
      medium: findings.filter((f) => f.severity === "MEDIUM").length,
      low: findings.filter((f) => f.severity === "LOW").length,
      pendingReview: findings.filter((f) => f.status === "pending_review").length,
      adjudicated: findings.filter((f) => f.councilDecision && f.councilDecision !== "Deleted")
        .length,
    };
  },
});

export const recordPeerChallenge = internalMutation({
  args: {
    projectId: v.id("projects"),
    findingId: v.string(),
    challengerDiscipline: v.string(),
    decision: v.string(),
    reason: v.string(),
    revisedRisk: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const decision = args.decision as
      | "Retained"
      | "Amended"
      | "Merged"
      | "Downgraded"
      | "Escalated"
      | "Deleted";

    await ctx.db.insert("peerChallenges", {
      projectId: args.projectId,
      findingId: args.findingId,
      challengerDiscipline: args.challengerDiscipline,
      decision,
      reason: args.reason,
      revisedRisk: args.revisedRisk as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | undefined,
      createdAt: Date.now(),
    });
  },
});

export const listPeerChallenges = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("peerChallenges")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

export const applyAdjudication = internalMutation({
  args: {
    projectId: v.id("projects"),
    findingId: v.string(),
    councilDecision: v.string(),
    rationale: v.string(),
    severity: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const findings = await ctx.db
      .query("findings")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const finding = findings.find((f) => f.findingId === args.findingId);
    if (!finding) return;

    const decision = args.councilDecision as
      | "Retained"
      | "Amended"
      | "Merged"
      | "Downgraded"
      | "Escalated"
      | "Deleted";

    const patch: Record<string, unknown> = {
      councilDecision: decision,
      adjudicationRationale: args.rationale,
    };

    if (args.severity) {
      patch.severity = args.severity;
    }
    if (decision === "Deleted") {
      patch.status = "rejected";
    } else {
      patch.status = "approved";
    }

    await ctx.db.patch(finding._id, patch);
  },
});

export const listAdjudicated = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const findings = await ctx.db
      .query("findings")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    return findings.filter(
      (f) => f.councilDecision !== "Deleted" && f.status !== "rejected",
    );
  },
});

export const saveCouncilReport = internalMutation({
  args: {
    projectId: v.id("projects"),
    buildReadinessRating: v.union(
      v.literal("Green"),
      v.literal("Amber"),
      v.literal("Red"),
      v.literal("Grey"),
    ),
    executiveDecision: v.union(
      v.literal("Proceed"),
      v.literal("Proceed with conditions"),
      v.literal("Pause before build"),
      v.literal("Insufficient information"),
    ),
    summary: v.string(),
    reportMarkdown: v.string(),
    criticalBlockers: v.number(),
    highRiskConditions: v.number(),
    corpusVersion: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("councilReports", {
      projectId: args.projectId,
      buildReadinessRating: args.buildReadinessRating,
      executiveDecision: args.executiveDecision,
      summary: args.summary,
      reportMarkdown: args.reportMarkdown,
      criticalBlockers: args.criticalBlockers,
      highRiskConditions: args.highRiskConditions,
      corpusVersion: args.corpusVersion,
      createdAt: Date.now(),
    });
  },
});

export const getCouncilReport = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await requireAuthUserId(ctx);

    const project = await ctx.db.get(args.projectId);
    if (!project?.councilReportId) return null;

    return await ctx.db.get(project.councilReportId);
  },
});
