import type { LlmProvider } from "./models";

export type ServerLlmCapabilities = {
  /** Providers with a direct API key in server env */
  providers: LlmProvider[];
  openRouter: boolean;
};

export function getServerLlmCapabilities(): ServerLlmCapabilities {
  const providers = (["anthropic", "openai", "google"] as const).filter((p) => {
    switch (p) {
      case "anthropic":
        return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
      case "openai":
        return Boolean(process.env.OPENAI_API_KEY?.trim());
      case "google":
        return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim());
    }
  });
  return {
    providers,
    openRouter: Boolean(process.env.OPENROUTER_API_KEY?.trim()),
  };
}
