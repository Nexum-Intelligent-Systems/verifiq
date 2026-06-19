/**
 * Dev-only drawing pack E2E — gated by DEV_AUTH_RESET_SECRET.
 * Used by scripts/run-drawing-e2e.ts (no browser auth required).
 */

import { action, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

function assertDevSecret(secret: string) {
  const expected = process.env.DEV_AUTH_RESET_SECRET;
  if (!expected) {
    throw new Error("DEV_AUTH_RESET_SECRET is not configured on this deployment.");
  }
  if (secret !== expected) {
    throw new Error("Invalid dev secret.");
  }
}

export const generateDevUploadUrl = action({
  args: { secret: v.string() },
  handler: async (ctx, args) => {
    assertDevSecret(args.secret);
    return await ctx.storage.generateUploadUrl();
  },
});

export const ensureTestProject = internalMutation({
  args: {
    projectId: v.optional(v.id("projects")),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.projectId) {
      const existing = await ctx.db.get(args.projectId);
      if (existing) return { projectId: args.projectId, orgId: existing.orgId };
    }

    const now = Date.now();
    const orgId = await ctx.db.insert("organizations", {
      name: "E2E Test Organisation",
      createdAt: now,
    });

    const projectId = await ctx.db.insert("projects", {
      orgId,
      name: args.name,
      contractType: "PW-CF5",
      tier: "mid",
      createdBy: "e2e@verifiq.local",
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("scanStates", {
      projectId,
      phase: "pending",
      progressPct: 0,
      filesProcessed: 0,
      filesTotal: 0,
      findingsCount: 0,
      updatedAt: now,
    });

    return { projectId, orgId };
  },
});

export const startDrawingPackTest = action({
  args: {
    secret: v.string(),
    zipStorageId: v.id("_storage"),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    assertDevSecret(args.secret);

    const { projectId, orgId } = await ctx.runMutation(internal.e2eDrawingTest.ensureTestProject, {
      projectId: args.projectId,
      name: `Drawing E2E ${new Date().toISOString().slice(0, 16)}`,
    });

    await ctx.scheduler.runAfter(0, internal.actions.uploads.processStaffFullSuiteZip, {
      orgId,
      projectId,
      zipStorageId: args.zipStorageId,
      uploadedBy: "e2e@verifiq.local",
    });

    return { projectId, orgId };
  },
});

export const startScanInternal = internalMutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const uploads = await ctx.db
      .query("disciplineUploads")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const ready = uploads.filter(
      (u) => u.classificationStatus === "classified" && u.scanStatus === "pending",
    );

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

export const triggerScan = action({
  args: { secret: v.string(), projectId: v.id("projects") },
  handler: async (ctx, args) => {
    assertDevSecret(args.secret);
    return await ctx.runMutation(internal.e2eDrawingTest.startScanInternal, {
      projectId: args.projectId,
    });
  },
});

export const getTestStatus = action({
  args: { secret: v.string(), projectId: v.id("projects") },
  handler: async (ctx, args) => {
    assertDevSecret(args.secret);

    const project = await ctx.runQuery(internal.e2eDrawingTest.statusSnapshot, {
      projectId: args.projectId,
    });

    return project;
  },
});

export const statusSnapshot = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    const scanState = await ctx.db
      .query("scanStates")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .first();

    const uploads = await ctx.db
      .query("disciplineUploads")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const events = await ctx.db
      .query("pipelineEvents")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .take(20);

    const findings = await ctx.db
      .query("findings")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const drawingEvents = events.filter(
      (e) =>
        e.message.toLowerCase().includes("vision") ||
        e.message.toLowerCase().includes("drawing") ||
        e.message.toLowerCase().includes("pdf document") ||
        e.stage === "scanning",
    );

    return {
      projectName: project?.name,
      phase: scanState?.phase ?? "pending",
      progressPct: scanState?.progressPct ?? 0,
      uploads: uploads.map((u) => ({
        discipline: u.discipline,
        fileCount: u.fileCount,
        filesClassified: u.filesClassified ?? 0,
        filesScanned: u.filesScanned ?? 0,
        classificationStatus: u.classificationStatus,
        scanStatus: u.scanStatus,
        findingsCount: u.findingsCount ?? 0,
        currentActivity: u.currentActivity,
        currentFileName: u.currentFileName,
      })),
      findingsCount: findings.length,
      drawingFindings: findings.filter((f) => f.sourceFile?.includes(".pdf")).length,
      recentEvents: events.map((e) => ({
        stage: e.stage,
        message: e.message,
        fileName: e.fileName,
        detail: e.detail,
      })),
      drawingEvents: drawingEvents.map((e) => e.message),
      councilPhase: project?.councilPhase,
    };
  },
});
