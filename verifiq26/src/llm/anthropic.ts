/**
 * VerifIQ — Anthropic LLM adapter (Phase 1)
 *
 * Purpose: Implements LLMProvider against the Anthropic Messages API. Applies
 *   prompt caching to system prompts (the standards corpus + persona amortise
 *   across files), maps roles to Claude models via config.ts, and normalises
 *   errors into ProviderError so the router can fail over per-call.
 *
 * Implements: 02_agent_architecture.md (Anthropic wiring), 20 § failover.
 * Version: phase1-v0.1
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  type CompleteOptions,
  type CompletionResult,
  type LLMProvider,
  type LLMRole,
  type TokenUsage,
  type VisionImage,
  ProviderError,
} from "./types";
import { costFor, modelFor } from "./config";

const DEFAULT_MAX_TOKENS = 4096;

export class AnthropicProvider implements LLMProvider {
  readonly name = "anthropic" as const;
  private readonly client: Anthropic;

  constructor(apiKey: string | undefined = process.env.ANTHROPIC_API_KEY) {
    if (!apiKey) {
      throw new ProviderError("ANTHROPIC_API_KEY is not set", { retryable: false });
    }
    this.client = new Anthropic({ apiKey });
  }

  /** Resolve the model id for a role, honouring a per-call override. */
  private resolveModel(role: LLMRole, options?: CompleteOptions): string {
    const model = options?.model ?? modelFor(role, this.name);
    if (!model) {
      throw new ProviderError(`No Anthropic model configured for role ${role}`, {
        retryable: false,
      });
    }
    return model;
  }

  async complete(
    role: LLMRole,
    prompt: string,
    options?: CompleteOptions,
  ): Promise<CompletionResult> {
    return this.call(role, [{ type: "text", text: prompt }], options);
  }

  async completeVision(
    role: LLMRole,
    image: VisionImage,
    prompt: string,
    options?: CompleteOptions,
  ): Promise<CompletionResult> {
    return this.call(
      role,
      [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: image.media_type,
            data: image.buffer.toString("base64"),
          },
        },
        { type: "text", text: prompt },
      ],
      options,
    );
  }

  private async call(
    role: LLMRole,
    content: Anthropic.MessageParam["content"],
    options?: CompleteOptions,
  ): Promise<CompletionResult> {
    const model = this.resolveModel(role, options);
    const started = Date.now();

    // System prompt as a cacheable block when requested (prompt caching cuts
    // the cost of the shared corpus/persona on subsequent calls).
    const system: Anthropic.TextBlockParam[] | undefined = options?.system
      ? [
          {
            type: "text",
            text: options.system,
            ...(options.cacheSystem ? { cache_control: { type: "ephemeral" } } : {}),
          },
        ]
      : undefined;

    try {
      const response = await this.client.messages.create({
        model,
        max_tokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
        ...(options?.temperature !== undefined ? { temperature: options.temperature } : {}),
        ...(system ? { system } : {}),
        messages: [{ role: "user", content }],
      });

      const text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");

      const tokens_in = response.usage.input_tokens;
      const tokens_out = response.usage.output_tokens;

      return {
        text,
        tokens_in,
        tokens_out,
        model_used: model,
        provider_used: this.name,
        cost_eur: costFor(model, tokens_in, tokens_out),
        latency_ms: Date.now() - started,
      };
    } catch (err) {
      throw toProviderError(err);
    }
  }

  getCost(role: LLMRole, tokens: TokenUsage): number {
    const model = modelFor(role, this.name);
    if (!model) return 0;
    return costFor(model, tokens.input_tokens, tokens.output_tokens);
  }
}

/** Normalise SDK errors into ProviderError with a retryability verdict. */
function toProviderError(err: unknown): ProviderError {
  if (err instanceof ProviderError) return err;
  const status =
    typeof err === "object" && err !== null && "status" in err
      ? (err as { status?: number }).status
      : undefined;
  const message = err instanceof Error ? err.message : String(err);
  // 429 (rate limit) and 5xx are retryable; so are transport-level failures
  // (no status). 4xx other than 429 are not.
  const retryable = status === undefined || status === 429 || (status >= 500 && status < 600);
  return new ProviderError(`Anthropic call failed: ${message}`, { retryable, status, cause: err });
}
