import Link from "next/link";

import { WalletButton } from "@/components/wallet/WalletButton";
import { MourinhoAvatar } from "@/components/chat/MourinhoAvatar";
import { isMemWalLive } from "@/lib/memory/client";

export default function HomePage() {
  const memWalLive = isMemWalLive();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-press-border px-4 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <p className="font-display text-lg tracking-wider text-gold">
            WALRUS SESSIONS 4
          </p>
          <WalletButton />
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center gap-8 px-4 py-16 text-center">
        <MourinhoAvatar size={120} />

        <div>
          <h1 className="font-display text-5xl tracking-wide text-gold sm:text-6xl">
            MR. TOXIC SPECIAL ONE
          </h1>
          <p className="mt-3 text-sm uppercase tracking-[0.25em] text-foreground/50">
            FIFA World Cup 2026 · Press Conference Roast Bot
          </p>
        </div>

        <p className="max-w-xl text-base leading-relaxed text-foreground/80">
          A fictional José Mourinho persona that roasts blind football fans,
          remembers every wrong prediction via{" "}
          <span className="text-gold">Walrus Memory</span>, and escalates toxicity
          with every flip-flop. 🤡💀
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-foreground/50">
          <span className="rounded-full border border-press-border px-3 py-1">
            MemWal {memWalLive ? "🟢 LIVE" : "⚪ offline demo"}
          </span>
          <span className="rounded-full border border-press-border px-3 py-1">
            Sui wallet required
          </span>
          <span className="rounded-full border border-press-border px-3 py-1">
            English only
          </span>
        </div>

        <Link
          href="/chat"
          className="rounded-xl bg-gold px-8 py-4 text-lg font-bold text-press shadow-glow transition hover:bg-gold/90"
        >
          Enter Press Room →
        </Link>

        <p className="max-w-md text-xs text-foreground/40">
          Connect your Sui wallet first. The Special One does not argue with
          anonymous cope merchants.
        </p>
      </main>
    </div>
  );
}
