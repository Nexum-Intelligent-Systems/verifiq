import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthUserId } from "./lib/requireAuth";

type ScanPhaseValue =
  | "pending"
  | "uploading"
  | "classifying"
  | "confirm_classify"
  | "scanning"
  | "cross_ref"
  | "peer_challenge"
  | "adjudicate"
  | "reviewer_queue"
  | "released";

function derivePhase(
  uploads: Array<{ scanStatus: string; classificationStatus?: string }>,
  project: {
    crossDisciplineComplete?: boolean;
    councilPhase?: string;
  },
): ScanPhaseValue {
  if (uploads.length === 0) return "pending";

  if (project.councilPhase === "complete") return "reviewer_queue";

  if (project.councilPhase === "chair") return "adjudicate";
  if (project.councilPhase === "adjudicate") return "adjudicate";
  if (project.councilPhase === "peer_challenge") return "peer_challenge";

  if (project.crossDisciplineComplete) return "cross_ref";

  const allCompleted = uploads.every((u) => u.scanStatus === "completed");
  if (allCompleted) return "scanning";

  const anyScanning = uploads.some((u) => u.scanStatus === "scanning");
  if (anyScanning) return "scanning";

  const anyQueued = uploads.some((u) => u.scanStatus === "queued");
  if (anyQueued) return "scanning";

  const anyClassifying = uploads.some(
    (u) => u.classificationStatus === "pending" && u.scanStatus === "pending",
  );
  if (anyClassifying) return "classifying";

  const anyClassified = uploads.some((u) => u.classificationStatus === "classified");
  if (anyClassified) return "confirm_classify";

  return "uploading";
}

function deriveProgress(
  phase: ScanPhaseValue,
  uploads: Array<{
    scanStatus: string;
    fileCount: number;
    filesClassified?: number;
    filesScanned?: number;
  }>,
  project: { councilPhase?: string },
): number {
  if (phase === "pending") return 0;
  if (phase === "released") return 100;

  const totalFiles = uploads.reduce((sum, u) => sum + u.fileCount, 0);
  const filesClassified = uploads.reduce((sum, u) => sum + (u.filesClassified ?? 0), 0);
  const filesScanned = uploads.reduce((sum, u) => sum + (u.filesScanned ?? 0), 0);
  const completedUploads = uploads.filter((u) => u.scanStatus === "completed").length;

  const phaseBase: Record<ScanPhaseValue, number> = {
    pending: 0,
    uploading: 8,
    classifying: 18,
    confirm_classify: 32,
    scanning: 45,
    cross_ref: 68,
    peer_challenge: 78,
    adjudicate: 86,
    reviewer_queue: 94,
    released: 100,
  };

  let progress = phaseBase[phase];

  if (totalFiles > 0 && phase === "classifying") {
    progress += Math.round((filesClassified / totalFiles) * 14);
  }

  if (totalFiles > 0 && (phase === "scanning" || phase === "confirm_classify")) {
    progress += Math.round((filesScanned / totalFiles) * 22);
  }

  if (uploads.length > 0 && phase === "scanning" && completedUploads < uploads.length) {
    progress += Math.round((completedUploads / uploads.length) * 8);
  }

  if (project.councilPhase === "peer_challenge") progress = Math.max(progress, 78);
  if (project.councilPhase === "adjudicate") progress = Math.max(progress, 86);
  if (project.councilPhase === "chair") progress = Math.max(progress, 90);
  if (project.councilPhase === "complete") progress = Math.max(progress, 94);

  return Math.min(99, Math.round(progress));
}

function councilProgressPct(councilPhase?: string): number {
  switch (councilPhase) {
    case "peer_challenge":
      return 33;
    case "adjudicate":
      return 66;
    case "chair":
      return 85;
    case "complete":
      return 100;
    default:
      return 0;
  }
}

export const syncFromUpload = internalMutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) return;

    const uploads = await ctx.db
      .query("disciplineUploads")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const findings = await ctx.db
      .query("findings")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const phase = derivePhase(uploads, project);
    const progressPct = deriveProgress(phase, uploads, project);
    const filesTotal = uploads.reduce((sum, u) => sum + u.fileCount, 0);
    const filesClassified = uploads.reduce((sum, u) => sum + (u.filesClassified ?? 0), 0);
    const filesProcessed = uploads.reduce(
      (sum, u) => sum + (u.filesScanned ?? (u.scanStatus === "completed" ? u.fileCount : 0)),
      0,
    );

    const existing = await ctx.db
      .query("scanStates")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();

    const state = {
      projectId: args.projectId,
      phase,
      progressPct,
      filesProcessed,
      filesTotal,
      filesClassified,
      findingsCount: findings.length,
      councilProgressPct: councilProgressPct(project.councilPhase),
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, state);
    } else {
      await ctx.db.insert("scanStates", state);
    }
  },
});

export const getState = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await requireAuthUserId(ctx);

    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    const scanState = await ctx.db
      .query("scanStates")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();

    const uploads = await ctx.db
      .query("disciplineUploads")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const findings = await ctx.db
      .query("findings")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const jobs = await ctx.db
      .query("pipelineJobs")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const severityCounts = {
      critical: findings.filter((f) => f.severity === "CRITICAL").length,
      high: findings.filter((f) => f.severity === "HIGH").length,
      medium: findings.filter((f) => f.severity === "MEDIUM").length,
      low: findings.filter((f) => f.severity === "LOW").length,
    };

    const disciplineCards = uploads.map((u) => ({
      discipline: u.discipline,
      scanStatus: u.scanStatus,
      classificationStatus: u.classificationStatus,
      fileCount: u.fileCount,
      filesClassified: u.filesClassified ?? 0,
      filesScanned: u.filesScanned ?? 0,
      findingsCount: u.findingsCount ?? 0,
      currentActivity: u.currentActivity,
      currentFileName: u.currentFileName,
    }));

    return {
      project: {
        _id: project._id,
        name: project.name,
        contractType: project.contractType,
        tier: project.tier,
        councilPhase: project.councilPhase ?? "pending",
        crossDisciplineComplete: project.crossDisciplineComplete ?? false,
      },
      phase: scanState?.phase ?? "pending",
      progressPct: scanState?.progressPct ?? 0,
      filesProcessed: scanState?.filesProcessed ?? 0,
      filesTotal: scanState?.filesTotal ?? 0,
      filesClassified: scanState?.filesClassified ?? 0,
      findingsCount: scanState?.findingsCount ?? findings.length,
      councilProgressPct: scanState?.councilProgressPct ?? 0,
      activeStage: scanState?.activeStage,
      activeDetail: scanState?.activeDetail,
      severityCounts,
      disciplineUploads: disciplineCards,
      pipelineJobs: jobs.map((j) => ({
        jobType: j.jobType,
        status: j.status,
        discipline: j.discipline,
        error: j.error,
      })),
      updatedAt: scanState?.updatedAt ?? project.updatedAt,
    };
  },
});
