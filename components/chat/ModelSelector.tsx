"use client";

import { CHAT_MODELS, type LlmProvider } from "@/lib/ai/models";

export function ModelSelector({
  value,
  onChange,
  connectedProviders,
  hasServerKey,
}: {
  value: string;
  onChange: (id: string) => void;
  connectedProviders: LlmProvider[];
  /** Server operator demo keys (e.g. OpenRouter on Vercel) */
  hasServerKey: boolean;
}) {
  const canUse = (provider: LlmProvider) =>
    connectedProviders.includes(provider) || hasServerKey;

  const anyAvailable = hasServerKey || connectedProviders.length > 0;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={!anyAvailable}
      title={
        !anyAvailable
          ? "Open Settings and connect Claude, ChatGPT, or Gemini"
          : undefined
      }
      className="rounded-lg border border-press-border bg-press-card px-3 py-1.5 text-xs text-foreground focus:border-gold focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      aria-label="Select AI model"
    >
      {CHAT_MODELS.map((m) => {
        const available = canUse(m.provider);
        return (
          <option key={m.id} value={m.id} disabled={!available}>
            {m.label}
            {!available ? " (connect first)" : ""}
          </option>
        );
      })}
    </select>
  );
}
