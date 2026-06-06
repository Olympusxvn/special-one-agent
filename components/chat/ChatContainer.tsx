"use client";

import { useChat } from "@ai-sdk/react";
import { useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useMemo, useState } from "react";

import { DEFAULT_MODEL_ID } from "@/lib/ai/models";
import { buildAuthMessage } from "@/lib/auth/messages";
import type { FanMemory } from "@/lib/memory/types";
import { computeToxicityLevel } from "@/lib/memory/toxicity";
import { emptyFanMemory } from "@/lib/memory/types";

import { MessageBubble } from "./MessageBubble";
import { PredictionCard } from "./PredictionCard";
import { PressRoomHeader } from "./PressRoomHeader";

export function ChatContainer({ memWalLive }: { memWalLive: boolean }) {
  const account = useCurrentAccount();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
  const [profile, setProfile] = useState<FanMemory | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [input, setInput] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: {
          walletAddress: account?.address,
          modelId,
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
      if (res.ok) setVerified(true);
    } finally {
      setVerifying(false);
    }
  }, [account?.address, signPersonalMessage]);

  useEffect(() => {
    setVerified(false);
    if (account?.address) {
      void verifyWallet();
    }
  }, [account?.address, verifyWallet]);

  const handleSync = async () => {
    if (!account?.address) return;
    setSyncing(true);
    try {
      const res = await fetch("/api/matches/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: account.address }),
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !verified) return;
    void sendMessage({ text: input.trim() });
    setInput("");
  };

  if (!account) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <h2 className="text-2xl font-black text-gold">Connect Your Wallet</h2>
        <p className="max-w-md text-sm text-foreground/70">
          The Special One only roasts verified fans. Connect your Sui wallet to
          unlock Walrus Memory and enter the press room.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PressRoomHeader
        toxicityLevel={toxicityLevel}
        modelId={modelId}
        onModelChange={setModelId}
        memWalLive={memWalLive}
      />

      <div className="mx-auto grid w-full max-w-6xl flex-1 gap-4 p-4 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col rounded-xl border border-press-border bg-press-card">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="rounded-xl border border-dashed border-gold/30 p-6 text-center text-sm text-foreground/60">
                <p className="mb-2 font-semibold text-gold">
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
              <p className="animate-pulse text-sm text-gold/70">
                The Special One is preparing your roast… 🔥
              </p>
            )}
            {error && (
              <p className="text-sm text-roast">
                {error.message || "Something went wrong."}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-press-border p-4">
            {!verified && (
              <p className="mb-2 text-xs text-gold">
                {verifying ? "Signing wallet…" : "Verifying wallet signature…"}
              </p>
            )}
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  verified
                    ? "Declare your team, predict a score, or cope…"
                    : "Waiting for wallet verification…"
                }
                disabled={!verified || isLoading}
                className="flex-1 rounded-xl border border-press-border bg-press px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-gold focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!verified || isLoading || !input.trim()}
                className="rounded-xl bg-gold px-5 py-3 text-sm font-bold text-press transition hover:bg-gold/90 disabled:opacity-50"
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
