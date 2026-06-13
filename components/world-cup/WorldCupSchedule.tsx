"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { useCallback, useEffect, useMemo, useState } from "react";

import { MatchCard } from "@/components/world-cup/MatchCard";
import { PredictionModal } from "@/components/world-cup/PredictionModal";
import { TeamFlag } from "@/components/world-cup/TeamFlag";
import type {
  WorldCupMatch,
  WorldCupSource,
  WorldCupTeam,
} from "@/lib/api/worldcup";
import { getStoredWalletAuth } from "@/lib/storage/wallet-auth";

type TabId = "results" | "upcoming" | "full" | "groups";

const TABS: { id: TabId; label: string }[] = [
  { id: "results", label: "Results" },
  { id: "upcoming", label: "Upcoming" },
  { id: "full", label: "Full Schedule" },
  { id: "groups", label: "Groups" },
];

const POLL_MS = 45_000;

interface GroupBlock {
  group: string;
  teams: WorldCupTeam[];
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function formatDay(key: string): string {
  const d = new Date(`${key}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return key;
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function groupByDay(matches: WorldCupMatch[]): [string, WorldCupMatch[]][] {
  const map = new Map<string, WorldCupMatch[]>();
  for (const m of matches) {
    const k = dayKey(m.dateUtc);
    const list = map.get(k) ?? [];
    list.push(m);
    map.set(k, list);
  }
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

export function WorldCupSchedule({
  initialMatches,
  groups,
  source,
  groupsProjected = false,
}: {
  initialMatches: WorldCupMatch[];
  groups: GroupBlock[];
  source: WorldCupSource;
  groupsProjected?: boolean;
}) {
  const account = useCurrentAccount();
  const [matches, setMatches] = useState<WorldCupMatch[]>(initialMatches);
  const [tab, setTab] = useState<TabId>("upcoming");
  const [query, setQuery] = useState("");
  const [favoriteTeam, setFavoriteTeam] = useState<string | null>(null);
  const [selected, setSelected] = useState<WorldCupMatch | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Live polling — refresh scores without a full reload.
  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch("/api/matches/fixtures", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { matches?: WorldCupMatch[] };
        if (!cancelled && data.matches?.length) setMatches(data.matches);
      } catch {
        // keep previous data
      }
    };
    const id = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Pull favorite team from Walrus Memory for highlighting.
  useEffect(() => {
    const auth = getStoredWalletAuth();
    if (
      !account?.address ||
      auth?.walletAddress?.toLowerCase() !== account.address.toLowerCase()
    ) {
      setFavoriteTeam(null);
      return;
    }
    let cancelled = false;
    fetch("/api/memory/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletAddress: account.address,
        authMessage: auth.message,
        authSignature: auth.signature,
        query: "favorite team supports world cup",
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { profile?: { favorite_team?: string } } | null) => {
        if (!cancelled && d?.profile?.favorite_team) {
          setFavoriteTeam(d.profile.favorite_team);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [account?.address]);

  const isFav = useCallback(
    (m: WorldCupMatch) => {
      if (!favoriteTeam) return false;
      const f = favoriteTeam.toLowerCase();
      return (
        m.home.name.toLowerCase().includes(f) ||
        m.away.name.toLowerCase().includes(f)
      );
    },
    [favoriteTeam],
  );

  const liveCount = useMemo(
    () => matches.filter((m) => m.status === "live").length,
    [matches],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = matches;
    if (tab === "results") list = list.filter((m) => m.status === "finished");
    else if (tab === "upcoming")
      list = list.filter((m) => m.status !== "finished");
    if (q) {
      list = list.filter(
        (m) =>
          m.home.name.toLowerCase().includes(q) ||
          m.away.name.toLowerCase().includes(q) ||
          (m.group ?? "").toLowerCase().includes(q) ||
          (m.city ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [matches, tab, query]);

  const counts = useMemo(
    () => ({
      results: matches.filter((m) => m.status === "finished").length,
      upcoming: matches.filter((m) => m.status !== "finished").length,
      full: matches.length,
      groups: groups.length,
    }),
    [matches, groups.length],
  );

  const onSaved = useCallback(() => {
    setToast("Prediction saved to Walrus Memory");
    setTimeout(() => setToast(null), 4000);
  }, []);

  const select = useCallback((m: WorldCupMatch) => setSelected(m), []);

  return (
    <div>
      {/* Live banner */}
      {liveCount > 0 && (
        <div className="luxe-glass mb-6 flex items-center justify-center gap-2 px-4 py-2.5">
          <span className="luxe-live-dot" />
          <span className="text-sm font-semibold text-foreground">
            {liveCount} match{liveCount > 1 ? "es" : ""} live now
          </span>
        </div>
      )}

      {/* Tabs + search */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`luxe-navlink ${
                tab === t.id ? "luxe-navlink-active" : ""
              }`}
            >
              {t.label}
              <span className="ml-1.5 text-[0.7rem] opacity-70">
                {counts[t.id]}
              </span>
            </button>
          ))}
        </div>

        {tab !== "groups" && (
          <div className="relative sm:w-64">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search team, group, city…"
              className="w-full rounded-full border border-[color:var(--glass-border)] bg-black/20 px-4 py-2 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-[color:var(--gold-glow)]"
            />
          </div>
        )}
      </div>

      {/* Content */}
      {tab === "groups" ? (
        <GroupsView
          groups={groups}
          matches={matches}
          favoriteTeam={favoriteTeam}
          projected={groupsProjected}
        />
      ) : filtered.length === 0 ? (
        <p className="luxe-glass px-5 py-10 text-center text-base text-muted">
          {tab === "results"
            ? source === "fallback"
              ? "No results yet — live results appear here once matches kick off."
              : "No finished matches yet."
            : "No matches match your search."}
        </p>
      ) : (
        <div className="space-y-8">
          {groupByDay(filtered).map(([day, list]) => (
            <div key={day}>
              <div className="mb-3 flex items-center gap-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--text-gold)]">
                  {formatDay(day)}
                </h3>
                <div className="luxe-hairline flex-1" />
              </div>
              <ul className="space-y-3">
                {list.map((m) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    isFavorite={isFav(m)}
                    onSelect={select}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <PredictionModal
        match={selected}
        onClose={() => setSelected(null)}
        onSaved={onSaved}
      />

      {toast && (
        <div className="luxe-glass luxe-glass-strong fixed bottom-6 left-1/2 z-50 -translate-x-1/2 px-5 py-3 text-center">
          <p className="text-sm font-semibold text-[color:var(--text-gold)]">
            ★ {toast}
          </p>
        </div>
      )}
    </div>
  );
}

function GroupsView({
  groups,
  matches,
  favoriteTeam,
  projected,
}: {
  groups: GroupBlock[];
  matches: WorldCupMatch[];
  favoriteTeam: string | null;
  projected: boolean;
}) {
  if (groups.length === 0) {
    return (
      <p className="luxe-glass px-5 py-10 text-center text-base text-muted">
        Group standings appear once the draw data is available.
      </p>
    );
  }
  const fav = favoriteTeam?.toLowerCase() ?? null;
  return (
    <>
      {projected && (
        <p className="mb-5 text-center text-xs text-muted">
          Projected group draw — live feed doesn&apos;t expose official A–L
          labels. Results, fixtures, venues &amp; cities above are live &amp;
          accurate.
        </p>
      )}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((g) => {
        const played = matches.filter(
          (m) => m.group === g.group && m.status === "finished",
        ).length;
        return (
          <div key={g.group} className="luxe-glass p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="luxe-display text-lg">{g.group}</h3>
              <span className="luxe-chip">{played} played</span>
            </div>
            <ul className="space-y-2.5">
              {g.teams.map((t) => {
                const highlight =
                  fav && t.name.toLowerCase().includes(fav);
                return (
                  <li
                    key={t.name}
                    className={`flex items-center gap-3 rounded-xl px-2 py-1.5 ${
                      highlight
                        ? "bg-[color:var(--gold-glow)]"
                        : ""
                    }`}
                  >
                    <TeamFlag
                      team={t.name}
                      code={t.code ?? undefined}
                      size="sm"
                      variant="logo-glass"
                    />
                    <span className="text-sm font-medium text-foreground">
                      {t.name}
                    </span>
                    {t.code && (
                      <span className="ml-auto text-[0.66rem] font-bold uppercase tracking-wider text-muted">
                        {t.code}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
    </>
  );
}
