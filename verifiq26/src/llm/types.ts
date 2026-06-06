/**
 * VerifIQ — LLM provider interface (Phase 1)
 *
 * Purpose: The provider-agnostic contract every agent role calls through. No
 *   non-adapter code may import a vendor SDK directly (anti-pattern in the
 *   Phase 1 brief). Concrete adapters (anthropic.ts, openai.ts) implement this;
 *   index.ts selects + fails over between them per role.
 *
 * Implements: 02_agent_architecture.md § Provider abstraction.
 * Version: phase1-v0.1
 */

/** Agent roles that map to a provider chain in config.ts. */
export type LLMRole =
  | "classification"
  | "discipline-primary-review"
  | "peer-challenge"
  | "adjudicator"
  | "council-chair"
  | "title-block-extraction";

export type ProviderName = "anthropic" | "openai";

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
}

export interface CompleteOptions {
  /** Cap on output tokens. */
  maxTokens?: number;
  /** Sampling temperature. */
  temperature?: number;
  /** System prompt (loaded from verifiq-prompts/ — never inlined in code). */
  system?: string;
  /** Apply provider prompt-caching to the system block (Anthropic). */
  cacheSystem?: boolean;
  /** Override the configured model id for this single call. */
  model?: string;
}

/** Structured result returned by every adapter call. */
export interface CompletionResult {
  text: string;
  tokens_in: number;
  tokens_out: number;
  model_used: string;
  provider_used: ProviderName;
  cost_eur: number;
  latency_ms: number;
}

/** A vision input: raw image bytes plus their media type. */
export interface VisionImage {
  buffer: Buffer;
  media_type: "image/png" | "image/jpeg" | "image/webp" | "image/gif";
}

export interface LLMProvider {
  readonly name: ProviderName;

  /** Text completion for the given role. */
  complete(role: LLMRole, prompt: string, options?: CompleteOptions): Promise<CompletionResult>;

  /** Vision completion (e.g. title-block extraction) for the given role. */
  completeVision(
    role: LLMRole,
    image: VisionImage,
    prompt: string,
    options?: CompleteOptions,
  ): Promise<CompletionResult>;

  /** Estimated cost in EUR for a token usage under the model for this role. */
  getCost(role: LLMRole, tokens: TokenUsage): number;
}

/**
 * Audit record for a single LLM call. The router emits one of these per call
 * to an injected sink, which persists to the `audit_log` table via a Convex
 * mutation (20 § "Audit-log writes are mutations, never actions").
 */
export interface LlmCallAuditEntry {
  role: LLMRole;
  provider_used: ProviderName;
  model_used: string;
  tokens_in: number;
  tokens_out: number;
  cost_eur: number;
  latency_ms: number;
  outcome: "success" | "failover" | "error";
  /** Provider attempts in order, with any error message. */
  attempts: Array<{ provider: ProviderName; error?: string }>;
  project_id?: string;
}

export type AuditSink = (entry: LlmCallAuditEntry) => void | Promise<void>;

/** Error carrying retryability so the router can decide to fail over. */
export class ProviderError extends Error {
  readonly retryable: boolean;
  readonly status?: number;

  constructor(message: string, opts: { retryable: boolean; status?: number; cause?: unknown }) {
    super(message);
    this.name = "ProviderError";
    this.retryable = opts.retryable;
    this.status = opts.status;
    if (opts.cause !== undefined) {
      (this as { cause?: unknown }).cause = opts.cause;
    }
  }
}
