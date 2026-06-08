/**
 * VerifIQ — PDF text extractor (Phase 5, file 20 §1).
 *
 * Wraps an injected raw PDF parse into the `PdfExtractor` port and shapes the
 * result into the classifier's `ClassificationInput` (content text = first ~500
 * tokens, Source 3). The default parse binds the optional `pdf-parse` package via
 * a non-literal dynamic import, so `tsc`/CI don't require the dependency to be
 * installed; install it (or inject a `RawPdfParse`) to enable server extraction.
 *
 * Version: 0.8.0-phase5
 */

import type { ClassificationInput } from "../classifier/index.js";
import type { PdfExtraction, PdfExtractor, RawPdfParse } from "./types.js";

/** Default content window handed to the classifier (Source 3). */
const DEFAULT_CONTENT_TOKENS = 500;

/** Bind `pdf-parse` lazily; throws an actionable error when it isn't installed. */
export const defaultPdfParse: RawPdfParse = async (bytes) => {
  // Non-literal specifier → tsc treats the import as `any` and does not require
  // the optional dependency at build time (it's wired in the live environment).
  const moduleName = "pdf-parse";
  let mod: { default: (b: Uint8Array) => Promise<{ text?: string; numpages?: number }> };
  try {
    mod = (await import(moduleName)) as typeof mod;
  } catch {
    throw new Error("pdf-parse is not installed — run `npm i pdf-parse`, or inject a RawPdfParse");
  }
  const parsed = await mod.default(Buffer.from(bytes));
  return { text: parsed.text ?? "", pageCount: parsed.numpages ?? 0 };
};

export class PdfTextExtractor implements PdfExtractor {
  constructor(private readonly parse: RawPdfParse = defaultPdfParse) {}

  async extract(bytes: Uint8Array): Promise<PdfExtraction> {
    if (!bytes || bytes.length === 0) throw new Error("Empty PDF buffer");
    const { text, pageCount } = await this.parse(bytes);
    return { text: normaliseWhitespace(text), pageCount };
  }
}

/** First `n` whitespace-delimited tokens of the text (the classifier's window). */
export function firstTokens(text: string, n = DEFAULT_CONTENT_TOKENS): string {
  return text.split(/\s+/).filter(Boolean).slice(0, n).join(" ");
}

/** Normalise line endings and trailing whitespace from extracted text. */
export function normaliseWhitespace(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").trim();
}

/** Build the classifier input (Source 3 content text) from an extraction. */
export function extractionToInput(
  filename: string,
  extraction: PdfExtraction,
  opts: { sizeBytes?: number; folder?: string; contentTokens?: number } = {},
): ClassificationInput {
  return {
    filename,
    sizeBytes: opts.sizeBytes,
    folder: opts.folder,
    contentText: firstTokens(extraction.text, opts.contentTokens),
    titleBlockImage: extraction.titleBlockImage,
    titleBlockMediaType: extraction.titleBlockMediaType,
  };
}
