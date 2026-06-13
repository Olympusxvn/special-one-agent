"use client";

import { useEffect, useState } from "react";

import { WorldCupLogo } from "@/components/world-cup/WorldCupLogo";

type NewsItem = {
  id: string;
  title: string;
  url: string;
  publishedAt: string;
  sourceName: string;
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NewsFeed({
  title = "World Cup Headlines",
  className = "",
}: {
  title?: string;
  className?: string;
}) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/news");
        const data = (await res.json()) as {
          items?: NewsItem[];
          source?: string;
          error?: string;
        };

        if (cancelled) return;

        if (data.items?.length) {
          setItems(data.items);
          setError(null);
        } else {
          setItems([]);
          setError(data.error ?? "No headlines available.");
        }
      } catch {
        if (!cancelled) {
          setItems([]);
          setError("Could not load news. Check back later.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className={`walrus-card w-full max-w-xl p-4 ${className}`}>
      <header className="mb-3 flex items-start gap-3">
        <WorldCupLogo size="sm" className="mt-0.5 shrink-0 opacity-90" />
        <div>
          <p className="walrus-label">Wire Service</p>
          <h2 className="walrus-heading mt-1 text-lg">{title}</h2>
        </div>
      </header>

      {loading ? (
        <ul className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <li
              key={i}
              className="h-10 animate-pulse rounded-lg bg-foreground/5"
            />
          ))}
        </ul>
      ) : error && items.length === 0 ? (
        <p className="walrus-card border-dashed px-3 py-5 text-center walrus-caption">
          {error}
        </p>
      ) : (
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-lg border border-transparent px-2 py-2 transition hover:border-border-subtle hover:bg-foreground/5"
              >
                <p className="text-caption leading-snug text-foreground/90 group-hover:text-brand-light">
                  {item.title}
                </p>
                <p className="mt-1 text-caption text-foreground/40">
                  {item.sourceName}
                  {formatDate(item.publishedAt)
                    ? ` · ${formatDate(item.publishedAt)}`
                    : null}
                </p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
