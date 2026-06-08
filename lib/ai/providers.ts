import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";

import { getGatewayChatModel, isGatewayAvailable } from "./gateway";
import {
  CHAT_MODELS,
  getModelById,
  type LlmProvider,
  type ModelOption,
} from "./models";

export type UserLlmKeys = Partial<
  Record<Exclude<LlmProvider, "gateway"> | "openrouter", string>
>;

function serverKeyForProvider(
  provider: Exclude<LlmProvider, "gateway">,
): string | undefined {
  switch (provider) {
    case "anthropic":
      return process.env.ANTHROPIC_API_KEY?.trim();
    case "openai":
      return process.env.OPENAI_API_KEY?.trim();
    case "google":
      return process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  }
}

export function resolveProviderApiKey(
  provider: Exclude<LlmProvider, "gateway">,
  userKeys?: UserLlmKeys,
): string | undefined {
  const user = userKeys?.[provider]?.trim();
  if (user) return user;
  return serverKeyForProvider(provider);
}

export function resolveOpenRouterApiKey(userKeys?: UserLlmKeys): string | undefined {
  const user = userKeys?.openrouter?.trim();
  if (user) return user;
  return process.env.OPENROUTER_API_KEY?.trim();
}

export function hasProviderKey(
  provider: LlmProvider,
  userKeys?: UserLlmKeys,
): boolean {
  if (provider === "gateway") return isGatewayAvailable();
  return Boolean(
    resolveProviderApiKey(provider, userKeys) ||
      resolveOpenRouterApiKey(userKeys),
  );
}

export function hasServerByokKeys(): boolean {
  return (
    (["anthropic", "openai", "google"] as const).some((p) =>
      Boolean(serverKeyForProvider(p)),
    ) || Boolean(process.env.OPENROUTER_API_KEY?.trim())
  );
}

export function hasAnyLlmKey(userKeys?: UserLlmKeys): boolean {
  return (
    isGatewayAvailable() ||
    hasServerByokKeys() ||
    CHAT_MODELS.some((m) => hasProviderKey(m.provider, userKeys)) ||
    Boolean(resolveOpenRouterApiKey(userKeys))
  );
}

/** @deprecated use hasAnyLlmKey */
export function hasOpenRouterKey(userKeys?: UserLlmKeys): boolean {
  return hasAnyLlmKey(userKeys);
}

function createOpenRouterClient(apiKey: string) {
  return createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
  });
}

export function getChatModel(modelId: string, userKeys?: UserLlmKeys) {
  const model = getModelById(modelId) ?? CHAT_MODELS[0]!;

  if (model.provider === "gateway") {
    if (!isGatewayAvailable()) {
      throw new Error(
        "Claude Haiku (free) is only available on Vercel production. Connect your own API key in Settings for local dev.",
      );
    }
    return getGatewayChatModel();
  }

  const directKey = resolveProviderApiKey(model.provider, userKeys);

  if (directKey) {
    switch (model.provider) {
      case "anthropic":
        return createAnthropic({ apiKey: directKey }).chat(model.directModelId);
      case "openai":
        return createOpenAI({ apiKey: directKey }).chat(model.directModelId);
      case "google":
        return createGoogleGenerativeAI({ apiKey: directKey }).chat(
          model.directModelId,
        );
    }
  }

  const orKey = resolveOpenRouterApiKey(userKeys);
  if (!orKey) {
    throw new Error(
      `API key required for ${model.label}. Connect your ${model.provider} account in Settings.`,
    );
  }
  return createOpenRouterClient(orKey).chat(model.openRouterModelId);
}

export function getIntentModel(userKeys?: UserLlmKeys) {
  if (isGatewayAvailable()) {
    return getGatewayChatModel();
  }
  const intentModel =
    getModelById("claude-haiku") ??
    CHAT_MODELS.find((m) => m.provider === "anthropic")!;
  return getChatModel(intentModel.id, userKeys);
}

export function isModelAvailable(
  model: ModelOption,
  userKeys?: UserLlmKeys,
): boolean {
  return hasProviderKey(model.provider, userKeys);
}
