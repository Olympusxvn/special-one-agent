"use client";

import {
  getPredictionOutcome,
  type PredictionOutcome,
} from "@/lib/memory/prediction-outcome";
import type { FanMemory, Prediction } from "@/lib/memory/types";

const OUTCOME_STYLES: Record<
  PredictionOutcome,
  { label: string; className: string }
> = {
  pending: {
    label: "PENDING",
    className: "border-pitch/30 bg-pitch/10 text-pitch",
  },
  correct: {
    label: "CORRECT",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  },
  wrong: {
    label: "WRONG",
    className: "border-roast/40 bg-roast/10 text-roast",
  },
};

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function PredictionRow({ p, index }: { p: Prediction; index: number }) {
  const outcome = getPredictionOutcome(p);
  const style = OUTCOME_STYLES[outcome];

  return (
    <li
      key={`${p.match}-${p.createdAt}-${index}`}
      className="rounded-lg border border-gold/10 bg-background/40 px-2.5 py-2 text-xs"
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <span className="font-medium leading-snug text-gold">{p.match}</span>
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide ${style.className}`}
        >
          {style.label}
        </span>
      </div>
      <p className="text-foreground/80">
        <span className="text-foreground/50">You said: </span>
        {p.prediction}
      </p>
      {p.result !== null && (
        <p className="mt-0.5 text-foreground/70">
          <span className="text-foreground/50">Actual: </span>
          {p.result}
        </p>
      )}
      {p.createdAt && (
        <p className="mt-1 text-[10px] text-foreground/40">
          Saved {formatWhen(p.createdAt)} · Walrus
        </p>
      )}
    </li>
  );
}

export function PredictionCard({
  profile,
  profileLoading,
  memWalLive,
  walletAddress,
  onSync,
  syncing,
}: {
  profile: FanMemory | null;
  profileLoading?: boolean;
  memWalLive?: boolean;
  walletAddress?: string;
  onSync: () => void;
  syncing: boolean;
}) {
  const pending =
    profile?.past_predictions.filter((p) => p.result === null) ?? [];
  const resolved = [...(profile?.past_predictions ?? [])]
    .filter((p) => p.result !== null)
    .reverse()
    .slice(0, 8);

  const namespace = walletAddress
    ? `special-one-${walletAddress.toLowerCase().slice(0, 10)}…`
    : null;

  return (
    <aside className="festive-card flex max-h-[calc(100vh-8rem)] flex-col rounded-xl p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-lg">📋</span>
        <h3 className="text-sm font-bold uppercase tracking-wider text-gold">
          Walrus Memory Ledger
        </h3>
      </div>

      <p className="mb-3 text-[10px] leading-relaxed text-foreground/45">
        Prediction history loaded from MemWal per wallet — updates after each
        chat turn and on refresh.
      </p>

      {profileLoading && !profile?.favorite_team && pending.length === 0 && (
        <p className="mb-3 animate-pulse text-xs text-foreground/50">
          Loading your Walrus record…
        </p>
      )}

      {profile?.favorite_team ? (
        <div className="mb-3 rounded-lg border border-gold/15 bg-gold/5 px-2.5 py-2 text-xs">
          <p className="text-foreground/70">
            Team:{" "}
            <span className="font-semibold text-pitch">
              {profile.favorite_team}
            </span>
          </p>
          {profile.flip_flop_count > 0 && (
            <p className="mt-0.5 text-roast">
              {profile.flip_flop_count} bandwagon flip-flop
              {profile.flip_flop_count > 1 ? "s" : ""} 🤡
            </p>
          )}
          <p className="mt-0.5 text-foreground/50">
            Confidence: {profile.confidence_level}
          </p>
        </div>
      ) : (
        !profileLoading && (
          <p className="mb-3 text-xs text-foreground/50">
            No team yet — tell the Special One who you support.
          </p>
        )
      )}

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        <section>
          <h4 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-foreground/45">
            Open predictions
          </h4>
          {pending.length === 0 ? (
            <p className="text-xs text-foreground/45">None pending.</p>
          ) : (
            <ul className="space-y-2">
              {pending.map((p, i) => (
                <PredictionRow key={`pending-${i}`} p={p} index={i} />
              ))}
            </ul>
          )}
        </section>

        <section>
          <h4 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-foreground/45">
            Resolved history
          </h4>
          {resolved.length === 0 ? (
            <p className="text-xs text-foreground/45">
              Report a result in chat (e.g. &quot;Argentina beat Brazil 1-0&quot;)
              or use sync below.
            </p>
          ) : (
            <ul className="space-y-2">
              {resolved.map((p, i) => (
                <PredictionRow key={`resolved-${i}`} p={p} index={i} />
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-3 space-y-2 border-t border-gold/10 pt-3">
        {namespace && (
          <p className="text-[10px] text-foreground/40">
            Namespace:{" "}
            <code className="text-foreground/55">{namespace}</code>
            {memWalLive ? " · 🟢 mainnet" : " · ⚪ offline"}
          </p>
        )}
        <button
          type="button"
          onClick={onSync}
          disabled={syncing || profileLoading}
          className="btn-outline-festive w-full rounded-lg px-3 py-2 text-xs font-semibold text-gold disabled:opacity-50"
        >
          {syncing
            ? "Syncing results…"
            : profileLoading
              ? "Refreshing ledger…"
              : "Sync pending results"}
        </button>
      </div>
    </aside>
  );
}
