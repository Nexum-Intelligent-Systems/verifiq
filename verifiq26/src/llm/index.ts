/**
 * VerifIQ — LLM router / provider selector (Phase 1)
 *
 * Purpose: The single entry point agents call. Reads the role→provider chain
 *   from config.ts, invokes the configured provider, and FAILS OVER PER CALL
 *   (not per scan) to the next provider in the chain on a retryable error
 *   (20 § "Multi-provider failover at the call level"). Emits one audit record
 *   per call to an injected sink that persists via a Convex mutation.
 *
 *   Providers are injectable so tests (and the smoke test) can run without
 *   network access or API keys.
 *
 * Implements: 02_agent_architecture.md § Fallback chain, 20 § failover.
 * Version: phase1-v0.1
 */

import { AnthropicProvider } from "./anthropic";
import { OpenAIProvider } from "./openai";
import { ROLE_CONFIG } from "./config";
import {
  type AuditSink,
  type CompleteOptions,
  type CompletionResult,
  type LLMProvider,
  type LLMRole,
  type LlmCallAuditEntry,
  type ProviderName,
  type VisionImage,
  ProviderError,
} from "./types";

export interface RouterContext {
  project_id?: string;
}

export interface LLMRouterOptions {
  /** Called once per LLM call to persist the audit entry (e.g. Convex mutation). */
  auditSink?: AuditSink;
  /** Inject providers (for tests). Missing providers are lazily constructed. */
  providers?: Partial<Record<ProviderName, LLMProvider>>;
}

export class LLMRouter {
  private readonly auditSink?: AuditSink;
  private readonly providers: Partial<Record<ProviderName, LLMProvider>>;

  constructor(options: LLMRouterOptions = {}) {
    this.auditSink = options.auditSink;
    this.providers = { ...options.providers };
  }

  /** Lazily construct + cache a provider. Returns undefined if unavailable. */
  private getProvider(name: ProviderName): LLMProvider | undefined {
    const existing = this.providers[name];
    if (existing) return existing;
    try {
      const created = name === "anthropic" ? new AnthropicProvider() : new OpenAIProvider();
      this.providers[name] = created;
      return created;
    } catch {
      // Missing API key / construction failure → provider unavailable.
      return undefined;
    }
  }

  async complete(
    role: LLMRole,
    prompt: string,
    options?: CompleteOptions,
    ctx?: RouterContext,
  ): Promise<CompletionResult> {
    return this.run(role, ctx, (provider) => provider.complete(role, prompt, options));
  }

  async completeVision(
    role: LLMRole,
    image: VisionImage,
    prompt: string,
    options?: CompleteOptions,
    ctx?: RouterContext,
  ): Promise<CompletionResult> {
    return this.run(role, ctx, (provider) => provider.completeVision(role, image, prompt, options));
  }

  /** Walk the role's provider chain, failing over on retryable errors. */
  private async run(
    role: LLMRole,
    ctx: RouterContext | undefined,
    invoke: (provider: LLMProvider) => Promise<CompletionResult>,
  ): Promise<CompletionResult> {
    const chain = ROLE_CONFIG[role].chain;
    const attempts: LlmCallAuditEntry["attempts"] = [];
    let lastError: unknown;

    for (let i = 0; i < chain.length; i++) {
      const name = chain[i]!;
      const isLast = i === chain.length - 1;
      const provider = this.getProvider(name);

      if (!provider) {
        attempts.push({ provider: name, error: "provider unavailable (no credentials)" });
        lastError = new ProviderError(`Provider ${name} unavailable`, { retryable: true });
        if (isLast) break;
        continue;
      }

      try {
        const result = await invoke(provider);
        attempts.push({ provider: name });
        await this.emit({
          role,
          provider_used: result.provider_used,
          model_used: result.model_used,
          tokens_in: result.tokens_in,
          tokens_out: result.tokens_out,
          cost_eur: result.cost_eur,
          latency_ms: result.latency_ms,
          outcome: attempts.length > 1 ? "failover" : "success",
          attempts,
          ...(ctx?.project_id ? { project_id: ctx.project_id } : {}),
        });
        return result;
      } catch (err) {
        lastError = err;
        const message = err instanceof Error ? err.message : String(err);
        attempts.push({ provider: name, error: message });
        const retryable = err instanceof ProviderError ? err.retryable : true;
        if (retryable && !isLast) {
          continue; // fail over to next provider in the chain
        }
        break; // non-retryable, or chain exhausted
      }
    }

    await this.emit({
      role,
      provider_used: chain[chain.length - 1]!,
      model_used: "n/a",
      tokens_in: 0,
      tokens_out: 0,
      cost_eur: 0,
      latency_ms: 0,
      outcome: "error",
      attempts,
      ...(ctx?.project_id ? { project_id: ctx.project_id } : {}),
    });

    throw lastError instanceof Error
      ? lastError
      : new ProviderError(`All providers failed for role ${role}`, { retryable: false });
  }

  private async emit(entry: LlmCallAuditEntry): Promise<void> {
    if (!this.auditSink) return;
    await this.auditSink(entry);
  }
}

/** Convenience factory. */
export function createLLMRouter(options?: LLMRouterOptions): LLMRouter {
  return new LLMRouter(options);
}

export * from "./types";
export { ROLE_CONFIG, costFor, modelFor } from "./config";
