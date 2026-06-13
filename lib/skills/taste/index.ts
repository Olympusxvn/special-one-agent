/**
 * taste-skill · PUBLIC API (barrel)
 * -------------------------------------------------------------------------
 * This is the ONLY file the rest of the app should import from. Everything
 * below is the stable, supported surface of the skill. Internal derivation
 * (tokens.ts, motion-presets.ts) may change without breaking consumers.
 *
 * ┌─ HOW TO DETACH & PLUG INTO ANOTHER PROJECT ──────────────────────────┐
 * │ 1. Copy the entire `lib/skills/taste/` folder into the target repo.   │
 * │    It has ZERO app-specific imports — only React (for the hook).      │
 * │ 2. Ensure the target has React 18+. No other runtime deps required.  │
 * │ 3. (Optional) `npm i framer-motion` if you want to feed the motion    │
 * │    presets into `<motion.* />`. The presets are plain objects, so any │
 * │    animation lib — or none — works.                                   │
 * │ 4. In a client component:                                             │
 * │      import { useTasteSkill } from "@/lib/skills/taste";              │
 * │      const taste = useTasteSkill({ preset: "landingSaaS" });          │
 * │ 5. Drive your UI from `taste.tokens`, `taste.motion`, `taste.dials`.  │
 * │                                                                       │
 * │ To remove it: delete the folder and the import. Nothing else in the  │
 * │ codebase reaches into it.                                             │
 * └───────────────────────────────────────────────────────────────────────┘
 */

export {
  BASELINE_DIALS,
  DIAL_PRESETS,
  resolveDials,
  clampDial,
  type TasteDials,
  type DialValue,
  type DialPresetName,
} from "./dials";

export {
  tokensFromDials,
  type TasteTokens,
  type SpacingScale,
  type MotionTokens,
  type VarianceTokens,
} from "./tokens";

export {
  motionPresets,
  type MotionPresets,
  type MotionVariant,
} from "./motion-presets";

export {
  createTasteConfig,
  LUXURY_WC_TASTE,
  type TasteConfig,
  type TasteConfigInput,
  type DesignRead,
} from "./taste-config";

export { useTasteSkill } from "./use-taste-skill";
