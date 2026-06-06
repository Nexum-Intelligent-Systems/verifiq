/**
 * VerifIQ — Cloudflare R2 storage adapter (Phase 1)
 *
 * Purpose: Implements StorageProvider against R2 via the S3-compatible API.
 *   Generates presigned upload URLs for direct browser→R2 upload (single PUT,
 *   or multipart for files >5 MB), presigned 1-hour download URLs, supports
 *   ranged reads for streaming PDFs, and verifies SHA-256 on completion.
 *
 * Implements: docs/27 (R2 hybrid), 20_platform_architecture.md § 1.
 * Version: phase1-v0.1
 */

import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { sha256Hex } from "../lib/hash";
import {
  buildObjectKey,
  type FileMeta,
  type GetObjectOptions,
  type MultipartPart,
  type ObjectBody,
  type ObjectHead,
  type StorageProvider,
  type UploadTarget,
} from "./types";

const DOWNLOAD_EXPIRY_SECONDS = 3600; // 1 hour (per Phase 1 brief).
const UPLOAD_EXPIRY_SECONDS = 3600;
const MULTIPART_THRESHOLD_BYTES = 5 * 1024 * 1024; // 5 MB.
const PART_SIZE_BYTES = 5 * 1024 * 1024;
const SHA256_METADATA_KEY = "sha256";

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
}

/** Read R2 config from env, throwing a clear error if anything is missing. */
export function r2ConfigFromEnv(): R2Config {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const missing = [
    ["R2_ACCOUNT_ID", accountId],
    ["R2_ACCESS_KEY_ID", accessKeyId],
    ["R2_SECRET_ACCESS_KEY", secretAccessKey],
    ["R2_BUCKET_NAME", bucket],
  ]
    .filter(([, val]) => !val)
    .map(([name]) => name);
  if (missing.length > 0) {
    throw new Error(`Missing R2 env vars: ${missing.join(", ")}`);
  }
  return {
    accountId: accountId!,
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
    bucket: bucket!,
  };
}

export class R2StorageProvider implements StorageProvider {
  readonly name = "r2" as const;
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(config: R2Config = r2ConfigFromEnv()) {
    this.bucket = config.bucket;
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async getUploadUrl(meta: FileMeta): Promise<UploadTarget> {
    const key = buildObjectKey(meta);
    const expires_at = Date.now() + UPLOAD_EXPIRY_SECONDS * 1000;

    if (meta.size_bytes >= MULTIPART_THRESHOLD_BYTES) {
      const created = await this.client.send(
        new CreateMultipartUploadCommand({
          Bucket: this.bucket,
          Key: key,
          ContentType: meta.content_type,
          Metadata: meta.sha256 ? { [SHA256_METADATA_KEY]: meta.sha256 } : undefined,
        }),
      );
      const uploadId = created.UploadId;
      if (!uploadId) throw new Error("R2 did not return an UploadId");

      const partCount = Math.ceil(meta.size_bytes / PART_SIZE_BYTES);
      const parts: MultipartPart[] = [];
      for (let n = 1; n <= partCount; n++) {
        const url = await getSignedUrl(
          this.client,
          new UploadPartCommand({
            Bucket: this.bucket,
            Key: key,
            UploadId: uploadId,
            PartNumber: n,
          }),
          { expiresIn: UPLOAD_EXPIRY_SECONDS },
        );
        parts.push({ part_number: n, url });
      }

      return {
        provider: this.name,
        key,
        method: "PUT",
        expires_at,
        multipart: { upload_id: uploadId, part_size_bytes: PART_SIZE_BYTES, parts },
      };
    }

    // Single-PUT presigned URL (no network round-trip required).
    const url = await getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: meta.content_type,
        Metadata: meta.sha256 ? { [SHA256_METADATA_KEY]: meta.sha256 } : undefined,
      }),
      { expiresIn: UPLOAD_EXPIRY_SECONDS },
    );

    return { provider: this.name, key, url, method: "PUT", expires_at };
  }

  /** Finalise a multipart upload after all parts are PUT. */
  async completeMultipartUpload(
    key: string,
    uploadId: string,
    parts: Array<{ part_number: number; etag: string }>,
  ): Promise<void> {
    await this.client.send(
      new CompleteMultipartUploadCommand({
        Bucket: this.bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts
            .sort((a, b) => a.part_number - b.part_number)
            .map((p) => ({ PartNumber: p.part_number, ETag: p.etag })),
        },
      }),
    );
  }

  async abortMultipartUpload(key: string, uploadId: string): Promise<void> {
    await this.client.send(
      new AbortMultipartUploadCommand({ Bucket: this.bucket, Key: key, UploadId: uploadId }),
    );
  }

  async getDownloadUrl(key: string): Promise<string> {
    return getSignedUrl(this.client, new GetObjectCommand({ Bucket: this.bucket, Key: key }), {
      expiresIn: DOWNLOAD_EXPIRY_SECONDS,
    });
  }

  async getObject(key: string, options?: GetObjectOptions): Promise<ObjectBody> {
    const range = options?.range
      ? `bytes=${options.range.start}-${options.range.end ?? ""}`
      : undefined;
    const response = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key, Range: range }),
    );
    return {
      body: response.Body,
      ...(response.ContentLength !== undefined ? { size_bytes: response.ContentLength } : {}),
      ...(response.ContentType !== undefined ? { content_type: response.ContentType } : {}),
      ...(response.ContentRange !== undefined ? { content_range: response.ContentRange } : {}),
    };
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  async headObject(key: string): Promise<ObjectHead> {
    try {
      const response = await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return {
        exists: true,
        ...(response.ContentLength !== undefined ? { size_bytes: response.ContentLength } : {}),
        ...(response.ContentType !== undefined ? { content_type: response.ContentType } : {}),
        ...(response.Metadata?.[SHA256_METADATA_KEY]
          ? { sha256: response.Metadata[SHA256_METADATA_KEY] }
          : {}),
      };
    } catch (err) {
      if (isNotFound(err)) return { exists: false };
      throw err;
    }
  }

  /** Server-side direct upload (used in tests + small server-generated artefacts). */
  async putObject(key: string, body: Buffer, contentType?: string, sha256?: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        Metadata: sha256 ? { [SHA256_METADATA_KEY]: sha256 } : undefined,
      }),
    );
  }

  /**
   * Verify a stored object against an expected SHA-256 by downloading and
   * re-hashing. Returns true on match (20 § Integrity-checked).
   */
  async verifyUpload(key: string, expectedSha256: string): Promise<boolean> {
    const response = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    const body = response.Body as { transformToByteArray?: () => Promise<Uint8Array> } | undefined;
    if (!body?.transformToByteArray) {
      throw new Error("R2 object body is not readable for verification");
    }
    const bytes = await body.transformToByteArray();
    return sha256Hex(bytes) === expectedSha256;
  }
}

function isNotFound(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const e = err as { name?: string; $metadata?: { httpStatusCode?: number } };
  return e.name === "NotFound" || e.$metadata?.httpStatusCode === 404;
}
