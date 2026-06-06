export const OPENROUTER_SESSION_KEY = "openrouter_api_key";

export function getStoredOpenRouterKey(): string | null {
  if (typeof window === "undefined") return null;
  const key = sessionStorage.getItem(OPENROUTER_SESSION_KEY);
  return key?.trim() ? key.trim() : null;
}

export function setStoredOpenRouterKey(key: string): void {
  sessionStorage.setItem(OPENROUTER_SESSION_KEY, key.trim());
}

export function clearStoredOpenRouterKey(): void {
  sessionStorage.removeItem(OPENROUTER_SESSION_KEY);
}

export function maskApiKey(key: string): string {
  if (key.length <= 4) return "••••";
  return `••••${key.slice(-4)}`;
}
