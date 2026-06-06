/**
 * VerifIQ — Convex-native storage adapter (fallback for small artefacts).
 *
 * Used for small generated artefacts (report exports, signed forms) per docs/27.
 * Convex's storage API is only available inside a Convex function context, so
 * this adapter wraps the `ctx.storage` handle. For Convex, the object "key" is
 * the storage id, which is only known AFTER the client completes the upload
 * (the POST returns it) — so `getUploadUrl` returns an empty key.
 *
 * Callers inside Convex pass `ctx.storage` (cast to `ConvexStorage`, since the
 * generated `Id<"_storage">` brand is intentionally not imported here).
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

/** The minimal slice of Convex's `ctx.storage` this adapter needs. */
export interface ConvexStorage {
  generateUploadUrl(): Promise<string>;
  getUrl(storageId: string): Promise<string | null>;
  get(storageId: string): Promise<Blob | null>;
  delete(storageId: string): Promise<void>;
}

const UPLOAD_URL_TTL = 3600;

export class ConvexStorageProvider implements StorageProvider {
  readonly name = "convex" as const;
  constructor(private storage: ConvexStorage) {}

  async getUploadUrl(_meta: FileMeta): Promise<UploadTarget> {
    const url = await this.storage.generateUploadUrl();
    // Convex returns the storage id in the upload POST response, not now.
    return { url, key: "", method: "POST", expires_in: UPLOAD_URL_TTL };
  }

  async getDownloadUrl(key: string): Promise<string> {
    const url = await this.storage.getUrl(key);
    if (!url) throw new Error(`No Convex storage object for id "${key}"`);
    return url;
  }

  async getObject(key: string, range?: ByteRange): Promise<Uint8Array> {
    const blob = await this.storage.get(key);
    if (!blob) throw new Error(`No Convex storage object for id "${key}"`);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    return range ? bytes.slice(range.start, range.end + 1) : bytes;
  }

  async deleteObject(key: string): Promise<void> {
    await this.storage.delete(key);
  }

  async headObject(key: string): Promise<ObjectHead | null> {
    const blob = await this.storage.get(key);
    if (!blob) return null;
    return { size_bytes: blob.size, content_type: blob.type || undefined };
  }
}
