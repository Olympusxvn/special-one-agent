export type LlmProvider = "anthropic" | "openai" | "google";

export interface ModelOption {
  id: string;
  provider: LlmProvider;
  label: string;
  description: string;
  /** Model id when using the provider's API directly */
  directModelId: string;
  /** Model id when falling back to OpenRouter */
  openRouterModelId: string;
}

export const LLM_PROVIDERS: {
  id: LlmProvider;
  name: string;
  loginUrl: string;
  keyUrl: string;
  keyHint: string;
  placeholder: string;
}[] = [
  {
    id: "anthropic",
    name: "Claude",
    loginUrl: "https://claude.ai/login",
    keyUrl: "https://console.anthropic.com/settings/keys",
    keyHint: "Log in at claude.ai → Console → API Keys",
    placeholder: "sk-ant-…",
  },
  {
    id: "openai",
    name: "ChatGPT",
    loginUrl: "https://chat.openai.com/",
    keyUrl: "https://platform.openai.com/api-keys",
    keyHint: "Log in at chat.openai.com → Platform → API Keys",
    placeholder: "sk-…",
  },
  {
    id: "google",
    name: "Gemini",
    loginUrl: "https://gemini.google.com/",
    keyUrl: "https://aistudio.google.com/apikey",
    keyHint:
      "Free demo: aistudio.google.com/apikey → Create API key → paste AIza… below",
    placeholder: "AIza…",
  },
];

/** Demo-friendly order: ChatGPT & Gemini first (common free-tier keys). */
export const CHAT_MODELS: ModelOption[] = [
  {
    id: "chatgpt",
    provider: "openai",
    label: "ChatGPT (GPT-4o Mini)",
    description: "Fast & sharp",
    directModelId: "gpt-4o-mini",
    openRouterModelId: "openai/gpt-4o-mini",
  },
  {
    id: "gemini",
    provider: "google",
    label: "Gemini 2.0 Flash",
    description: "Free tier friendly",
    directModelId: "gemini-2.0-flash",
    openRouterModelId: "google/gemini-2.0-flash-001",
  },
  {
    id: "claude-sonnet",
    provider: "anthropic",
    label: "Claude Sonnet",
    description: "Best roast quality",
    directModelId: "claude-sonnet-4-20250514",
    openRouterModelId: "anthropic/claude-3.5-sonnet",
  },
];

export const DEFAULT_MODEL_ID = "chatgpt";

/** Pick the first model that matches a connected provider key. */
export function pickModelForProviders(
  providers: LlmProvider[],
  hasServerKey = false,
): string {
  if (hasServerKey) return DEFAULT_MODEL_ID;
  const match = CHAT_MODELS.find((m) => providers.includes(m.provider));
  return match?.id ?? DEFAULT_MODEL_ID;
}

export function syncModelWithProviders(
  currentModelId: string,
  providers: LlmProvider[],
  hasServerKey = false,
): string {
  const current = getModelById(currentModelId);
  if (
    hasServerKey ||
    (current && providers.includes(current.provider))
  ) {
    return currentModelId;
  }
  return pickModelForProviders(providers, hasServerKey);
}
export const INTENT_MODEL_ID = "gemini";

export function getModelById(id: string): ModelOption | undefined {
  return CHAT_MODELS.find((m) => m.id === id);
}
