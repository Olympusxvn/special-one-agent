"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import Link from "next/link";
import { useEffect, useState } from "react";

import { TeamFlag } from "@/components/world-cup/TeamFlag";
import type { WorldCupMatch } from "@/lib/api/worldcup";
import type { ConfidenceLevel } from "@/lib/memory/types";
import { getStoredWalletAuth } from "@/lib/storage/wallet-auth";

type SubmitState = "idle" | "saving" | "done" | "error";

const CONFIDENCE: { id: ConfidenceLevel; label: string }[] = [
  { id: "low", label: "Maybe" },
  { id: "medium", label: "Confident" },
  { id: "high", label: "Lock it in" },
];

function Stepper({
  label,
  code,
  value,
  onChange,
}: {
  label: string;
  code: string | null;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="max-w-[7rem] truncate text-center text-sm font-semibold text-foreground">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(Math.max(0, value - 1))}
          className="luxe-stepper-btn"
        >
          −
        </button>
        <span className="luxe-display w-10 text-center text-4xl tabular-nums">
          {value}
        </span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(Math.min(20, value + 1))}
          className="luxe-stepper-btn"
        >
          +
        </button>
      </div>
      {code && (
        <span className="rounded-md border border-[color:var(--glass-border)] px-1.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-muted">
          {code}
        </span>
      )}
    </div>
  );
}

/**
 * "Make Prediction" modal. Picks a scoreline + confidence and writes it
 * straight to Walrus Memory via /api/memory/commit (the same persist path the
 * chat uses). Requires a connected + verified Sui wallet.
 */
export function PredictionModal({
  match,
  onClose,
  onSaved,
}: {
  match: WorldCupMatch | null;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const account = useCurrentAccount();
  const [home, setHome] = useState(1);
  const [away, setAway] = useState(1);
  const [confidence, setConfidence] = useState<ConfidenceLevel>("medium");
  const [state, setState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset whenever a new match opens.
  useEffect(() => {
    if (match) {
      setHome(1);
      setAway(1);
      setConfidence("medium");
      setState("idle");
      setErrorMsg(null);
    }
  }, [match]);

  // Close on Escape.
  useEffect(() => {
    if (!match) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [match, onClose]);

  if (!match) return null;

  const auth = getStoredWalletAuth();
  const verified =
    Boolean(account?.address) &&
    auth?.walletAddress?.toLowerCase() === account?.address?.toLowerCase();

  const confidenceWord =
    confidence === "high"
      ? "I'm 100% sure"
      : confidence === "low"
        ? "maybe"
        : "I think";

  async function submit() {
    if (!account?.address || !auth) return;
    setState("saving");
    setErrorMsg(null);
    // Phrase it so the intent parser tags it as a prediction.
    const message = `I predict ${match!.home.name} ${home}-${away} ${match!.away.name}. ${confidenceWord} about this World Cup 2026 result.`;
    try {
      const res = await fetch("/api/memory/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: account.address,
          authMessage: auth.message,
          authSignature: auth.signature,
          message,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? `Request failed (${res.status})`);
      }
      setState("done");
      onSaved?.();
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Make a prediction"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div className="luxe-glass luxe-glass-strong relative z-10 w-full max-w-md animate-fade-in p-6 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-muted transition hover:text-foreground"
        >
          ✕
        </button>

        <p className="luxe-eyebrow text-center">Make your prediction</p>
        <p className="mt-1 text-center text-xs text-muted">
          {match.group ?? match.stage}
        </p>

        {/* Teams */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <TeamFlag
            team={match.home.name}
            code={match.home.code ?? undefined}
            size="lg"
            variant="logo-glass"
          />
          <span className="luxe-display text-lg text-muted">vs</span>
          <TeamFlag
            team={match.away.name}
            code={match.away.code ?? undefined}
            size="lg"
            variant="logo-glass"
          />
        </div>

        {state === "done" ? (
          <div className="mt-6 text-center">
            <p className="luxe-display text-2xl">
              {match.home.name}{" "}
              <span className="luxe-gold-text">
                {home}-{away}
              </span>{" "}
              {match.away.name}
            </p>
            <p className="mt-3 text-sm text-muted">
              Saved to Walrus Memory on-chain. The Special One will remember
              this — especially if you&apos;re wrong.
            </p>
            <button type="button" onClick={onClose} className="btn-luxe mt-6">
              Done
            </button>
          </div>
        ) : !verified ? (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              Connect and verify your Sui wallet in the Press Room to save
              predictions to Walrus Memory.
            </p>
            <Link href="/chat" className="btn-luxe mt-6 inline-flex">
              Go to Press Room
            </Link>
          </div>
        ) : (
          <>
            {/* Score steppers */}
            <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-start gap-2">
              <Stepper
                label={match.home.name}
                code={match.home.code}
                value={home}
                onChange={setHome}
              />
              <span className="luxe-display pt-9 text-2xl text-muted">-</span>
              <Stepper
                label={match.away.name}
                code={match.away.code}
                value={away}
                onChange={setAway}
              />
            </div>

            {/* Confidence */}
            <div className="mt-6">
              <p className="mb-2 text-center text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-muted">
                Confidence
              </p>
              <div className="flex justify-center gap-2">
                {CONFIDENCE.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setConfidence(c.id)}
                    className={`luxe-navlink ${
                      confidence === c.id ? "luxe-navlink-active" : ""
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {state === "error" && (
              <p className="mt-4 text-center text-xs text-red-400">
                {errorMsg}
              </p>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={state === "saving"}
              className="btn-luxe mt-7 w-full disabled:opacity-60"
            >
              {state === "saving"
                ? "Saving to Walrus…"
                : "Lock in prediction"}
            </button>
            <p className="mt-3 text-center text-[0.7rem] text-muted-foreground">
              Stored on-chain via Walrus Memory. No gas.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
