/**
 * VerifIQ — upload file-type routing tests (Phase 6 web-upload).
 *
 * Pure, credential-less coverage of `fileTextKind` — the decision that turns an
 * uploaded (or unzipped) file into review text or sets it aside. Discipline
 * classification is the title-block classifier's job and is tested separately.
 */

import { describe, it, expect } from "vitest";
import { fileTextKind } from "../src/ingest/extract";

describe("fileTextKind", () => {
  it("routes PDFs to the parser and text files to UTF-8 decode", () => {
    expect(fileTextKind("Fire Strategy.pdf")).toBe("pdf");
    expect(fileTextKind("SPEC.PDF")).toBe("pdf");
    expect(fileTextKind("notes.txt")).toBe("text");
    expect(fileTextKind("schedule.csv")).toBe("text");
    expect(fileTextKind("data.json")).toBe("text");
  });

  it("skips unsupported binaries (stray zip / image / no extension)", () => {
    expect(fileTextKind("pack.zip")).toBe("unsupported");
    expect(fileTextKind("titleblock.png")).toBe("unsupported");
    expect(fileTextKind("README")).toBe("unsupported");
  });
});
