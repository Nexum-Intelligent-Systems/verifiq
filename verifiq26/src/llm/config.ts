/**
 * VerifIQ — role-to-provider mapping (Phase 1)
 *
 * Purpose: Maps each agent role to an ordered provider chain (primary first,
 *   fallback after) and to the model used per provider. Everything is
 *   env-overridable so a role can be reassigned without code changes
 *   (02_agent_architecture.md § Provider abstraction). Pricing is centralised
 *   here for getCost().
 *
 * Implements: 02_agent_architecture.md § Multi-LLM configuration + Fallback chain.
 * Version: phase1-v0.1
 */

import type { LLMRole, ProviderName } from "./types";

/** EUR cost per 1,000,000 tokens, per model. Approximate; tune with billing. */
export interface ModelPricing {
  input_per_m: number;
  output_per_m: number;
}

/**
 * Default model ids. All overridable via env so the adjudicator can be pointed
 * at Opus (02 allows "Opus, or Sonnet with explicit adjudicator prompt") or any
 * model without touching code.
 */
const ANTHROPIC_HAIKU = process.env.ANTHROPIC_MODEL_HAIKU ?? "claude-haiku-4-5-20251001";
const ANTHROPIC_SONNET = process.env.ANTHROPIC_MODEL_SONNET ?? "claude-sonnet-4-6";
// Adjudicator: defaults to Sonnet-with-adjudicator-prompt; set ANTHROPIC_MODEL_ADJUDICATOR
// to a higher-reasoning model in the environment to upgrade the final gate.
const ANTHROPIC_ADJUDICATOR = process.env.ANTHROPIC_MODEL_ADJUDICATOR ?? ANTHROPIC_SONNET;

const OPENAI_PRIMARY = process.env.OPENAI_MODEL ?? "gpt-4o";
const OPENAI_MINI = process.env.OPENAI_MODEL_MINI ?? "gpt-4o-mini";

/** Per-role configuration: ordered provider chain + the model for each provider. */
export interface RoleConfig {
  /** Provider chain — index 0 is primary, the rest are failover targets. */
  chain: ProviderName[];
  models: Partial<Record<ProviderName, string>>;
}

/**
 * Role wiring per 02_agent_architecture.md § Recommended initial wiring.
 * Peer challenge leads with OpenAI deliberately — a different model family
 * avoids shared blind spots.
 */
export const ROLE_CONFIG: Record<LLMRole, RoleConfig> = {
  classification: {
    chain: ["anthropic", "openai"],
    models: { anthropic: ANTHROPIC_HAIKU, openai: OPENAI_MINI },
  },
  "discipline-primary-review": {
    chain: ["anthropic", "openai"],
    models: { anthropic: ANTHROPIC_SONNET, openai: OPENAI_PRIMARY },
  },
  "peer-challenge": {
    chain: ["openai", "anthropic"],
    models: { openai: OPENAI_PRIMARY, anthropic: ANTHROPIC_SONNET },
  },
  adjudicator: {
    chain: ["anthropic", "openai"],
    models: { anthropic: ANTHROPIC_ADJUDICATOR, openai: OPENAI_PRIMARY },
  },
  "council-chair": {
    chain: ["anthropic", "openai"],
    models: { anthropic: ANTHROPIC_SONNET, openai: OPENAI_PRIMARY },
  },
  "title-block-extraction": {
    chain: ["anthropic", "openai"],
    models: { anthropic: ANTHROPIC_SONNET, openai: OPENAI_PRIMARY },
  },
};

/** EUR pricing per 1M tokens by model id. Unknown models cost 0 (logged). */
export const PRICING: Record<string, ModelPricing> = {
  [ANTHROPIC_HAIKU]: { input_per_m: 0.8, output_per_m: 4 },
  [ANTHROPIC_SONNET]: { input_per_m: 3, output_per_m: 15 },
  [ANTHROPIC_ADJUDICATOR]: { input_per_m: 3, output_per_m: 15 },
  [OPENAI_PRIMARY]: { input_per_m: 2.5, output_per_m: 10 },
  [OPENAI_MINI]: { input_per_m: 0.15, output_per_m: 0.6 },
};

/** Resolve the configured model id for a (role, provider) pair. */
export function modelFor(role: LLMRole, provider: ProviderName): string | undefined {
  return ROLE_CONFIG[role].models[provider];
}

/** Compute EUR cost for a token count under a model. */
export function costFor(model: string, inputTokens: number, outputTokens: number): number {
  const p = PRICING[model];
  if (!p) return 0;
  return (inputTokens / 1_000_000) * p.input_per_m + (outputTokens / 1_000_000) * p.output_per_m;
}
