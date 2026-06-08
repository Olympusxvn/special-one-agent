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
    id: "google",
    name: "Gemini",
    loginUrl: "https://gemini.google.com/",
    keyUrl: "https://aistudio.google.com/apikey",
    keyHint:
      "Free tier: aistudio.google.com/apikey → Create API key → paste AIza…",
    placeholder: "AIza…",
  },
  {
    id: "openai",
    name: "ChatGPT",
    loginUrl: "https://chat.openai.com/",
    keyUrl: "https://platform.openai.com/api-keys",
    keyHint: "platform.openai.com/api-keys → Create key → paste sk-…",
    placeholder: "sk-…",
  },
  {
    id: "anthropic",
    name: "Claude",
    loginUrl: "https://claude.ai/login",
    keyUrl: "https://console.anthropic.com/settings/keys",
    keyHint: "console.anthropic.com → API Keys → paste sk-ant-…",
    placeholder: "sk-ant-…",
  },
];

export const CHAT_MODELS: ModelOption[] = [
  {
    id: "gemini",
    provider: "google",
    label: "Gemini 2.0 Flash Lite",
    description: "Fastest — free tier",
    directModelId: "gemini-2.0-flash-lite",
    openRouterModelId: "google/gemini-2.0-flash-001",
  },
  {
    id: "chatgpt",
    provider: "openai",
    label: "ChatGPT (GPT-4o Mini)",
    description: "Fast & sharp",
    directModelId: "gpt-4o-mini",
    openRouterModelId: "openai/gpt-4o-mini",
  },
  {
    id: "claude-haiku",
    provider: "anthropic",
    label: "Claude Haiku",
    description: "Fast Claude",
    directModelId: "claude-3-5-haiku-20241022",
    openRouterModelId: "anthropic/claude-3.5-haiku",
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

export const DEFAULT_MODEL_ID = "gemini";

const MODEL_PICK_ORDER = ["gemini", "chatgpt", "claude-haiku", "claude-sonnet"] as const;

/** Pick the first model whose provider has a connected key. */
export function pickModelForProviders(
  providers: LlmProvider[],
  options: { hasOpenRouter?: boolean; serverProviders?: LlmProvider[] } = {},
): string {
  const server = options.serverProviders ?? [];
  for (const id of MODEL_PICK_ORDER) {
    const model = getModelById(id);
    if (!model) continue;
    if (
      providers.includes(model.provider) ||
      server.includes(model.provider) ||
      options.hasOpenRouter
    ) {
      return id;
    }
  }
  return DEFAULT_MODEL_ID;
}

export function syncModelWithProviders(
  currentModelId: string,
  providers: LlmProvider[],
  options: { hasOpenRouter?: boolean; serverProviders?: LlmProvider[] } = {},
): string {
  const current = getModelById(currentModelId);
  if (current && isProviderCovered(current.provider, providers, options)) {
    return currentModelId;
  }
  return pickModelForProviders(providers, options);
}

function isProviderCovered(
  provider: LlmProvider,
  connected: LlmProvider[],
  options: { hasOpenRouter?: boolean; serverProviders?: LlmProvider[] },
): boolean {
  if (connected.includes(provider)) return true;
  if (options.serverProviders?.includes(provider)) return true;
  if (options.hasOpenRouter) return true;
  return false;
}

export function getModelById(id: string): ModelOption | undefined {
  return CHAT_MODELS.find((m) => m.id === id);
}
