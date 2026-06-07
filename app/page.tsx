import Link from "next/link";

import { MourinhoAvatar } from "@/components/chat/MourinhoAvatar";
import { NewsFeed } from "@/components/news/NewsFeed";
import { WalletButton } from "@/components/wallet/WalletButton";
import { WorldCupLogo } from "@/components/world-cup/WorldCupLogo";
import { WorldCupStripe } from "@/components/world-cup/WorldCupStripe";
import { WorldCupWatermark } from "@/components/world-cup/WorldCupWatermark";
import { isMemWalLive } from "@/lib/memory/client";

export default function HomePage() {
  const memWalLive = isMemWalLive();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <WorldCupWatermark />
      <div className="pitch-accent-bar" />
      <WorldCupStripe />

      <header className="stadium-header px-4 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <WorldCupLogo size="sm" className="hidden opacity-90 sm:block" />
            <p className="font-display text-lg tracking-[0.15em] text-gold">
              WALRUS SESSIONS 4
              <span className="ml-2 text-pitch">· WC 2026</span>
            </p>
          </div>
          <WalletButton />
        </div>
      </header>

      <main className="relative mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center gap-8 px-4 py-16 text-center">
        {/* decorative confetti accents */}
        <div className="pointer-events-none absolute inset-x-0 top-32 flex justify-center gap-48 opacity-40">
          <span className="animate-confetti-float text-2xl" style={{ animationDelay: "0s" }}>
            🏆
          </span>
          <span className="animate-confetti-float text-xl" style={{ animationDelay: "1.2s" }}>
            ⚽
          </span>
          <span className="animate-confetti-float text-2xl" style={{ animationDelay: "0.6s" }}>
            🎉
          </span>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 rounded-full bg-pitch/10 blur-3xl" />
          <div className="absolute -inset-4 rounded-full bg-gold/5 blur-2xl" />
          <MourinhoAvatar size={120} />
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-center">
          <div className="logo-badge shrink-0">
            <WorldCupLogo size="lg" priority className="drop-shadow-md" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="font-display text-5xl tracking-wide sm:text-6xl">
              <span className="gradient-text-festive">MR. TOXIC SPECIAL ONE</span>
            </h1>
            <p className="mt-3 text-sm uppercase tracking-[0.3em] text-pitch/80">
              FIFA World Cup 2026
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-foreground/45">
              Press Conference Roast Bot · USA · Canada · Mexico
            </p>
          </div>
        </div>

        <p className="max-w-xl text-base leading-relaxed text-foreground/80">
          A fictional José Mourinho persona that roasts blind football fans,
          remembers every wrong prediction via{" "}
          <span className="font-semibold text-gold">Walrus Memory</span>, and escalates
          toxicity with every flip-flop. 🤡💀
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
          <span className="badge-festive rounded-full px-3 py-1.5 text-foreground/70">
            MemWal {memWalLive ? "🟢 LIVE" : "⚪ offline demo"}
          </span>
          <span className="badge-festive rounded-full px-3 py-1.5 text-foreground/70">
            Sui wallet required
          </span>
          <span className="badge-festive rounded-full px-3 py-1.5 text-foreground/70">
            English only
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/chat"
            className="btn-festive rounded-xl px-8 py-4 text-lg font-bold shadow-glow-gold"
          >
            Enter Press Room →
          </Link>
          <Link
            href="/schedules"
            className="btn-outline-festive rounded-xl px-6 py-4 text-sm font-semibold text-gold"
          >
            Schedules & Results
          </Link>
        </div>

        <NewsFeed />

        <p className="max-w-md text-xs text-foreground/40">
          Connect your Sui wallet first. The Special One does not argue with
          anonymous cope merchants.
        </p>
      </main>
    </div>
  );
}
