import type { FixtureSummary } from "./types";
import {
  formatFixtureResult,
  isFixtureFinished,
} from "./types";

export { formatFixtureResult, isFixtureFinished };

const BASE_URL = "https://v3.football.api-sports.io";

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const fixtureCache = new Map<string, CacheEntry<FixtureSummary[]>>();
const singleCache = new Map<string, CacheEntry<FixtureSummary | null>>();

function apiKey(): string | null {
  return process.env.API_FOOTBALL_KEY?.trim() ?? null;
}

async function fetchApi<T>(path: string): Promise<T | null> {
  const key = apiKey();
  if (!key) return null;

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "x-apisports-key": key,
    },
    next: { revalidate: 900 },
  });

  if (!res.ok) return null;
  return res.json() as Promise<T>;
}

function mapFixture(item: Record<string, unknown>): FixtureSummary {
  const fixture = item.fixture as Record<string, unknown>;
  const teams = item.teams as Record<string, Record<string, string>>;
  const goals = item.goals as Record<string, number | null>;
  const status = fixture.status as Record<string, string>;

  const homeGoals = goals.home;
  const awayGoals = goals.away;
  const scoreline =
    homeGoals !== null && awayGoals !== null
      ? `${homeGoals}-${awayGoals}`
      : null;

  return {
    id: fixture.id as number,
    date: fixture.date as string,
    status: status.short ?? "NS",
    homeTeam: teams.home.name,
    awayTeam: teams.away.name,
    homeGoals,
    awayGoals,
    scoreline,
  };
}

export async function getWorldCupFixtures(): Promise<FixtureSummary[]> {
  const cacheKey = "wc2026-fixtures";
  const cached = fixtureCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const data = await fetchApi<{ response: Record<string, unknown>[] }>(
    "/fixtures?league=1&season=2026",
  );

  if (!data?.response) return [];

  const fixtures = data.response.map(mapFixture);
  fixtureCache.set(cacheKey, {
    data: fixtures,
    expiresAt: Date.now() + 15 * 60 * 1000,
  });
  return fixtures;
}

export async function getFixtureById(
  fixtureId: number,
): Promise<FixtureSummary | null> {
  const cacheKey = `fixture-${fixtureId}`;
  const cached = singleCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const data = await fetchApi<{ response: Record<string, unknown>[] }>(
    `/fixtures?id=${fixtureId}`,
  );

  const fixture = data?.response?.[0] ? mapFixture(data.response[0]) : null;
  singleCache.set(cacheKey, {
    data: fixture,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });
  return fixture;
}
