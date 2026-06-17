"use node";

/**
 * VerifIQ — ZIP upload actions (single discipline + full multi-discipline suite).
 */

import { createHash } from "crypto";
import { writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { action, internalAction, type ActionCtx } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import StreamZip from "node-stream-zip";
import {
  DISCIPLINE_CODES,
  inferDisciplineFromPath,
  type DisciplineCode,
} from "../lib/disciplineInfer";

const MAX_ZIP_SIZE_BYTES = 1_000_000_000;
const MAX_FILE_SIZE_BYTES = 60_000_000;
const SUPPORTED_EXTENSIONS = [".pdf", ".docx", ".xlsx", ".xls", ".dwg", ".dxf", ".rvt"];

type ExtractedZipFile = {
  filePath: string;
  fileName: string;
  ext: string;
  sizeBytes: number;
  data: Buffer;
};

type DisciplineUploadResult = {
  uploadId: Id<"disciplineUploads">;
  fileCount: number;
  totalSizeBytes: number;
};

export const submitDisciplineZip = action({
  args: {
    magicLinkToken: v.string(),
    zipStorageId: v.id("_storage"),
    consultantEmail: v.string(),
  },
  handler: async (ctx, args): Promise<DisciplineUploadResult> => {
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

export const processStaffDisciplineZip = internalAction({
  args: {
    orgId: v.id("organizations"),
    projectId: v.id("projects"),
    discipline: v.string(),
    zipStorageId: v.id("_storage"),
    uploadedBy: v.string(),
  },
  handler: async (ctx, args) => {
    await processDisciplineZip(ctx, args);
  },
});

export const processStaffFullSuiteZip = internalAction({
  args: {
    orgId: v.id("organizations"),
    projectId: v.id("projects"),
    zipStorageId: v.id("_storage"),
    uploadedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const zipBuffer = await loadZipBuffer(ctx, args.zipStorageId);
    const extracted = await readZipEntries(zipBuffer);

    const buckets = new Map<DisciplineCode, ExtractedZipFile[]>();
    for (const file of extracted) {
      const discipline = inferDisciplineFromPath(file.filePath, file.fileName);
      const bucket = buckets.get(discipline) ?? [];
      bucket.push(file);
      buckets.set(discipline, bucket);
    }

    if (buckets.size === 0) {
      throw new Error(
        "No supported files found in ZIP. Include PDF, DOCX, XLSX, XLS, DWG, DXF, or RVT.",
      );
    }

    for (const discipline of DISCIPLINE_CODES) {
      const files = buckets.get(discipline);
      if (!files?.length) continue;

      await persistDisciplineFiles(ctx, {
        orgId: args.orgId,
        projectId: args.projectId,
        discipline,
        zipStorageId: args.zipStorageId,
        uploadedBy: args.uploadedBy,
        files,
      });
    }
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
): Promise<DisciplineUploadResult> {
  const zipBuffer = await loadZipBuffer(ctx, args.zipStorageId);
  const extracted = await readZipEntries(zipBuffer);

  return await persistDisciplineFiles(ctx, {
    orgId: args.orgId,
    projectId: args.projectId,
    discipline: args.discipline,
    zipStorageId: args.zipStorageId,
    uploadedBy: args.uploadedBy,
    invitationId: args.invitationId,
    files: extracted,
  });
}

async function persistDisciplineFiles(
  ctx: ActionCtx,
  args: {
    orgId: Id<"organizations">;
    projectId: Id<"projects">;
    discipline: string;
    zipStorageId: Id<"_storage">;
    uploadedBy: string;
    invitationId?: Id<"uploadInvitations">;
    files: ExtractedZipFile[];
  },
): Promise<DisciplineUploadResult> {
  if (args.files.length === 0) {
    throw new Error(
      "No supported files found in ZIP. Include PDF, DOCX, XLSX, XLS, DWG, DXF, or RVT.",
    );
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

  const extractedFiles: Id<"files">[] = [];
  let totalSize = 0;
  let estimatedPages = 0;

  for (const file of args.files) {
    const fileStorageId = await ctx.storage.store(new Blob([new Uint8Array(file.data)]));
    totalSize += file.sizeBytes;
    estimatedPages += estimatePagesFromSize(file.sizeBytes, file.ext);

    const fileId = await ctx.runMutation(internal.files.create, {
      orgId: args.orgId,
      uploadId,
      packId: undefined,
      fileName: file.fileName,
      filePath: file.filePath,
      mimeType: mimeFromExt(file.ext),
      sizeBytes: file.sizeBytes,
      storageId: fileStorageId,
      estimatedPages: estimatePagesFromSize(file.sizeBytes, file.ext),
    });
    extractedFiles.push(fileId);
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

async function loadZipBuffer(ctx: ActionCtx, zipStorageId: Id<"_storage">): Promise<Buffer> {
  const zipBlob = await ctx.storage.get(zipStorageId);
  if (!zipBlob) throw new Error("ZIP not found in storage.");
  const zipBuffer = Buffer.from(await zipBlob.arrayBuffer());
  if (zipBuffer.byteLength > MAX_ZIP_SIZE_BYTES) {
    throw new Error(`ZIP exceeds ${MAX_ZIP_SIZE_BYTES / 1e6}MB cap. Split into multiple uploads.`);
  }
  return zipBuffer;
}

async function readZipEntries(zipBuffer: Buffer): Promise<ExtractedZipFile[]> {
  const zip = new StreamZip.async({ file: zipBufferToTempPath(zipBuffer) });
  const entries = await zip.entries();
  const extracted: ExtractedZipFile[] = [];

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

    const data = Buffer.from(await zip.entryData(name));
    extracted.push({
      filePath: name,
      fileName: name.split("/").pop()?.split("\\").pop() || name,
      ext,
      sizeBytes: entry.size,
      data,
    });
  }

  await zip.close();
  return extracted;
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
