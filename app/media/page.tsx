import Link from "next/link";

import { LuxuryNav } from "@/components/luxury/LuxuryNav";
import { StadiumBackground } from "@/components/world-cup/StadiumBackground";
import { WorldCupMediaTabs } from "@/components/world-cup/WorldCupMediaTabs";
import { WORLD_CUP_MEDIA } from "@/lib/world-cup/media";

export const metadata = {
  title: "World Cup Media | Mr. Toxic Special One",
  description:
    "Premium World Cup 2026 media — Walrus meets the beautiful game.",
};

export default function WorldCupMediaPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <StadiumBackground />

      <LuxuryNav active="/media" />

      <main className="relative z-10 mx-auto max-w-walrus px-5 py-10 sm:px-6 sm:py-14">
        {/* Luxe hero header */}
        <header className="mb-10 text-center sm:mb-12">
          <p className="luxe-eyebrow">FIFA World Cup 2026</p>
          <h1 className="luxe-display mt-4 text-balance text-5xl sm:text-6xl">
            World Cup <span className="luxe-gold-text">Media</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            Official-style campaign visuals — Walrus on the pitch, in the net,
            and on the touchline. Select a frame to view it in full.
          </p>
        </header>

        {/* Glass gallery shell */}
        <section className="luxe-glass luxe-glass-strong p-4 sm:p-6">
          <WorldCupMediaTabs items={WORLD_CUP_MEDIA} />
        </section>

        {/* CTA */}
        <div className="mx-auto mt-12 flex max-w-2xl flex-col items-center gap-4 text-center">
          <div className="luxe-hairline w-full" />
          <p className="text-sm text-muted">
            The Special One has opinions about every frame.
          </p>
          <Link href="/chat" className="btn-luxe">
            Enter the Press Room
          </Link>
        </div>
      </main>
    </div>
  );
}
