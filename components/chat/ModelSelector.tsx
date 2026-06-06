"use client";

import { CHAT_MODELS } from "@/lib/ai/models";

export function ModelSelector({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      title={
        disabled
          ? "Connect your OpenRouter key or use the server demo key to pick a model"
          : undefined
      }
      className="rounded-lg border border-press-border bg-press-card px-3 py-1.5 text-xs text-foreground focus:border-gold focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      aria-label="Select AI model"
    >
      {CHAT_MODELS.map((m) => (
        <option key={m.id} value={m.id}>
          {m.label}
        </option>
      ))}
    </select>
  );
}
