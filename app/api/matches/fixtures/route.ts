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
    seasonId: source === "sportmonks" ? 26618 : undefined,
    leagueId: source === "sportmonks" ? 732 : undefined,
  });
}
