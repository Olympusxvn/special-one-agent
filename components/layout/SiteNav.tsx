import Link from "next/link";

import { ThemeToggle } from "@/components/ThemeToggle";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/chat", label: "Press Room" },
  { href: "/schedules", label: "Schedules" },
  { href: "/media", label: "World Cup Media" },
] as const;

export function SiteNav({ active }: { active?: string }) {
  return (
    <header className="walrus-nav px-4 py-5 sm:px-6">
      <div className="mx-auto flex max-w-walrus flex-wrap items-center justify-between gap-4">
        <nav
          className="flex flex-wrap items-center gap-1 sm:gap-2"
          aria-label="Main navigation"
        >
          {LINKS.map((link) => {
            const isActive = active === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-pill px-3 py-1.5 text-caption transition ${
                  isActive
                    ? "border border-brand bg-brand/10 text-brand-light"
                    : "border border-transparent text-muted hover:border-border-subtle hover:text-foreground"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
