/**
 * VerifIQ — storage selector / router (Phase 1)
 *
 * Purpose: Routes uploads by file size — files at/above the threshold go to R2
 *   (no per-blob ceiling, zero egress), smaller files go to Convex-native
 *   storage (docs/27). Non-upload operations route to the named provider the
 *   `documents` row recorded at upload time.
 *
 * Implements: docs/27 § Recommendation, 20_platform_architecture.md § 1.
 * Version: phase1-v0.1
 */

import { ConvexStorageProvider } from "./convex";
import { R2StorageProvider } from "./r2";
import {
  type FileMeta,
  type StorageProvider,
  type StorageProviderName,
  type UploadTarget,
} from "./types";

/** Default routing threshold: 100 MB (docs/27). Env-overridable. */
export function r2ThresholdBytes(): number {
  const raw = process.env.STORAGE_R2_THRESHOLD_BYTES;
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) ? parsed : 100 * 1024 * 1024;
}

/** Decide which provider a file of the given size should upload to. */
export function routeProviderName(
  sizeBytes: number,
  thresholdBytes: number = r2ThresholdBytes(),
): StorageProviderName {
  return sizeBytes >= thresholdBytes ? "r2" : "convex";
}

export interface StorageRouterOptions {
  r2?: StorageProvider;
  convex?: StorageProvider;
  thresholdBytes?: number;
}

export class StorageRouter {
  private readonly r2?: StorageProvider;
  private readonly convex?: StorageProvider;
  private readonly threshold: number;

  constructor(options: StorageRouterOptions = {}) {
    this.r2 = options.r2;
    this.convex = options.convex;
    this.threshold = options.thresholdBytes ?? r2ThresholdBytes();
  }

  /** Pick the upload target by size, with a sensible fallback when one provider
   * is not wired (e.g. Convex storage is unavailable outside a Convex action). */
  async getUploadTarget(meta: FileMeta): Promise<UploadTarget> {
    const preferred = routeProviderName(meta.size_bytes, this.threshold);
    const provider = this.resolve(preferred);
    return provider.getUploadUrl(meta);
  }

  /** Return a specific provider for download/head/get/delete operations. */
  provider(name: StorageProviderName): StorageProvider {
    return this.resolve(name);
  }

  private resolve(name: StorageProviderName): StorageProvider {
    const chosen = name === "r2" ? this.r2 : this.convex;
    if (chosen) return chosen;
    const fallback = this.r2 ?? this.convex;
    if (!fallback) {
      throw new Error("No storage provider configured on the StorageRouter");
    }
    return fallback;
  }
}

/** Construct an R2 provider from env. */
export function createR2Provider(): R2StorageProvider {
  return new R2StorageProvider();
}

export { ConvexStorageProvider, R2StorageProvider };
export * from "./types";
