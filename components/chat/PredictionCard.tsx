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
    <aside className="festive-card rounded-xl p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">📋</span>
        <h3 className="text-sm font-bold uppercase tracking-wider text-gold">
          Your Cope Ledger
        </h3>
      </div>

      {profile?.favorite_team ? (
        <p className="mb-3 text-xs text-foreground/70">
          Team: <span className="font-semibold text-pitch">{profile.favorite_team}</span>
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
              className="rounded-lg border border-pitch/20 bg-pitch/5 px-2 py-1.5 text-xs"
            >
              <span className="font-medium text-gold">{p.match}</span>
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
        className="btn-outline-festive w-full rounded-lg px-3 py-2 text-xs font-semibold text-gold disabled:opacity-50"
      >
        {syncing ? "Syncing…" : "Check my predictions"}
      </button>
    </aside>
  );
}
