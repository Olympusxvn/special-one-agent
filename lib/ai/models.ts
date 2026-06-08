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
    keyHint: "Log in with Google → AI Studio → Create API key",
    placeholder: "AIza…",
  },
];

export const CHAT_MODELS: ModelOption[] = [
  {
    id: "claude-sonnet",
    provider: "anthropic",
    label: "Claude Sonnet",
    description: "Best roast quality",
    directModelId: "claude-sonnet-4-20250514",
    openRouterModelId: "anthropic/claude-3.5-sonnet",
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
    id: "gemini",
    provider: "google",
    label: "Gemini 2.0 Flash",
    description: "Quick responses",
    directModelId: "gemini-2.0-flash",
    openRouterModelId: "google/gemini-2.0-flash-001",
  },
];

export const DEFAULT_MODEL_ID = CHAT_MODELS[0]!.id;
export const INTENT_MODEL_ID = "gemini";

export function getModelById(id: string): ModelOption | undefined {
  return CHAT_MODELS.find((m) => m.id === id);
}
