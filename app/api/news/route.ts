import { unstable_cache } from "next/cache";

export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

import { fetchFootballNews, type NewsItem } from "@/lib/football/news";

export const revalidate = 1800;

const getCachedNews = unstable_cache(
  async (): Promise<NewsItem[]> => fetchFootballNews(),
  ["football-news-rss"],
  { revalidate: 1800 },
);

export async function GET() {
  try {
    const items = await getCachedNews();

    if (items.length === 0) {
      return NextResponse.json({
        items: [],
        error: "No headlines available right now. Try again shortly.",
      });
    }

    return NextResponse.json(
      { items },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=60",
        },
      },
    );
  } catch {
    return NextResponse.json({
      items: [],
      error: "News feed temporarily unavailable.",
    });
  }
}
