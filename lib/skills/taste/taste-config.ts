/**
 * taste-skill · CONFIG
 * -------------------------------------------------------------------------
 * The single composable object the rest of an app consumes. A `TasteConfig`
 * bundles: the resolved dials, the derived tokens, the motion presets, and an
 * optional named "palette intent" so a project can declare its aesthetic once.
 *
 * This is the abstraction boundary: UI imports `TasteConfig` (via the
 * `useTasteSkill` hook), never the internal derivation modules.
 *
 * PORTABILITY: zero external imports beyond sibling files. Copy the folder.
 */

import {
  BASELINE_DIALS,
  DIAL_PRESETS,
  resolveDials,
  type DialPresetName,
  type TasteDials,
} from "./dials";
import { motionPresets, type MotionPresets } from "./motion-presets";
import { tokensFromDials, type TasteTokens } from "./tokens";

/**
 * A "design read" — the one-line intent the taste-skill asks you to declare
 * before generating. Kept as free-form metadata for documentation / debugging.
 */
export interface DesignRead {
  /** e.g. "premium consumer landing for football fans". */
  pageKind: string;
  /** Vibe words: "luxury", "VIP lounge", "World Cup". */
  vibe: string[];
  /** Leaning: stack / fonts / motion approach. */
  leaning: string;
}

export interface TasteConfigInput {
  /** Start from a named preset (defaults to premiumConsumer). */
  preset?: DialPresetName;
  /** Conversational dial overrides on top of the preset. */
  dials?: Partial<TasteDials>;
  /** Optional human-readable design read. */
  read?: DesignRead;
  /** Honor reduced-motion: force motion off regardless of dial. */
  reducedMotion?: boolean;
}

export interface TasteConfig {
  dials: TasteDials;
  tokens: TasteTokens;
  motion: MotionPresets;
  read?: DesignRead;
}

/**
 * Build a TasteConfig. Pure + deterministic — same input → same output, so it
 * is safe to call on the server or memoize on the client.
 */
export function createTasteConfig(input: TasteConfigInput = {}): TasteConfig {
  const base = input.preset ? DIAL_PRESETS[input.preset] : BASELINE_DIALS;
  const dials = resolveDials(base, input.dials);
  const tokens = tokensFromDials(dials);

  // Reduced-motion override: collapse motion tier to "static".
  const motionTokens = input.reducedMotion
    ? { ...tokens.motion, enabled: false, immersive: false }
    : tokens.motion;

  return {
    dials,
    tokens,
    motion: motionPresets(motionTokens),
    read: input.read,
  };
}

/**
 * Ready-made config for THIS project: a luxury "VIP lounge at the World Cup
 * 2026 final" landing. premiumConsumer preset, motion nudged up for cinematic
 * entrances, density kept airy for an expensive feel.
 *
 * To reuse the skill in another project, ignore this and call
 * `createTasteConfig()` with your own preset/overrides.
 */
export const LUXURY_WC_TASTE: TasteConfigInput = {
  preset: "premiumConsumer",
  dials: { MOTION_INTENSITY: 7, VISUAL_DENSITY: 3 },
  read: {
    pageKind: "premium consumer landing — World Cup 2026 VIP lounge",
    vibe: ["luxury", "obsidian + gold", "VIP lounge", "World Cup 2026"],
    leaning: "Tailwind + glassmorphism + framer-motion, elegant sans display",
  },
};
