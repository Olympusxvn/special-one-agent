"use client";

import type { FanMemory } from "@/lib/memory/types";

export function PredictionCard({
  profile,
  onSync,
  syncing,
}: {
  profile: FanMemory | null;
  onSync: () => void;
  syncing: boolean;
}) {
  const pending =
    profile?.past_predictions.filter((p) => p.result === null) ?? [];

  return (
    <aside className="rounded-xl border border-press-border bg-press-card p-4">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gold">
        Your Cope Ledger
      </h3>

      {profile?.favorite_team ? (
        <p className="mb-3 text-xs text-foreground/70">
          Team: <span className="text-gold">{profile.favorite_team}</span>
          {profile.flip_flop_count > 0 && (
            <span className="ml-2 text-roast">
              ({profile.flip_flop_count} flip-flops 🤡)
            </span>
          )}
        </p>
      ) : (
        <p className="mb-3 text-xs text-foreground/50">
          No team declared yet. Tell Mourinho who you support.
        </p>
      )}

      {pending.length === 0 ? (
        <p className="text-xs text-foreground/50">No pending predictions.</p>
      ) : (
        <ul className="mb-3 space-y-2">
          {pending.map((p, i) => (
            <li
              key={`${p.match}-${i}`}
              className="rounded-lg border border-press-border/80 bg-press/50 px-2 py-1.5 text-xs"
            >
              <span className="text-gold">{p.match}</span>
              <br />
              <span className="text-foreground/80">{p.prediction}</span>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={onSync}
        disabled={syncing}
        className="w-full rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-xs font-semibold text-gold transition hover:bg-gold/20 disabled:opacity-50"
      >
        {syncing ? "Syncing…" : "Check my predictions"}
      </button>
    </aside>
  );
}
