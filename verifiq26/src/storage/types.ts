/**
 * VerifIQ — storage provider interface (Phase 1)
 *
 * Purpose: The provider-agnostic file-storage contract. No non-adapter code may
 *   reference a storage SDK or hardcode a storage location (anti-pattern in the
 *   Phase 1 brief). R2 and Convex-native adapters implement this; index.ts
 *   routes by file size (docs/27).
 *
 * Implements: docs/27, 20_platform_architecture.md § 1.
 * Version: phase1-v0.1
 */

export type StorageProviderName = "r2" | "convex";

/** Metadata supplied before an upload so a deterministic object key can form. */
export interface FileMeta {
  filename: string;
  size_bytes: number;
  /** Client-computed SHA-256 (hex). Drives the deterministic object key. */
  sha256?: string;
  content_type?: string;
  project_id?: string;
  discipline?: string;
}

/** A single presigned part for a multipart upload. */
export interface MultipartPart {
  part_number: number;
  url: string;
}

/** Multipart upload handle for large files (>5 MB). */
export interface MultipartUpload {
  upload_id: string;
  part_size_bytes: number;
  parts: MultipartPart[];
}

/** What the caller needs to upload directly from the browser, and persist. */
export interface UploadTarget {
  provider: StorageProviderName;
  key: string;
  /** Single-PUT presigned URL (undefined when multipart is used). */
  url?: string;
  method: "PUT" | "POST";
  headers?: Record<string, string>;
  expires_at: number;
  /** Present when the file exceeds the multipart threshold. */
  multipart?: MultipartUpload;
}

/** Result of a HEAD request. */
export interface ObjectHead {
  exists: boolean;
  size_bytes?: number;
  content_type?: string;
  sha256?: string;
}

/** A (possibly ranged) object read for streaming PDF access. */
export interface ObjectBody {
  /** Node stream / web stream / bytes — provider-specific, opaque to callers. */
  body: unknown;
  size_bytes?: number;
  content_type?: string;
  /** Echoed content-range when a range request was served. */
  content_range?: string;
}

export interface GetObjectOptions {
  /** Byte range for streaming (inclusive). */
  range?: { start: number; end?: number };
}

export interface StorageProvider {
  readonly name: StorageProviderName;

  /** Presigned URL(s) for direct browser→storage upload (tus.io-compatible). */
  getUploadUrl(meta: FileMeta): Promise<UploadTarget>;

  /** Presigned download URL with 1-hour expiry. */
  getDownloadUrl(key: string): Promise<string>;

  /** Read an object, optionally a byte range (for streaming PDFs). */
  getObject(key: string, options?: GetObjectOptions): Promise<ObjectBody>;

  /** Delete an object. */
  deleteObject(key: string): Promise<void>;

  /** HEAD an object (existence + metadata). */
  headObject(key: string): Promise<ObjectHead>;
}

/**
 * Deterministic object key per 20 § file storage strategy:
 *   proj/{project_id}/disc/{discipline}/{sha256}.{ext}
 * Falls back to a timestamp+random segment when project/discipline/sha256 are
 * not yet known (e.g. pre-classification staging).
 */
export function buildObjectKey(meta: FileMeta): string {
  const ext = extensionOf(meta.filename);
  const project = meta.project_id ?? "staging";
  const discipline = meta.discipline ?? "unsorted";
  const name = meta.sha256 ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `proj/${project}/disc/${discipline}/${name}${ext}`;
}

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot).toLowerCase() : "";
}
