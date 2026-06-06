/**
 * VerifIQ — LLM provider selector + per-call failover.
 *
 * Reads configured providers, resolves the provider chain for a role from
 * config.ts, and tries each in order. On a retryable error (rate limit / 5xx /
 * network) it fails over to the next provider WITHIN THE SAME CALL (file 20
 * § Multi-provider failover at the call level). If every provider in the chain
 * fails, the error propagates so the caller can hold the pack in the reviewer
 * queue rather than ship degraded output (file 02 § Fallback chain).
 *
 * Every attempt is recorded to the audit log via the injected AuditSink
 * (docs/28 § D2). The sink is a dependency so this module never imports Convex.
 *
 * Spec references: verifiq-prompts/02_agent_architecture.md; docs/28 § D2.
 * Version: 0.3.0-phase1
 */

import {
  type AuditSink,
  type CompleteOptions,
  type LLMProvider,
  type LLMResult,
  type LLMRole,
  type ProviderName,
  RetryableLLMError,
} from "./types.js";
import { ROLE_WIRING } from "./config.js";
import { AnthropicProvider } from "./anthropic.js";
import { OpenAIProvider } from "./openai.js";

export * from "./types.js";
export { ROLE_WIRING, modelFor, costEur } from "./config.js";

export interface LLMClient {
  complete(role: LLMRole, prompt: string, options?: CompleteOptions): Promise<LLMResult>;
  completeVision(
    role: LLMRole,
    imageBuffer: Uint8Array,
    prompt: string,
    options?: CompleteOptions,
  ): Promise<LLMResult>;
}

export interface CreateLLMOptions {
  /** Inject provider instances (used by tests / custom wiring). */
  providers?: Partial<Record<ProviderName, LLMProvider>>;
  /** Records every call/failover/error to audit_log. */
  audit?: AuditSink;
  /** Keys for auto-instantiation when `providers` is not supplied. */
  anthropicApiKey?: string;
  openaiApiKey?: string;
}

/**
 * Build the LLM client. With no injected providers it instantiates from the
 * supplied keys (or the ANTHROPIC_API_KEY / OPENAI_API_KEY env vars).
 */
export function createLLM(opts: CreateLLMOptions = {}): LLMClient {
  const registry = buildRegistry(opts);
  if (Object.keys(registry).length === 0) {
    throw new Error(
      "No LLM providers configured. Set ANTHROPIC_API_KEY and/or OPENAI_API_KEY, or inject providers.",
    );
  }
  return new FailoverClient(registry, opts.audit);
}

function buildRegistry(opts: CreateLLMOptions): Partial<Record<ProviderName, LLMProvider>> {
  if (opts.providers) return opts.providers;
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
  const registry: Partial<Record<ProviderName, LLMProvider>> = {};
  const anthropicKey = opts.anthropicApiKey ?? env.ANTHROPIC_API_KEY;
  const openaiKey = opts.openaiApiKey ?? env.OPENAI_API_KEY;
  if (anthropicKey) registry.anthropic = new AnthropicProvider(anthropicKey);
  if (openaiKey) registry.openai = new OpenAIProvider(openaiKey);
  return registry;
}

class FailoverClient implements LLMClient {
  constructor(
    private registry: Partial<Record<ProviderName, LLMProvider>>,
    private audit?: AuditSink,
  ) {}

  complete(role: LLMRole, prompt: string, options?: CompleteOptions): Promise<LLMResult> {
    return this.run(role, options, (p) => p.complete(role, prompt, options));
  }

  completeVision(
    role: LLMRole,
    imageBuffer: Uint8Array,
    prompt: string,
    options?: CompleteOptions,
  ): Promise<LLMResult> {
    return this.run(role, options, (p) => p.completeVision(role, imageBuffer, prompt, options));
  }

  /** Walk the role's provider chain, failing over per-call on retryable errors. */
  private async run(
    role: LLMRole,
    options: CompleteOptions | undefined,
    call: (provider: LLMProvider) => Promise<LLMResult>,
  ): Promise<LLMResult> {
    const available = ROLE_WIRING[role].chain
      .map((c) => this.registry[c.provider])
      .filter((p): p is LLMProvider => Boolean(p));

    if (available.length === 0) {
      throw new Error(`No configured provider in the chain for role "${role}"`);
    }

    let lastError: unknown;
    for (let i = 0; i < available.length; i++) {
      const provider = available[i]!;
      const isLast = i === available.length - 1;
      try {
        const result = await call(provider);
        await this.log({
          action: "llm_call",
          role,
          provider_used: result.provider_used,
          model_used: result.model_used,
          tokens_in: result.tokens_in,
          tokens_out: result.tokens_out,
          cost_eur: result.cost_eur,
          latency_ms: result.latency_ms,
          prompt_version: options?.promptVersion,
          agent_id: options?.agentId,
        });
        return result;
      } catch (err) {
        lastError = err;
        const retryable = err instanceof RetryableLLMError;
        if (retryable && !isLast) {
          await this.log({
            action: "llm_failover",
            role,
            provider_used: provider.name,
            error: (err as Error).message,
            prompt_version: options?.promptVersion,
            agent_id: options?.agentId,
          });
          continue;
        }
        await this.log({
          action: "llm_error",
          role,
          provider_used: provider.name,
          error: err instanceof Error ? err.message : String(err),
          prompt_version: options?.promptVersion,
          agent_id: options?.agentId,
        });
        throw err;
      }
    }
    // Chain exhausted on retryable errors — surface so the pack can be held.
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  private async log(entry: Parameters<AuditSink>[0]): Promise<void> {
    if (this.audit) await this.audit(entry);
  }
}
