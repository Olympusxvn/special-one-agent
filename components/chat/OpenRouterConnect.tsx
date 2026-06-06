"use client";

import { useCallback, useEffect, useState } from "react";

import {
  clearStoredOpenRouterKey,
  getStoredOpenRouterKey,
  maskApiKey,
  setStoredOpenRouterKey,
} from "@/lib/storage/openrouter-key";

export function OpenRouterConnect({
  hasServerKey,
  onKeyChange,
}: {
  hasServerKey: boolean;
  onKeyChange: (key: string | null) => void;
}) {
  const [draft, setDraft] = useState("");
  const [connectedKey, setConnectedKey] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = getStoredOpenRouterKey();
    setConnectedKey(stored);
    onKeyChange(stored);
  }, [onKeyChange]);

  const handleSave = useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setStoredOpenRouterKey(trimmed);
    setConnectedKey(trimmed);
    setDraft("");
    onKeyChange(trimmed);
    setOpen(false);
  }, [draft, onKeyChange]);

  const handleDisconnect = useCallback(() => {
    clearStoredOpenRouterKey();
    setConnectedKey(null);
    setDraft("");
    onKeyChange(null);
  }, [onKeyChange]);

  const statusLabel = connectedKey
    ? `Connected (${maskApiKey(connectedKey)})`
    : hasServerKey
      ? "Using server demo key"
      : "No key — connect to chat";

  const safetyNote =
    "An toàn đủ cho Walrus Sessions demo — key stays in your browser session only.";

  return (
    <div className="relative flex items-center gap-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="shrink-0 rounded-lg border border-press-border bg-press-card px-3 py-1.5 text-xs text-foreground transition hover:border-gold/50"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {connectedKey ? "🔑 Your key" : hasServerKey ? "🔑 Demo key" : "🔑 Connect"}
      </button>
      <p className="hidden max-w-[10rem] text-[10px] leading-tight text-foreground/45 sm:block">
        {safetyNote}
      </p>

      {open && (
        <div
          role="dialog"
          aria-label="OpenRouter connection"
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-press-border bg-press-card p-4 shadow-lg"
        >
          <p className="mb-3 text-xs font-semibold text-gold">
            Connect your OpenRouter account to pick your roast engine
          </p>

          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-3 block text-xs text-gold underline underline-offset-2 hover:text-gold/80"
          >
            Get key at OpenRouter →
          </a>

          <p className="mb-2 text-[11px] text-foreground/50">
            Log in at openrouter.ai, copy your API key, paste below. Stored in
            this tab only (sessionStorage).
          </p>

          <input
            type="password"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="sk-or-…"
            autoComplete="off"
            className="mb-2 w-full rounded-lg border border-press-border bg-press px-3 py-2 text-xs text-foreground placeholder:text-foreground/40 focus:border-gold focus:outline-none"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!draft.trim()}
              className="flex-1 rounded-lg bg-gold px-3 py-1.5 text-xs font-bold text-press disabled:opacity-50"
            >
              Save
            </button>
            {connectedKey && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="rounded-lg border border-press-border px-3 py-1.5 text-xs text-foreground/70 hover:border-roast/50 hover:text-roast"
              >
                Disconnect
              </button>
            )}
          </div>

          <p className="mt-3 text-[11px] text-foreground/60">{statusLabel}</p>

          <p className="mt-2 text-[10px] leading-tight text-foreground/45">
            {safetyNote}
          </p>
        </div>
      )}
    </div>
  );
}
