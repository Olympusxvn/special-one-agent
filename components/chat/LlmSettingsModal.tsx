"use client";

import { useCallback, useEffect, useState } from "react";

import { LLM_PROVIDERS, type LlmProvider } from "@/lib/ai/models";
import type { ServerLlmCapabilities } from "@/lib/ai/server-llm";
import {
  clearStoredProviderKey,
  getStoredLlmKeys,
  getStoredProviderKey,
  maskApiKey,
  setStoredProviderKey,
} from "@/lib/storage/llm-keys";

export function LlmSettingsModal({
  open,
  onClose,
  serverLlm,
  onKeysChange,
}: {
  open: boolean;
  onClose: () => void;
  serverLlm: ServerLlmCapabilities;
  onKeysChange: (connected: LlmProvider[]) => void;
}) {
  const [activeTab, setActiveTab] = useState<LlmProvider>("google");
  const [drafts, setDrafts] = useState<Partial<Record<LlmProvider, string>>>({});
  const [connected, setConnected] = useState<LlmProvider[]>([]);

  const refresh = useCallback(() => {
    const keys = getStoredLlmKeys();
    const list = LLM_PROVIDERS.filter((p) => keys[p.id]).map((p) => p.id);
    setConnected(list);
    onKeysChange(list);
  }, [onKeysChange]);

  useEffect(() => {
    if (open) refresh();
  }, [open, refresh]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

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
      : serverLlm.providers.length > 0 || serverLlm.openRouter
        ? "Server demo keys active"
        : "Paste an API key below to start chatting";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-midnight/80 backdrop-blur-sm"
        aria-label="Close settings"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="llm-settings-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-gold/25 bg-press-card p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-pitch/80">
              Settings
            </p>
            <h2
              id="llm-settings-title"
              className="font-display text-2xl tracking-wide text-gold"
            >
              LLM Connection
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-press-border px-2.5 py-1 text-sm text-foreground/70 hover:border-gold/40 hover:text-foreground"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="mb-4 text-sm text-foreground/70">
          Paste an API key for the provider you want. After saving, the model
          dropdown switches to match (e.g. Gemini key → Gemini model). Keys stay
          in this browser tab only.
        </p>

        {activeTab === "google" && (
          <ol className="mb-4 list-decimal space-y-1 pl-4 text-xs text-foreground/60">
            <li>
              Open{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold underline"
              >
                Google AI Studio
              </a>{" "}
              (free tier)
            </li>
            <li>
              Click <strong>Create API key</strong>
            </li>
            <li>
              Paste <code className="text-foreground/80">AIza…</code> below →{" "}
              <strong>Save key</strong>
            </li>
          </ol>
        )}

        <div className="mb-4 flex gap-1">
          {LLM_PROVIDERS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActiveTab(p.id)}
              className={`flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition ${
                activeTab === p.id
                  ? "bg-gold/20 text-gold ring-1 ring-gold/40"
                  : "bg-press text-foreground/60 hover:text-foreground"
              }`}
            >
              {p.name}
              {connected.includes(p.id) ? " ✓" : ""}
            </button>
          ))}
        </div>

        <div className="mb-3 flex flex-wrap gap-3 text-xs">
          <a
            href={provider.loginUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pitch underline hover:text-gold"
          >
            Log in to {provider.name} →
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

        <p className="mb-2 text-xs text-foreground/50">{provider.keyHint}</p>

        <input
          type="password"
          value={draft}
          onChange={(e) =>
            setDrafts((d) => ({ ...d, [activeTab]: e.target.value }))
          }
          placeholder={provider.placeholder}
          autoComplete="off"
          className="chat-input mb-3 w-full rounded-xl px-4 py-3 text-sm"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!draft.trim()}
            className="btn-festive flex-1 rounded-xl px-4 py-2.5 text-sm font-bold disabled:opacity-50"
          >
            Save key
          </button>
          {storedKey && (
            <button
              type="button"
              onClick={handleDisconnect}
              className="rounded-xl border border-press-border px-4 py-2.5 text-sm text-foreground/70 hover:border-roast/50 hover:text-roast"
            >
              Disconnect
            </button>
          )}
        </div>

        {storedKey && (
          <p className="mt-3 text-xs text-pitch">
            {provider.name} key saved ({maskApiKey(storedKey)})
          </p>
        )}

        <p className="mt-4 rounded-lg border border-press-border/60 bg-press/50 px-3 py-2 text-xs text-foreground/60">
          {statusLabel}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="btn-outline-festive mt-4 w-full rounded-xl py-2.5 text-sm font-semibold text-gold"
        >
          Done
        </button>
      </div>
    </div>
  );
}
