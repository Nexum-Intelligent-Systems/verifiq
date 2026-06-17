/**
 * VerifIQ — ingest data queries (Phase 6 web-upload wiring).
 *
 * The database side of turning a sealed pack into a council review. The heavy
 * lifting (download bytes from R2 / Convex storage, parse PDFs, build RunInput)
 * runs in the `ingest.ingestAndReview` node action; these `internalQuery`s give
 * that action the project metadata and document manifest it needs, since a
 * "use node" action has no `ctx.db`.
 *
 * Version: 0.8.0-phase6
 */

import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

/** Project fields the council needs to frame a review (or null if missing). */
export const loadProjectForReview = internalQuery({
  args: { project_id: v.id("projects") },
  handler: async (ctx, args) => {
    const p = await ctx.db.get(args.project_id);
    if (!p) return null;
    return {
      name: p.name,
      building_type: p.building_type ?? null,
      stage: p.stage ?? null,
      corpus_version: p.corpus_version ?? null,
    };
  },
});

/** The document manifest for a project (location + tag), for byte download. */
export const loadProjectDocuments = internalQuery({
  args: { project_id: v.id("projects") },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_project", (q) => q.eq("project_id", args.project_id))
      .collect();
    return docs.map((d) => ({
      filename: d.filename,
      discipline: d.discipline ?? null,
      r2_key: d.r2_key ?? null,
      storage_id: d.storage_id ?? null,
      size_bytes: d.size_bytes,
    }));
  },
});
