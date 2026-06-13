/**
 * taste-skill · DIALS
 * -------------------------------------------------------------------------
 * Faithful runtime port of the three "dials" from the taste-skill agent
 * skill (https://github.com/Leonxlnx/taste-skill). The skill itself is a set
 * of design instructions for AI agents; this module turns its core decision
 * model into typed, reusable runtime values so product UI can stay consistent
 * with the same taste rules.
 *
 * The three dials gate every layout / motion / density decision:
 *   - DESIGN_VARIANCE  1 = perfect symmetry      → 10 = artsy chaos
 *   - MOTION_INTENSITY 1 = static                → 10 = cinematic / physics
 *   - VISUAL_DENSITY   1 = art gallery / airy    → 10 = cockpit / packed
 *
 * PORTABILITY: this file has zero external imports. Copy the whole
 * `lib/skills/taste/` folder into any project untouched.
 */

export type DialValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface TasteDials {
  /** Layout experimentation. Lower = centered/clean, higher = asymmetric. */
  DESIGN_VARIANCE: DialValue;
  /** Animation depth. Lower = hover only, higher = scroll/physics. */
  MOTION_INTENSITY: DialValue;
  /** Information per viewport. Lower = spacious, higher = dense. */
  VISUAL_DENSITY: DialValue;
}

/** taste-skill baseline (8 / 6 / 4) — used unless the brief overrides it. */
export const BASELINE_DIALS: TasteDials = {
  DESIGN_VARIANCE: 8,
  MOTION_INTENSITY: 6,
  VISUAL_DENSITY: 4,
};

/**
 * Use-case presets straight from the skill's preset table. Pick the closest
 * one to your brief, then override conversationally if needed.
 */
export const DIAL_PRESETS = {
  landingSaaS: { DESIGN_VARIANCE: 7, MOTION_INTENSITY: 6, VISUAL_DENSITY: 4 },
  landingAgency: { DESIGN_VARIANCE: 9, MOTION_INTENSITY: 8, VISUAL_DENSITY: 3 },
  premiumConsumer: { DESIGN_VARIANCE: 7, MOTION_INTENSITY: 6, VISUAL_DENSITY: 3 },
  portfolioDesigner: { DESIGN_VARIANCE: 8, MOTION_INTENSITY: 7, VISUAL_DENSITY: 3 },
  portfolioDeveloper: { DESIGN_VARIANCE: 6, MOTION_INTENSITY: 5, VISUAL_DENSITY: 4 },
  editorial: { DESIGN_VARIANCE: 6, MOTION_INTENSITY: 4, VISUAL_DENSITY: 3 },
  trustFirst: { DESIGN_VARIANCE: 3, MOTION_INTENSITY: 2, VISUAL_DENSITY: 5 },
} as const satisfies Record<string, TasteDials>;

export type DialPresetName = keyof typeof DIAL_PRESETS;

/** Clamp any number into the valid 1–10 dial range. */
export function clampDial(n: number): DialValue {
  return Math.min(10, Math.max(1, Math.round(n))) as DialValue;
}

/** Merge a preset (or baseline) with partial overrides, clamping the result. */
export function resolveDials(
  base: TasteDials = BASELINE_DIALS,
  overrides: Partial<TasteDials> = {},
): TasteDials {
  return {
    DESIGN_VARIANCE: clampDial(overrides.DESIGN_VARIANCE ?? base.DESIGN_VARIANCE),
    MOTION_INTENSITY: clampDial(overrides.MOTION_INTENSITY ?? base.MOTION_INTENSITY),
    VISUAL_DENSITY: clampDial(overrides.VISUAL_DENSITY ?? base.VISUAL_DENSITY),
  };
}
