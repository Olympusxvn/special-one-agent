import { NextResponse } from "next/server";

import {
  getFootballDataSource,
  getWorldCupFixtures,
} from "@/lib/football/provider";

export async function GET() {
  const fixtures = await getWorldCupFixtures();
  const source = getFootballDataSource();

  return NextResponse.json({
    fixtures,
    source,
    leagueId: source === "api-football" ? 1 : undefined,
    season: source === "api-football" ? 2026 : undefined,
  });
}
