/**
 * VerifIQ — OpenAI provider adapter.
 *
 * Implements LLMProvider against the `openai` SDK. Default use is the
 * peer-challenge role (a different model family from Anthropic, per file 02)
 * and as the per-call failover target. Models per role come from config.ts.
 *
 * Spec references: verifiq-prompts/02_agent_architecture.md; docs/28 § D2.
 * Version: 0.3.0-phase1
 */

import OpenAI from "openai";
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

export class OpenAIProvider implements LLMProvider {
  readonly name = "openai" as const;
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  private model(role: LLMRole): string {
    const m = modelFor(role, "openai");
    if (!m) throw new Error(`No OpenAI model configured for role "${role}"`);
    return m;
  }

  async complete(role: LLMRole, prompt: string, options: CompleteOptions = {}): Promise<LLMResult> {
    const model = this.model(role);
    const started = Date.now();
    try {
      const resp = await this.client.chat.completions.create({
        model,
        max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
        temperature: options.temperature,
        messages: [
          ...(options.system ? [{ role: "system" as const, content: options.system }] : []),
          { role: "user" as const, content: prompt },
        ],
      });
      return this.toResult(model, resp, started);
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
    const dataUrl = `data:image/png;base64,${toBase64(imageBuffer)}`;
    try {
      const resp = await this.client.chat.completions.create({
        model,
        max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
        temperature: options.temperature,
        messages: [
          ...(options.system ? [{ role: "system" as const, content: options.system }] : []),
          {
            role: "user" as const,
            content: [
              { type: "text" as const, text: prompt },
              { type: "image_url" as const, image_url: { url: dataUrl } },
            ],
          },
        ],
      });
      return this.toResult(model, resp, started);
    } catch (err) {
      throw this.mapError(err);
    }
  }

  getCost(role: LLMRole, tokensIn: number, tokensOut: number): number {
    return costEur(this.model(role), tokensIn, tokensOut);
  }

  private toResult(
    model: string,
    resp: OpenAI.Chat.Completions.ChatCompletion,
    started: number,
  ): LLMResult {
    const text = resp.choices[0]?.message?.content ?? "";
    const tokens_in = resp.usage?.prompt_tokens ?? 0;
    const tokens_out = resp.usage?.completion_tokens ?? 0;
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

  private mapError(err: unknown): Error {
    if (err instanceof OpenAI.APIConnectionError) {
      return new RetryableLLMError(`openai connection error: ${err.message}`, this.name);
    }
    if (err instanceof OpenAI.APIError) {
      const status = err.status ?? 0;
      if (status === 429 || status >= 500) {
        return new RetryableLLMError(`openai ${status}: ${err.message}`, this.name);
      }
    }
    return err instanceof Error ? err : new Error(String(err));
  }
}
