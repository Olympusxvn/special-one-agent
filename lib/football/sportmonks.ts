import type { FixtureSummary } from "./types";
import {
  formatFixtureResult,
  isFixtureFinished,
} from "./types";

export { formatFixtureResult, isFixtureFinished };

const BASE_URL = "https://api.sportmonks.com/v3/football";
const WC_SEASON_ID = 26618;
const FINISHED_STATE_IDS = new Set([5, 7, 8]);

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const fixtureCache = new Map<string, CacheEntry<FixtureSummary[]>>();
const singleCache = new Map<string, CacheEntry<FixtureSummary | null>>();

function apiToken(): string | null {
  return process.env.SPORTMONKS_API_TOKEN?.trim() ?? null;
}

function buildUrl(path: string, params: Record<string, string> = {}): string | null {
  const token = apiToken();
  if (!token) return null;

  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("api_token", token);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

async function fetchSportMonks<T>(path: string, params: Record<string, string> = {}): Promise<T | null> {
  const url = buildUrl(path, params);
  if (!url) return null;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 900 },
  });

  if (!res.ok) return null;
  return res.json() as Promise<T>;
}

interface SportMonksParticipant {
  id: number;
  name: string;
  meta?: { location?: string };
}

interface SportMonksScore {
  participant_id: number;
  description?: string;
  score?: { goals?: number | null };
}

interface SportMonksState {
  short_name?: string;
  state?: string;
}

function normalizeStatus(raw: SportMonksState | undefined, stateId?: number): string {
  if (stateId && FINISHED_STATE_IDS.has(stateId)) {
    if (stateId === 7) return "AET";
    if (stateId === 8) return "PEN";
    return "FT";
  }

  const code = raw?.short_name ?? raw?.state ?? "NS";
  if (code === "FT_PEN") return "PEN";
  return code;
}

function parseTeams(
  raw: Record<string, unknown>,
  participants: SportMonksParticipant[],
): { homeTeam: string; awayTeam: string } {
  const home = participants.find((p) => p.meta?.location === "home");
  const away = participants.find((p) => p.meta?.location === "away");

  if (home?.name && away?.name) {
    return { homeTeam: home.name, awayTeam: away.name };
  }

  const name = typeof raw.name === "string" ? raw.name : "";
  const parts = name.split(" vs ");
  return {
    homeTeam: parts[0]?.trim() ?? "",
    awayTeam: parts[1]?.trim() ?? "",
  };
}

function parseGoals(
  participants: SportMonksParticipant[],
  scores: SportMonksScore[],
): { homeGoals: number | null; awayGoals: number | null } {
  const home = participants.find((p) => p.meta?.location === "home");
  const away = participants.find((p) => p.meta?.location === "away");
  if (!home || !away) return { homeGoals: null, awayGoals: null };

  const current = scores.filter((s) => s.description === "CURRENT");
  const relevant = current.length > 0 ? current : scores;

  const homeScore = relevant.find((s) => s.participant_id === home.id);
  const awayScore = relevant.find((s) => s.participant_id === away.id);

  const homeGoals = homeScore?.score?.goals ?? null;
  const awayGoals = awayScore?.score?.goals ?? null;

  return { homeGoals, awayGoals };
}

function mapSportMonksFixture(raw: Record<string, unknown>): FixtureSummary {
  const participants = (raw.participants as SportMonksParticipant[] | undefined) ?? [];
  const scores = (raw.scores as SportMonksScore[] | undefined) ?? [];
  const state = raw.state as SportMonksState | undefined;
  const stateId = typeof raw.state_id === "number" ? raw.state_id : undefined;

  const { homeTeam, awayTeam } = parseTeams(raw, participants);
  const { homeGoals, awayGoals } = parseGoals(participants, scores);
  const status = normalizeStatus(state, stateId);

  const scoreline =
    homeGoals !== null && awayGoals !== null
      ? `${homeGoals}-${awayGoals}`
      : null;

  return {
    id: raw.id as number,
    date: (raw.starting_at as string) ?? "",
    status,
    homeTeam,
    awayTeam,
    homeGoals,
    awayGoals,
    scoreline,
  };
}

interface PaginatedFixtures {
  data: Record<string, unknown>[];
  pagination?: { has_more?: boolean };
}

export async function getWorldCupFixtures(): Promise<FixtureSummary[]> {
  const cacheKey = "sportmonks-wc2026-fixtures";
  const cached = fixtureCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const fixtures: FixtureSummary[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetchSportMonks<PaginatedFixtures>("/fixtures", {
      filters: `fixtureSeasons:${WC_SEASON_ID}`,
      include: "participants;scores;state",
      per_page: "50",
      page: String(page),
    });

    if (!response?.data?.length) break;

    fixtures.push(...response.data.map(mapSportMonksFixture));
    hasMore = Boolean(response.pagination?.has_more);
    page += 1;
    if (page > 10) break;
  }

  fixtureCache.set(cacheKey, {
    data: fixtures,
    expiresAt: Date.now() + 15 * 60 * 1000,
  });

  return fixtures;
}

export async function getFixtureById(
  fixtureId: number,
): Promise<FixtureSummary | null> {
  const cacheKey = `sportmonks-fixture-${fixtureId}`;
  const cached = singleCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const response = await fetchSportMonks<{ data: Record<string, unknown> }>(
    `/fixtures/${fixtureId}`,
    { include: "participants;scores;state" },
  );

  const fixture = response?.data ? mapSportMonksFixture(response.data) : null;
  singleCache.set(cacheKey, {
    data: fixture,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  return fixture;
}
