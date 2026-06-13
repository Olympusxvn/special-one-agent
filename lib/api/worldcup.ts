import { teamNameToCode } from "@/lib/teams/team-flags";

import {
  buildFallbackSchedule,
  getFallbackGroups,
  venueToCity,
} from "./wc2026-schedule";

/**
 * Unified World Cup 2026 data service.
 *
 * Source priority (first that returns data wins):
 *   1. API-Football — set API_FOOTBALL_KEY (paid season access for 2026).
 *   2. WorldCup26 — free open API, 104 matches, groups A–L, 16 stadiums.
 *      https://worldcup26.ir/get/games
 *   3. openfootball — free public JSON, groups A–L, no key.
 *      https://github.com/openfootball/worldcup.json
 *   4. TheSportsDB — partial live feed (15 events), keyless.
 *   5. Static fallback schedule (real venues, no fabricated scores).
 */

export type MatchStatusKind = "scheduled" | "live" | "finished";

export interface WorldCupTeam {
  name: string;
  code: string | null;
}

export interface WorldCupMatch {
  id: number;
  dateUtc: string;
  status: MatchStatusKind;
  statusShort: string;
  minute: number | null;
  home: WorldCupTeam;
  away: WorldCupTeam;
  homeScore: number | null;
  awayScore: number | null;
  venue: string | null;
  city: string | null;
  group: string | null;
  stage: string;
}

export type WorldCupSource =
  | "api-football"
  | "worldcup26"
  | "openfootball"
  | "thesportsdb"
  | "fallback";

export interface WorldCupGroupBlock {
  group: string;
  teams: WorldCupTeam[];
}

export interface WorldCupData {
  matches: WorldCupMatch[];
  groups: WorldCupGroupBlock[];
  source: WorldCupSource;
  updatedAt: string;
  /** True when groups are a projected draw, not from the live provider. */
  groupsProjected: boolean;
}

const LIVE_STATUSES = new Set([
  "1H",
  "HT",
  "2H",
  "ET",
  "BT",
  "P",
  "SUSP",
  "INT",
  "LIVE",
]);
const FINISHED_STATUSES = new Set(["FT", "AET", "PEN", "FT_PEN", "PEN_LIVE"]);

const WC26_BASE = "https://worldcup26.ir/get";
const OPENFOOTBALL_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

const KNOCKOUT_LABELS: Record<string, string> = {
  R32: "Round of 32",
  R16: "Round of 16",
  QF: "Quarter-finals",
  SF: "Semi-finals",
  FINAL: "Final",
  "3RD": "Third place",
};

function classify(short: string): MatchStatusKind {
  const s = short.toUpperCase();
  if (FINISHED_STATUSES.has(s)) return "finished";
  if (LIVE_STATUSES.has(s)) return "live";
  return "scheduled";
}

function formatGroupLabel(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  const g = raw.trim().toUpperCase();
  if (/^[A-L]$/.test(g)) return `Group ${g}`;
  return KNOCKOUT_LABELS[g] ?? raw;
}

function isKnockoutGroup(label: string | null): boolean {
  if (!label) return false;
  return !/^Group [A-L]$/i.test(label);
}

export function isLive(m: WorldCupMatch): boolean {
  return m.status === "live";
}
export function isFinished(m: WorldCupMatch): boolean {
  return m.status === "finished";
}
export function isScheduled(m: WorldCupMatch): boolean {
  return m.status === "scheduled";
}

export function sortByKickoff(matches: WorldCupMatch[]): WorldCupMatch[] {
  return [...matches].sort(
    (a, b) => new Date(a.dateUtc).getTime() - new Date(b.dateUtc).getTime(),
  );
}

function deriveGroupsFromMatches(
  matches: WorldCupMatch[],
): WorldCupGroupBlock[] {
  const map = new Map<string, Map<string, WorldCupTeam>>();
  for (const m of matches) {
    if (!m.group?.toLowerCase().startsWith("group")) continue;
    const set = map.get(m.group) ?? new Map<string, WorldCupTeam>();
    set.set(m.home.name, m.home);
    set.set(m.away.name, m.away);
    map.set(m.group, set);
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([group, teams]) => ({ group, teams: Array.from(teams.values()) }));
}

/* ----------------------------- API-Football ----------------------------- */

const AF_BASE = "https://v3.football.api-sports.io";

function mapApiFootball(item: Record<string, unknown>): WorldCupMatch {
  const fixture = item.fixture as Record<string, unknown>;
  const teams = item.teams as Record<string, Record<string, string>>;
  const goals = item.goals as Record<string, number | null>;
  const status = fixture.status as Record<string, string | number>;
  const league = (item.league as Record<string, unknown>) ?? {};
  const venueObj = (fixture.venue as Record<string, string>) ?? {};
  const short = String(status.short ?? "NS");
  const homeName = teams.home?.name ?? "TBD";
  const awayName = teams.away?.name ?? "TBD";
  const group = (league.round as string) ?? null;

  return {
    id: Number(fixture.id),
    dateUtc: String(fixture.date),
    status: classify(short),
    statusShort: short,
    minute: typeof status.elapsed === "number" ? status.elapsed : null,
    home: { name: homeName, code: teamNameToCode(homeName) },
    away: { name: awayName, code: teamNameToCode(awayName) },
    homeScore: goals?.home ?? null,
    awayScore: goals?.away ?? null,
    venue: venueObj.name ?? null,
    city: venueObj.city ?? null,
    group,
    stage: group?.includes("Group") ? "Group Stage" : "Knockout",
  };
}

async function fetchApiFootball(): Promise<WorldCupMatch[] | null> {
  const key = process.env.API_FOOTBALL_KEY?.trim();
  if (!key) return null;
  try {
    const res = await fetch(`${AF_BASE}/fixtures?league=1&season=2026`, {
      headers: { "x-apisports-key": key },
      next: { revalidate: 45 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      response?: Record<string, unknown>[];
      errors?: Record<string, string> | string[];
    };
    if (data.errors && Object.keys(data.errors).length > 0) return null;
    if (!data.response?.length) return null;
    return data.response.map(mapApiFootball);
  } catch {
    return null;
  }
}

/* ------------------------------ WorldCup26 ------------------------------ */

interface Wc26Stadium {
  id: string;
  name_en: string;
  city_en: string;
  country_en: string;
}

interface Wc26Team {
  id: string;
  name_en: string;
  iso2?: string;
  groups?: string;
}

interface Wc26Game {
  id: string;
  home_team_name_en: string;
  away_team_name_en: string;
  home_score: string;
  away_score: string;
  group: string;
  matchday?: string;
  local_date: string;
  stadium_id: string;
  finished: string;
  time_elapsed: string;
  type: string;
}

function utcOffsetHours(country: string, city: string): number {
  if (country === "Mexico") return 6;
  if (country === "Canada") {
    if (/vancouver|bc place/i.test(city)) return 7;
    return 4;
  }
  if (/los angeles|seattle|san francisco|sofi|levi|lumen|santa clara/i.test(city)) {
    return 7;
  }
  if (/denver|kansas|dallas|houston|arrowhead|att/i.test(city)) return 5;
  return 4;
}

function parseWc26LocalDate(
  localDate: string,
  stadium: Wc26Stadium | undefined,
): string {
  const [datePart, timePart = "00:00"] = localDate.trim().split(/\s+/);
  const [mm, dd, yyyy] = datePart.split("/").map(Number);
  const [hh, min] = timePart.split(":").map(Number);
  const offset = stadium
    ? utcOffsetHours(stadium.country_en, stadium.city_en)
    : 5;
  return new Date(
    Date.UTC(yyyy, mm - 1, dd, hh + offset, min, 0),
  ).toISOString();
}

function mapWc26Game(
  game: Wc26Game,
  stadiums: Map<string, Wc26Stadium>,
): WorldCupMatch {
  const stadium = stadiums.get(game.stadium_id);
  const finished =
    game.finished === "TRUE" || game.time_elapsed === "finished";
  const elapsed = game.time_elapsed?.toLowerCase() ?? "";
  let status: MatchStatusKind = "scheduled";
  let statusShort = "NS";
  let minute: number | null = null;

  if (finished) {
    status = "finished";
    statusShort = "FT";
  } else if (
    elapsed &&
    elapsed !== "notstarted" &&
    elapsed !== "finished"
  ) {
    status = "live";
    statusShort = "LIVE";
    const parsed = parseInt(elapsed, 10);
    minute = Number.isNaN(parsed) ? null : parsed;
  }

  const group = formatGroupLabel(game.group);
  const homeName = game.home_team_name_en?.trim() || "TBD";
  const awayName = game.away_team_name_en?.trim() || "TBD";

  return {
    id: Number(game.id),
    dateUtc: parseWc26LocalDate(game.local_date, stadium),
    status,
    statusShort,
    minute,
    home: { name: homeName, code: teamNameToCode(homeName) },
    away: { name: awayName, code: teamNameToCode(awayName) },
    homeScore: finished ? Number(game.home_score) : null,
    awayScore: finished ? Number(game.away_score) : null,
    venue: stadium?.name_en ?? null,
    city: stadium?.city_en ?? null,
    group,
    stage:
      game.type === "group" || /^Group [A-L]$/i.test(group ?? "")
        ? "Group Stage"
        : "Knockout",
  };
}

async function fetchWorldCup26(): Promise<{
  matches: WorldCupMatch[];
  groups: WorldCupGroupBlock[];
} | null> {
  try {
    const [gamesRes, stadiumsRes, groupsRes, teamsRes] = await Promise.all([
      fetch(`${WC26_BASE}/games`, { next: { revalidate: 45 } }),
      fetch(`${WC26_BASE}/stadiums`, { next: { revalidate: 3600 } }),
      fetch(`${WC26_BASE}/groups`, { next: { revalidate: 60 } }),
      fetch(`${WC26_BASE}/teams`, { next: { revalidate: 3600 } }),
    ]);
    if (!gamesRes.ok) return null;

    const gamesPayload = (await gamesRes.json()) as { games?: Wc26Game[] };
    const games = gamesPayload.games ?? [];
    if (!games.length) return null;

    const stadiumsPayload = stadiumsRes.ok
      ? ((await stadiumsRes.json()) as { stadiums?: Wc26Stadium[] })
      : { stadiums: [] };
    const stadiumMap = new Map(
      (stadiumsPayload.stadiums ?? []).map((s) => [s.id, s]),
    );

    const teamsPayload = teamsRes.ok
      ? ((await teamsRes.json()) as { teams?: Wc26Team[] })
      : { teams: [] };
    const teamMap = new Map(
      (teamsPayload.teams ?? []).map((t) => [t.id, t]),
    );

    const matches = sortByKickoff(
      games.map((g) => mapWc26Game(g, stadiumMap)),
    );

    let groups: WorldCupGroupBlock[] = deriveGroupsFromMatches(matches);

    if (groupsRes.ok) {
      const groupsPayload = (await groupsRes.json()) as {
        groups?: { name: string; teams: { team_id: string }[] }[];
      };
      const apiGroups = (groupsPayload.groups ?? [])
        .filter((g) => /^[A-L]$/i.test(g.name))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((g) => ({
          group: `Group ${g.name.toUpperCase()}`,
          teams: g.teams
            .map((row) => teamMap.get(row.team_id))
            .filter((t): t is Wc26Team => Boolean(t))
            .map((t) => ({
              name: t.name_en,
              code: t.iso2?.toUpperCase() ?? teamNameToCode(t.name_en),
            })),
        }))
        .filter((g) => g.teams.length > 0);

      if (apiGroups.length >= 12) groups = apiGroups;
    }

    return { matches, groups };
  } catch {
    return null;
  }
}

/* ----------------------------- openfootball ----------------------------- */

function parseOpenFootballTime(date: string, time: string): string {
  const offsetMatch = time.match(/UTC([+-]?\d+)/i);
  const offsetHours = offsetMatch ? Number(offsetMatch[1]) : 0;
  const hm = time.match(/(\d{1,2}):(\d{2})/);
  const hh = hm ? Number(hm[1]) : 0;
  const min = hm ? Number(hm[2]) : 0;
  const [y, m, d] = date.split("-").map(Number);
  return new Date(
    Date.UTC(y, m - 1, d, hh - offsetHours, min, 0),
  ).toISOString();
}

function mapOpenFootball(
  row: Record<string, unknown>,
  index: number,
): WorldCupMatch {
  const team1 = String(row.team1 ?? "TBD");
  const team2 = String(row.team2 ?? "TBD");
  const score = row.score as { ft?: number[] } | undefined;
  const hasScore = Array.isArray(score?.ft) && score.ft.length === 2;
  const group = (row.group as string) ?? null;
  const ground = (row.ground as string) ?? null;

  return {
    id: 2026_1000 + index,
    dateUtc: parseOpenFootballTime(
      String(row.date),
      String(row.time ?? "00:00 UTC+0"),
    ),
    status: hasScore ? "finished" : "scheduled",
    statusShort: hasScore ? "FT" : "NS",
    minute: null,
    home: { name: team1, code: teamNameToCode(team1) },
    away: { name: team2, code: teamNameToCode(team2) },
    homeScore: hasScore ? score!.ft![0]! : null,
    awayScore: hasScore ? score!.ft![1]! : null,
    venue: null,
    city: ground,
    group,
    stage: isKnockoutGroup(group) ? "Knockout" : "Group Stage",
  };
}

async function fetchOpenFootball(): Promise<{
  matches: WorldCupMatch[];
  groups: WorldCupGroupBlock[];
} | null> {
  try {
    const res = await fetch(OPENFOOTBALL_URL, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      matches?: Record<string, unknown>[];
    };
    const rows = data.matches ?? [];
    if (!rows.length) return null;
    const matches = sortByKickoff(rows.map(mapOpenFootball));
    return { matches, groups: deriveGroupsFromMatches(matches) };
  } catch {
    return null;
  }
}

/* ------------------------------ TheSportsDB ----------------------------- */

const TSDB_BASE = "https://www.thesportsdb.com/api/v1/json/3";
const TSDB_WORLD_CUP_LEAGUE = "4429";

function normalizeUtc(raw: string): string {
  let s = raw.trim().replace(" ", "T");
  if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(s)) s += "Z";
  return s;
}

function mapSportsDb(ev: Record<string, unknown>): WorldCupMatch | null {
  const homeName = (ev.strHomeTeam as string)?.trim();
  const awayName = (ev.strAwayTeam as string)?.trim();
  if (!homeName || !awayName) return null;

  const rawDate =
    (ev.strTimestamp as string) ||
    `${ev.dateEvent as string}T${(ev.strTime as string) || "00:00:00"}`;
  const dateUtc = normalizeUtc(rawDate);
  const rawGroup = (ev.strGroup as string)?.trim();
  const round = (ev.intRound as string)?.trim();
  const group =
    rawGroup && /group|final|semi|quarter|round of/i.test(rawGroup)
      ? rawGroup
      : round
        ? `Matchday ${round}`
        : null;
  const venueName = (ev.strVenue as string) || null;
  const status = (ev.strStatus as string) || "NS";
  const homeScore =
    ev.intHomeScore != null && ev.intHomeScore !== ""
      ? Number(ev.intHomeScore)
      : null;
  const awayScore =
    ev.intAwayScore != null && ev.intAwayScore !== ""
      ? Number(ev.intAwayScore)
      : null;
  const kind: MatchStatusKind =
    homeScore != null && /match finished|ft/i.test(status)
      ? "finished"
      : /1h|2h|ht|live|in progress/i.test(status)
        ? "live"
        : "scheduled";

  return {
    id: Number(ev.idEvent),
    dateUtc,
    status: kind,
    statusShort: status,
    minute: ev.intMinute ? Number(ev.intMinute) : null,
    home: { name: homeName, code: teamNameToCode(homeName) },
    away: { name: awayName, code: teamNameToCode(awayName) },
    homeScore,
    awayScore,
    venue: venueName,
    city: (ev.strCity as string) || venueToCity(venueName),
    group,
    stage: isKnockoutGroup(group) ? "Knockout" : "Group Stage",
  };
}

async function fetchSportsDb(): Promise<WorldCupMatch[] | null> {
  try {
    const res = await fetch(
      `${TSDB_BASE}/eventsseason.php?id=${TSDB_WORLD_CUP_LEAGUE}&s=2026`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { events?: Record<string, unknown>[] };
    if (!data.events?.length) return null;
    const mapped = data.events
      .map(mapSportsDb)
      .filter((m): m is WorldCupMatch => m !== null);
    return mapped.length ? mapped : null;
  } catch {
    return null;
  }
}

/* -------------------------------- Public -------------------------------- */

export async function getWorldCupData(): Promise<WorldCupData> {
  const updatedAt = new Date().toISOString();

  const af = await fetchApiFootball();
  if (af?.length) {
    const groups = deriveGroupsFromMatches(af);
    return {
      matches: sortByKickoff(af),
      groups: groups.length ? groups : getFallbackGroups(),
      source: "api-football",
      updatedAt,
      groupsProjected: groups.length === 0,
    };
  }

  const wc26 = await fetchWorldCup26();
  if (wc26?.matches.length) {
    return {
      matches: wc26.matches,
      groups: wc26.groups.length ? wc26.groups : getFallbackGroups(),
      source: "worldcup26",
      updatedAt,
      groupsProjected: wc26.groups.length === 0,
    };
  }

  const of = await fetchOpenFootball();
  if (of?.matches.length) {
    return {
      matches: of.matches,
      groups: of.groups.length ? of.groups : getFallbackGroups(),
      source: "openfootball",
      updatedAt,
      groupsProjected: of.groups.length === 0,
    };
  }

  const tsdb = await fetchSportsDb();
  if (tsdb?.length) {
    const groups = deriveGroupsFromMatches(tsdb);
    return {
      matches: sortByKickoff(tsdb),
      groups: groups.length ? groups : getFallbackGroups(),
      source: "thesportsdb",
      updatedAt,
      groupsProjected: groups.length === 0,
    };
  }

  return {
    matches: sortByKickoff(buildFallbackSchedule()),
    groups: getFallbackGroups(),
    source: "fallback",
    updatedAt,
    groupsProjected: true,
  };
}

export { getFallbackGroups };

export function sourceLabel(source: WorldCupSource): string {
  switch (source) {
    case "api-football":
      return "Live · API-Football";
    case "worldcup26":
      return "Live · WorldCup26 (free)";
    case "openfootball":
      return "Live · openfootball (free)";
    case "thesportsdb":
      return "Live · TheSportsDB";
    default:
      return "Official schedule";
  }
}
