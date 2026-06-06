/**
 * VerifIQ — minimal Convex functions (Phase 1)
 *
 * Purpose: Only the mutations/queries the Phase 1 smoke test needs, plus the
 *   audit-log writers. Audit writes are MUTATIONS so they persist even when a
 *   calling action retries (20 § "Audit-log writes are mutations, never
 *   actions"). The full workflow mutations arrive in Phase 2+.
 *
 * Implements: 05_output_schemas.md § Audit log, 20 § audit-as-mutation.
 * Version: phase1-v0.1
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  vBuildReadinessImpact,
  vCouncilDecision,
  vFindingStatus,
  vRisk,
  vScanState,
  vStage,
} from "./schema";

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const createProject = mutation({
  args: {
    name: v.string(),
    address: v.optional(v.string()),
    building_type: v.optional(v.string()),
    stage: v.optional(vStage),
    state: v.optional(vScanState),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("projects", {
      name: args.name,
      ...(args.address !== undefined ? { address: args.address } : {}),
      ...(args.building_type !== undefined ? { building_type: args.building_type } : {}),
      ...(args.stage !== undefined ? { stage: args.stage } : {}),
      state: args.state ?? "pending",
      created_at: now,
      updated_at: now,
    });
  },
});

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export const addDocument = mutation({
  args: {
    project_id: v.id("projects"),
    filename: v.string(),
    sha256: v.string(),
    size_bytes: v.number(),
    convex_storage_id: v.optional(v.id("_storage")),
    r2_key: v.optional(v.string()),
    discipline: v.optional(v.string()),
    doc_type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", {
      project_id: args.project_id,
      filename: args.filename,
      sha256: args.sha256,
      size_bytes: args.size_bytes,
      ...(args.convex_storage_id !== undefined
        ? { convex_storage_id: args.convex_storage_id }
        : {}),
      ...(args.r2_key !== undefined ? { r2_key: args.r2_key } : {}),
      ...(args.discipline !== undefined ? { discipline: args.discipline } : {}),
      ...(args.doc_type !== undefined ? { doc_type: args.doc_type } : {}),
      uploaded_at: Date.now(),
    });
  },
});

// ---------------------------------------------------------------------------
// Findings
// ---------------------------------------------------------------------------

export const insertFinding = mutation({
  args: {
    project_id: v.id("projects"),
    issue_id: v.string(),
    discipline_origin: v.string(),
    interface_disciplines: v.optional(v.array(v.string())),
    stage: vStage,
    project_area: v.optional(v.string()),
    location: v.optional(v.string()),
    source_document: v.string(),
    source_reference: v.string(),
    related_documents: v.optional(v.array(v.string())),
    requirement: v.string(),
    finding: v.string(),
    status: vFindingStatus,
    risk: vRisk,
    build_readiness_impact: vBuildReadinessImpact,
    question: v.optional(v.string()),
    required_evidence: v.optional(v.array(v.string())),
    owner: v.string(),
    secondary_owner: v.optional(v.string()),
    close_out_stage: v.optional(v.string()),
    council_decision: v.optional(vCouncilDecision),
    rationale: v.optional(v.string()),
    source_quote: v.optional(v.string()),
    model_used: v.optional(v.string()),
    prompt_version: v.optional(v.string()),
    corpus_version: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("findings", {
      project_id: args.project_id,
      issue_id: args.issue_id,
      discipline_origin: args.discipline_origin,
      interface_disciplines: args.interface_disciplines ?? [],
      stage: args.stage,
      ...(args.project_area !== undefined ? { project_area: args.project_area } : {}),
      ...(args.location !== undefined ? { location: args.location } : {}),
      source_document: args.source_document,
      source_reference: args.source_reference,
      related_documents: args.related_documents ?? [],
      requirement: args.requirement,
      finding: args.finding,
      status: args.status,
      risk: args.risk,
      build_readiness_impact: args.build_readiness_impact,
      ...(args.question !== undefined ? { question: args.question } : {}),
      required_evidence: args.required_evidence ?? [],
      owner: args.owner,
      ...(args.secondary_owner !== undefined ? { secondary_owner: args.secondary_owner } : {}),
      ...(args.close_out_stage !== undefined ? { close_out_stage: args.close_out_stage } : {}),
      ...(args.council_decision !== undefined ? { council_decision: args.council_decision } : {}),
      ...(args.rationale !== undefined ? { rationale: args.rationale } : {}),
      ...(args.source_quote !== undefined ? { source_quote: args.source_quote } : {}),
      ...(args.model_used !== undefined ? { model_used: args.model_used } : {}),
      ...(args.prompt_version !== undefined ? { prompt_version: args.prompt_version } : {}),
      ...(args.corpus_version !== undefined ? { corpus_version: args.corpus_version } : {}),
      created_at: now,
      updated_at: now,
    });
  },
});

export const getFinding = query({
  args: { id: v.id("findings") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listFindingsByProject = query({
  args: { project_id: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("findings")
      .withIndex("by_project", (q) => q.eq("project_id", args.project_id))
      .collect();
  },
});

// ---------------------------------------------------------------------------
// Audit log (the customer trust artefact — must work from day 1)
// ---------------------------------------------------------------------------

export const writeAuditLog = mutation({
  args: {
    project_id: v.optional(v.id("projects")),
    actor: v.string(),
    action: v.string(),
    target_type: v.string(),
    target_id: v.optional(v.string()),
    payload_json: v.string(),
    occurred_at: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("audit_log", {
      ...(args.project_id !== undefined ? { project_id: args.project_id } : {}),
      actor: args.actor,
      action: args.action,
      target_type: args.target_type,
      ...(args.target_id !== undefined ? { target_id: args.target_id } : {}),
      payload_json: args.payload_json,
      occurred_at: args.occurred_at ?? Date.now(),
    });
  },
});

/**
 * Persist a single LLM call to the audit log. This is the Convex mutation the
 * LLM router's auditSink invokes in production (one row per call).
 */
export const logLlmCall = mutation({
  args: {
    project_id: v.optional(v.id("projects")),
    role: v.string(),
    provider_used: v.string(),
    model_used: v.string(),
    tokens_in: v.number(),
    tokens_out: v.number(),
    cost_eur: v.number(),
    latency_ms: v.number(),
    outcome: v.string(),
    payload_json: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("audit_log", {
      ...(args.project_id !== undefined ? { project_id: args.project_id } : {}),
      actor: `llm:${args.provider_used}`,
      action: "llm_call",
      target_type: "llm_role",
      target_id: args.role,
      payload_json: args.payload_json,
      occurred_at: Date.now(),
    });
  },
});

export const listAuditLog = query({
  args: { project_id: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("audit_log")
      .withIndex("by_project", (q) => q.eq("project_id", args.project_id))
      .collect();
  },
});
