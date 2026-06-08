"use client";

import { useCallback, useEffect, useState } from "react";

import { LLM_PROVIDERS, type LlmProvider } from "@/lib/ai/models";
import {
  clearStoredProviderKey,
  getStoredLlmKeys,
  getStoredProviderKey,
  maskApiKey,
  setStoredProviderKey,
} from "@/lib/storage/llm-keys";

export function LlmProviderConnect({
  hasServerKey,
  onKeysChange,
}: {
  hasServerKey: boolean;
  onKeysChange: (connected: LlmProvider[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<LlmProvider>("anthropic");
  const [drafts, setDrafts] = useState<Partial<Record<LlmProvider, string>>>({});
  const [connected, setConnected] = useState<LlmProvider[]>([]);

  const refresh = useCallback(() => {
    const keys = getStoredLlmKeys();
    const list = LLM_PROVIDERS.filter((p) => keys[p.id]).map((p) => p.id);
    setConnected(list);
    onKeysChange(list);
  }, [onKeysChange]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const provider = LLM_PROVIDERS.find((p) => p.id === activeTab)!;
  const storedKey = getStoredProviderKey(activeTab);
  const draft = drafts[activeTab] ?? "";

  const handleSave = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setStoredProviderKey(activeTab, trimmed);
    setDrafts((d) => ({ ...d, [activeTab]: "" }));
    refresh();
  };

  const handleDisconnect = () => {
    clearStoredProviderKey(activeTab);
    refresh();
  };

  const statusLabel =
    connected.length > 0
      ? `Connected: ${connected.map((id) => LLM_PROVIDERS.find((p) => p.id === id)?.name).join(", ")}`
      : hasServerKey
        ? "Using server demo key"
        : "Connect an LLM account to chat";

  return (
    <div className="relative flex items-center gap-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="shrink-0 rounded-lg border border-press-border bg-press-card px-3 py-1.5 text-xs text-foreground transition hover:border-gold/50"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {connected.length > 0 ? "🔑 LLM connected" : hasServerKey ? "🔑 Demo key" : "🔑 Connect LLM"}
      </button>
      <p className="hidden max-w-[11rem] text-[10px] leading-tight text-foreground/45 sm:block">
        Key stays in this browser tab only (sessionStorage).
      </p>

      {open && (
        <div
          role="dialog"
          aria-label="Connect LLM provider"
          className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-press-border bg-press-card p-4 shadow-lg"
        >
          <p className="mb-2 text-xs font-semibold text-gold">
            Connect Claude, ChatGPT, or Gemini
          </p>
          <p className="mb-3 text-[11px] text-foreground/55">
            Log in to your web account, create an API key, paste below. Pick the
            matching model in the dropdown.
          </p>

          <div className="mb-3 flex gap-1">
            {LLM_PROVIDERS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setActiveTab(p.id)}
                className={`flex-1 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition ${
                  activeTab === p.id
                    ? "bg-gold/20 text-gold"
                    : "bg-press text-foreground/60 hover:text-foreground"
                }`}
              >
                {p.name}
                {connected.includes(p.id) ? " ✓" : ""}
              </button>
            ))}
          </div>

          <div className="mb-2 flex gap-2 text-[11px]">
            <a
              href={provider.loginUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pitch underline hover:text-gold"
            >
              Log in →
            </a>
            <a
              href={provider.keyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold underline hover:text-gold-bright"
            >
              Get API key →
            </a>
          </div>

          <p className="mb-2 text-[10px] text-foreground/45">{provider.keyHint}</p>

          <input
            type="password"
            value={draft}
            onChange={(e) =>
              setDrafts((d) => ({ ...d, [activeTab]: e.target.value }))
            }
            placeholder={provider.placeholder}
            autoComplete="off"
            className="chat-input mb-2 w-full rounded-lg px-3 py-2 text-xs"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!draft.trim()}
              className="flex-1 rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-midnight disabled:opacity-50"
            >
              Save key
            </button>
            {storedKey && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="rounded-lg border border-press-border px-3 py-1.5 text-xs text-foreground/70 hover:border-roast/50 hover:text-roast"
              >
                Disconnect
              </button>
            )}
          </div>

          {storedKey && (
            <p className="mt-2 text-[10px] text-pitch">
              {provider.name} key saved ({maskApiKey(storedKey)})
            </p>
          )}

          <p className="mt-3 text-[11px] text-foreground/60">{statusLabel}</p>
        </div>
      )}
    </div>
  );
}
