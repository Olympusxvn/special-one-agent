import Image from "next/image";

const LOGO_SRC = "/mourinho-logo.png";

export function MourinhoAvatar({ size = 48 }: { size?: number }) {
  return (
    <div
      className="avatar-ring relative shrink-0 overflow-hidden rounded-xl bg-white"
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
