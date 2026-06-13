"use client";

import Link from "next/link";

import { MourinhoAvatar } from "@/components/chat/MourinhoAvatar";
import { TeamFlag } from "@/components/world-cup/TeamFlag";
import { LUXURY_WC_TASTE, useTasteSkill } from "@/lib/skills/taste";

// Host nations first, then marquee favorites — luxe glass flag strip.
const NATIONS: { code: string; label: string }[] = [
  { code: "US", label: "United States" },
  { code: "CA", label: "Canada" },
  { code: "MX", label: "Mexico" },
  { code: "BR", label: "Brazil" },
  { code: "AR", label: "Argentina" },
  { code: "FR", label: "France" },
  { code: "ES", label: "Spain" },
  { code: "PT", label: "Portugal" },
  { code: "GB", label: "England" },
  { code: "DE", label: "Germany" },
];

export function LuxuryHero({ memWalLive }: { memWalLive: boolean }) {
  // Taste-skill drives motion timing + spacing. Reduced-motion auto-handled.
  // CSS keyframes (not JS gating) guarantee content is visible even if JS
  // hydration is slow or disabled.
  const taste = useTasteSkill(LUXURY_WC_TASTE);
  const motionOn = taste.tokens.motion.enabled;
  const stagger = taste.tokens.motion.stagger;

  let step = 0;
  const reveal = () => {
    if (!motionOn) return undefined;
    const delay = `${(0.05 + step++ * stagger).toFixed(2)}s`;
    return { animationDelay: delay } as const;
  };
  const anim = motionOn ? "animate-fade-in" : "";

  return (
    <section
      aria-label="Session 4: Walrus Memory"
      className="relative z-10 mx-auto flex min-h-[calc(100dvh-5.5rem)] max-w-walrus items-center justify-center px-5 py-12 sm:px-6"
    >
      <div className="luxe-glass luxe-glass-strong w-full max-w-3xl px-6 py-10 text-center sm:px-12 sm:py-14">
        <div className={`flex justify-center ${anim}`} style={reveal()}>
          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-full bg-[radial-gradient(circle,var(--gold-glow),transparent_70%)] blur-xl" />
            <MourinhoAvatar size={88} />
          </div>
        </div>

        <p className={`luxe-eyebrow mt-6 ${anim}`} style={reveal()}>
          Walrus Sessions · World Cup 2026
        </p>

        {/* STRICT TITLE */}
        <h1
          className={`luxe-display mt-4 text-balance text-5xl sm:text-6xl lg:text-7xl ${anim}`}
          style={reveal()}
        >
          Session 4:{" "}
          <span className="luxe-gold-text">Walrus Memory</span>
        </h1>

        <p
          className={`mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg ${anim}`}
          style={reveal()}
        >
          The VIP lounge of the 2026 final. A fictional José Mourinho persona
          that roasts blind football fans and remembers every wrong prediction —
          on-chain, forever, via Walrus Memory.
        </p>

        {/* Glass flag strip */}
        <div
          className={`mx-auto mt-7 flex max-w-xl flex-wrap items-center justify-center gap-2.5 ${anim}`}
          style={reveal()}
        >
          {NATIONS.map((n) => (
            <TeamFlag
              key={n.code}
              code={n.code}
              label={n.label}
              size="md"
              variant="glass"
            />
          ))}
        </div>

        <div
          className={`mt-7 flex flex-wrap items-center justify-center gap-2.5 ${anim}`}
          style={reveal()}
        >
          <span className={`luxe-chip ${memWalLive ? "luxe-chip-gold" : ""}`}>
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                memWalLive ? "bg-gold" : "bg-muted"
              }`}
            />
            MemWal {memWalLive ? "live · mainnet" : "offline demo"}
          </span>
          <span className="luxe-chip">Sui wallet</span>
          <span className="luxe-chip">Portable on-chain memory</span>
        </div>

        <div
          className={`mt-8 flex flex-wrap items-center justify-center gap-3 ${anim}`}
          style={reveal()}
        >
          <Link href="/chat" className="btn-luxe">
            Enter the press room
          </Link>
          <Link href="/schedules" className="btn-luxe-ghost">
            Schedules
          </Link>
          <Link href="/media" className="btn-luxe-ghost">
            World Cup Media
          </Link>
        </div>

        <p
          className={`mx-auto mt-7 max-w-md text-sm text-muted-foreground ${anim}`}
          style={reveal()}
        >
          Connect your Sui wallet to enter. The Special One does not argue with
          anonymous cope merchants.
        </p>
      </div>
    </section>
  );
}
