export type NewsItem = {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
  sourceName: string;
};

const MAX_ITEMS = 5;

/** Free public RSS feeds — no API keys required. */
const RSS_FEEDS: { url: string; defaultSource: string }[] = [
  {
    url: "https://news.google.com/rss/search?q=World+Cup+2026+football&hl=en-US&gl=US&ceid=US:en",
    defaultSource: "Google News",
  },
  {
    url: "https://feeds.bbci.co.uk/sport/football/rss.xml",
    defaultSource: "BBC Sport",
  },
];

const FETCH_TIMEOUT_MS = 8_000;

function decodeXmlEntities(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

function extractTag(block: string, tag: string): string | null {
  const match = block.match(
    new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"),
  );
  return match ? decodeXmlEntities(match[1]) : null;
}

function parseRssItems(xml: string, defaultSource: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = extractTag(block, "title");
    const url =
      extractTag(block, "link") ?? extractTag(block, "guid") ?? null;
    const pubDate =
      extractTag(block, "pubDate") ?? extractTag(block, "dc:date") ?? null;
    const sourceName = extractTag(block, "source") ?? defaultSource;

    if (!title || !url) continue;

    items.push({
      id: url,
      title,
      url,
      publishedAt: pubDate
        ? new Date(pubDate).toISOString()
        : new Date().toISOString(),
      sourceName,
    });
  }

  return items;
}

function parseAtomEntries(xml: string, defaultSource: string): NewsItem[] {
  const items: NewsItem[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(xml)) !== null) {
    const block = match[1];
    const title = extractTag(block, "title");
    const linkMatch = block.match(
      /<link[^>]*href=["']([^"']+)["'][^>]*\/?>/i,
    );
    const url = linkMatch?.[1] ?? extractTag(block, "id");
    const pubDate =
      extractTag(block, "published") ?? extractTag(block, "updated") ?? null;

    if (!title || !url) continue;

    items.push({
      id: url,
      title,
      url,
      publishedAt: pubDate
        ? new Date(pubDate).toISOString()
        : new Date().toISOString(),
      sourceName: defaultSource,
    });
  }

  return items;
}

async function fetchFeed(
  feedUrl: string,
  defaultSource: string,
): Promise<NewsItem[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(feedUrl, {
      signal: controller.signal,
      headers: {
        Accept:
          "application/rss+xml, application/atom+xml, application/xml, text/xml",
        "User-Agent": "SpecialOneAgent/1.0 (World Cup news aggregator)",
      },
      next: { revalidate: 1800 },
    });

    if (!res.ok) return [];

    const xml = await res.text();
    if (/<entry[\s>]/i.test(xml)) {
      return parseAtomEntries(xml, defaultSource);
    }
    return parseRssItems(xml, defaultSource);
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

function dedupeAndSort(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  const unique: NewsItem[] = [];

  for (const item of items) {
    const key = item.url.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }

  return unique.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export async function fetchFootballNews(): Promise<NewsItem[]> {
  const results = await Promise.all(
    RSS_FEEDS.map(({ url, defaultSource }) => fetchFeed(url, defaultSource)),
  );

  return dedupeAndSort(results.flat()).slice(0, MAX_ITEMS);
}
