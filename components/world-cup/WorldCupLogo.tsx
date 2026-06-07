import Image from "next/image";

const SIZES = {
  sm: { width: 40, height: 28 },
  md: { width: 64, height: 45 },
  lg: { width: 96, height: 67 },
  xl: { width: 134, height: 94 },
} as const;

export function WorldCupLogo({
  size = "md",
  className = "",
  priority = false,
}: {
  size?: keyof typeof SIZES;
  className?: string;
  priority?: boolean;
}) {
  const { width, height } = SIZES[size];

  return (
    <Image
      src="/world-cup-2026-logo.png"
      alt="FIFA World Cup 2026 — USA, Canada, Mexico"
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}
