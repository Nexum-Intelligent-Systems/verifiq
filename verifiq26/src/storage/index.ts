/**
 * VerifIQ — storage selector (size-aware routing).
 *
 * Routes by file size per docs/27: files at/above the threshold (default
 * 100 MB) go to Cloudflare R2; smaller artefacts may use Convex-native storage.
 * For read/delete/head, the location is inferred from the key shape — R2 keys
 * follow `proj/.../<sha>.<ext>` (contain "/"), Convex storage ids do not.
 *
 * Spec references: docs/27; docs/28 § D3.
 * Version: 0.3.0-phase1
 */

import {
  type ByteRange,
  type FileMeta,
  type ObjectHead,
  type StorageProvider,
  type UploadTarget,
} from "./types.js";
import { R2Provider, r2FromEnv } from "./r2.js";
import { ConvexStorageProvider, type ConvexStorage } from "./convex.js";

export * from "./types.js";
export { R2Provider, r2FromEnv, MULTIPART_THRESHOLD_BYTES } from "./r2.js";
export { ConvexStorageProvider } from "./convex.js";

/** Default size threshold for routing to R2 (100 MB; docs/27 / .env example). */
export const DEFAULT_R2_THRESHOLD_BYTES = 100 * 1024 * 1024;

export interface StorageRouterOptions {
  r2?: R2Provider | null;
  convex?: ConvexStorageProvider | null;
  thresholdBytes?: number;
}

/**
 * Size-aware storage router implementing the 5-method StorageProvider contract.
 * Upload routing uses `meta.size_bytes`; other ops route by key shape.
 */
export class StorageRouter implements StorageProvider {
  readonly name = "r2" as const; // nominal; routing happens per call
  private r2: R2Provider | null;
  private convex: ConvexStorageProvider | null;
  private threshold: number;

  constructor(opts: StorageRouterOptions) {
    this.r2 = opts.r2 ?? null;
    this.convex = opts.convex ?? null;
    this.threshold = opts.thresholdBytes ?? DEFAULT_R2_THRESHOLD_BYTES;
    if (!this.r2 && !this.convex) {
      throw new Error("StorageRouter needs at least one of: r2, convex");
    }
  }

  /** Pick the provider for an upload of the given size. */
  forUpload(sizeBytes: number): StorageProvider {
    if (sizeBytes >= this.threshold) {
      return this.require(this.r2, "R2");
    }
    // Prefer Convex for small artefacts when available, else fall back to R2.
    return this.convex ?? this.require(this.r2, "R2");
  }

  /** Pick the provider for an existing key by its shape. */
  private forKey(key: string): StorageProvider {
    const looksLikeR2 = key.includes("/");
    return looksLikeR2 ? this.require(this.r2, "R2") : this.convex ?? this.require(this.r2, "R2");
  }

  private require<T>(value: T | null, label: string): T {
    if (!value) throw new Error(`${label} storage provider is not configured`);
    return value;
  }

  getUploadUrl(meta: FileMeta): Promise<UploadTarget> {
    return this.forUpload(meta.size_bytes).getUploadUrl(meta);
  }
  getDownloadUrl(key: string, expiresInSeconds?: number): Promise<string> {
    return this.forKey(key).getDownloadUrl(key, expiresInSeconds);
  }
  getObject(key: string, range?: ByteRange): Promise<Uint8Array> {
    return this.forKey(key).getObject(key, range);
  }
  deleteObject(key: string): Promise<void> {
    return this.forKey(key).deleteObject(key);
  }
  headObject(key: string): Promise<ObjectHead | null> {
    return this.forKey(key).headObject(key);
  }
}

/**
 * Build a StorageRouter from environment variables. The Convex-native adapter
 * is added separately (it needs a function ctx), so this wires R2 only.
 */
export function storageFromEnv(env: Record<string, string | undefined>): StorageRouter {
  const r2 = r2FromEnv(env);
  const threshold = env.STORAGE_R2_THRESHOLD_BYTES
    ? Number(env.STORAGE_R2_THRESHOLD_BYTES)
    : DEFAULT_R2_THRESHOLD_BYTES;
  return new StorageRouter({ r2, thresholdBytes: threshold });
}

export type { ConvexStorage };
