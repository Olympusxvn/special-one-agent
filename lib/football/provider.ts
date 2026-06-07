import * as apiFootball from "./api-football";
import * as staticFixtures from "./static-fixtures";
import type { FixtureSummary } from "./types";
import {
  formatFixtureResult,
  isFixtureFinished,
} from "./types";

export type FootballDataSource = "api-football" | "static-demo";

export function getFootballDataSource(): FootballDataSource {
  if (process.env.API_FOOTBALL_KEY?.trim()) return "api-football";
  return "static-demo";
}

function activeProvider() {
  return getFootballDataSource() === "api-football" ? apiFootball : staticFixtures;
}

export async function getWorldCupFixtures(): Promise<FixtureSummary[]> {
  return activeProvider().getWorldCupFixtures();
}

export async function getFixtureById(
  fixtureId: number,
): Promise<FixtureSummary | null> {
  return activeProvider().getFixtureById(fixtureId);
}

export { formatFixtureResult, isFixtureFinished };
