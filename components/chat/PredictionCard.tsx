"use client";

import {
  getPredictionOutcome,
  type PredictionOutcome,
} from "@/lib/memory/prediction-outcome";
import { AGENT_MEMORY_PREFIX } from "@/lib/memory/constants";
import type { FanMemory, Prediction } from "@/lib/memory/types";
import { TeamFlag } from "@/components/world-cup/TeamFlag";

import { RoastLevelBar } from "./RoastLevelBar";

const OUTCOME_STYLES: Record<
  PredictionOutcome,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "text-accent border-accent/30 bg-accent/5",
  },
  correct: {
    label: "Correct",
    className: "text-brand-light border-brand/30 bg-brand/5",
  },
  wrong: {
    label: "Wrong",
    className: "text-muted border-border bg-surface",
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

function PredictionRow({ p }: { p: Prediction }) {
  const outcome = getPredictionOutcome(p);
  const style = OUTCOME_STYLES[outcome];

  return (
    <li className="walrus-card px-3 py-3 text-caption">
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="font-medium text-foreground">{p.match}</span>
        <span
          className={`shrink-0 rounded-sm border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${style.className}`}
        >
          {style.label}
        </span>
      </div>
      <p className="text-foreground/90">
        <span className="text-muted">You said: </span>
        {p.prediction}
      </p>
      {p.result !== null && (
        <p className="mt-1 text-foreground/80">
          <span className="text-muted">Actual: </span>
          {p.result}
        </p>
      )}
      {p.createdAt && (
        <p className="mt-2 walrus-label">Walrus · {formatWhen(p.createdAt)}</p>
      )}
    </li>
  );
}

function teamFromMemories(memories: string[]): string | null {
  for (const line of memories) {
    const support = line.match(
      /(?:Favorite team:|User supports|I support)\s*([A-Za-z][A-Za-z\s'-]+?)(?:\.|,|!| in\b|$)/i,
    );
    if (support?.[1]) {
      const team = support[1].trim();
      if (team.length >= 3 && team.length <= 28) return team;
    }
  }
  return null;
}

export function PredictionCard({
  profile,
  walrusMemories = [],
  recallStatus,
  profileLoading,
  memWalLive,
  walletAddress,
  toxicityLevel = 1,
  onSync,
  syncing,
}: {
  profile: FanMemory | null;
  walrusMemories?: string[];
  recallStatus?: {
    ok: boolean;
    error: string | null;
    hitCount: number;
  } | null;
  profileLoading?: boolean;
  memWalLive?: boolean;
  walletAddress?: string;
  toxicityLevel?: number;
  onSync: () => void;
  syncing: boolean;
}) {
  const teamLabel =
    profile?.favorite_team || teamFromMemories(walrusMemories) || null;
  const pending =
    profile?.past_predictions.filter((p) => p.result === null) ?? [];
  const resolved = [...(profile?.past_predictions ?? [])]
    .filter((p) => p.result !== null)
    .reverse()
    .slice(0, 8);

  const namespace = walletAddress
    ? `${AGENT_MEMORY_PREFIX}-${walletAddress.toLowerCase().slice(0, 10)}…`
    : null;

  return (
    <aside className="flex max-h-[calc(100vh-8rem)] flex-col gap-4">
      <div className="walrus-card p-4">
        <p className="walrus-label mb-1">Walrus memory</p>
        <h3 className="walrus-heading text-base font-medium">Ledger</h3>
        <p className="walrus-caption mt-2">
          Per-wallet recall from MemWal — updates after each turn.
        </p>
      </div>

      <RoastLevelBar level={toxicityLevel} />

      {profileLoading && !teamLabel && pending.length === 0 && (
        <p className="walrus-caption animate-pulse px-1">Saving to Walrus…</p>
      )}

      {teamLabel ? (
        <div className="walrus-card flex items-center gap-4 p-4">
          <TeamFlag team={teamLabel} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="walrus-label">Your team</p>
            <p className="truncate text-base font-medium text-foreground">
              {teamLabel}
            </p>
            {profile && profile.flip_flop_count > 0 && (
              <p className="walrus-caption mt-1 text-brand-light">
                {profile.flip_flop_count} flip-flop
                {profile.flip_flop_count > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      ) : (
        !profileLoading && (
          <p className="walrus-caption border border-dashed border-border-subtle p-4 text-center">
            Tell Mourinho who you support.
          </p>
        )
      )}

      <section className="walrus-card p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h4 className="walrus-label">Recall</h4>
          {recallStatus && memWalLive && (
            <span
              className={`walrus-badge text-[10px] ${
                recallStatus.ok ? "walrus-badge-live" : ""
              }`}
            >
              {recallStatus.ok
                ? `${recallStatus.hitCount} hit${recallStatus.hitCount === 1 ? "" : "s"}`
                : "empty"}
            </span>
          )}
        </div>
        {walrusMemories.length > 0 ? (
          <ul className="max-h-32 space-y-2 overflow-y-auto">
            {walrusMemories.slice(0, 5).map((memory, index) => (
              <li
                key={`${index}-${memory.slice(0, 24)}`}
                className="border-l-2 border-brand/30 py-1 pl-3 text-caption leading-snug text-foreground/80"
              >
                {memory}
              </li>
            ))}
          </ul>
        ) : (
          !profileLoading &&
          memWalLive && (
            <p className="walrus-caption">
              {recallStatus?.error ?? "No memories yet — chat once, then refresh."}
            </p>
          )
        )}
      </section>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        <section>
          <h4 className="walrus-label mb-3 px-1">Open predictions</h4>
          {pending.length === 0 ? (
            <p className="walrus-caption px-1">None pending.</p>
          ) : (
            <ul className="space-y-2">
              {pending.map((p, i) => (
                <PredictionRow key={`pending-${i}`} p={p} />
              ))}
            </ul>
          )}
        </section>

        <section>
          <h4 className="walrus-label mb-3 px-1">History</h4>
          {resolved.length === 0 ? (
            <p className="walrus-caption px-1">
              Report results in chat to populate history.
            </p>
          ) : (
            <ul className="space-y-2">
              {resolved.map((p, i) => (
                <PredictionRow key={`resolved-${i}`} p={p} />
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="space-y-3 border-t border-border-subtle pt-4">
        {namespace && (
          <p className="walrus-caption break-all">
            <span className="text-muted">ns </span>
            {namespace}
            <span className="ml-1">{memWalLive ? "· live" : "· demo"}</span>
          </p>
        )}
        <button
          type="button"
          onClick={onSync}
          disabled={syncing || profileLoading}
          className="btn-walrus-primary w-full disabled:opacity-50"
        >
          {syncing
            ? "Syncing…"
            : profileLoading
              ? "Refreshing…"
              : "Sync results"}
        </button>
      </div>
    </aside>
  );
}
