import Image from "next/image";

import { teamNameToLogoSrc } from "@/lib/teams/team-logos";
import { countryCodeToFlag, teamNameToFlag } from "@/lib/teams/team-flags";

type Size = "sm" | "md" | "lg";

const PLAIN_SIZE: Record<Size, string> = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
};

const GLASS_SIZE: Record<Size, string> = {
  sm: "h-9 w-9 text-base",
  md: "h-12 w-12 text-xl",
  lg: "h-14 w-14 text-2xl",
};

const LOGO_PX: Record<Size, number> = {
  sm: 28,
  md: 36,
  lg: 44,
};

/**
 * Nation flag or crest.
 * - `plain`: emoji only (chat / compact UI).
 * - `glass`: emoji inside luxe glass tile.
 * - `logo-glass`: national-team crest PNG when available, else emoji in glass.
 */
export function TeamFlag({
  team,
  code,
  label,
  size = "md",
  variant = "plain",
  className = "",
}: {
  team?: string | null;
  code?: string;
  label?: string;
  size?: Size;
  variant?: "plain" | "glass" | "logo-glass";
  className?: string;
}) {
  const flag = code ? countryCodeToFlag(code) : teamNameToFlag(team);
  const ariaLabel = label ?? team ?? code ?? "flag";
  const logoSrc =
    variant === "logo-glass" ? teamNameToLogoSrc(team) : null;

  if (variant === "logo-glass" || variant === "glass") {
    const px = LOGO_PX[size];
    return (
      <span
        className={`luxe-flag overflow-hidden ${GLASS_SIZE[size]} ${className}`}
        role="img"
        aria-label={ariaLabel}
        title={ariaLabel}
      >
        {logoSrc ? (
          <Image
            src={logoSrc}
            alt=""
            width={px}
            height={px}
            className="h-[70%] w-[70%] object-contain"
            unoptimized
          />
        ) : (
          flag
        )}
      </span>
    );
  }

  return (
    <span
      className={`leading-none ${PLAIN_SIZE[size]} ${className}`}
      role="img"
      aria-label={ariaLabel}
    >
      {flag}
    </span>
  );
}
