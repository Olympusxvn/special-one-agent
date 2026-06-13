import Link from "next/link";

import { ThemeToggle } from "@/components/ThemeToggle";
import { WalletButton } from "@/components/wallet/WalletButton";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/chat", label: "Press Room" },
  { href: "/schedules", label: "Schedules" },
  { href: "/media", label: "Media" },
] as const;

/** Shared luxe glass top bar used across all tabs for a consistent feel. */
export function LuxuryNav({ active }: { active?: string }) {
  return (
    <header className="sticky top-0 z-30 px-4 py-3 sm:px-6">
      <div className="luxe-glass luxe-glass-strong mx-auto flex max-w-walrus flex-wrap items-center justify-between gap-3 rounded-full px-4 py-2.5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="inline-block h-2 w-2 rounded-full bg-gold shadow-[0_0_10px_var(--gold-glow)]" />
          <span className="luxe-eyebrow text-[0.7rem]">
            Session 4 · Walrus Memory
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="order-last flex w-full items-center justify-center gap-1 sm:order-none sm:w-auto sm:gap-2"
        >
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active === link.href ? "page" : undefined}
              className={`luxe-navlink ${
                active === link.href ? "luxe-navlink-active" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <WalletButton />
        </div>
      </div>
    </header>
  );
}
