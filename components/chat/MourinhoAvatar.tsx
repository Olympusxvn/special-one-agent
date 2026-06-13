import Image from "next/image";

const LOGO_SRC = "/mourinho-logo.png";

/** Premium Walrus × Mourinho hybrid avatar — subtle purple/cyan ring. */
export function MourinhoAvatar({
  size = 44,
  premium = true,
}: {
  size?: number;
  premium?: boolean;
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-surface-elevated ${
        premium ? "walrus-avatar-ring-premium" : "walrus-avatar-ring"
      }`}
      style={{ width: size, height: size }}
    >
      <Image
        src={LOGO_SRC}
        alt="Mr. Toxic Special One"
        width={size}
        height={size}
        className="aspect-square h-full w-full object-cover"
        priority
      />
      {/* Walrus accent — subtle cyan arc */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-brand/10 via-transparent to-accent/10"
        aria-hidden
      />
    </div>
  );
}
