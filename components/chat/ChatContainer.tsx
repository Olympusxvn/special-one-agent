"use client";

import { useChat } from "@ai-sdk/react";
import { useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { WorldCupWatermark } from "@/components/world-cup/WorldCupWatermark";
import {
  getModelById,
  LLM_PROVIDERS,
  pickModelForProviders,
  syncModelWithProviders,
  type LlmProvider,
} from "@/lib/ai/models";
import { isModelAvailableForUser } from "@/lib/ai/providers";
import type { ServerLlmCapabilities } from "@/lib/ai/server-llm";
import { buildAuthMessage } from "@/lib/auth/messages";
import { formatChatError } from "@/lib/chat/format-error";
import { computeToxicityLevel } from "@/lib/memory/toxicity";
import type { FanMemory } from "@/lib/memory/types";
import { emptyFanMemory } from "@/lib/memory/types";
import { getStoredLlmKeys } from "@/lib/storage/llm-keys";
import {
  clearStoredWalletAuth,
  getStoredWalletAuth,
  setStoredWalletAuth,
} from "@/lib/storage/wallet-auth";

import { DemoPromptChips } from "./DemoPromptChips";
import { LlmSettingsModal } from "./LlmSettingsModal";
import { MessageBubble } from "./MessageBubble";
import { PredictionCard } from "./PredictionCard";
import { PressRoomHeader } from "./PressRoomHeader";

function buildLlmOptions(
  connected: LlmProvider[],
  serverLlm: ServerLlmCapabilities,
) {
  const keys = getStoredLlmKeys();
  return {
    hasOpenRouter: Boolean(keys.openrouter) || serverLlm.openRouter,
    serverProviders: serverLlm.providers,
    connected,
  };
}

export function ChatContainer({
  memWalLive,
  serverLlm,
}: {
  memWalLive: boolean;
  serverLlm: ServerLlmCapabilities;
}) {
  const account = useCurrentAccount();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [modelId, setModelId] = useState(() => {
    const connected = LLM_PROVIDERS.filter((p) => getStoredLlmKeys()[p.id]).map(
      (p) => p.id,
    );
    return pickModelForProviders(connected, buildLlmOptions(connected, serverLlm));
  });
  const [profile, setProfile] = useState<FanMemory | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const prevChatStatus = useRef<string>("ready");
  const [input, setInput] = useState("");
  const [connectedProviders, setConnectedProviders] = useState<LlmProvider[]>(
    [],
  );
  const [hasUserOpenRouter, setHasUserOpenRouter] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const modelIdRef = useRef(modelId);
  useEffect(() => {
    modelIdRef.current = modelId;
  }, [modelId]);

  const handleProvidersChange = useCallback(
    (providers: LlmProvider[]) => {
      const keys = getStoredLlmKeys();
      setConnectedProviders(providers);
      setHasUserOpenRouter(Boolean(keys.openrouter));
      const opts = buildLlmOptions(providers, serverLlm);
      setModelId((id) => syncModelWithProviders(id, providers, opts));
    },
    [serverLlm],
  );

  useEffect(() => {
    const keys = getStoredLlmKeys();
    handleProvidersChange(
      LLM_PROVIDERS.filter((p) => keys[p.id]).map((p) => p.id),
    );
  }, [handleProvidersChange]);

  const canUseModel = useCallback(
    (id: string) => {
      const model = getModelById(id);
      if (!model) return false;
      return isModelAvailableForUser(
        model,
        connectedProviders,
        serverLlm,
        hasUserOpenRouter,
      );
    },
    [connectedProviders, serverLlm, hasUserOpenRouter],
  );

  const hasAnyLlmBackend =
    connectedProviders.length > 0 ||
    serverLlm.providers.length > 0 ||
    serverLlm.openRouter ||
    hasUserOpenRouter;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages }) => {
          const keys = getStoredLlmKeys();
          const auth = getStoredWalletAuth();
          return {
            body: {
              walletAddress: account?.address,
              modelId: modelIdRef.current,
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
    [account?.address],
  );

  const { messages, sendMessage, status, error } = useChat({ transport });

  const fetchProfile = useCallback(async () => {
    if (!account?.address) return;
    const auth = getStoredWalletAuth();
    if (!auth?.message || !auth.signature) return;

    setProfileLoading(true);
    try {
      const res = await fetch("/api/memory/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: account.address,
          authMessage: auth.message,
          authSignature: auth.signature,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { profile: FanMemory };
        setProfile(data.profile);
      }
    } finally {
      setProfileLoading(false);
    }
  }, [account?.address]);

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

  useEffect(() => {
    if (verified && account?.address) {
      void fetchProfile();
    } else {
      setProfile(null);
    }
  }, [verified, account?.address, fetchProfile]);

  useEffect(() => {
    const wasStreaming =
      prevChatStatus.current === "streaming" ||
      prevChatStatus.current === "submitted";
    if (wasStreaming && status === "ready") {
      void fetchProfile();
      const retry = setTimeout(() => void fetchProfile(), 1500);
      prevChatStatus.current = status;
      return () => clearTimeout(retry);
    }
    prevChatStatus.current = status;
  }, [status, fetchProfile]);

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
  const canChat = verified && hasAnyLlmBackend && canUseModel(modelId);

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
        serverLlm={serverLlm}
        connectedProviders={connectedProviders}
        hasUserOpenRouter={hasUserOpenRouter}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <LlmSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        serverLlm={serverLlm}
        onKeysChange={handleProvidersChange}
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
                <DemoPromptChips
                  disabled={!canChat || isLoading}
                  onPick={setInput}
                />
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
              <p className="rounded-lg border border-roast/30 bg-roast/10 px-3 py-2 text-sm text-roast">
                {formatChatError(error)}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-gold/10 p-4">
            {!verified && (
              <p className="mb-2 text-xs text-pitch">
                {verifying ? "Signing wallet…" : "Verifying wallet signature…"}
              </p>
            )}
            {verified && !hasAnyLlmBackend && (
              <p className="mb-2 text-xs text-gold">
                Open{" "}
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="font-semibold text-pitch underline hover:text-gold"
                >
                  Settings
                </button>{" "}
                and paste a Gemini, ChatGPT, or Claude API key.
              </p>
            )}
            {verified && hasAnyLlmBackend && !canUseModel(modelId) && (
              <p className="mb-2 text-xs text-gold">
                Selected model needs a matching key in{" "}
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="font-semibold text-pitch underline hover:text-gold"
                >
                  Settings
                </button>
                , or pick another model.
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
                      ? "Connect an LLM in Settings…"
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

        <PredictionCard
          profile={profile}
          profileLoading={profileLoading}
          memWalLive={memWalLive}
          walletAddress={account.address}
          onSync={handleSync}
          syncing={syncing}
        />
      </div>
    </div>
  );
}
