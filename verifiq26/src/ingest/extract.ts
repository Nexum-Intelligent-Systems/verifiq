/**
 * VerifIQ — upload-pack ingest helpers (Phase 6 web-upload wiring).
 *
 * Pure, runtime-agnostic helpers that turn a sealed upload pack into the
 * orchestrator's RunInput: mapping the customer's upload-time discipline tag
 * (src/storage/upload-client `UPLOAD_DISCIPLINES`) onto a council discipline-
 * agent key (src/agents/disciplines `MVP_DISCIPLINES`), and deciding how a
 * file's bytes become review text.
 *
 * No Convex, no Node, no pdfjs here — so the routing logic stays unit-testable
 * without a deployment or credentials. The byte download + PDF parse live at
 * the edge in `src/convex/ingest.ts` (a "use node" action).
 *
 * Version: 0.8.0-phase6
 */

import { parseFilename } from "../classify/filename";

/** Council discipline-agent keys (the MVP_DISCIPLINES keys). */
export const AGENT_DISCIPLINES = ["architect", "fire", "access", "m-and-e", "qs"] as const;
export type AgentDiscipline = (typeof AGENT_DISCIPLINES)[number];

/** The Architect carries general building-fabric review where no MVP discipline
 * agent exists (structural / civil) or the file was never tagged. */
export const DEFAULT_AGENT_DISCIPLINE: AgentDiscipline = "architect";

/**
 * Discipline name → council discipline-agent key. Accepts both the upload-time
 * tags a customer can pick (`src/storage/upload-client` `UPLOAD_DISCIPLINES`)
 * and the filename classifier's vocabulary (`src/classify/filename`), so the
 * same table resolves either source.
 */
const TO_AGENT: Record<string, AgentDiscipline> = {
  // Upload tags.
  architectural: "architect",
  fire: "fire",
  access: "access",
  "mechanical-electrical": "m-and-e",
  qs: "qs",
  structural: "architect",
  civil: "architect",
  unclassified: "architect",
  // Filename-classifier outputs.
  mechanical: "m-and-e",
  electrical: "m-and-e",
  "quantity-surveying": "qs",
  unsorted: "architect",
};

/**
 * Resolve a discipline name (upload tag or classifier output) onto a council
 * agent key. Unknown or missing names fall to the Architect (the generalist) so
 * a file is never silently dropped from the review.
 */
export function mapDiscipline(tag?: string | null): AgentDiscipline {
  if (!tag) return DEFAULT_AGENT_DISCIPLINE;
  return TO_AGENT[tag.trim().toLowerCase()] ?? DEFAULT_AGENT_DISCIPLINE;
}

/**
 * Pick the council agent for a file. An explicit, specific upload tag wins; an
 * untagged or "unclassified" file is routed by a filename heuristic
 * (`parseFilename`) so a mixed pack (e.g. an unpacked ZIP tagged "unclassified")
 * still reaches fire / access / M&E / QS rather than dumping everything on the
 * Architect. Falls back to the Architect when nothing matches.
 */
export function resolveAgentDiscipline(tag: string | null | undefined, filename: string): AgentDiscipline {
  const t = tag?.trim().toLowerCase();
  if (t && t !== "unclassified") return mapDiscipline(t);
  return mapDiscipline(parseFilename(filename).discipline);
}

export type FileTextKind = "pdf" | "text" | "unsupported";

/** Plain-text extensions whose bytes are review text as-is (UTF-8 decoded). */
const TEXT_EXTS = new Set(["txt", "md", "text", "csv", "json", "log"]);

/**
 * Decide how a filename's bytes become review text: parse a PDF, UTF-8 decode a
 * text file, or skip an unsupported binary (e.g. a stray .zip or image). Routing
 * is by extension only — deliberately no content sniffing, so it is pure.
 */
export function fileTextKind(filename: string): FileTextKind {
  const dot = filename.lastIndexOf(".");
  const ext = dot >= 0 ? filename.slice(dot + 1).toLowerCase() : "";
  if (ext === "pdf") return "pdf";
  if (TEXT_EXTS.has(ext)) return "text";
  return "unsupported";
}
