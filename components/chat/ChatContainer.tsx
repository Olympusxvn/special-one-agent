"use client";

import { useChat } from "@ai-sdk/react";
import { useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useMemo, useState } from "react";

import { WorldCupWatermark } from "@/components/world-cup/WorldCupWatermark";
import {
  CHAT_MODELS,
  DEFAULT_MODEL_ID,
  getModelById,
  LLM_PROVIDERS,
  type LlmProvider,
} from "@/lib/ai/models";
import { buildAuthMessage } from "@/lib/auth/messages";
import { computeToxicityLevel } from "@/lib/memory/toxicity";
import type { FanMemory } from "@/lib/memory/types";
import { emptyFanMemory } from "@/lib/memory/types";
import { getStoredLlmKeys } from "@/lib/storage/llm-keys";
import {
  clearStoredWalletAuth,
  getStoredWalletAuth,
  setStoredWalletAuth,
} from "@/lib/storage/wallet-auth";

import { LlmSettingsModal } from "./LlmSettingsModal";
import { MessageBubble } from "./MessageBubble";
import { PredictionCard } from "./PredictionCard";
import { PressRoomHeader } from "./PressRoomHeader";

export function ChatContainer({
  memWalLive,
  hasServerLlmKey,
}: {
  memWalLive: boolean;
  hasServerLlmKey: boolean;
}) {
  const account = useCurrentAccount();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
  const [profile, setProfile] = useState<FanMemory | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [input, setInput] = useState("");
  const [connectedProviders, setConnectedProviders] = useState<LlmProvider[]>(
    [],
  );
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const keys = getStoredLlmKeys();
    setConnectedProviders(
      LLM_PROVIDERS.filter((p) => keys[p.id]).map((p) => p.id),
    );
  }, []);

  const canUseModel = useCallback(
    (id: string) => {
      const model = getModelById(id);
      if (!model) return false;
      return (
        connectedProviders.includes(model.provider) || hasServerLlmKey
      );
    },
    [connectedProviders, hasServerLlmKey],
  );

  useEffect(() => {
    if (canUseModel(modelId)) return;
    const fallback = CHAT_MODELS.find((m) => canUseModel(m.id));
    if (fallback) setModelId(fallback.id);
  }, [modelId, canUseModel]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: {
          walletAddress: account?.address,
          modelId,
        },
        prepareSendMessagesRequest: ({ body, messages }) => {
          const keys = getStoredLlmKeys();
          const auth = getStoredWalletAuth();
          return {
            body: {
              ...body,
              messages,
              llmKeys: {
                ...(keys.anthropic ? { anthropic: keys.anthropic } : {}),
                ...(keys.openai ? { openai: keys.openai } : {}),
                ...(keys.google ? { google: keys.google } : {}),
                ...(keys.openrouter ? { openrouter: keys.openrouter } : {}),
              },
              ...(auth?.message && auth.signature
                ? {
                    authMessage: auth.message,
                    authSignature: auth.signature,
                  }
                : {}),
            },
          };
        },
      }),
    [account?.address, modelId],
  );

  const { messages, sendMessage, status, error } = useChat({ transport });

  const verifyWallet = useCallback(async () => {
    if (!account?.address) return;
    setVerifying(true);
    try {
      const message = buildAuthMessage(account.address);
      const { signature } = await signPersonalMessage({
        message: new TextEncoder().encode(message),
      });
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: account.address,
          message,
          signature,
        }),
      });
      if (res.ok) {
        setStoredWalletAuth({
          walletAddress: account.address,
          message,
          signature,
        });
        setVerified(true);
      } else {
        setVerified(false);
        clearStoredWalletAuth();
      }
    } catch {
      setVerified(false);
      clearStoredWalletAuth();
    } finally {
      setVerifying(false);
    }
  }, [account?.address, signPersonalMessage]);

  useEffect(() => {
    if (!account?.address) {
      setVerified(false);
      return;
    }

    const stored = getStoredWalletAuth();
    if (
      stored?.walletAddress.toLowerCase() === account.address.toLowerCase()
    ) {
      setVerified(true);
      return;
    }

    clearStoredWalletAuth();
    setVerified(false);
    void verifyWallet();
  }, [account?.address, verifyWallet]);

  const handleSync = async () => {
    if (!account?.address) return;
    setSyncing(true);
    try {
      const auth = getStoredWalletAuth();
      const res = await fetch("/api/matches/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: account.address,
          authMessage: auth?.message,
          authSignature: auth?.signature,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { profile: FanMemory };
        setProfile(data.profile);
      }
    } finally {
      setSyncing(false);
    }
  };

  const toxicityLevel = computeToxicityLevel(profile ?? emptyFanMemory());
  const isLoading = status === "streaming" || status === "submitted";
  const canChat =
    verified &&
    (hasServerLlmKey || connectedProviders.length > 0) &&
    canUseModel(modelId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !canChat) return;
    void sendMessage({ text: input.trim() });
    setInput("");
  };

  if (!account) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="pitch-accent-bar fixed inset-x-0 top-0" />
        <div className="relative">
          <div className="absolute -inset-6 rounded-full bg-gold/10 blur-2xl" />
          <span className="relative text-5xl">🔐</span>
        </div>
        <h2 className="font-display text-3xl tracking-wide">
          <span className="gradient-text-gold">Connect Your Wallet</span>
        </h2>
        <p className="max-w-md text-sm text-foreground/70">
          The Special One only roasts verified fans. Connect your Sui wallet to
          unlock Walrus Memory and enter the press room.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <WorldCupWatermark />
      <PressRoomHeader
        toxicityLevel={toxicityLevel}
        modelId={modelId}
        onModelChange={setModelId}
        memWalLive={memWalLive}
        hasServerLlmKey={hasServerLlmKey}
        connectedProviders={connectedProviders}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <LlmSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        hasServerKey={hasServerLlmKey}
        onKeysChange={setConnectedProviders}
      />

      <div className="relative mx-auto grid w-full max-w-6xl flex-1 gap-4 p-4 lg:grid-cols-[1fr_280px]">
        <div className="festive-card flex flex-col rounded-xl">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="rounded-xl border border-dashed border-gold/30 bg-gold/5 p-6 text-center text-sm text-foreground/60">
                <p className="mb-2 font-display text-lg tracking-wide text-gold">
                  Welcome to the press conference, little supporter.
                </p>
                <p>
                  Tell me your team, make a World Cup prediction, or report a
                  result — I remember everything. 🤡
                </p>
              </div>
            )}
            {messages.map((m) => {
              const text =
                m.parts
                  ?.filter((p) => p.type === "text")
                  .map((p) => (p.type === "text" ? p.text : ""))
                  .join("") ?? "";
              if (!text) return null;
              return (
                <MessageBubble
                  key={m.id}
                  role={m.role === "user" ? "user" : "assistant"}
                  content={text}
                />
              );
            })}
            {isLoading && (
              <p className="animate-pulse text-sm text-pitch">
                The Special One is preparing your roast… 🔥
              </p>
            )}
            {error && (
              <p className="text-sm text-roast">
                {error.message || "Something went wrong."}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-gold/10 p-4">
            {!verified && (
              <p className="mb-2 text-xs text-pitch">
                {verifying ? "Signing wallet…" : "Verifying wallet signature…"}
              </p>
            )}
            {verified &&
              !hasServerLlmKey &&
              connectedProviders.length === 0 && (
                <p className="mb-2 text-xs text-gold">
                  Open{" "}
                  <button
                    type="button"
                    onClick={() => setSettingsOpen(true)}
                    className="font-semibold text-pitch underline hover:text-gold"
                  >
                    Settings
                  </button>{" "}
                  to connect Claude, ChatGPT, or Gemini.
                </p>
              )}
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  canChat
                    ? "Declare your team, predict a score, or cope…"
                    : verified
                      ? "Open Settings to connect an LLM…"
                      : "Waiting for wallet verification…"
                }
                disabled={!canChat || isLoading}
                className="chat-input flex-1 rounded-xl px-4 py-3 text-sm disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!canChat || isLoading || !input.trim()}
                className="btn-festive rounded-xl px-5 py-3 text-sm font-bold disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </div>

        <PredictionCard profile={profile} onSync={handleSync} syncing={syncing} />
      </div>
    </div>
  );
}
