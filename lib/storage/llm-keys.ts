import type { LlmProvider } from "@/lib/ai/models";
import type { UserLlmKeys } from "@/lib/ai/providers";

const STORAGE_PREFIX = "llm_api_key_";
const LEGACY_OPENROUTER_KEY = "openrouter_api_key";

export type StoredLlmKeys = UserLlmKeys;

export function getStoredLlmKeys(): StoredLlmKeys {
  if (typeof window === "undefined") return {};
  const keys: StoredLlmKeys = {};
  for (const provider of ["anthropic", "openai", "google"] as LlmProvider[]) {
    const v = sessionStorage.getItem(`${STORAGE_PREFIX}${provider}`);
    if (v?.trim()) keys[provider] = v.trim();
  }
  const legacy = sessionStorage.getItem(LEGACY_OPENROUTER_KEY);
  if (legacy?.trim()) keys.openrouter = legacy.trim();
  return keys;
}

export function getStoredProviderKey(provider: LlmProvider): string | null {
  return getStoredLlmKeys()[provider] ?? null;
}

export function setStoredProviderKey(provider: LlmProvider, key: string): void {
  sessionStorage.setItem(`${STORAGE_PREFIX}${provider}`, key.trim());
}

export function clearStoredProviderKey(provider: LlmProvider): void {
  sessionStorage.removeItem(`${STORAGE_PREFIX}${provider}`);
}

export function maskApiKey(key: string): string {
  if (key.length <= 4) return "••••";
  return `••••${key.slice(-4)}`;
}
