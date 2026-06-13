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
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        aria-label="Close settings"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="llm-settings-title"
        className="walrus-card relative z-10 w-full max-w-md p-6 shadow-elevated"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="walrus-label">Settings</p>
            <h2 id="llm-settings-title" className="walrus-heading mt-1 text-2xl">
              LLM Connection
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-walrus-primary px-2.5 py-1 text-sm"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="walrus-caption mb-4 text-foreground/70">
          Paste an API key for the provider you want. After saving, the model
          dropdown switches to match (e.g. Gemini key → Gemini model). Keys stay
          in this browser tab only.
        </p>

        {activeTab === "google" && (
          <ol className="mb-4 list-decimal space-y-1 pl-4 text-caption text-foreground/60">
            <li>
              Open{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-light underline hover:text-accent"
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
              className={`flex-1 rounded-pill px-2 py-2 text-caption font-medium transition ${
                activeTab === p.id
                  ? "border border-brand bg-brand/10 text-brand-light"
                  : "border border-transparent text-foreground/60 hover:text-foreground"
              }`}
            >
              {p.name}
              {connected.includes(p.id) ? " ✓" : ""}
            </button>
          ))}
        </div>

        <div className="mb-3 flex flex-wrap gap-3 text-caption">
          <a
            href={provider.loginUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-light underline hover:text-accent"
          >
            Log in to {provider.name} →
          </a>
          <a
            href={provider.keyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-light underline hover:text-accent"
          >
            Get API key →
          </a>
        </div>

        <p className="mb-2 text-caption text-foreground/50">{provider.keyHint}</p>

        <input
          type="password"
          value={draft}
          onChange={(e) =>
            setDrafts((d) => ({ ...d, [activeTab]: e.target.value }))
          }
          placeholder={provider.placeholder}
          autoComplete="off"
          className="walrus-input mb-3 w-full px-4 py-3 text-sm"
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!draft.trim()}
            className="btn-walrus-accent flex-1 px-4 py-2.5 text-sm disabled:opacity-50"
          >
            Save key
          </button>
          {storedKey && (
            <button
              type="button"
              onClick={handleDisconnect}
              className="btn-walrus-primary px-4 py-2.5 text-sm hover:text-roast"
            >
              Disconnect
            </button>
          )}
        </div>

        {storedKey && (
          <p className="mt-3 text-caption text-accent">
            {provider.name} key saved ({maskApiKey(storedKey)})
          </p>
        )}

        <p className="walrus-card mt-4 px-3 py-2 text-caption text-foreground/60">
          {statusLabel}
        </p>

        <button
          type="button"
          onClick={onClose}
          className="btn-walrus-primary mt-4 w-full py-2.5 text-sm"
        >
          Done
        </button>
      </div>
    </div>
  );
}
