/**
 * taste-skill · TOKENS
 * -------------------------------------------------------------------------
 * Derives concrete, framework-agnostic design tokens from the three dials.
 * These are plain values (numbers / strings) — no Tailwind, no React — so the
 * same taste decisions can drive CSS variables, inline styles, or motion.
 *
 * PORTABILITY: zero external imports. Safe to copy with the folder.
 */

import type { TasteDials } from "./dials";

export interface SpacingScale {
  /** Section vertical rhythm, in rem. Airy density → larger gaps. */
  section: number;
  /** Stack gap between grouped elements, in rem. */
  stack: number;
  /** Inline gap between inline elements, in rem. */
  inline: number;
}

export interface MotionTokens {
  /** Whether motion should run at all (MOTION_INTENSITY > 1). */
  enabled: boolean;
  /** Base entrance duration, seconds. */
  duration: number;
  /** Stagger between siblings, seconds. */
  stagger: number;
  /** Travel distance for entrance transforms, px. */
  distance: number;
  /** Whether scroll / pointer-physics tier is unlocked (>= 7). */
  immersive: boolean;
}

export interface VarianceTokens {
  /** 0–1 normalized variance, handy for interpolation. */
  level: number;
  /** Suggested hero alignment derived from variance. */
  heroAlign: "center" | "asymmetric";
  /** Suggested feature grid column count. */
  gridColumns: number;
}

export interface TasteTokens {
  spacing: SpacingScale;
  motion: MotionTokens;
  variance: VarianceTokens;
}

/** VISUAL_DENSITY → spacing rhythm. Higher density compresses the scale. */
export function spacingFromDensity(density: number): SpacingScale {
  // density 1 (airy) → big; density 10 (packed) → tight.
  const t = (10 - density) / 9; // 0..1, 1 = airiest
  return {
    section: round(3 + t * 5), // 3rem .. 8rem
    stack: round(1 + t * 1.5), // 1rem .. 2.5rem
    inline: round(0.5 + t * 0.75), // 0.5rem .. 1.25rem
  };
}

/** MOTION_INTENSITY → motion timing + capability tier. */
export function motionFromIntensity(intensity: number): MotionTokens {
  const enabled = intensity > 1;
  const t = (intensity - 1) / 9; // 0..1
  return {
    enabled,
    // Higher intensity = slightly longer, more deliberate cinematic entrances.
    duration: round(0.35 + t * 0.5), // 0.35s .. 0.85s
    stagger: round(0.04 + t * 0.1), // 0.04s .. 0.14s
    distance: Math.round(8 + t * 28), // 8px .. 36px
    immersive: intensity >= 7,
  };
}

/** DESIGN_VARIANCE → layout asymmetry hints. */
export function varianceFromDial(variance: number): VarianceTokens {
  const level = (variance - 1) / 9; // 0..1
  return {
    level: round(level),
    heroAlign: variance >= 7 ? "asymmetric" : "center",
    gridColumns: variance >= 9 ? 4 : variance >= 6 ? 3 : 2,
  };
}

export function tokensFromDials(dials: TasteDials): TasteTokens {
  return {
    spacing: spacingFromDensity(dials.VISUAL_DENSITY),
    motion: motionFromIntensity(dials.MOTION_INTENSITY),
    variance: varianceFromDial(dials.DESIGN_VARIANCE),
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
