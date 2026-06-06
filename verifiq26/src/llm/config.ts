/**
 * VerifIQ — role→provider/model mapping + cost table.
 *
 * Source of truth: verifiq-prompts/02_agent_architecture.md § Recommended
 * initial wiring + Fallback chain. Changing a role's provider must be possible
 * here without touching any agent code (CLAUDE.md modular rule).
 *
 * Version: 0.3.0-phase1
 */

import type { LLMRole, ProviderName } from "./types.js";

export interface RoleWiring {
  /** Ordered provider chain: try [0] first, fail over to the rest per-call. */
  chain: { provider: ProviderName; model: string }[];
}

// Model ids (current generation). Vision uses the same Sonnet model.
const CLAUDE_SONNET = "claude-sonnet-4-6";
const CLAUDE_HAIKU = "claude-haiku-4-5-20251001";
const CLAUDE_OPUS = "claude-opus-4-8";
const GPT_4_CLASS = "gpt-4o";

/**
 * Role wiring per file 02. Each role lists a primary then fallback providers;
 * failover is per-call (file 20 § Multi-provider failover at the call level).
 */
export const ROLE_WIRING: Record<LLMRole, RoleWiring> = {
  // Cheap, fast, low-stakes.
  classification: {
    chain: [
      { provider: "anthropic", model: CLAUDE_HAIKU },
      { provider: "openai", model: GPT_4_CLASS },
    ],
  },
  // High capability; prompt caching on system prompts.
  "discipline-primary-review": {
    chain: [
      { provider: "anthropic", model: CLAUDE_SONNET },
      { provider: "openai", model: GPT_4_CLASS },
    ],
  },
  // Different model family avoids shared blind spots.
  "peer-challenge": {
    chain: [
      { provider: "openai", model: GPT_4_CLASS },
      { provider: "anthropic", model: CLAUDE_SONNET },
    ],
  },
  // Highest reasoning capacity; final gate.
  adjudicator: {
    chain: [
      { provider: "anthropic", model: CLAUDE_OPUS },
      { provider: "openai", model: GPT_4_CLASS },
    ],
  },
  // Cost-controlled report generation.
  "council-chair": {
    chain: [
      { provider: "anthropic", model: CLAUDE_SONNET },
      { provider: "openai", model: GPT_4_CLASS },
    ],
  },
  // Vision-capable Sonnet for title-block extraction.
  "title-block-extraction": {
    chain: [
      { provider: "anthropic", model: CLAUDE_SONNET },
      { provider: "openai", model: GPT_4_CLASS },
    ],
  },
};

/**
 * Indicative pricing in EUR per 1,000 tokens, {input, output}. Used by getCost.
 * These are planning figures for cost telemetry, refreshed from provider price
 * sheets; they are not contractual. (file 20 § Financial dashboard)
 */
export const MODEL_COST_EUR_PER_1K: Record<string, { in: number; out: number }> = {
  [CLAUDE_SONNET]: { in: 0.0028, out: 0.014 },
  [CLAUDE_HAIKU]: { in: 0.0008, out: 0.004 },
  [CLAUDE_OPUS]: { in: 0.014, out: 0.07 },
  [GPT_4_CLASS]: { in: 0.0023, out: 0.0092 },
};

/** Resolve the model a given provider uses for a role (first match in chain). */
export function modelFor(role: LLMRole, provider: ProviderName): string | undefined {
  return ROLE_WIRING[role].chain.find((c) => c.provider === provider)?.model;
}

/** Cost in EUR for a token count under a model (0 if model unknown). */
export function costEur(model: string, tokensIn: number, tokensOut: number): number {
  const rate = MODEL_COST_EUR_PER_1K[model];
  if (!rate) return 0;
  return (tokensIn / 1000) * rate.in + (tokensOut / 1000) * rate.out;
}
