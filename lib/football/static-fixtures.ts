import demoFixtures from "@/data/wc2026-fixtures.json";

import type { FixtureSummary } from "./types";
import {
  formatFixtureResult,
  isFixtureFinished,
} from "./types";

export { formatFixtureResult, isFixtureFinished };

const fixtures = demoFixtures as FixtureSummary[];

export async function getWorldCupFixtures(): Promise<FixtureSummary[]> {
  return fixtures;
}

export async function getFixtureById(
  fixtureId: number,
): Promise<FixtureSummary | null> {
  return fixtures.find((f) => f.id === fixtureId) ?? null;
}
