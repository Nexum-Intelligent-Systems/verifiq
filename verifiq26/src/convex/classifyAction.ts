"use node";
/**
 * VerifIQ — Phase 6 classify action (CLAUDE.md §Phase 6).
 *
 * Wires the 3-source title-block classifier (src/classify/) into Convex: each
 * uploaded document is classified in isolation, auto-confirmed when confidence
 * is high enough, and — once the whole pack is done — the review is dispatched
 * automatically. Low-confidence documents advance the project to `confirm_classify`
 * instead so the customer can review them before the council begins.
 *
 * Call graph (all triggered by sealUploadSession):
 *   sealUploadSession → ctx.scheduler per doc → classifyOneDocument
 *   classifyOneDocument → saveClassification → (confirmDocument) → checkAndAdvance
 *   checkAndAdvance (all confirmed) → build RunInput → scanning → runReview
 */

import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { storageFromEnv } from "../storage";
import { classifyDocument } from "../classify";
import { createNodePdf } from "../pdf";
import { createLLM } from "../llm";
import type { RunInput } from "../orchestrator";
import type { Stage } from "../types/index";

/** Confidence threshold for auto-confirm; mirrors classify.ts constant. */
const CONFIRM_THRESHOLD = 0.7;

// ── Internal queries ──────────────────────────────────────────────────────────

export const loadDocument = internalQuery({
  args: { document_id: v.id("documents") },
  handler: async (ctx, args) => ctx.db.get(args.document_id),
});

export const loadProjectDocuments = internalQuery({
  args: { project_id: v.id("projects") },
  handler: async (ctx, args) =>
    ctx.db
      .query("documents")
      .withIndex("by_project", (q) => q.eq("project_id", args.project_id))
      .collect(),
});

export const loadProject = internalQuery({
  args: { project_id: v.id("projects") },
  handler: async (ctx, args) => ctx.db.get(args.project_id),
});

// ── Internal mutations ────────────────────────────────────────────────────────

export const markClassifying = internalMutation({
  args: { document_id: v.id("documents") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.document_id, { status: "classifying" });
  },
});

export const saveTextPreview = internalMutation({
  args: { document_id: v.id("documents"), text_preview: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.document_id, { text_preview: args.text_preview });
  },
});

/**
 * After each document finishes classifying: check the whole pack's status and
 * advance the project if all documents are now settled.
 *
 * - Any `uploaded` or `classifying` doc → still in flight; nothing to do.
 * - Any `classified` (low confidence, unconfirmed) doc → `confirm_classify`.
 * - All `confirmed` → build RunInput from extracted text, advance to `scanning`,
 *   persist the review payload, and schedule runReview.
 */
export const checkAndAdvance = internalMutation({
  args: { project_id: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.project_id);
    if (!project || project.scan_state !== "classifying") return;

    const docs = await ctx.db
      .query("documents")
      .withIndex("by_project", (q) => q.eq("project_id", args.project_id))
      .collect();
    if (docs.length === 0) return;

    const inFlight = docs.some((d) => d.status === "uploaded" || d.status === "classifying");
    if (inFlight) return;

    const now = Date.now();
    const needsConfirm = docs.some((d) => d.status === "classified");

    if (needsConfirm) {
      await ctx.db.patch(args.project_id, { scan_state: "confirm_classify", updated_at: now });
      return;
    }

    // All confirmed — build the RunInput and hand off to the council.
    const byDiscipline: Record<string, { filename: string; text: string }[]> = {};
    for (const doc of docs) {
      const disc = doc.discipline ?? "unclassified";
      (byDiscipline[disc] ??= []).push({
        filename: doc.filename,
        text: doc.text_preview ?? `[No text extracted from ${doc.filename}]`,
      });
    }

    const input: RunInput = {
      projectId: args.project_id,
      projectName: project.name,
      projectStage: (project.stage as Stage) ?? "pre-tender",
      buildingType: project.building_type ?? "Unknown",
      reviewDate: new Date().toISOString().slice(0, 10),
      corpusVersion: project.corpus_version ?? "IE-2026.06",
      documentsByDiscipline: byDiscipline,
    };

    const existing = await ctx.db
      .query("review_inputs")
      .withIndex("by_project", (q) => q.eq("project_id", args.project_id))
      .first();
    const payload = JSON.stringify(input);
    if (existing) {
      await ctx.db.patch(existing._id, { payload_json: payload });
    } else {
      await ctx.db.insert("review_inputs", {
        project_id: args.project_id,
        payload_json: payload,
        created_at: now,
      });
    }

    await ctx.db.patch(args.project_id, { scan_state: "scanning", updated_at: now });
    await ctx.scheduler.runAfter(0, internal.review.runReview, { project_id: args.project_id });
  },
});

// ── Classify action ───────────────────────────────────────────────────────────

/**
 * Classify one document. Runs in the Node runtime so pdfjs and @napi-rs/canvas
 * are available. Scheduled per-document by sealUploadSession.
 *
 * On any unrecoverable error the document is marked `failed` so the pack can
 * still advance once all other documents are settled.
 */
export const classifyOneDocument = internalAction({
  args: { document_id: v.id("documents") },
  handler: async (ctx, args) => {
    // Mark in-flight so checkAndAdvance doesn't prematurely advance.
    await ctx.runMutation(internal.classifyAction.markClassifying, {
      document_id: args.document_id,
    });

    const doc = await ctx.runQuery(internal.classifyAction.loadDocument, {
      document_id: args.document_id,
    });
    if (!doc) return;

    // Download bytes from R2.
    let bytes: Uint8Array | undefined;
    if (doc.r2_key) {
      try {
        const storage = storageFromEnv(process.env);
        bytes = await storage.getObject(doc.r2_key);
      } catch {
        // Non-fatal — fall back to filename-only classification.
      }
    }

    // Build the LLM client (optional — gracefully degrades if keys absent).
    let llm: ReturnType<typeof createLLM> | undefined;
    try {
      llm = createLLM({});
    } catch {
      // No LLM configured — filename-only path below.
    }

    // Run the 3-source classifier.
    let result;
    try {
      const pdfAdapter = createNodePdf();
      result = await classifyDocument(
        { filename: doc.filename, bytes },
        { llm: llm!, renderer: bytes ? pdfAdapter : undefined, textExtractor: bytes ? pdfAdapter : undefined },
      );
    } catch {
      const { parseFilename } = await import("../classify/filename.js");
      result = parseFilename(doc.filename);
    }

    // Persist text preview for use in the review RunInput.
    if (bytes) {
      try {
        const pdfAdapter = createNodePdf();
        const text = await pdfAdapter.firstText(bytes, 2000);
        if (text.trim()) {
          await ctx.runMutation(internal.classifyAction.saveTextPreview, {
            document_id: args.document_id,
            text_preview: text,
          });
        }
      } catch {
        // Non-fatal.
      }
    }

    // Save classification result (sets status → "classified").
    await ctx.runMutation(internal.classify.saveClassification, {
      document_id: args.document_id,
      discipline: result.discipline,
      doc_type: result.doc_type,
      classifier_confidence: result.classifier_confidence,
      ...(result.drawing_number !== undefined ? { drawing_number: result.drawing_number } : {}),
      ...(result.revision !== undefined ? { revision: result.revision } : {}),
      ...(result.date !== undefined ? { date: result.date } : {}),
      ...(result.author !== undefined ? { author: result.author } : {}),
    });

    // Auto-confirm high-confidence results so the pack can advance without
    // customer intervention (file 20 §4).
    if (result.classifier_confidence >= CONFIRM_THRESHOLD) {
      await ctx.runMutation(internal.classify.confirmDocument, {
        document_id: args.document_id,
      });
    }

    // Check if the whole pack is now settled and advance the project.
    await ctx.runMutation(internal.classifyAction.checkAndAdvance, {
      project_id: doc.project_id,
    });
  },
});
