import Image from "next/image";

import { WORLD_CUP_MEDIA } from "@/lib/world-cup/media";

/**
 * World Cup media backdrop — ORIGINAL imagery, full color, not blurred/dimmed.
 * Only a light edge scrim keeps top (nav) and bottom readable; the center
 * stays vivid. Server-safe; sits behind page content.
 */
export function StadiumBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 grid grid-cols-2 sm:grid-cols-4">
        {WORLD_CUP_MEDIA.map((item, index) => (
          <div key={item.id} className="relative h-full overflow-hidden">
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

      {/* Light edge scrim only — keeps imagery vivid, helps nav/footer legibility */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background/90 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background/90 to-transparent" />
    </div>
  );
}
