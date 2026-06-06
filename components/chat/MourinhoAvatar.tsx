import Image from "next/image";

export function MourinhoAvatar({ size = 48 }: { size?: number }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full border-2 border-gold shadow-glow"
      style={{ width: size, height: size }}
    >
      <Image
        src="/mourinho-avatar.svg"
        alt="Mr. Toxic Special One"
        width={size}
        height={size}
        className="object-cover"
        priority
      />
    </div>
  );
}
