import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";

import {
  CHAT_MODELS,
  getModelById,
  type LlmProvider,
  type ModelOption,
} from "./models";
import type { ServerLlmCapabilities } from "./server-llm";

export type UserLlmKeys = Partial<Record<LlmProvider | "openrouter", string>>;

function serverKeyForProvider(provider: LlmProvider): string | undefined {
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
  provider: LlmProvider,
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

export function hasOpenRouterKey(userKeys?: UserLlmKeys): boolean {
  return Boolean(resolveOpenRouterApiKey(userKeys));
}

export function hasProviderKey(
  provider: LlmProvider,
  userKeys?: UserLlmKeys,
): boolean {
  if (resolveProviderApiKey(provider, userKeys)) return true;
  return hasOpenRouterKey(userKeys);
}

export function hasAnyLlmKey(userKeys?: UserLlmKeys): boolean {
  return (
    (["anthropic", "openai", "google"] as const).some((p) =>
      hasProviderKey(p, userKeys),
    ) || hasOpenRouterKey(userKeys)
  );
}

export function isModelAvailableForKeys(
  model: ModelOption,
  userKeys?: UserLlmKeys,
): boolean {
  return hasProviderKey(model.provider, userKeys);
}

/** Client-side: which models the user can select in the dropdown. */
export function isModelAvailableForUser(
  model: ModelOption,
  connectedProviders: LlmProvider[],
  server: ServerLlmCapabilities,
  userOpenRouter = false,
): boolean {
  if (connectedProviders.includes(model.provider)) return true;
  if (server.providers.includes(model.provider)) return true;
  if (userOpenRouter || server.openRouter) return true;
  return false;
}

function createOpenRouterClient(apiKey: string) {
  return createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
  });
}

export function getChatModel(modelId: string, userKeys?: UserLlmKeys) {
  const model = getModelById(modelId) ?? CHAT_MODELS[0]!;
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
      `No API key for ${model.label}. Open Settings → ${providerLabel(model.provider)} tab → paste your key.`,
    );
  }
  return createOpenRouterClient(orKey).chat(model.openRouterModelId);
}

function providerLabel(provider: LlmProvider): string {
  switch (provider) {
    case "google":
      return "Gemini";
    case "openai":
      return "ChatGPT";
    case "anthropic":
      return "Claude";
  }
}
