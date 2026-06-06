import { createOpenAI } from "@ai-sdk/openai";

export function resolveOpenRouterApiKey(userKey?: string): string | undefined {
  const trimmedUser = userKey?.trim();
  if (trimmedUser) return trimmedUser;
  const server = process.env.OPENROUTER_API_KEY?.trim();
  return server || undefined;
}

function createOpenRouterClient(apiKey: string) {
  return createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
  });
}

export function getChatModel(modelId: string, apiKey?: string) {
  const resolved = resolveOpenRouterApiKey(apiKey);
  if (!resolved) {
    throw new Error("OpenRouter API key required");
  }
  return createOpenRouterClient(resolved).chat(modelId);
}

export function hasOpenRouterKey(apiKey?: string): boolean {
  return Boolean(resolveOpenRouterApiKey(apiKey));
}
