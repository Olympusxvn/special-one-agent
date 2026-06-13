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
      className="walrus-input min-h-0 rounded-pill border-border-subtle bg-transparent px-3 py-2 text-caption text-foreground focus:border-brand disabled:cursor-not-allowed disabled:opacity-50"
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
