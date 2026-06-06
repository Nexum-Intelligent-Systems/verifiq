/**
 * VerifIQ — LLM adapter interface.
 *
 * Purpose: the provider-agnostic contract every agent role calls through. No
 * non-adapter code may name a concrete provider (CLAUDE.md anti-patterns);
 * everything goes through `LLMProvider` and the role→provider config.
 *
 * Spec references: verifiq-prompts/02_agent_architecture.md § Multi-LLM
 * configuration; docs/28 § Deliverable 2.
 * Version: 0.3.0-phase1
 */

/** Provider identifiers. Used only inside the adapter + config layers. */
export type ProviderName = "anthropic" | "openai";

/**
 * Agent role strings. The config layer maps each to a provider + model so the
 * caller never picks a model directly.
 */
export type LLMRole =
  | "classification"
  | "discipline-primary-review"
  | "peer-challenge"
  | "adjudicator"
  | "council-chair"
  | "title-block-extraction";

/** Per-call options. */
export interface CompleteOptions {
  /** System prompt; cached (Anthropic) when `cacheSystem` is true. */
  system?: string;
  maxTokens?: number;
  temperature?: number;
  /** Cache the system block (Anthropic prompt caching). Default true. */
  cacheSystem?: boolean;
  /** Recorded in the audit entry / inference cache key (file 20 §2). */
  promptVersion?: string;
  agentId?: string;
  corpusVersion?: string;
}

/** Structured result returned by every adapter call. */
export interface LLMResult {
  text: string;
  tokens_in: number;
  tokens_out: number;
  model_used: string;
  provider_used: ProviderName;
  cost_eur: number;
  latency_ms: number;
}

/** A single provider adapter (Anthropic, OpenAI, …). */
export interface LLMProvider {
  readonly name: ProviderName;
  /** Text completion for a role. */
  complete(role: LLMRole, prompt: string, options?: CompleteOptions): Promise<LLMResult>;
  /** Vision completion (e.g. title-block extraction) for a role. */
  completeVision(
    role: LLMRole,
    imageBuffer: Uint8Array,
    prompt: string,
    options?: CompleteOptions,
  ): Promise<LLMResult>;
  /** Estimated cost in EUR for a token count under a role's model. */
  getCost(role: LLMRole, tokensIn: number, tokensOut: number): number;
}

/**
 * Audit sink — the adapter calls this on every LLM call so the call is recorded
 * to `audit_log` (docs/28 D2: "Log every call to audit_log via a Convex
 * mutation"). Injected as a dependency to keep the adapter decoupled from
 * Convex and unit-testable.
 */
export type AuditSink = (entry: LLMAuditEntry) => Promise<void> | void;

export interface LLMAuditEntry {
  action: "llm_call" | "llm_failover" | "llm_error";
  role: LLMRole;
  provider_used?: ProviderName;
  model_used?: string;
  tokens_in?: number;
  tokens_out?: number;
  cost_eur?: number;
  latency_ms?: number;
  prompt_version?: string;
  agent_id?: string;
  error?: string;
}

/** Error class that marks an LLM failure as retryable (rate limit / 5xx / network). */
export class RetryableLLMError extends Error {
  constructor(
    message: string,
    public readonly provider: ProviderName,
  ) {
    super(message);
    this.name = "RetryableLLMError";
  }
}
