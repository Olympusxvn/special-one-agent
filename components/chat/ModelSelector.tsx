"use client";

import {
  CHAT_MODELS,
  type LlmProvider,
  type ModelOption,
} from "@/lib/ai/models";
import { isModelAvailableForUser } from "@/lib/ai/providers";
import type { ServerLlmCapabilities } from "@/lib/ai/server-llm";

export function ModelSelector({
  value,
  onChange,
  connectedProviders,
  serverLlm,
  hasUserOpenRouter,
}: {
  value: string;
  onChange: (id: string) => void;
  connectedProviders: LlmProvider[];
  serverLlm: ServerLlmCapabilities;
  hasUserOpenRouter: boolean;
}) {
  const canUse = (model: ModelOption) =>
    isModelAvailableForUser(
      model,
      connectedProviders,
      serverLlm,
      hasUserOpenRouter,
    );

  const anyAvailable = CHAT_MODELS.some(canUse);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={!anyAvailable}
      title={
        !anyAvailable
          ? "Open Settings and connect Gemini, ChatGPT, or Claude"
          : undefined
      }
      className="rounded-lg border border-press-border bg-press-card px-3 py-1.5 text-xs text-foreground focus:border-gold focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      aria-label="Select AI model"
    >
      {CHAT_MODELS.map((m) => {
        const available = canUse(m);
        return (
          <option key={m.id} value={m.id} disabled={!available}>
            {m.label}
            {!available ? " (connect in Settings)" : ""}
          </option>
        );
      })}
    </select>
  );
}
