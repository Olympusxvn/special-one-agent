import Link from "next/link";

import { LuxuryNav } from "@/components/luxury/LuxuryNav";
import { NewsFeed } from "@/components/news/NewsFeed";
import { WorldCupSchedule } from "@/components/world-cup/WorldCupSchedule";
import { getWorldCupData, sourceLabel } from "@/lib/api/worldcup";

export const metadata = {
  title: "Schedules & Results | Session 4: Walrus Memory",
  description:
    "FIFA World Cup 2026 fixtures, live scores, group standings, and predictions saved to Walrus Memory.",
};

// ISR — refresh the server snapshot every minute; the client polls for live.
export const revalidate = 60;

export default async function SchedulesPage() {
  const { matches, groups, source, groupsProjected } = await getWorldCupData();

  return (
    <div className="luxe-bg-base relative min-h-screen overflow-hidden">
      <LuxuryNav active="/schedules" />

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-walrus px-5 pb-4 pt-10 text-center sm:px-6 sm:pt-14">
        <p className="luxe-eyebrow">
          FIFA World Cup 2026 · USA · Canada · Mexico
        </p>
        <h1 className="luxe-display mt-3 text-4xl text-balance sm:text-6xl">
          Schedules &amp; <span className="luxe-gold-text">Results</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted sm:text-lg">
          Every fixture of the tournament. Live scores, group standings, and the
          predictions the Special One never forgets — click any match to call it.
        </p>
        <div className="mt-5 flex items-center justify-center">
          <span className="luxe-chip">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-gold" />
            {sourceLabel(source)}
          </span>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-4xl space-y-14 px-5 py-12 sm:px-6">
        <WorldCupSchedule
          initialMatches={matches}
          groups={groups}
          source={source}
          groupsProjected={groupsProjected}
        />

        <div className="pt-2">
          <div className="mb-6 flex items-center gap-4">
            <p className="luxe-eyebrow">The Newsroom</p>
            <div className="luxe-hairline flex-1" />
          </div>
          <div className="flex justify-center">
            <NewsFeed title="World Cup Headlines" className="luxe-glass p-5" />
          </div>
        </div>

        <p className="text-center text-base text-muted">
          <Link
            href="/chat"
            className="font-semibold text-[color:var(--text-gold)] hover:underline"
          >
            Enter the Press Room
          </Link>{" "}
          to argue with the Special One — he remembers every wrong call.
        </p>
      </main>
    </div>
  );
}
