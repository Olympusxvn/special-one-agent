import Link from "next/link";

import { NewsFeed } from "@/components/news/NewsFeed";
import { WorldCupLogo } from "@/components/world-cup/WorldCupLogo";
import { WorldCupStripe } from "@/components/world-cup/WorldCupStripe";
import { WorldCupWatermark } from "@/components/world-cup/WorldCupWatermark";
import { getWorldCupFixtures } from "@/lib/football/provider";
import { formatFixtureResult, isFixtureFinished } from "@/lib/football/types";
import type { FixtureSummary } from "@/lib/football/types";

function dateKey(iso: string): string {
  return iso.slice(0, 10);
}

function formatKickoff(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function groupByDate(fixtures: FixtureSummary[]): Map<string, FixtureSummary[]> {
  const sorted = [...fixtures].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const map = new Map<string, FixtureSummary[]>();
  for (const f of sorted) {
    const key = dateKey(f.date);
    const list = map.get(key) ?? [];
    list.push(f);
    map.set(key, list);
  }
  return map;
}

function FixtureRow({ fixture }: { fixture: FixtureSummary }) {
  const finished = isFixtureFinished(fixture);
  const result = finished ? formatFixtureResult(fixture) : null;

  return (
    <li className="rounded-lg border border-press-border/60 bg-press/40 px-4 py-3 transition hover:border-pitch/30 hover:bg-pitch/5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">
          {fixture.homeTeam}{" "}
          <span className="text-pitch/60">vs</span> {fixture.awayTeam}
        </p>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            finished
              ? "bg-roast/20 text-roast"
              : "border border-pitch/40 bg-pitch/10 text-pitch"
          }`}
        >
          {fixture.status}
        </span>
      </div>
      <p className="mt-1 text-xs text-foreground/50">{formatKickoff(fixture.date)}</p>
      {result ? (
        <p className="mt-2 font-semibold text-gold">{result}</p>
      ) : (
        <p className="mt-2 text-xs text-foreground/40">Scheduled — no result yet</p>
      )}
    </li>
  );
}

export default async function SchedulesPage() {
  const fixtures = await getWorldCupFixtures();
  const finished = fixtures.filter((f) => isFixtureFinished(f));
  const upcoming = fixtures.filter((f) => !isFixtureFinished(f));
  const resultsByDate = groupByDate(finished);
  const scheduleByDate = groupByDate(upcoming);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <WorldCupWatermark />
      <div className="pitch-accent-bar" />
      <WorldCupStripe />

      <header className="stadium-header px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="logo-badge shrink-0">
              <WorldCupLogo size="md" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-pitch/80">
                FIFA World Cup 2026
              </p>
              <h1 className="font-display text-2xl tracking-wide">
                <span className="gradient-text-gold">Schedules & Results</span>
              </h1>
            </div>
          </div>
          <Link
            href="/"
            className="btn-outline-festive rounded-lg px-3 py-1.5 text-xs text-gold"
          >
            ← Home
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-3xl space-y-10 px-4 py-8">
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold">
            <span>🏆</span> Results ({finished.length})
          </h2>
          {finished.length === 0 ? (
            <p className="text-sm text-foreground/50">No finished matches yet.</p>
          ) : (
            <div className="space-y-6">
              {Array.from(resultsByDate.entries()).map(([day, list]) => (
                <div key={day}>
                  <h3 className="mb-2 text-xs font-semibold text-foreground/60">
                    {day}
                  </h3>
                  <ul className="space-y-2">
                    {list.map((f) => (
                      <FixtureRow key={f.id} fixture={f} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gold">
            <span>📅</span> Schedule ({upcoming.length})
          </h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-foreground/50">No upcoming fixtures listed.</p>
          ) : (
            <div className="space-y-6">
              {Array.from(scheduleByDate.entries()).map(([day, list]) => (
                <div key={day}>
                  <h3 className="mb-2 text-xs font-semibold text-foreground/60">
                    {day}
                  </h3>
                  <ul className="space-y-2">
                    {list.map((f) => (
                      <FixtureRow key={f.id} fixture={f} />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="border-t border-gold/10 pt-8">
          <NewsFeed />
        </div>

        <p className="text-center text-xs text-foreground/40">
          <Link href="/chat" className="font-semibold text-pitch hover:text-gold hover:underline">
            Enter Press Room
          </Link>{" "}
          to predict scores — the Special One remembers every wrong call.
        </p>
      </main>
    </div>
  );
}
