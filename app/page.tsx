import { LuxuryHero } from "@/components/luxury/LuxuryHero";
import { LuxuryNav } from "@/components/luxury/LuxuryNav";
import { NewsFeed } from "@/components/news/NewsFeed";
import { StadiumBackground } from "@/components/world-cup/StadiumBackground";
import { isMemWalLive } from "@/lib/memory/client";

export default function HomePage() {
  const memWalLive = isMemWalLive();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <StadiumBackground />

      <LuxuryNav active="/" />

      <LuxuryHero memWalLive={memWalLive} />

      {/* Newsroom */}
      <section className="relative z-10 mx-auto w-full max-w-walrus px-5 pb-24 sm:px-6">
        <div className="mb-6 flex items-center gap-4">
          <p className="luxe-eyebrow">The Newsroom</p>
          <div className="luxe-hairline flex-1" />
        </div>
        <div className="flex justify-center">
          <NewsFeed title="World Cup Headlines" className="luxe-glass p-5" />
        </div>
      </section>
    </div>
  );
}
