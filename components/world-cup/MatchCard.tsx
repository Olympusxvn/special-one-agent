"use client";

import { TeamFlag } from "@/components/world-cup/TeamFlag";
import type { WorldCupMatch } from "@/lib/api/worldcup";

function kickoffUtc(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    hour12: false,
  });
}

function CodeBadge({ code }: { code: string | null }) {
  if (!code) return null;
  return (
    <span className="hidden rounded-md border border-[color:var(--glass-border)] bg-black/20 px-1.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-muted sm:inline">
      {code}
    </span>
  );
}

function StatusPill({ match }: { match: WorldCupMatch }) {
  if (match.status === "live") {
    return (
      <span className="luxe-live-pill">
        <span className="luxe-live-dot" />
        LIVE{match.minute != null ? ` ${match.minute}'` : ""}
      </span>
    );
  }
  if (match.status === "finished") {
    return (
      <span className="rounded-full bg-[color:var(--gold-glow)] px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-widest text-[color:var(--text-gold)]">
        Full time
      </span>
    );
  }
  return (
    <span className="rounded-full border border-[color:var(--glass-border)] px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-widest text-accent">
      Upcoming
    </span>
  );
}

/**
 * Premium match card for WorldCupMatch. Flags + 2-letter code badges, large
 * scoreline / VS, UTC kickoff, venue, group, live pulse, favorite highlight,
 * and a hover lift. Whole card is a button when `onSelect` is provided so it
 * opens the prediction modal.
 */
export function MatchCard({
  match,
  isFavorite = false,
  onSelect,
}: {
  match: WorldCupMatch;
  isFavorite?: boolean;
  onSelect?: (match: WorldCupMatch) => void;
}) {
  const finished = match.status === "finished";
  const live = match.status === "live";
  const hasScore =
    (finished || live) &&
    typeof match.homeScore === "number" &&
    typeof match.awayScore === "number";
  const homeWin = hasScore && match.homeScore! > match.awayScore!;
  const awayWin = hasScore && match.awayScore! > match.homeScore!;

  const interactive = Boolean(onSelect);

  const inner = (
    <>
      {/* Meta row */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-muted">
          {match.group ?? match.stage}
          {isFavorite && (
            <span className="ml-2 text-[color:var(--text-gold)]">★ Your team</span>
          )}
        </span>
        <StatusPill match={match} />
      </div>

      {/* Teams + score */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
        {/* Home */}
        <div className="flex items-center justify-end gap-2 text-right sm:gap-3">
          <span
            className={`truncate text-sm font-semibold sm:text-lg ${
              awayWin ? "text-muted" : "text-foreground"
            }`}
          >
            {match.home.name}
          </span>
          <CodeBadge code={match.home.code} />
          <TeamFlag
            team={match.home.name}
            code={match.home.code ?? undefined}
            size="md"
            variant="logo-glass"
            className="shrink-0"
          />
        </div>

        {/* Score / VS */}
        <div className="flex min-w-[64px] flex-col items-center gap-1">
          {hasScore ? (
            <span className="luxe-display text-2xl tabular-nums sm:text-4xl">
              <span className={homeWin ? "luxe-gold-text" : "text-foreground"}>
                {match.homeScore}
              </span>
              <span className="px-1 text-muted">-</span>
              <span className={awayWin ? "luxe-gold-text" : "text-foreground"}>
                {match.awayScore}
              </span>
            </span>
          ) : (
            <span className="luxe-display text-base text-muted sm:text-2xl">
              VS
            </span>
          )}
        </div>

        {/* Away */}
        <div className="flex items-center justify-start gap-2 sm:gap-3">
          <TeamFlag
            team={match.away.name}
            code={match.away.code ?? undefined}
            size="md"
            variant="logo-glass"
            className="shrink-0"
          />
          <CodeBadge code={match.away.code} />
          <span
            className={`truncate text-sm font-semibold sm:text-lg ${
              homeWin ? "text-muted" : "text-foreground"
            }`}
          >
            {match.away.name}
          </span>
        </div>
      </div>

      {/* Footer: time + venue */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-xs text-muted-foreground">
        <span className="tabular-nums">{kickoffUtc(match.dateUtc)} UTC</span>
        {match.venue && (
          <>
            <span className="text-muted">·</span>
            <span>
              {match.venue}
              {match.city ? `, ${match.city}` : ""}
            </span>
          </>
        )}
        {interactive && (
          <>
            <span className="text-muted">·</span>
            <span className="font-semibold text-[color:var(--text-gold)]">
              Predict →
            </span>
          </>
        )}
      </div>
    </>
  );

  const base = `luxe-glass w-full px-4 py-4 text-left transition sm:px-6 sm:py-5 ${
    isFavorite ? "border-[color:var(--gold-glow)] ring-1 ring-[color:var(--gold-glow)]" : ""
  } ${live ? "luxe-live-card" : ""}`;

  return (
    <li>
      {interactive ? (
        <button
          type="button"
          onClick={() => onSelect?.(match)}
          className={`${base} cursor-pointer hover:-translate-y-0.5`}
          aria-label={`Predict ${match.home.name} vs ${match.away.name}`}
        >
          {inner}
        </button>
      ) : (
        <div className={base}>{inner}</div>
      )}
    </li>
  );
}
