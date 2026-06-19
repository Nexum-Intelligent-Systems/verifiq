import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthUserId } from "./lib/requireAuth";
import { PipelineJobType } from "./schema";

export const logEvent = internalMutation({
  args: {
    projectId: v.id("projects"),
    stage: v.string(),
    message: v.string(),
    discipline: v.optional(v.string()),
    detail: v.optional(v.string()),
    progressPct: v.optional(v.number()),
    fileName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("pipelineEvents", {
      projectId: args.projectId,
      stage: args.stage,
      discipline: args.discipline,
      message: args.message,
      detail: args.detail,
      progressPct: args.progressPct,
      fileName: args.fileName,
      occurredAt: Date.now(),
    });

    const scanState = await ctx.db
      .query("scanStates")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();

    if (scanState) {
      await ctx.db.patch(scanState._id, {
        activeStage: args.stage,
        activeDetail: args.detail ?? args.message,
        updatedAt: Date.now(),
      });
    }
  },
});

export const createJob = internalMutation({
  args: {
    projectId: v.id("projects"),
    jobType: PipelineJobType,
    discipline: v.optional(v.string()),
    payloadJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pipelineJobs", {
      projectId: args.projectId,
      jobType: args.jobType,
      status: "pending",
      discipline: args.discipline,
      payloadJson: args.payloadJson,
      createdAt: Date.now(),
    });
  },
});

export const markJobRunning = internalMutation({
  args: { jobId: v.id("pipelineJobs") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      status: "running",
      startedAt: Date.now(),
    });
  },
});

export const markJobSucceeded = internalMutation({
  args: { jobId: v.id("pipelineJobs") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      status: "succeeded",
      completedAt: Date.now(),
    });
  },
});

export const markJobFailed = internalMutation({
  args: { jobId: v.id("pipelineJobs"), error: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      status: "failed",
      error: args.error,
      completedAt: Date.now(),
    });
  },
});

export const updateUploadProgress = internalMutation({
  args: {
    uploadId: v.id("disciplineUploads"),
    filesClassified: v.optional(v.number()),
    filesScanned: v.optional(v.number()),
    currentActivity: v.optional(v.string()),
    currentFileName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const upload = await ctx.db.get(args.uploadId);
    if (!upload) return;

    const patch: Record<string, string | number | undefined> = {};
    if (args.filesClassified !== undefined) patch.filesClassified = args.filesClassified;
    if (args.filesScanned !== undefined) patch.filesScanned = args.filesScanned;
    if (args.currentActivity !== undefined) patch.currentActivity = args.currentActivity;
    if (args.currentFileName !== undefined) patch.currentFileName = args.currentFileName;

    await ctx.db.patch(args.uploadId, patch);
  },
});

export const getActivity = query({
  args: { projectId: v.id("projects"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireAuthUserId(ctx);

    const events = await ctx.db
      .query("pipelineEvents")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .take(args.limit ?? 50);

    return events.reverse();
  },
});

export const getJobs = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await requireAuthUserId(ctx);

    return await ctx.db
      .query("pipelineJobs")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});
