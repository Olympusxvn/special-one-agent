import { NextResponse } from "next/server";

import { getWorldCupFixtures } from "@/lib/football/api-football";

export async function GET() {
  const fixtures = await getWorldCupFixtures();
  return NextResponse.json({
    fixtures,
    source: process.env.API_FOOTBALL_KEY ? "api-football" : "unavailable",
  });
}
