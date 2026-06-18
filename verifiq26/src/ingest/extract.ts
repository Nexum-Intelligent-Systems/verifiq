/**
 * VerifIQ — upload file-type helper (Phase 6 web-upload).
 *
 * A pure, runtime-agnostic check of how a file's bytes become review text —
 * shared by the browser (`/upload` keeps only readable files and zip entries)
 * and `src/ingest/zip.ts`. No Convex, no Node, no pdfjs here, so it bundles into
 * the client and stays unit-testable. Discipline classification is handled
 * separately by the title-block classifier (`src/classify` + `classifyAction`).
 *
 * Version: 0.8.0-phase6
 */

export type FileTextKind = "pdf" | "text" | "unsupported";

/** Plain-text extensions whose bytes are review text as-is (UTF-8 decoded). */
const TEXT_EXTS = new Set(["txt", "md", "text", "csv", "json", "log"]);

/**
 * Decide how a filename's bytes become review text: parse a PDF, UTF-8 decode a
 * text file, or skip an unsupported binary (e.g. an image). Routing is by
 * extension only — deliberately no content sniffing, so it stays pure.
 */
export function fileTextKind(filename: string): FileTextKind {
  const dot = filename.lastIndexOf(".");
  const ext = dot >= 0 ? filename.slice(dot + 1).toLowerCase() : "";
  if (ext === "pdf") return "pdf";
  if (TEXT_EXTS.has(ext)) return "text";
  return "unsupported";
}
