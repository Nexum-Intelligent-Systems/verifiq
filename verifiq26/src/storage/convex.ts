/**
 * VerifIQ — Convex-native storage adapter (Phase 1)
 *
 * Purpose: Fallback StorageProvider for small artefacts (generated reports,
 *   audit PDFs) per docs/27. Convex storage is only reachable from inside a
 *   Convex function, so this adapter wraps an injected Convex storage context
 *   rather than importing the SDK — keeping it conformant to StorageProvider
 *   while remaining usable from Convex actions.
 *
 * Implements: docs/27 (Convex-native small-artefact path).
 * Version: phase1-v0.1
 */

import {
  type FileMeta,
  type GetObjectOptions,
  type ObjectBody,
  type ObjectHead,
  type StorageProvider,
  type UploadTarget,
} from "./types";

const UPLOAD_EXPIRY_SECONDS = 3600;

/**
 * The subset of Convex's storage context this adapter needs. In a Convex
 * action/mutation this is satisfied by `ctx.storage`.
 */
export interface ConvexStorageCtx {
  generateUploadUrl(): Promise<string>;
  getUrl(storageId: string): Promise<string | null>;
  delete(storageId: string): Promise<void>;
  get?(storageId: string): Promise<Blob | null>;
  getMetadata?(
    storageId: string,
  ): Promise<{ size?: number; contentType?: string; sha256?: string } | null>;
}

export class ConvexStorageProvider implements StorageProvider {
  readonly name = "convex" as const;

  constructor(private readonly ctx: ConvexStorageCtx) {}

  /**
   * Convex issues a one-time POST upload URL; the storage id is returned in the
   * upload response, so `key` is empty here and persisted by the caller after
   * the upload completes. `meta` is part of the interface contract.
   */
  async getUploadUrl(_meta: FileMeta): Promise<UploadTarget> {
    void _meta;
    const url = await this.ctx.generateUploadUrl();
    return {
      provider: this.name,
      key: "",
      url,
      method: "POST",
      expires_at: Date.now() + UPLOAD_EXPIRY_SECONDS * 1000,
    };
  }

  async getDownloadUrl(key: string): Promise<string> {
    const url = await this.ctx.getUrl(key);
    if (!url) throw new Error(`Convex storage object not found: ${key}`);
    return url;
  }

  /** Convex storage reads are whole-object; `range` is accepted but not applied. */
  async getObject(key: string, _options?: GetObjectOptions): Promise<ObjectBody> {
    void _options;
    if (!this.ctx.get) {
      throw new Error("Convex storage context does not support get()");
    }
    const blob = await this.ctx.get(key);
    if (!blob) throw new Error(`Convex storage object not found: ${key}`);
    return {
      body: blob,
      size_bytes: blob.size,
      content_type: blob.type,
    };
  }

  async deleteObject(key: string): Promise<void> {
    await this.ctx.delete(key);
  }

  async headObject(key: string): Promise<ObjectHead> {
    if (this.ctx.getMetadata) {
      const meta = await this.ctx.getMetadata(key);
      if (!meta) return { exists: false };
      return {
        exists: true,
        ...(meta.size !== undefined ? { size_bytes: meta.size } : {}),
        ...(meta.contentType !== undefined ? { content_type: meta.contentType } : {}),
        ...(meta.sha256 !== undefined ? { sha256: meta.sha256 } : {}),
      };
    }
    const url = await this.ctx.getUrl(key);
    return { exists: url !== null };
  }
}
