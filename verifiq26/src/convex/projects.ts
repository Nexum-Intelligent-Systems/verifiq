import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { requireAuthEmail, requireAuthUserId } from "./lib/requireAuth";

export const get = internalQuery({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getStatus = internalQuery({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) return null;

    const disciplineUploads = await ctx.db
      .query("disciplineUploads")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();

    return { ...project, disciplineUploads };
  },
});

export const markCrossDisciplineComplete = internalMutation({
  args: {
    projectId: v.id("projects"),
    crossDisciplineFindingsCount: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.projectId, {
      crossDisciplineComplete: true,
      crossDisciplineFindingsCount: args.crossDisciplineFindingsCount,
      updatedAt: Date.now(),
    });
  },
});

export const setCouncilPhase = internalMutation({
  args: {
    projectId: v.id("projects"),
    councilPhase: v.union(
      v.literal("pending"),
      v.literal("peer_challenge"),
      v.literal("adjudicate"),
      v.literal("chair"),
      v.literal("complete"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.projectId, {
      councilPhase: args.councilPhase,
      updatedAt: Date.now(),
    });
  },
});

export const setCouncilComplete = internalMutation({
  args: {
    projectId: v.id("projects"),
    councilReportId: v.id("councilReports"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.projectId, {
      councilPhase: "complete",
      councilReportId: args.councilReportId,
      updatedAt: Date.now(),
    });
  },
});

export const getPublic = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    await requireAuthUserId(ctx);

    const project = await ctx.db.get(args.projectId);
    if (!project) return null;

    return {
      _id: project._id,
      name: project.name,
      contractType: project.contractType,
      tier: project.tier,
    };
  },
});

/** Queue discipline scans after classification — staff confirms on the dashboard. */
export const startScan = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const email = await requireAuthEmail(ctx);
    const project = await ctx.db.get(args.projectId);
    if (!project) {
      throw new Error("Project not found");
    }
    if (project.createdBy !== email) {
      throw new Error("Not authorized for this project");
    }

    const uploads = await ctx.db
      .query("disciplineUploads")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const ready = uploads.filter(
      (u) => u.classificationStatus === "classified" && u.scanStatus === "pending",
    );

    if (ready.length === 0) {
      throw new Error("No classified uploads ready. Wait for classification to finish.");
    }

    for (const upload of ready) {
      await ctx.db.patch(upload._id, { scanStatus: "queued" });
      await ctx.scheduler.runAfter(0, internal.actions.scan.scanDisciplineUpload, {
        uploadId: upload._id,
      });
    }

    await ctx.scheduler.runAfter(0, internal.scanState.syncFromUpload, {
      projectId: args.projectId,
    });

    return { queued: ready.length };
  },
});
