"use client";

import { CHAT_MODELS, type LlmProvider } from "@/lib/ai/models";

type ByokProvider = Exclude<LlmProvider, "gateway">;

export function ModelSelector({
  value,
  onChange,
  connectedProviders,
  hasGateway,
  hasServerByok,
}: {
  value: string;
  onChange: (id: string) => void;
  connectedProviders: ByokProvider[];
  hasGateway: boolean;
  /** Server operator BYOK env keys (not gateway) */
  hasServerByok: boolean;
}) {
  const canUse = (provider: LlmProvider) => {
    if (provider === "gateway") return hasGateway;
    return connectedProviders.includes(provider) || hasServerByok;
  };

  const anyAvailable =
    hasGateway || hasServerByok || connectedProviders.length > 0;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={!anyAvailable}
      title={
        !anyAvailable
          ? "Connect wallet — Claude Haiku is free on production"
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
            {m.provider === "gateway" && hasGateway ? " (free)" : ""}
            {!available ? " (BYOK)" : ""}
          </option>
        );
      })}
    </select>
  );
}
