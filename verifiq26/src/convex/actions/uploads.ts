"use node";

/**
 * VerifIQ — Per-Discipline ZIP Upload Action
 *
 * Receives a ZIP uploaded by a consultant via magic-link, extracts it server-side,
 * classifies each file, queues per-discipline scan.
 */

import { createHash } from "crypto";
import { writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { action, type ActionCtx } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import StreamZip from "node-stream-zip";

const MAX_ZIP_SIZE_BYTES = 1_000_000_000; // 1 GB cap per discipline ZIP
const MAX_FILE_SIZE_BYTES = 60_000_000; // 60 MB per individual file
const SUPPORTED_EXTENSIONS = [".pdf", ".docx", ".xlsx", ".xls", ".dwg", ".dxf", ".rvt"];

const DISCIPLINE_CODES = ["arch", "cs", "mech", "elec", "fire", "qs", "bcar"] as const;

export const submitDisciplineZip = action({
  args: {
    magicLinkToken: v.string(),
    zipStorageId: v.id("_storage"),
    consultantEmail: v.string(),
  },
  handler: async (ctx, args): Promise<{
    uploadId: Id<"disciplineUploads">;
    fileCount: number;
    totalSizeBytes: number;
  }> => {
    const invitation = await ctx.runQuery(internal.invitations.findByToken, {
      tokenHash: hashToken(args.magicLinkToken),
    });

    if (!invitation) {
      throw new Error("Invalid or expired upload link.");
    }
    if (invitation.status !== "sent" && invitation.status !== "opened") {
      throw new Error("Upload link has already been used or expired.");
    }
    if (Date.now() > invitation.expiresAt) {
      await ctx.runMutation(internal.invitations.markExpired, { id: invitation._id });
      throw new Error("Upload link has expired. Ask the customer for a new one.");
    }

    const result = await processDisciplineZip(ctx, {
      orgId: invitation.orgId,
      projectId: invitation.projectId,
      discipline: invitation.discipline,
      zipStorageId: args.zipStorageId,
      uploadedBy: args.consultantEmail,
      invitationId: invitation._id,
    });

    await ctx.runMutation(internal.invitations.markUploaded, { id: invitation._id });
    return result;
  },
});

/** Staff console upload — authenticated project owner, no magic link required. */
export const staffSubmitDisciplineZip = action({
  args: {
    projectId: v.id("projects"),
    discipline: v.string(),
    zipStorageId: v.id("_storage"),
  },
  handler: async (ctx, args): Promise<{
    uploadId: Id<"disciplineUploads">;
    fileCount: number;
    totalSizeBytes: number;
  }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) {
      throw new Error("Not authenticated");
    }

    const project = await ctx.runQuery(internal.projects.get, { id: args.projectId });
    if (!project) {
      throw new Error("Project not found");
    }
    if (project.createdBy !== identity.email) {
      throw new Error("Not authorized for this project");
    }
    if (!DISCIPLINE_CODES.includes(args.discipline as (typeof DISCIPLINE_CODES)[number])) {
      throw new Error(`Invalid discipline. Use one of: ${DISCIPLINE_CODES.join(", ")}`);
    }

    return await processDisciplineZip(ctx, {
      orgId: project.orgId,
      projectId: args.projectId,
      discipline: args.discipline,
      zipStorageId: args.zipStorageId,
      uploadedBy: identity.email,
    });
  },
});

async function processDisciplineZip(
  ctx: ActionCtx,
  args: {
    orgId: Id<"organizations">;
    projectId: Id<"projects">;
    discipline: string;
    zipStorageId: Id<"_storage">;
    uploadedBy: string;
    invitationId?: Id<"uploadInvitations">;
  },
): Promise<{
  uploadId: Id<"disciplineUploads">;
  fileCount: number;
  totalSizeBytes: number;
}> {
  const zipBlob = await ctx.storage.get(args.zipStorageId);
  if (!zipBlob) throw new Error("ZIP not found in storage.");
  const zipBuffer = Buffer.from(await zipBlob.arrayBuffer());
  if (zipBuffer.byteLength > MAX_ZIP_SIZE_BYTES) {
    throw new Error(`ZIP exceeds ${MAX_ZIP_SIZE_BYTES / 1e6}MB cap. Split into multiple uploads.`);
  }

  const uploadId = await ctx.runMutation(internal.uploads.create, {
    orgId: args.orgId,
    projectId: args.projectId,
    discipline: args.discipline,
    invitationId: args.invitationId,
    zipStorageId: args.zipStorageId,
    uploadedBy: args.uploadedBy,
    uploadedAt: Date.now(),
  });

  const zip = new StreamZip.async({ file: zipBufferToTempPath(zipBuffer) });
  const entries = await zip.entries();
  const extractedFiles: Id<"files">[] = [];
  let totalSize = 0;
  let estimatedPages = 0;

  for (const [name, entry] of Object.entries(entries)) {
    if (entry.isDirectory) continue;

    const ext = name.toLowerCase().substring(name.lastIndexOf("."));
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      console.warn(`Skipping unsupported file: ${name}`);
      continue;
    }
    if (entry.size > MAX_FILE_SIZE_BYTES) {
      console.warn(`Skipping oversized file: ${name} (${entry.size} bytes)`);
      continue;
    }

    const data = await zip.entryData(name);
    const fileStorageId = await ctx.storage.store(new Blob([new Uint8Array(data)]));
    totalSize += entry.size;
    estimatedPages += estimatePagesFromSize(entry.size, ext);

    const fileId = await ctx.runMutation(internal.files.create, {
      orgId: args.orgId,
      uploadId,
      packId: undefined,
      fileName: name.split("/").pop() || name,
      filePath: name,
      mimeType: mimeFromExt(ext),
      sizeBytes: entry.size,
      storageId: fileStorageId,
      estimatedPages: estimatePagesFromSize(entry.size, ext),
    });
    extractedFiles.push(fileId);
  }
  await zip.close();

  if (extractedFiles.length === 0) {
    throw new Error(
      "No supported files found in ZIP. Include PDF, DOCX, XLSX, XLS, DWG, DXF, or RVT.",
    );
  }

  await ctx.runMutation(internal.uploads.finalise, {
    uploadId,
    fileIds: extractedFiles,
    fileCount: extractedFiles.length,
    totalSizeBytes: totalSize,
    estimatedPages,
  });

  await ctx.scheduler.runAfter(0, internal.actions.classify.classifyDisciplineUpload, {
    uploadId,
  });

  return { uploadId, fileCount: extractedFiles.length, totalSizeBytes: totalSize };
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function zipBufferToTempPath(buf: Buffer): string {
  const tmpPath = join(
    tmpdir(),
    `verifiq_zip_${Date.now()}_${Math.random().toString(36).slice(2)}.zip`,
  );
  writeFileSync(tmpPath, buf);
  return tmpPath;
}

function estimatePagesFromSize(sizeBytes: number, ext: string): number {
  const bytesPerPage = {
    ".pdf": 60_000,
    ".docx": 25_000,
    ".xlsx": 8_000,
    ".xls": 8_000,
    ".dwg": 200_000,
    ".dxf": 150_000,
    ".rvt": 500_000,
  } as Record<string, number>;
  return Math.max(1, Math.round(sizeBytes / (bytesPerPage[ext] || 60_000)));
}

function mimeFromExt(ext: string): string {
  const map = {
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xls": "application/vnd.ms-excel",
    ".dwg": "application/acad",
    ".dxf": "application/dxf",
    ".rvt": "application/octet-stream",
  } as Record<string, string>;
  return map[ext] || "application/octet-stream";
}
