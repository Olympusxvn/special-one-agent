"use client";

import { useChat } from "@ai-sdk/react";
import {
  ConnectButton,
  useCurrentAccount,
  useSignPersonalMessage,
} from "@mysten/dapp-kit";
import { DefaultChatTransport } from "ai";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { LuxuryNav } from "@/components/luxury/LuxuryNav";
import { StadiumBackground } from "@/components/world-cup/StadiumBackground";
import { TeamFlag } from "@/components/world-cup/TeamFlag";
import {
  getModelById,
  LLM_PROVIDERS,
  pickModelForProviders,
  syncModelWithProviders,
  type LlmProvider,
} from "@/lib/ai/models";
import { isModelAvailableForUser } from "@/lib/ai/providers";
import type { ServerLlmCapabilities } from "@/lib/ai/server-llm";
import { detectIntent } from "@/lib/ai/intent";
import { buildAuthMessage } from "@/lib/auth/messages";
import { formatChatError } from "@/lib/chat/format-error";
import { mergeIntentIntoProfile } from "@/lib/memory/merge-intent";
import { mergeFanProfiles } from "@/lib/memory/merge-profiles";
import { computeToxicityLevel } from "@/lib/memory/toxicity";
import type { FanMemory } from "@/lib/memory/types";
import { emptyFanMemory } from "@/lib/memory/types";
import {
  cachedOrEmpty,
  loadCachedFanProfile,
  saveCachedFanProfile,
} from "@/lib/storage/fan-profile-cache";
import { getStoredLlmKeys } from "@/lib/storage/llm-keys";
import {
  clearStoredWalletAuth,
  getStoredWalletAuth,
  setStoredWalletAuth,
} from "@/lib/storage/wallet-auth";

import { MourinhoAvatar } from "./MourinhoAvatar";
import { DemoPromptChips } from "./DemoPromptChips";
import { JudgeDemoGuide, JudgeDemoGuideMobile } from "./JudgeDemoGuide";
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
  const [walrusMemories, setWalrusMemories] = useState<string[]>([]);
  const [recallStatus, setRecallStatus] = useState<{
    ok: boolean;
    error: string | null;
    hitCount: number;
  } | null>(null);
  const [walrusToast, setWalrusToast] = useState<string | null>(null);
  const walrusToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const prevChatStatus = useRef<string>("ready");
  const lastSentMessageRef = useRef<string | null>(null);
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

  const showWalrusBusyToast = useCallback(() => {
    setWalrusToast("Walrus is a bit busy, using cached memories…");
    if (walrusToastTimer.current) clearTimeout(walrusToastTimer.current);
    walrusToastTimer.current = setTimeout(() => setWalrusToast(null), 4_500);
  }, []);

  useEffect(() => {
    return () => {
      if (walrusToastTimer.current) clearTimeout(walrusToastTimer.current);
    };
  }, []);

  const applyRecallMeta = useCallback(
    (data: {
      recallOk?: boolean;
      recallError?: string | null;
      hitCount?: number;
      memories?: string[];
      fromCache?: boolean;
      rateLimited?: boolean;
    }) => {
      const hits = data.memories ?? [];
      setRecallStatus({
        ok: data.recallOk ?? hits.length > 0,
        error: data.recallError ?? null,
        hitCount: data.hitCount ?? hits.length,
      });
      if (data.rateLimited) {
        showWalrusBusyToast();
      }
    },
    [showWalrusBusyToast],
  );

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
      const body = JSON.stringify({
        walletAddress: account.address,
        authMessage: auth.message,
        authSignature: auth.signature,
        query: "favorite team supports football world cup predictions bad takes",
      });

      const [profileRes, notebookRes] = await Promise.all([
        fetch("/api/memory/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        }),
        fetch("/api/memory/notebook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        }),
      ]);

      const local =
        loadCachedFanProfile(account.address) ?? emptyFanMemory();
      let merged = local;

      if (notebookRes.ok) {
        const notebook = (await notebookRes.json()) as {
          memories: string[];
          profile: FanMemory;
          recallOk?: boolean;
          recallError?: string | null;
          hitCount?: number;
          fromCache?: boolean;
          rateLimited?: boolean;
        };
        setWalrusMemories(notebook.memories ?? []);
        applyRecallMeta(notebook);
        merged = mergeFanProfiles(merged, notebook.profile);
      }

      if (profileRes.ok) {
        const data = (await profileRes.json()) as { profile: FanMemory };
        merged = mergeFanProfiles(merged, data.profile);
      }

      setProfile(merged);
      saveCachedFanProfile(account.address, merged);
    } finally {
      setProfileLoading(false);
    }
  }, [account?.address, applyRecallMeta]);

  const commitToWalrus = useCallback(
    async (message: string) => {
      if (!account?.address || !message.trim()) return;
      const auth = getStoredWalletAuth();
      if (!auth?.message || !auth.signature) return;

      setCommitting(true);
      try {
        const res = await fetch("/api/memory/commit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: account.address,
            authMessage: auth.message,
            authSignature: auth.signature,
            message: message.trim(),
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as {
            profile: FanMemory;
            memories: string[];
            recallOk?: boolean;
            recallError?: string | null;
            hitCount?: number;
            fromCache?: boolean;
            rateLimited?: boolean;
          };
          setWalrusMemories(data.memories ?? []);
          applyRecallMeta(data);
          const local =
            loadCachedFanProfile(account.address) ?? emptyFanMemory();
          const merged = mergeFanProfiles(local, data.profile);
          setProfile(merged);
          saveCachedFanProfile(account.address, merged);
        }
      } finally {
        setCommitting(false);
      }
    },
    [account?.address, applyRecallMeta],
  );

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
      const cached = cachedOrEmpty(account.address);
      if (cached.favorite_team || cached.past_predictions.length > 0) {
        setProfile(cached);
      }
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
      const msg = lastSentMessageRef.current;
      if (msg) void commitToWalrus(msg);
      const t30 = setTimeout(() => void fetchProfile(), 30_000);
      prevChatStatus.current = status;
      return () => clearTimeout(t30);
    }
    prevChatStatus.current = status;
  }, [status, fetchProfile, commitToWalrus]);

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
        const local = account?.address
          ? (loadCachedFanProfile(account.address) ?? emptyFanMemory())
          : emptyFanMemory();
        const merged = mergeFanProfiles(local, data.profile);
        setProfile(merged);
        if (account?.address) {
          saveCachedFanProfile(account.address, merged);
        }
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
    const text = input.trim();
    if (!text || !canChat) return;
    const intent = detectIntent(text);
    if (intent.intent !== "banter" && account?.address) {
      setProfile((prev) => {
        const merged = mergeIntentIntoProfile(
          prev ?? cachedOrEmpty(account.address),
          intent,
        );
        saveCachedFanProfile(account.address, merged);
        return merged;
      });
    }
    lastSentMessageRef.current = text;
    void sendMessage({ text });
    setInput("");
  };

  const favoriteTeam =
    profile?.favorite_team ||
    walrusMemories
      .map((m) => m.match(/(?:Favorite team:|supports)\s*([A-Za-z][A-Za-z\s'-]+)/i)?.[1])
      .find(Boolean) ||
    null;

  if (!account) {
    return (
      <div className="relative flex min-h-screen flex-col overflow-hidden">
        <StadiumBackground />
        <LuxuryNav active="/chat" />

        <main className="relative z-10 flex flex-1 items-center justify-center px-5 py-12 sm:px-6">
          <div className="luxe-glass luxe-glass-strong w-full max-w-xl px-6 py-10 text-center sm:px-12 sm:py-14">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-4 -z-10 rounded-full bg-[radial-gradient(circle,var(--gold-glow),transparent_70%)] blur-xl" />
                <MourinhoAvatar size={84} />
              </div>
            </div>

            <p className="luxe-eyebrow mt-6">The Press Room · Members only</p>

            <h1 className="luxe-display mt-4 text-balance text-4xl sm:text-5xl">
              Connect your <span className="luxe-gold-text">Sui wallet</span>
            </h1>

            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted">
              The Special One only roasts verified fans. Connect your wallet to
              unlock Walrus Memory — your roasts and wrong predictions, stored
              on-chain forever.
            </p>

            <div className="mt-7 flex flex-col items-center gap-3">
              <div className="luxe-connect">
                <ConnectButton connectText="Connect Sui wallet" />
              </div>
              <p className="text-xs text-muted-foreground">
                A signature request will follow to verify ownership. No gas, no
                cost.
              </p>
            </div>

            <div className="mx-auto mt-8 flex max-w-sm flex-wrap items-center justify-center gap-2.5">
              <span
                className={`luxe-chip ${memWalLive ? "luxe-chip-gold" : ""}`}
              >
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                    memWalLive ? "bg-gold" : "bg-muted"
                  }`}
                />
                MemWal {memWalLive ? "live · mainnet" : "offline demo"}
              </span>
              <span className="luxe-chip">Sui wallet</span>
              <span className="luxe-chip">On-chain memory</span>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/schedules" className="btn-luxe-ghost">
                Schedules
              </Link>
              <Link href="/media" className="btn-luxe-ghost">
                World Cup Media
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <StadiumBackground />
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

      <div className="relative mx-auto grid w-full max-w-walrus flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(220px,260px)_1fr_minmax(260px,280px)]">
        <JudgeDemoGuideMobile
          memWalLive={memWalLive}
          onOpenSettings={() => setSettingsOpen(true)}
          onPickDemo={setInput}
          demoDisabled={!canChat || isLoading}
        />

        <div className="hidden lg:block">
          <JudgeDemoGuide
            memWalLive={memWalLive}
            onOpenSettings={() => setSettingsOpen(true)}
            onPickDemo={setInput}
            demoDisabled={!canChat || isLoading}
          />
        </div>

        <div className="luxe-glass flex min-h-[420px] flex-col">
          <div className="flex items-center gap-3 border-b border-[color:var(--glass-border)] px-5 py-4">
            <div className="min-w-0 flex-1">
              <p className="luxe-eyebrow">Press conference</p>
              <p className="walrus-caption truncate">
                Walrus remembers every wrong prediction
              </p>
            </div>
            {favoriteTeam && (
              <TeamFlag team={favoriteTeam} size="md" className="shrink-0" />
            )}
          </div>
          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            {messages.length === 0 && (
              <div className="border border-dashed border-border-subtle p-8 text-center">
                <p className="walrus-body mb-2 text-base">
                  Welcome to the press conference.
                </p>
                <p className="walrus-quote">
                  &quot;I am the Special One — you are especially deluded.&quot;
                </p>
                <p className="walrus-caption mt-4">
                  Declare your team, predict a score, or report a result.
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
                  favoriteTeam={favoriteTeam}
                  toxicityLevel={toxicityLevel}
                />
              );
            })}
            {isLoading && (
              <p className="walrus-caption animate-pulse">
                The Special One is preparing your roast…
              </p>
            )}
            {error && (
              <p className="walrus-card border-brand/30 px-4 py-3 text-caption text-foreground">
                {formatChatError(error)}
              </p>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-border-subtle p-5"
          >
            {!verified && (
              <p className="walrus-caption mb-3">
                {verifying ? "Signing wallet…" : "Verifying wallet signature…"}
              </p>
            )}
            {verified && !hasAnyLlmBackend && (
              <p className="walrus-caption mb-3">
                Open{" "}
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="text-brand-light underline hover:text-accent"
                >
                  Settings
                </button>{" "}
                and paste an API key.
              </p>
            )}
            {verified && hasAnyLlmBackend && !canUseModel(modelId) && (
              <p className="walrus-caption mb-3">
                Selected model needs a key in{" "}
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="text-brand-light underline hover:text-accent"
                >
                  Settings
                </button>
                .
              </p>
            )}
            <div className="flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  canChat
                    ? "Declare your team, predict a score…"
                    : verified
                      ? "Connect an LLM in Settings…"
                      : "Waiting for wallet verification…"
                }
                disabled={!canChat || isLoading}
                className="walrus-input flex-1 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!canChat || isLoading || !input.trim()}
                className="btn-walrus-accent shrink-0 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </div>

        <PredictionCard
          profile={profile}
          walrusMemories={walrusMemories}
          recallStatus={recallStatus}
          profileLoading={profileLoading || committing}
          memWalLive={memWalLive}
          walletAddress={account.address}
          toxicityLevel={toxicityLevel}
          onSync={handleSync}
          syncing={syncing}
        />
      </div>

      {walrusToast && (
        <div
          role="status"
          className="walrus-toast fixed bottom-6 left-1/2 z-50 max-w-sm -translate-x-1/2 px-5 py-4 text-center"
        >
          <p className="walrus-label mb-1">Walrus memory</p>
          <p className="walrus-caption text-foreground">{walrusToast}</p>
        </div>
      )}
    </div>
  );
}
