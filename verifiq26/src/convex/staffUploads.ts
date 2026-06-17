import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { isDisciplineCode } from "./lib/disciplineInfer";
import { requireAuthEmail } from "./lib/requireAuth";

async function assertProjectOwner(
  ctx: { db: { get: (id: Id<"projects">) => Promise<unknown> } },
  projectId: Id<"projects">,
  email: string,
) {
  const project = await ctx.db.get(projectId);
  if (!project) {
    throw new Error("Project not found");
  }
  const row = project as { orgId: Id<"organizations">; createdBy: string };
  if (row.createdBy !== email) {
    throw new Error("Not authorized for this project");
  }
  return row;
}

/** Auth-checked enqueue — ZIP extraction runs in an internal Node action. */
export const submitDisciplineZip = mutation({
  args: {
    projectId: v.id("projects"),
    discipline: v.string(),
    zipStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const email = await requireAuthEmail(ctx);
    const project = await assertProjectOwner(ctx, args.projectId, email);
    if (!isDisciplineCode(args.discipline)) {
      throw new Error(`Invalid discipline: ${args.discipline}`);
    }

    await ctx.scheduler.runAfter(0, internal.actions.uploads.processStaffDisciplineZip, {
      orgId: project.orgId,
      projectId: args.projectId,
      discipline: args.discipline,
      zipStorageId: args.zipStorageId,
      uploadedBy: email,
    });

    return { started: true as const };
  },
});

/** Auth-checked enqueue for a full multi-discipline tender pack. */
export const submitFullSuiteZip = mutation({
  args: {
    projectId: v.id("projects"),
    zipStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const email = await requireAuthEmail(ctx);
    const project = await assertProjectOwner(ctx, args.projectId, email);

    await ctx.scheduler.runAfter(0, internal.actions.uploads.processStaffFullSuiteZip, {
      orgId: project.orgId,
      projectId: args.projectId,
      zipStorageId: args.zipStorageId,
      uploadedBy: email,
    });

    return { started: true as const };
  },
});
