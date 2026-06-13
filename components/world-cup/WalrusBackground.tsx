"use client";

/** Subtle Walrus.xyz atmospheric gradient — no neon, premium dark-first. */
export function WalrusBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div className="walrus-bg-gradient absolute inset-0" />
      <div className="walrus-bg-glow absolute inset-0 opacity-60 dark:opacity-100" />
    </div>
  );
}
