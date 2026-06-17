/**
 * VerifIQ — ingest routing tests (Phase 6 web-upload wiring).
 *
 * Pure, credential-less coverage of the two routing decisions that turn a
 * sealed pack into a council RunInput: upload discipline tag → agent key, and
 * filename → text-extraction kind. The byte download + PDF parse live in the
 * node action and are verified locally.
 */

import { describe, it, expect } from "vitest";
import {
  mapDiscipline,
  fileTextKind,
  AGENT_DISCIPLINES,
  DEFAULT_AGENT_DISCIPLINE,
} from "../src/ingest/extract";

describe("mapDiscipline", () => {
  it("maps each upload tag onto a real council agent key", () => {
    const cases: Record<string, string> = {
      architectural: "architect",
      fire: "fire",
      access: "access",
      "mechanical-electrical": "m-and-e",
      qs: "qs",
    };
    for (const [tag, key] of Object.entries(cases)) {
      expect(mapDiscipline(tag)).toBe(key);
      expect(AGENT_DISCIPLINES).toContain(mapDiscipline(tag));
    }
  });

  it("folds tags without a dedicated MVP agent onto the Architect", () => {
    expect(mapDiscipline("structural")).toBe(DEFAULT_AGENT_DISCIPLINE);
    expect(mapDiscipline("civil")).toBe(DEFAULT_AGENT_DISCIPLINE);
    expect(mapDiscipline("unclassified")).toBe(DEFAULT_AGENT_DISCIPLINE);
  });

  it("is case/whitespace tolerant and defaults unknown or missing tags", () => {
    expect(mapDiscipline("  Fire ")).toBe("fire");
    expect(mapDiscipline("nonsense")).toBe(DEFAULT_AGENT_DISCIPLINE);
    expect(mapDiscipline(undefined)).toBe(DEFAULT_AGENT_DISCIPLINE);
    expect(mapDiscipline(null)).toBe(DEFAULT_AGENT_DISCIPLINE);
    expect(mapDiscipline("")).toBe(DEFAULT_AGENT_DISCIPLINE);
  });
});

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
