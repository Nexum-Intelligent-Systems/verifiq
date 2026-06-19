/**
 * End-to-end drawing pack test via Convex (no browser).
 *
 * Usage:
 *   npm run scan:e2e
 *
 * Requires DEV_AUTH_RESET_SECRET on the Convex deployment (same as devAuth).
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { execSync } from "child_process";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

const ZIP_PATH = resolve(process.cwd(), "fixtures/arch-drawings-test.zip");
const POLL_MS = 4_000;
const CLASSIFY_TIMEOUT_MS = 120_000;
const SCAN_TIMEOUT_MS = 300_000;

function getDevSecret(): string {
  const secret = execSync("npx convex env get DEV_AUTH_RESET_SECRET", {
    encoding: "utf8",
    cwd: process.cwd(),
  }).trim();
  if (!secret) throw new Error("DEV_AUTH_RESET_SECRET not set on deployment");
  return secret;
}

function getConvexUrl(): string {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) throw new Error(".env.local missing");
  const text = readFileSync(envPath, "utf8");
  const match = text.match(/NEXT_PUBLIC_CONVEX_URL=(.+)/);
  if (!match) throw new Error("NEXT_PUBLIC_CONVEX_URL not in .env.local");
  return match[1].trim();
}

async function uploadZip(client: ConvexHttpClient, secret: string, zipPath: string) {
  const uploadUrl = await client.action(api.e2eDrawingTest.generateDevUploadUrl, { secret });
  const body = readFileSync(zipPath);
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "application/zip" },
    body,
  });
  if (!res.ok) throw new Error(`Storage upload failed: ${res.status}`);
  const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };
  return storageId;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function pollUntil(
  label: string,
  timeoutMs: number,
  fn: () => Promise<boolean>,
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await fn()) return;
    await sleep(POLL_MS);
  }
  throw new Error(`Timeout waiting for ${label} (${timeoutMs / 1000}s)`);
}

async function main() {
  if (!existsSync(ZIP_PATH)) {
    console.error("Missing ZIP — run: npm run scan:zip");
    process.exit(1);
  }

  const secret = getDevSecret();
  const client = new ConvexHttpClient(getConvexUrl());

  console.log("Drawing pack E2E");
  console.log("  zip:", ZIP_PATH);

  console.log("\n1. Uploading ZIP to Convex storage…");
  const zipStorageId = await uploadZip(client, secret, ZIP_PATH);
  console.log("  storageId:", zipStorageId);

  console.log("\n2. Starting full-suite ingest…");
  const { projectId } = await client.action(api.e2eDrawingTest.startDrawingPackTest, {
    secret,
    zipStorageId,
  });
  console.log("  projectId:", projectId);

  console.log("\n3. Waiting for classification…");
  await pollUntil("classification", CLASSIFY_TIMEOUT_MS, async () => {
    const s = await client.action(api.e2eDrawingTest.getTestStatus, { secret, projectId });
    console.log(
      `  phase=${s.phase} uploads=${s.uploads.length} classified=${s.uploads.length > 0 && s.uploads.every((u: { classificationStatus?: string }) => u.classificationStatus === "classified")}`,
    );
    return (
      s.uploads.length > 0 &&
      s.uploads.every((u) => u.classificationStatus === "classified")
    );
  });

  const afterClassify = await client.action(api.e2eDrawingTest.getTestStatus, {
    secret,
    projectId,
  });
  console.log("  arch gate:", afterClassify.uploads[0]);

  console.log("\n4. Starting discipline scan…");
  const { queued } = await client.action(api.e2eDrawingTest.triggerScan, {
    secret,
    projectId,
  });
  console.log("  queued disciplines:", queued);

  console.log("\n5. Waiting for drawing scan events…");
  let sawDrawingVision = false;
  await pollUntil("drawing scan", SCAN_TIMEOUT_MS, async () => {
    const s = await client.action(api.e2eDrawingTest.getTestStatus, { secret, projectId });
    const drawingMsgs = s.drawingEvents.filter(
      (m) => m.includes("Vision") || m.includes("PDF document") || m.includes("drawing"),
    );
    if (drawingMsgs.length > 0) sawDrawingVision = true;

    console.log(
      `  phase=${s.phase} progress=${s.progressPct}% findings=${s.findingsCount} scanned=${s.uploads.map((u) => `${u.filesScanned}/${u.fileCount}`).join(", ")}`,
    );
    if (drawingMsgs.length > 0) {
      console.log("  drawing events:", drawingMsgs.slice(0, 3).join(" | "));
    }

    const arch = s.uploads.find((u: { discipline: string }) => u.discipline === "arch");
    return (
      arch?.scanStatus === "completed" ||
      (arch?.filesScanned ?? 0) >= (arch?.fileCount ?? 0) ||
      s.findingsCount > 0
    );
  });

  const final = await client.action(api.e2eDrawingTest.getTestStatus, { secret, projectId });

  console.log("\n=== RESULT ===");
  console.log("  projectId:", projectId);
  console.log("  phase:", final.phase);
  console.log("  progress:", final.progressPct + "%");
  console.log("  findings:", final.findingsCount);
  console.log("  drawing vision path used:", sawDrawingVision ? "YES" : "NO (check activity feed)");
  console.log("\n  Recent activity:");
  for (const e of final.recentEvents.slice(0, 8)) {
    console.log(`    [${e.stage}] ${e.message}${e.fileName ? ` (${e.fileName})` : ""}`);
  }

  if (final.findingsCount === 0 && !sawDrawingVision) {
    console.error("\nFAIL — scan produced no findings. Check ANTHROPIC_API_KEY on Convex deployment.");
    process.exit(1);
  }

  console.log("\nPASS — drawing pack ran through Convex.");
  console.log(`Open dashboard: http://localhost:3000/projects/${projectId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
