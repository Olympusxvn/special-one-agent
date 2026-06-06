export interface ModelOption {
  id: string;
  label: string;
  description: string;
}

export const CHAT_MODELS: ModelOption[] = [
  {
    id: "anthropic/claude-3.5-sonnet",
    label: "Claude 3.5 Sonnet",
    description: "Best roast quality",
  },
  {
    id: "openai/gpt-4o-mini",
    label: "GPT-4o Mini",
    description: "Fast & cheap",
  },
  {
    id: "google/gemini-2.0-flash-001",
    label: "Gemini 2.0 Flash",
    description: "Quick responses",
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    label: "Llama 3.3 70B",
    description: "Open model",
  },
];

export const DEFAULT_MODEL_ID = CHAT_MODELS[0]!.id;
export const INTENT_MODEL_ID = "google/gemini-2.0-flash-001";
