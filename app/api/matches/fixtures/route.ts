import { NextResponse } from "next/server";

import { getWorldCupData } from "@/lib/api/worldcup";

export const dynamic = "force-dynamic";

export async function GET() {
  const { matches, groups, source, updatedAt, groupsProjected } =
    await getWorldCupData();
  return NextResponse.json({
    matches,
    groups,
    source,
    updatedAt,
    groupsProjected,
  });
}
