/**
 * VerifIQ — minimal mutations + queries (Phase 1).
 *
 * Purpose: only what the Phase 1 smoke test needs — create a stub user + a
 * project, add a document, insert/read a finding, and append audit-log entries.
 * The audit-log writes are mutations (never actions) per
 * verifiq-prompts/20_platform_architecture.md § 2, so they persist even when a
 * calling action retries.
 *
 * Scope: agents, the orchestrator and the job queue are Phase 2+ (docs/28).
 * Version: 0.3.0-phase1
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Stage, FindingStatus, Risk, BuildReadinessImpact } from "./schema";

/** Create a stub user (Phase 1 has no Clerk wiring). */
export const createUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    role: v.optional(v.union(v.literal("customer"), v.literal("reviewer"), v.literal("admin"))),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      role: args.role ?? "customer",
      is_stub: true,
      created_at: Date.now(),
    });
  },
});

/** Create a project in the initial `pending` scan state. */
export const createProject = mutation({
  args: {
    owner_user_id: v.id("users"),
    name: v.string(),
    building_type: v.optional(v.string()),
    stage: v.optional(Stage),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return ctx.db.insert("projects", {
      owner_user_id: args.owner_user_id,
      name: args.name,
      building_type: args.building_type,
      stage: args.stage,
      scan_state: "pending",
      created_at: now,
      updated_at: now,
    });
  },
});

/** Add a document record (metadata only; the file lives in R2 or Convex storage). */
export const addDocument = mutation({
  args: {
    project_id: v.id("projects"),
    filename: v.string(),
    sha256: v.string(),
    size_bytes: v.number(),
    r2_key: v.optional(v.string()),
    storage_id: v.optional(v.id("_storage")),
    discipline: v.optional(v.string()),
    doc_type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("documents", {
      project_id: args.project_id,
      filename: args.filename,
      sha256: args.sha256,
      size_bytes: args.size_bytes,
      r2_key: args.r2_key,
      storage_id: args.storage_id,
      discipline: args.discipline,
      doc_type: args.doc_type,
      status: "uploaded",
      created_at: Date.now(),
    });
  },
});

/** Insert a finding (schema-conformant; §05.1). */
export const insertFinding = mutation({
  args: {
    project_id: v.id("projects"),
    issue_id: v.string(),
    discipline_origin: v.string(),
    stage: Stage,
    source_document: v.string(),
    source_reference: v.string(),
    requirement: v.string(),
    finding: v.string(),
    status: FindingStatus,
    risk: Risk,
    build_readiness_impact: BuildReadinessImpact,
    owner: v.string(),
    interface_disciplines: v.optional(v.array(v.string())),
    related_documents: v.optional(v.array(v.string())),
    required_evidence: v.optional(v.array(v.string())),
    question: v.optional(v.string()),
    model_used: v.optional(v.string()),
    prompt_version: v.optional(v.string()),
    corpus_version: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return ctx.db.insert("findings", {
      project_id: args.project_id,
      issue_id: args.issue_id,
      discipline_origin: args.discipline_origin,
      interface_disciplines: args.interface_disciplines ?? [],
      stage: args.stage,
      source_document: args.source_document,
      source_reference: args.source_reference,
      related_documents: args.related_documents ?? [],
      requirement: args.requirement,
      finding: args.finding,
      status: args.status,
      risk: args.risk,
      build_readiness_impact: args.build_readiness_impact,
      question: args.question,
      required_evidence: args.required_evidence ?? [],
      owner: args.owner,
      model_used: args.model_used,
      prompt_version: args.prompt_version,
      corpus_version: args.corpus_version,
      created_at: now,
      updated_at: now,
    });
  },
});

/** Append an audit-log entry. The trust artefact — must work from day one. */
export const appendAudit = mutation({
  args: {
    project_id: v.optional(v.id("projects")),
    actor: v.string(),
    action: v.string(),
    target_type: v.string(),
    target_id: v.optional(v.string()),
    payload_json: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("audit_log", {
      project_id: args.project_id,
      actor: args.actor,
      action: args.action,
      target_type: args.target_type,
      target_id: args.target_id,
      payload_json: args.payload_json,
      occurred_at: Date.now(),
    });
  },
});

// ── Queries ─────────────────────────────────────────────────────────────────

/** Read a finding back by project + business issue_id. */
export const getFindingByIssue = query({
  args: { project_id: v.id("projects"), issue_id: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("findings")
      .withIndex("by_project_issue_id", (q) =>
        q.eq("project_id", args.project_id).eq("issue_id", args.issue_id),
      )
      .unique();
  },
});

/** List audit-log entries for a project (most recent first). */
export const listAudit = query({
  args: { project_id: v.id("projects") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("audit_log")
      .withIndex("by_project", (q) => q.eq("project_id", args.project_id))
      .order("desc")
      .collect();
  },
});
