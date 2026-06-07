import Image from "next/image";

const LOGO_SRC = "/mourinho-logo.png";

export function MourinhoAvatar({ size = 48 }: { size?: number }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-lg border-2 border-gold bg-white shadow-glow"
      style={{ width: size, height: size }}
    >
      <Image
        src={LOGO_SRC}
        alt="Mr. Toxic Special One"
        width={size}
        height={size}
        className="aspect-square h-full w-full object-contain"
        priority
      />
    </div>
  );
}
