import * as apiFootball from "./api-football";
import * as sportmonks from "./sportmonks";
import type { FixtureSummary } from "./types";
import {
  formatFixtureResult,
  isFixtureFinished,
} from "./types";

export type FootballDataSource = "sportmonks" | "api-football" | "unavailable";

export function getFootballDataSource(): FootballDataSource {
  if (process.env.SPORTMONKS_API_TOKEN?.trim()) return "sportmonks";
  if (process.env.API_FOOTBALL_KEY?.trim()) return "api-football";
  return "unavailable";
}

function activeProvider() {
  return getFootballDataSource() === "sportmonks" ? sportmonks : apiFootball;
}

export async function getWorldCupFixtures(): Promise<FixtureSummary[]> {
  if (getFootballDataSource() === "unavailable") return [];
  return activeProvider().getWorldCupFixtures();
}

export async function getFixtureById(
  fixtureId: number,
): Promise<FixtureSummary | null> {
  if (getFootballDataSource() === "unavailable") return null;
  return activeProvider().getFixtureById(fixtureId);
}

export { formatFixtureResult, isFixtureFinished };
