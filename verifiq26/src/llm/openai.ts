/**
 * VerifIQ — OpenAI LLM adapter (Phase 1)
 *
 * Purpose: Implements LLMProvider against the OpenAI Chat Completions API. Used
 *   as the fallback family for most roles and as the primary for peer-challenge
 *   (a different model family avoids shared blind spots — 02). Normalises errors
 *   into ProviderError so the router can fail over per-call.
 *
 * Implements: 02_agent_architecture.md (OpenAI wiring), 20 § failover.
 * Version: phase1-v0.1
 */

import OpenAI from "openai";
import type {
  ChatCompletionContentPart,
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";
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

export class OpenAIProvider implements LLMProvider {
  readonly name = "openai" as const;
  private readonly client: OpenAI;

  constructor(apiKey: string | undefined = process.env.OPENAI_API_KEY) {
    if (!apiKey) {
      throw new ProviderError("OPENAI_API_KEY is not set", { retryable: false });
    }
    this.client = new OpenAI({ apiKey });
  }

  private resolveModel(role: LLMRole, options?: CompleteOptions): string {
    const model = options?.model ?? modelFor(role, this.name);
    if (!model) {
      throw new ProviderError(`No OpenAI model configured for role ${role}`, { retryable: false });
    }
    return model;
  }

  async complete(
    role: LLMRole,
    prompt: string,
    options?: CompleteOptions,
  ): Promise<CompletionResult> {
    return this.call(role, prompt, options);
  }

  async completeVision(
    role: LLMRole,
    image: VisionImage,
    prompt: string,
    options?: CompleteOptions,
  ): Promise<CompletionResult> {
    const dataUri = `data:${image.media_type};base64,${image.buffer.toString("base64")}`;
    const parts: ChatCompletionContentPart[] = [
      { type: "text", text: prompt },
      { type: "image_url", image_url: { url: dataUri } },
    ];
    return this.call(role, parts, options);
  }

  private async call(
    role: LLMRole,
    userContent: string | ChatCompletionContentPart[],
    options?: CompleteOptions,
  ): Promise<CompletionResult> {
    const model = this.resolveModel(role, options);
    const started = Date.now();

    const messages: ChatCompletionMessageParam[] = [];
    if (options?.system) {
      messages.push({ role: "system", content: options.system });
    }
    messages.push({ role: "user", content: userContent });

    try {
      const response = await this.client.chat.completions.create({
        model,
        max_tokens: options?.maxTokens ?? DEFAULT_MAX_TOKENS,
        ...(options?.temperature !== undefined ? { temperature: options.temperature } : {}),
        messages,
      });

      const text = response.choices[0]?.message?.content ?? "";
      const tokens_in = response.usage?.prompt_tokens ?? 0;
      const tokens_out = response.usage?.completion_tokens ?? 0;

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

function toProviderError(err: unknown): ProviderError {
  if (err instanceof ProviderError) return err;
  const status =
    typeof err === "object" && err !== null && "status" in err
      ? (err as { status?: number }).status
      : undefined;
  const message = err instanceof Error ? err.message : String(err);
  const retryable = status === undefined || status === 429 || (status >= 500 && status < 600);
  return new ProviderError(`OpenAI call failed: ${message}`, { retryable, status, cause: err });
}
