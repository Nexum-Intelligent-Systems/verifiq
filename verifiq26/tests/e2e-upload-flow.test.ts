/**
 * VerifIQ — end-to-end magic-code + direct-upload flow (docs/42 §5.5, Sprint 2).
 *
 * Drives the whole handoff the way production does, in-process and offline:
 *
 *   website POST /intake  →  project + magic code issued
 *   (email carries the link)  →  verify code  →  upload session
 *   signed URL per file  →  PUT to R2 (simulated)  →  registerUploadedDocument
 *   sealUploadSession  →  scan-state advances into the pipeline
 *
 * The only seams not exercised here are the ones that genuinely need live
 * services: Resend delivery (no-op without a key) and the byte PUT to R2 (the
 * signed URL is asserted well-formed instead). Everything else — the real
 * httpAction, the rate limiter, the session auth, the audit trail — runs.
 */

/// <reference types="vite/client" />
import { describe, it, expect, beforeAll } from "vitest";
import { convexTest } from "convex-test";
import schema from "../src/convex/schema";
import { api, internal } from "../src/convex/_generated/api";

const modules = import.meta.glob([
  "../src/convex/**/*.ts",
  "../src/convex/**/*.js",
  "!../src/convex/**/*.d.ts",
]);

beforeAll(() => {
  process.env.UPLOAD_TOKEN_PEPPER = "test-pepper";
  process.env.R2_ACCOUNT_ID = "test-account";
  process.env.R2_ACCESS_KEY_ID = "test-access-key";
  process.env.R2_SECRET_ACCESS_KEY = "test-secret-key";
  process.env.R2_BUCKET_NAME = "verifiq-prod-eu-west";
});

function intakeBody(over: Record<string, unknown> = {}) {
  return JSON.stringify({
    name: "Liam Doolan",
    email: "liam@goviq.ie",
    project_name: "Adult Day Centre — Stage 2C",
    practice: "GovIQ Architects",
    notes: "25 architectural drawings + form of contract",
    ...over,
  });
}

describe("end-to-end: intake → code → direct upload → seal", () => {
  it("carries a pack the whole way from website POST to a sealed, classifying project", async () => {
    const t = convexTest(schema, modules);

    // 1 · website front door: POST /intake creates the project + issues a code.
    const res = await t.fetch("/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: intakeBody(),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; projectId: string };
    expect(body.ok).toBe(true);
    expect(body.projectId).toBeTruthy();

    // The HTTP response never carries the code; the email does. Reissue through
    // the same internal entry to capture the link the customer would click.
    const issued = await t.mutation(internal.uploadTokens.createIntake, {
      name: "Liam Doolan",
      email: "liam@goviq.ie",
      project_name: "Adult Day Centre — Stage 2C",
    });

    // 2 · customer clicks the link → code verifies into an upload session.
    const verified = await t.mutation(api.uploadTokens.verifyUploadCode, {
      secret: issued.linkToken,
    });
    expect(verified.ok).toBe(true);
    const sessionToken = verified.sessionToken as string;

    // 3 · upload three files: signed URL → (PUT to R2) → register.
    const files = [
      { filename: "A-100.pdf", discipline: "architectural" },
      { filename: "FIRE-01.pdf", discipline: "fire" },
      { filename: "M-200.pdf", discipline: "mechanical-electrical" },
    ];
    for (const f of files) {
      const sha256 = "a".repeat(64);
      const signed = await t.action(api.uploadDirect.getUploadUrlForSession, {
        sessionToken,
        filename: f.filename,
        sha256,
        size_bytes: 1_500_000,
        discipline: f.discipline,
      });
      expect(signed.ok).toBe(true);
      expect(signed.uploadUrl).toContain("X-Amz-Signature"); // a real, signed PUT target
      // (production PUTs the bytes to signed.uploadUrl here)
      const reg = await t.mutation(api.uploadDocs.registerUploadedDocument, {
        sessionToken,
        filename: f.filename,
        sha256,
        size_bytes: 1_500_000,
        r2_key: signed.key!,
        discipline: f.discipline,
      });
      expect(reg.ok).toBe(true);
    }

    // 4 · the live manifest shows all three.
    const manifest = await t.query(api.uploadDocs.listSessionDocuments, { sessionToken });
    expect(manifest).toHaveLength(3);

    // 5 · seal → the pack advances into the council pipeline.
    const sealed = await t.mutation(api.uploadDocs.sealUploadSession, { sessionToken });
    expect(sealed).toMatchObject({ ok: true, documentCount: 3 });

    const project = await t.run(async (ctx) => ctx.db.get(issued.projectId as never));
    expect((project as { scan_state: string }).scan_state).toBe("classifying");

    // 6 · the audit trail records the whole journey.
    const audit = await t.query(api.mutations.listAudit, { project_id: issued.projectId });
    const actions = audit.map((a: { action: string }) => a.action);
    expect(actions).toContain("upload_code_issued");
    expect(actions).toContain("upload_code_verified");
    expect(actions.filter((a: string) => a === "document_uploaded")).toHaveLength(3);
    expect(actions).toContain("upload_sealed");

    // and the session is spent — the link cannot be replayed.
    const replay = await t.mutation(api.uploadTokens.verifyUploadCode, {
      secret: issued.linkToken,
    });
    expect(replay).toEqual({ ok: false, error: "used" });
  });
});

describe("front door: validation, honeypot, rate limit", () => {
  it("rejects missing fields with 422", async () => {
    const t = convexTest(schema, modules);
    const res = await t.fetch("/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "x" }),
    });
    expect(res.status).toBe(422);
  });

  it("silently accepts-and-drops a honeypot hit without creating a project", async () => {
    const t = convexTest(schema, modules);
    const res = await t.fetch("/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: intakeBody({ company_website: "http://spam.example" }),
    });
    expect(res.status).toBe(200);
    const projects = await t.run(async (ctx) => ctx.db.query("projects").collect());
    expect(projects).toHaveLength(0);
  });

  it("rate-limits a flood of intakes from the same email (429 past the budget)", async () => {
    const t = convexTest(schema, modules);
    const post = (i: number) =>
      t.fetch("/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: intakeBody({ email: "flood@goviq.ie", project_name: `Pack ${i}` }),
      });
    // INTAKE_EMAIL_LIMIT = 5: the first five pass, the sixth is throttled.
    for (let i = 0; i < 5; i++) expect((await post(i)).status).toBe(200);
    expect((await post(5)).status).toBe(429);
  });
});
