/**
 * VerifIQ — Phase 1 end-to-end smoke test
 *
 * Purpose: Prove the foundation works before any complexity is added. Runs the
 *   Convex schema + functions in-process (convex-test), exercises the LLM router
 *   with an injected fake provider (no network/keys), and asserts the audit log
 *   is written — the audit log is the customer trust artefact and must work from
 *   day 1.
 *
 * Covers Deliverable 5 steps 1–5 from docs/28-claude-code-phase1-kickoff.md, plus
 * a unit-level failover check and the guardrail constants/validator.
 *
 * Version: phase1-v0.1
 */

import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import schema from "../src/convex/schema";
import { api } from "../src/convex/_generated/api";
import { createLLMRouter } from "../src/llm";
import type {
  CompleteOptions,
  CompletionResult,
  LLMProvider,
  LLMRole,
  TokenUsage,
  VisionImage,
} from "../src/llm/types";
import { ProviderError } from "../src/llm/types";
import { LOCKED_DISCLAIMER, findBannedTerms } from "../src/lib/guardrails";

// Discover the Convex function modules for convex-test. `import.meta.glob` is a
// Vite/Vitest feature; type it locally to avoid depending on vite/client types.
interface ViteImportMeta {
  glob(pattern: string): Record<string, () => Promise<unknown>>;
}
const modules = (import.meta as unknown as ViteImportMeta).glob("../src/convex/**/*.ts");

/** A deterministic fake provider — implements the real LLMProvider contract. */
class FakeProvider implements LLMProvider {
  constructor(
    readonly name: "anthropic" | "openai",
    private readonly behaviour: "ok" | "retryable-fail" = "ok",
    private readonly reply = "OK",
  ) {}

  private result(): CompletionResult {
    return {
      text: this.reply,
      tokens_in: 5,
      tokens_out: 1,
      model_used: `fake-${this.name}`,
      provider_used: this.name,
      cost_eur: 0,
      latency_ms: 1,
    };
  }

  async complete(_role: LLMRole, _prompt: string, _options?: CompleteOptions) {
    void _role;
    void _prompt;
    void _options;
    if (this.behaviour === "retryable-fail") {
      throw new ProviderError("forced failure", { retryable: true, status: 429 });
    }
    return this.result();
  }

  async completeVision(
    _role: LLMRole,
    _image: VisionImage,
    _prompt: string,
    _options?: CompleteOptions,
  ) {
    void _role;
    void _image;
    void _prompt;
    void _options;
    return this.result();
  }

  getCost(_role: LLMRole, _tokens: TokenUsage): number {
    void _role;
    void _tokens;
    return 0;
  }
}

describe("VerifIQ Phase 1 foundation", () => {
  test("end-to-end: project → document → LLM call → finding → audit log", async () => {
    const t = convexTest(schema, modules);

    // 1. Create a test project.
    const projectId = await t.mutation(api.mutations.createProject, {
      name: "Smoke Test — Adult Day Centre",
      building_type: "Healthcare",
      stage: "pre-tender",
    });
    expect(projectId).toBeTruthy();

    // 2. Add a fake document record (R2-backed).
    const documentId = await t.mutation(api.mutations.addDocument, {
      project_id: projectId,
      filename: "A-100 Rev B.pdf",
      sha256: "a".repeat(64),
      size_bytes: 1_234_567,
      r2_key: "proj/test/disc/architectural/" + "a".repeat(64) + ".pdf",
      discipline: "Architectural",
      doc_type: "GA Plan",
    });
    expect(documentId).toBeTruthy();

    // 3. Call the LLM adapter with a trivial prompt, logging to audit_log.
    const router = createLLMRouter({
      providers: { anthropic: new FakeProvider("anthropic", "ok", "OK") },
      auditSink: async (entry) => {
        await t.mutation(api.mutations.logLlmCall, {
          project_id: projectId,
          role: entry.role,
          provider_used: entry.provider_used,
          model_used: entry.model_used,
          tokens_in: entry.tokens_in,
          tokens_out: entry.tokens_out,
          cost_eur: entry.cost_eur,
          latency_ms: entry.latency_ms,
          outcome: entry.outcome,
          payload_json: JSON.stringify(entry),
        });
      },
    });

    const completion = await router.complete(
      "discipline-primary-review",
      "Respond with the word 'OK'.",
      undefined,
      { project_id: projectId },
    );
    expect(completion.text).toBe("OK");
    expect(completion.provider_used).toBe("anthropic");

    // 4. Insert a finding and read it back.
    const findingId = await t.mutation(api.mutations.insertFinding, {
      project_id: projectId,
      issue_id: "ARCH-PRE-0001",
      discipline_origin: "Architectural",
      stage: "pre-tender",
      source_document: "A-100 Rev B.pdf",
      source_reference: "Title block, sheet A-100",
      requirement: "Drawing register must list current revisions.",
      finding: "Revision letter on the title block does not match the drawing register.",
      status: "Not demonstrated",
      risk: "Medium",
      build_readiness_impact: "Pre-tender close-out",
      owner: "Lead Designer",
      source_quote: "Rev B",
    });

    const finding = await t.query(api.mutations.getFinding, { id: findingId });
    expect(finding?.issue_id).toBe("ARCH-PRE-0001");
    expect(finding?.risk).toBe("Medium");

    // 5. Verify the audit_log entry for the LLM call was written.
    const auditEntries: Array<{ action: string; target_id?: string }> = await t.query(
      api.mutations.listAuditLog,
      { project_id: projectId },
    );
    const llmCalls = auditEntries.filter((e) => e.action === "llm_call");
    expect(llmCalls.length).toBeGreaterThanOrEqual(1);
    expect(llmCalls[0]?.target_id).toBe("discipline-primary-review");
  });

  test("router fails over to the fallback provider on a retryable error", async () => {
    const router = createLLMRouter({
      providers: {
        // peer-challenge chain is [openai, anthropic]; force openai to fail.
        openai: new FakeProvider("openai", "retryable-fail"),
        anthropic: new FakeProvider("anthropic", "ok", "OK"),
      },
    });

    const completion = await router.complete("peer-challenge", "ping");
    expect(completion.provider_used).toBe("anthropic");
    expect(completion.text).toBe("OK");
  });

  test("guardrails: locked disclaimer exported; banned-verb scanner works", () => {
    expect(LOCKED_DISCLAIMER).toContain("software-based reading aid");
    // Clean marketing copy passes; banned verbs are caught.
    expect(findBannedTerms("We review and surface possible issues for you.")).toHaveLength(0);
    expect(findBannedTerms("We certify and guarantee compliance.").map((h) => h.term)).toContain(
      "certify",
    );
  });
});
