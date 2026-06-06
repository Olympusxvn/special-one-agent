"use client";

import { CHAT_MODELS } from "@/lib/ai/models";

export function ModelSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-press-border bg-press-card px-3 py-1.5 text-xs text-foreground focus:border-gold focus:outline-none"
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
