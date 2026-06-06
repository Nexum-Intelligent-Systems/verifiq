/**
 * VerifIQ — storage adapter interface.
 *
 * Purpose: the provider-agnostic contract for file storage. No non-adapter code
 * may name a concrete store (CLAUDE.md anti-patterns); everything goes through
 * `StorageProvider` and the size-routing selector.
 *
 * Spec references: docs/27-stack-decision-storage-and-platform.md (Convex + R2
 * hybrid); verifiq-prompts/20_platform_architecture.md § 1; docs/28 § D3.
 * Version: 0.3.0-phase1
 */

/** Metadata supplied when requesting an upload URL. */
export interface FileMeta {
  project_id: string;
  discipline: string;
  filename: string;
  sha256: string;
  size_bytes: number;
  content_type?: string;
}

/** A signed upload target (direct browser→storage; tus.io compatible). */
export interface UploadTarget {
  url: string;
  /** The object key (R2) or storage id (Convex) the file will live under. */
  key: string;
  method: "PUT" | "POST";
  headers?: Record<string, string>;
  /** Seconds until the signed URL expires. */
  expires_in: number;
}

/** Result of a HEAD request. */
export interface ObjectHead {
  size_bytes: number;
  etag?: string;
  content_type?: string;
}

/** Optional byte range for streaming reads (e.g. PDF range requests). */
export interface ByteRange {
  start: number;
  end: number;
}

/** The five-method storage contract (docs/28 § D3). */
export interface StorageProvider {
  readonly name: "r2" | "convex";
  /** Signed URL for a direct upload. */
  getUploadUrl(meta: FileMeta): Promise<UploadTarget>;
  /** Signed download URL (default 1-hour expiry). */
  getDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;
  /** Fetch object bytes, optionally a byte range. */
  getObject(key: string, range?: ByteRange): Promise<Uint8Array>;
  /** Delete an object. */
  deleteObject(key: string): Promise<void>;
  /** HEAD metadata, or null if absent. */
  headObject(key: string): Promise<ObjectHead | null>;
}

/**
 * Object-key convention (file 20 § File storage strategy):
 *   proj/{project_id}/disc/{discipline}/{sha256}.{ext}
 */
export function buildObjectKey(meta: FileMeta): string {
  const ext = meta.filename.includes(".") ? meta.filename.split(".").pop() : "bin";
  const disc = meta.discipline || "unsorted";
  return `proj/${meta.project_id}/disc/${disc}/${meta.sha256}.${ext}`;
}

/** SHA-256 hex of bytes (Web Crypto; available in Node 20 + edge runtimes). */
export async function computeSha256(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
