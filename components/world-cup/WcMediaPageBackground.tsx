import Image from "next/image";

import { WORLD_CUP_MEDIA } from "@/lib/world-cup/media";

/** Four-column WC media strip — original colors, light edge vignette for text. */
export function WcMediaPageBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 grid grid-cols-2 sm:grid-cols-4">
        {WORLD_CUP_MEDIA.map((item, index) => (
          <div
            key={item.id}
            className="relative h-full overflow-hidden border-r border-border-subtle/15 last:border-r-0"
          >
            <Image
              src={item.src}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              priority={index < 2}
              quality={90}
              className="object-cover object-center"
            />
          </div>
        ))}
      </div>

      {/* Light edge vignette only — center stays clear */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,var(--background)_100%)] opacity-35 dark:opacity-40"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/35"
        aria-hidden
      />
    </div>
  );
}
