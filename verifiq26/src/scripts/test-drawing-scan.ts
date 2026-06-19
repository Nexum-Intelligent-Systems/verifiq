/**
 * Local drawing-scan smoke test.
 *
 * Usage:
 *   npm run scan:test
 *   npm run scan:test -- path/to/drawing.pdf
 *
 * Requires ANTHROPIC_API_KEY in environment for live vision scan.
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import pdfParse from "pdf-parse";
import { classifyByFilename } from "../convex/lib/disciplineInfer";
import { buildSystemPrompt, loadDisciplineCorpus } from "../convex/lib/corpus";
import { callClaudeWithCache } from "../convex/lib/anthropicClient";
import { verifySourceQuotes } from "../convex/lib/sourceQuote";
import { runSelfCheck } from "../convex/lib/selfCheck";

const DEFAULT_DRAWING = resolve(
  process.cwd(),
  "../../.tmp-carrolls/Carrolls_Tender_Invite/Arch/CIX-TD-11.10_Proposed Ground Floor Level_Rev B.pdf",
);

async function tryPdf2Pic(buffer: Buffer, pages: number): Promise<number> {
  try {
    const { fromBuffer } = await import("pdf2pic");
    const converter = fromBuffer(buffer, {
      density: 100,
      format: "png",
      width: 1200,
      height: 900,
    });
    let rendered = 0;
    for (let page = 1; page <= Math.min(pages, 2); page++) {
      const result = await converter(page, { responseType: "base64" });
      if (result?.base64) rendered++;
    }
    return rendered;
  } catch (e) {
    console.log("  pdf2pic:", (e as Error).message);
    return 0;
  }
}

async function main() {
  const pdfPath = resolve(process.argv[2] ?? DEFAULT_DRAWING);
  console.log("Drawing scan test");
  console.log("  file:", pdfPath);

  const buffer = readFileSync(pdfPath);
  const fileName = pdfPath.split(/[/\\]/).pop() ?? "drawing.pdf";

  const classification = classifyByFilename(fileName);
  console.log("\n1. Classification");
  console.log("  docType:", classification.docType);
  console.log("  discipline:", classification.discipline);
  console.log("  confidence:", classification.confidence);

  const parsed = await pdfParse(buffer);
  const textPreview = parsed.text.replace(/\s+/g, " ").trim().slice(0, 400);
  console.log("\n2. Text layer");
  console.log("  pages:", parsed.numpages);
  console.log("  chars:", parsed.text.length);
  console.log("  preview:", textPreview || "(empty — likely raster)");

  const renderedPages = await tryPdf2Pic(buffer, parsed.numpages);
  console.log("\n3. Page render (pdf2pic / ImageMagick)");
  console.log("  pages rendered:", renderedPages);
  if (renderedPages === 0) {
    console.log("  → Convex uses native PDF document API instead (no ImageMagick in cloud)");
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log("\n4. Live scan: SKIPPED (set ANTHROPIC_API_KEY)");
    console.log("\nDone — classification + extraction OK. Add API key to test vision scan.");
    return;
  }

  console.log("\n4. Live drawing scan (PDF document → Claude)");
  const corpus = await loadDisciplineCorpus("arch", "v.2026.06");
  const systemPrompt = buildSystemPrompt("arch", corpus);
  const pdfBase64 = buffer.toString("base64");

  const response = await callClaudeWithCache({
    model: "claude-sonnet-4-6",
    systemPrompt,
    userPrompt: `Drawing review — ${fileName}:\n\nCheck title block, drawing number, revision, scale, status code, standards references. Return JSON findings array only.`,
    pdfBase64,
    maxTokens: 2_000,
    cacheControl: { type: "ephemeral" },
  });

  console.log("  tokens in/out:", response.usage.input_tokens, "/", response.usage.output_tokens);
  console.log("  raw findings:", response.findings.length);

  const verified = await verifySourceQuotes(response.findings, [parsed.text, fileName]);
  const passed = verified.filter((f) => runSelfCheck({ ...f, discipline: "arch" }).passed);

  console.log("  after quote gate:", verified.length);
  console.log("  after self-check:", passed.length);

  for (const f of passed.slice(0, 5)) {
    console.log(`\n  [${f.severity}] ${f.oneSentenceIssue}`);
    console.log(`    quote: ${f.evidenceQuote.slice(0, 120)}…`);
  }

  console.log("\nDone — drawing path exercised end-to-end.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
