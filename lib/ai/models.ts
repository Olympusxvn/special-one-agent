import { GATEWAY_CHAT_MODEL } from "./gateway";

export type LlmProvider = "gateway" | "anthropic" | "openai" | "google";

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
  id: Exclude<LlmProvider, "gateway">;
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
      "aistudio.google.com/apikey → Create API key → paste AIza… below",
    placeholder: "AIza…",
  },
];

export const CHAT_MODELS: ModelOption[] = [
  {
    id: "claude-haiku",
    provider: "gateway",
    label: "Claude Haiku 4.5",
    description: "Free — wallet only (Vercel AI Gateway)",
    directModelId: GATEWAY_CHAT_MODEL,
    openRouterModelId: "anthropic/claude-3.5-haiku",
  },
  {
    id: "chatgpt",
    provider: "openai",
    label: "ChatGPT (GPT-4o Mini)",
    description: "BYOK — your OpenAI key",
    directModelId: "gpt-4o-mini",
    openRouterModelId: "openai/gpt-4o-mini",
  },
  {
    id: "gemini",
    provider: "google",
    label: "Gemini 2.0 Flash",
    description: "BYOK — your Google key",
    directModelId: "gemini-2.0-flash",
    openRouterModelId: "google/gemini-2.0-flash-001",
  },
  {
    id: "claude-sonnet",
    provider: "anthropic",
    label: "Claude Sonnet",
    description: "BYOK — best roast quality",
    directModelId: "claude-sonnet-4-20250514",
    openRouterModelId: "anthropic/claude-3.5-sonnet",
  },
];

export const DEFAULT_MODEL_ID = "claude-haiku";

/** Pick default model: gateway first, then first connected BYOK provider. */
export function pickModelForProviders(
  providers: Exclude<LlmProvider, "gateway">[],
  options: { hasGateway?: boolean; hasServerKey?: boolean } = {},
): string {
  if (options.hasGateway) return DEFAULT_MODEL_ID;
  if (options.hasServerKey) return "chatgpt";
  const match = CHAT_MODELS.find(
    (m) => m.provider !== "gateway" && providers.includes(m.provider),
  );
  return match?.id ?? DEFAULT_MODEL_ID;
}

export function syncModelWithProviders(
  currentModelId: string,
  providers: Exclude<LlmProvider, "gateway">[],
  options: { hasGateway?: boolean; hasServerKey?: boolean } = {},
): string {
  const current = getModelById(currentModelId);
  if (current?.provider === "gateway" && options.hasGateway) {
    return currentModelId;
  }
  if (
    options.hasServerKey ||
    (current &&
      current.provider !== "gateway" &&
      providers.includes(current.provider))
  ) {
    return currentModelId;
  }
  return pickModelForProviders(providers, options);
}

export const INTENT_MODEL_ID = "claude-haiku";

export function getModelById(id: string): ModelOption | undefined {
  return CHAT_MODELS.find((m) => m.id === id);
}
