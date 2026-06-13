/**
 * taste-skill · MOTION PRESETS
 * -------------------------------------------------------------------------
 * Entrance / hover variants gated by MOTION_INTENSITY. The shapes are
 * intentionally compatible with framer-motion / motion (`Variants`,
 * `transition`) but typed locally as plain objects so this module has NO
 * hard dependency on any animation library. If MOTION_INTENSITY is 1, the
 * presets collapse to no-op (respecting "static" + reduced-motion).
 *
 * PORTABILITY: zero external imports. Consumers cast these to their motion
 * library's `Variants` type at the call site.
 */

import type { MotionTokens } from "./tokens";

/** Minimal structural type — assignable to framer-motion's `Variants`. */
export type MotionVariant = Record<string, Record<string, unknown>>;

export interface MotionPresets {
  /** Container that staggers its children on mount. */
  container: MotionVariant;
  /** Generic fade + rise entrance for a single element. */
  fadeRise: MotionVariant;
  /** Scale-in for badges / pills / avatars. */
  scaleIn: MotionVariant;
  /** Hover lift for interactive cards / buttons. */
  hoverLift: Record<string, unknown>;
  /** Shared transition object (duration + easing). */
  transition: { duration: number; ease: number[] };
  /** Convenience flag so callers can skip motion entirely. */
  enabled: boolean;
}

// Expensive, calm easing — premium feel (matches "soft" cubic-bezier).
const LUXE_EASE = [0.22, 1, 0.36, 1];

export function motionPresets(tokens: MotionTokens): MotionPresets {
  const { enabled, duration, stagger, distance } = tokens;

  if (!enabled) {
    const noop: MotionVariant = { hidden: {}, show: {} };
    return {
      container: noop,
      fadeRise: noop,
      scaleIn: noop,
      hoverLift: {},
      transition: { duration: 0, ease: LUXE_EASE },
      enabled: false,
    };
  }

  return {
    container: {
      hidden: {},
      show: {
        transition: { staggerChildren: stagger, delayChildren: 0.05 },
      },
    },
    fadeRise: {
      hidden: { opacity: 0, y: distance },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration, ease: LUXE_EASE },
      },
    },
    scaleIn: {
      hidden: { opacity: 0, scale: 0.9 },
      show: {
        opacity: 1,
        scale: 1,
        transition: { duration: duration * 0.85, ease: LUXE_EASE },
      },
    },
    hoverLift: {
      y: -4,
      transition: { duration: 0.25, ease: LUXE_EASE },
    },
    transition: { duration, ease: LUXE_EASE },
    enabled: true,
  };
}
