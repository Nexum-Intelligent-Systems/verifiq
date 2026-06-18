"use node";
/**
 * VerifIQ — pack ingest → review dispatch node action (Phase 6 web-upload wiring).
 *
 * The missing bridge between a sealed upload pack and the council. Sealing a
 * pack (`uploadDocs.sealUploadSession`) advances the project to `classifying`
 * and schedules this action, which:
 *
 *   1. loads the project + its document manifest (`ingestData` queries),
 *   2. downloads each file's bytes from R2 (`r2_key`) or Convex storage
 *      (`storage_id`),
 *   3. turns bytes into review text — pdfjs for PDFs, UTF-8 for text files,
 *   4. groups the text under each file's council discipline-agent key,
 *   5. dispatches the review via `reviewData.requestReview`, which persists the
 *      RunInput and schedules the resumable `review.runReview` orchestrator.
 *
 * Runs in Node ("use node") for the R2 presigner/SDK and the pdfjs parser.
 * Per-file failures are isolated and audit-logged — one unreadable file does
 * not sink the pack. If nothing is readable, the pack is parked (no empty run).
 *
 * Verify locally: needs R2_* (or Convex-stored files) + a Convex deployment;
 * the council leg additionally needs ANTHROPIC_API_KEY / OPENAI_API_KEY.
 *
 * Version: 0.8.0-phase6
 */

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { unzipSync } from "fflate";
import { api, internal } from "./_generated/api";
import { r2FromEnv } from "../storage/r2.js";
import { createNodePdf } from "../pdf/index.js";
import { resolveAgentDiscipline, fileTextKind } from "../ingest/extract.js";
import { isZipName, isReviewableZipPath, zipEntryBasename } from "../ingest/zip.js";
import type { RunInput } from "../orchestrator";
import type { ReviewDocument } from "../agents/agent.js";

/** Per-file text clamp — keeps a huge pack inside the council's token budget. */
const MAX_DOC_CHARS = 200_000;
/** Cap on files pulled out of a single archive — a guard against zip bombs. */
const MAX_ZIP_ENTRIES = 500;

export const ingestAndReview = internalAction({
  args: { project_id: v.id("projects") },
  handler: async (ctx, args) => {
    const appendAudit = (action: string, payloadObj: unknown) =>
      ctx.runMutation(api.mutations.appendAudit, {
        project_id: args.project_id,
        actor: "system",
        action,
        target_type: "project",
        payload_json: JSON.stringify(payloadObj),
      });

    const project = await ctx.runQuery(internal.ingestData.loadProjectForReview, {
      project_id: args.project_id,
    });
    if (!project) throw new Error(`project ${args.project_id} not found for ingest`);

    const docs = await ctx.runQuery(internal.ingestData.loadProjectDocuments, {
      project_id: args.project_id,
    });

    const r2 = r2FromEnv(process.env);
    const pdf = createNodePdf();
    const decoder = new TextDecoder();

    const documentsByDiscipline: Record<string, ReviewDocument[]> = {};
    const skipped: { filename: string; reason: string }[] = [];

    // Turn raw bytes into review text (PDF parse / UTF-8 decode), or null if the
    // type is unsupported or the parse fails — caller records the skip reason.
    const toText = async (filename: string, bytes: Uint8Array): Promise<string | null> => {
      const kind = fileTextKind(filename);
      try {
        if (kind === "pdf") return await pdf.allText(bytes, MAX_DOC_CHARS);
        if (kind === "text") return decoder.decode(bytes).slice(0, MAX_DOC_CHARS);
        return null;
      } catch {
        return null;
      }
    };

    // Add one extracted document under the council agent for its tag/filename.
    const add = (tag: string | null, filename: string, text: string) => {
      if (!text.trim()) {
        skipped.push({ filename, reason: "empty_text" });
        return;
      }
      const key = resolveAgentDiscipline(tag, filename);
      (documentsByDiscipline[key] ??= []).push({ filename, text });
    };

    for (const d of docs) {
      // 1) bytes
      let bytes: Uint8Array | null = null;
      try {
        if (d.r2_key) {
          if (!r2) {
            skipped.push({ filename: d.filename, reason: "r2_unconfigured" });
            continue;
          }
          bytes = await r2.getObject(d.r2_key);
        } else if (d.storage_id) {
          const blob = await ctx.storage.get(d.storage_id);
          if (blob) bytes = new Uint8Array(await blob.arrayBuffer());
        }
      } catch {
        bytes = null;
      }
      if (!bytes || bytes.length === 0) {
        skipped.push({ filename: d.filename, reason: "no_bytes" });
        continue;
      }

      // 2a) a raw ZIP that reached the server: unpack it and review its entries.
      // (The browser usually expands ZIPs before upload; this is the safety net.)
      if (isZipName(d.filename)) {
        let entries: Record<string, Uint8Array>;
        try {
          entries = unzipSync(bytes);
        } catch {
          skipped.push({ filename: d.filename, reason: "zip_unreadable" });
          continue;
        }
        let count = 0;
        for (const [path, entryBytes] of Object.entries(entries)) {
          if (!isReviewableZipPath(path)) {
            if (!path.endsWith("/")) skipped.push({ filename: path, reason: "zip_entry_unsupported" });
            continue;
          }
          if (++count > MAX_ZIP_ENTRIES) {
            skipped.push({ filename: d.filename, reason: "zip_too_many_entries" });
            break;
          }
          const name = zipEntryBasename(path);
          const text = await toText(name, entryBytes);
          if (text === null) skipped.push({ filename: name, reason: "extract_failed" });
          else add(d.discipline, name, text);
        }
        continue;
      }

      // 2b) a normal document.
      const text = await toText(d.filename, bytes);
      if (text === null) {
        skipped.push({ filename: d.filename, reason: "unsupported_type" });
        continue;
      }
      add(d.discipline, d.filename, text);
    }

    const ingested = Object.values(documentsByDiscipline).reduce((n, v2) => n + v2.length, 0);

    if (ingested === 0) {
      // Nothing readable — fail loudly rather than dispatch an empty review. The
      // pack stays at `classifying`; the scheduled-function error log carries the
      // per-file skip reasons for the reviewer queue.
      throw new Error(
        `pack ingest produced no reviewable text for project ${args.project_id}: ` +
          JSON.stringify(skipped),
      );
    }

    const input: RunInput = {
      projectId: args.project_id,
      projectName: project.name,
      projectStage: (project.stage ?? "pre-build") as RunInput["projectStage"],
      buildingType: project.building_type ?? "Unspecified",
      reviewDate: new Date().toISOString().slice(0, 10),
      corpusVersion: project.corpus_version ?? undefined,
      documentsByDiscipline,
    };

    await appendAudit("ingest_complete", {
      ingested,
      skipped,
      disciplines: Object.fromEntries(
        Object.entries(documentsByDiscipline).map(([k, v2]) => [k, v2.length]),
      ),
    });

    await ctx.runMutation(api.reviewData.requestReview, {
      project_id: args.project_id,
      payload_json: JSON.stringify(input),
    });

    return { ingested, skipped: skipped.length, dispatched: true };
  },
});
