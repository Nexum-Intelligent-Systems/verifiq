#!/usr/bin/env node
/**
 * VerifIQ — mint a dev upload link from the terminal (Phase 6 web-upload).
 *
 * The web `/upload` flow is gated by a magic code that normally travels only by
 * email (Resend). For local testing this script calls the dev-only
 * `issueDevUploadCode` mutation, which returns the code + one-click link so you
 * can open the upload page directly — no email wiring needed.
 *
 * Prerequisites:
 *   1) `npx convex dev` running (writes NEXT_PUBLIC_CONVEX_URL into .env.local)
 *   2) `npx convex env set VERIFIQ_DEV_CODES 1`   ← enables the dev mutation
 *      (with the flag unset the mutation refuses — production never leaks codes)
 *
 * Usage:
 *   node scripts/dev-issue-code.mjs "My Project Name" "Office building"
 *
 * Run it once per trial to get three independent upload links / projects.
 */

import { ConvexHttpClient } from "convex/browser";
import { readFileSync } from "node:fs";

function convexUrl() {
  if (process.env.CONVEX_URL) return process.env.CONVEX_URL;
  if (process.env.NEXT_PUBLIC_CONVEX_URL) return process.env.NEXT_PUBLIC_CONVEX_URL;
  try {
    const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    const m = env.match(/^NEXT_PUBLIC_CONVEX_URL=(.+)$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  } catch {
    /* fall through */
  }
  throw new Error(
    "No Convex URL. Run `npx convex dev` first (it writes NEXT_PUBLIC_CONVEX_URL to .env.local), or set CONVEX_URL.",
  );
}

async function loadApi() {
  try {
    const mod = await import("../src/convex/_generated/api.js");
    return mod.api;
  } catch {
    throw new Error(
      "Could not load src/convex/_generated/api.js — run `npx convex dev` first so Convex generates it.",
    );
  }
}

async function main() {
  const projectName = process.argv[2] ?? `Dev pack ${new Date().toISOString().slice(0, 16)}`;
  const buildingType = process.argv[3] ?? "Unspecified";

  const client = new ConvexHttpClient(convexUrl());
  const api = await loadApi();

  const res = await client.mutation(api.uploadTokens.issueDevUploadCode, {
    name: "Dev",
    email: "dev@verifiq.ie",
    project_name: projectName,
    building_type: buildingType,
  });

  if (!res.ok) {
    console.error(
      "\nDev codes are disabled. Enable them first:\n  npx convex env set VERIFIQ_DEV_CODES 1\n",
    );
    process.exit(1);
  }

  console.log(`\nVerifIQ · dev upload link\n`);
  console.log(`  project:  ${res.projectId}  (${projectName})`);
  console.log(`  code:     ${res.code}`);
  console.log(`  open:     ${res.link}\n`);
  console.log(
    "Open the link (with `npm run app:dev` running), drag your unzipped files in,\n" +
      "tag each by discipline, then 'start the read'. Watch findings land in the\n" +
      "Convex dashboard → Data → findings, or follow /projects/<id>.\n",
  );
}

main().catch((e) => {
  console.error("\ndev-issue-code failed:", e.message ?? e);
  process.exit(1);
});
