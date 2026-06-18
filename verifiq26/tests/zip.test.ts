/**
 * VerifIQ — ZIP entry helper tests (Phase 6 web-upload).
 *
 * Pure coverage of which archive entries get pulled out for review and what
 * they're named. Shared by the browser (drop-a-zip) and the Node ingest action
 * (raw-zip safety net), so the same rules apply on both ends.
 */

import { describe, it, expect } from "vitest";
import { isZipName, zipEntryBasename, isReviewableZipPath } from "../src/ingest/zip";

describe("isZipName", () => {
  it("detects .zip by extension, case-insensitively", () => {
    expect(isZipName("pack.zip")).toBe(true);
    expect(isZipName("PACK.ZIP")).toBe(true);
    expect(isZipName("  tender.zip  ")).toBe(true);
    expect(isZipName("drawing.pdf")).toBe(false);
    expect(isZipName("zipfile")).toBe(false);
  });
});

describe("zipEntryBasename", () => {
  it("drops folder components", () => {
    expect(zipEntryBasename("Pack/Fire/Strategy.pdf")).toBe("Strategy.pdf");
    expect(zipEntryBasename("Strategy.pdf")).toBe("Strategy.pdf");
  });
});

describe("isReviewableZipPath", () => {
  it("keeps readable documents in any folder", () => {
    expect(isReviewableZipPath("Fire Strategy.pdf")).toBe(true);
    expect(isReviewableZipPath("Pack/Architecture/A-100.pdf")).toBe(true);
    expect(isReviewableZipPath("notes/site.txt")).toBe(true);
  });

  it("drops folders, OS junk, dotfiles, nested zips and unsupported binaries", () => {
    expect(isReviewableZipPath("Pack/")).toBe(false); // directory marker
    expect(isReviewableZipPath("__MACOSX/foo.pdf")).toBe(false);
    expect(isReviewableZipPath("Pack/__MACOSX/bar.pdf")).toBe(false);
    expect(isReviewableZipPath(".DS_Store")).toBe(false);
    expect(isReviewableZipPath("Pack/.hidden.pdf")).toBe(false);
    expect(isReviewableZipPath("Pack/inner.zip")).toBe(false);
    expect(isReviewableZipPath("Pack/titleblock.png")).toBe(false);
    expect(isReviewableZipPath("")).toBe(false);
  });
});
