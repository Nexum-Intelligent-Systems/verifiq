/**
 * Build a minimal arch ZIP for full-suite upload testing (drawings only).
 *
 * Usage: npm run scan:zip
 */

import { createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import { join, resolve } from "path";
import { execSync } from "child_process";

const SOURCE_DIR = resolve(
  process.cwd(),
  "../../.tmp-carrolls/Carrolls_Tender_Invite/Arch",
);
const OUT_DIR = resolve(process.cwd(), "fixtures");
const OUT_ZIP = join(OUT_DIR, "arch-drawings-test.zip");
const MAX_FILES = 5;

async function main() {
  if (!existsSync(SOURCE_DIR)) {
    console.error("Source not found:", SOURCE_DIR);
    console.error("Expected Carrolls tender pack under .tmp-carrolls/");
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  const pdfs = readdirSync(SOURCE_DIR)
    .filter((f) => f.toLowerCase().endsWith(".pdf"))
    .slice(0, MAX_FILES);

  if (pdfs.length === 0) {
    console.error("No PDFs in", SOURCE_DIR);
    process.exit(1);
  }

  // node-stream-zip is read-only; use PowerShell Compress-Archive via child or manual zip
  // Simplest: write a manifest and tell user to zip, OR use archiver if available
  // Use built-in approach: store files in fixtures/arch/ for manual zip OR use PowerShell

  const staging = join(OUT_DIR, "arch");
  mkdirSync(staging, { recursive: true });

  for (const pdf of pdfs) {
    writeFileSync(join(staging, pdf), readFileSync(join(SOURCE_DIR, pdf)));
  }

  if (existsSync(OUT_ZIP)) unlinkSync(OUT_ZIP);
  // tar produces forward-slash paths (PowerShell Compress-Archive uses backslashes → StreamZip rejects)
  execSync(`tar -a -c -f "${OUT_ZIP}" -C "${OUT_DIR}" arch`, { stdio: "inherit" });

  console.log("Created:", OUT_ZIP);
  console.log("Files:", pdfs.join(", "));
  console.log("\nUpload steps:");
  console.log("  1. http://localhost:3000 → project dashboard");
  console.log("  2. Full suite · all disciplines");
  console.log("  3. Drop", OUT_ZIP);
  console.log("  4. Wait for classify → Start review");
  console.log("  5. Watch Pipeline Console for 'Vision scan (PDF document)' events");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
