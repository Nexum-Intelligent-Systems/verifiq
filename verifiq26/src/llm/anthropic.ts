/**
 * VerifIQ — Anthropic provider adapter.
 *
 * Implements LLMProvider against @anthropic-ai/sdk. System prompts are sent as
 * cached blocks (prompt caching) so the large standards-corpus system prompt
 * amortises across files. Models per role come from config.ts.
 *
 * Spec references: verifiq-prompts/02_agent_architecture.md; docs/28 § D2.
 * Version: 0.3.0-phase1
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  type CompleteOptions,
  type LLMProvider,
  type LLMResult,
  type LLMRole,
  RetryableLLMError,
} from "./types.js";
import { costEur, modelFor } from "./config.js";
import { toBase64 } from "./util.js";

const DEFAULT_MAX_TOKENS = 4096;

export class AnthropicProvider implements LLMProvider {
  readonly name = "anthropic" as const;
  private client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  private model(role: LLMRole): string {
    const m = modelFor(role, "anthropic");
    if (!m) throw new Error(`No Anthropic model configured for role "${role}"`);
    return m;
  }

  async complete(role: LLMRole, prompt: string, options: CompleteOptions = {}): Promise<LLMResult> {
    const model = this.model(role);
    const started = Date.now();
    try {
      const resp = await this.client.messages.create({
        model,
        max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
        temperature: options.temperature,
        system: this.systemBlocks(options),
        messages: [{ role: "user", content: prompt }],
      });
      return this.toResult(role, model, resp, started);
    } catch (err) {
      throw this.mapError(err);
    }
  }

  async completeVision(
    role: LLMRole,
    imageBuffer: Uint8Array,
    prompt: string,
    options: CompleteOptions = {},
  ): Promise<LLMResult> {
    const model = this.model(role);
    const started = Date.now();
    try {
      const resp = await this.client.messages.create({
        model,
        max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
        temperature: options.temperature,
        system: this.systemBlocks(options),
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: "image/png", data: toBase64(imageBuffer) },
              },
              { type: "text", text: prompt },
            ],
          },
        ],
      });
      return this.toResult(role, model, resp, started);
    } catch (err) {
      throw this.mapError(err);
    }
  }

  getCost(role: LLMRole, tokensIn: number, tokensOut: number): number {
    return costEur(this.model(role), tokensIn, tokensOut);
  }

  /** Build the system field, marking it for prompt caching unless disabled. */
  private systemBlocks(options: CompleteOptions): Anthropic.MessageCreateParams["system"] {
    if (!options.system) return undefined;
    if (options.cacheSystem === false) return options.system;
    // cache_control enables prompt caching; cast guards across SDK minor versions.
    return [
      { type: "text", text: options.system, cache_control: { type: "ephemeral" } },
    ] as unknown as Anthropic.MessageCreateParams["system"];
  }

  private toResult(
    role: LLMRole,
    model: string,
    resp: Anthropic.Message,
    started: number,
  ): LLMResult {
    const text = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");
    const tokens_in = resp.usage.input_tokens;
    const tokens_out = resp.usage.output_tokens;
    return {
      text,
      tokens_in,
      tokens_out,
      model_used: model,
      provider_used: this.name,
      cost_eur: costEur(model, tokens_in, tokens_out),
      latency_ms: Date.now() - started,
    };
  }

  /** Map SDK errors to RetryableLLMError for rate-limit / 5xx / network. */
  private mapError(err: unknown): Error {
    if (err instanceof Anthropic.APIConnectionError) {
      return new RetryableLLMError(`anthropic connection error: ${err.message}`, this.name);
    }
    if (err instanceof Anthropic.APIError) {
      const status = err.status ?? 0;
      if (status === 429 || status >= 500) {
        return new RetryableLLMError(`anthropic ${status}: ${err.message}`, this.name);
      }
    }
    return err instanceof Error ? err : new Error(String(err));
  }
}
