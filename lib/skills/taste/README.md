# `lib/skills/taste` — taste-skill runtime engine

A **decoupled, reusable** runtime port of
[`Leonxlnx/taste-skill`](https://github.com/Leonxlnx/taste-skill) (MIT).
Turns the skill's three-dial taste model into typed values, design tokens, and
motion presets you can feed straight into Tailwind + framer-motion.

## Why this exists

`taste-skill` is an *agent skill* (Markdown rules for AI coding agents), not an
npm package. To keep its taste **consistent at runtime** — and reusable across
projects — its decision model is vendored here as plain TypeScript.

## File map

| File | Responsibility | Imports |
|---|---|---|
| `dials.ts` | The 3 dials, presets, resolve/clamp | none |
| `tokens.ts` | Dials → spacing / motion / variance tokens | `./dials` |
| `motion-presets.ts` | Tokens → framer-motion-compatible variants | `./tokens` |
| `taste-config.ts` | Compose dials+tokens+motion into `TasteConfig` | siblings |
| `use-taste-skill.ts` | `useTasteSkill()` hook + reduced-motion wiring | React + siblings |
| `index.ts` | Public barrel — **import only from here** | siblings |
| `SKILL.md` | Vendored skill description | — |

The dependency graph is one-directional and **self-contained**: the only
external runtime dependency is React (and only inside the hook).

## Quick start

```tsx
"use client";
import { motion, type Variants } from "framer-motion";
import { useTasteSkill, LUXURY_WC_TASTE } from "@/lib/skills/taste";

export function Hero() {
  const taste = useTasteSkill(LUXURY_WC_TASTE);
  return (
    <motion.section
      variants={taste.motion.container as Variants}
      initial="hidden"
      animate="show"
      style={{ paddingBlock: `${taste.tokens.spacing.section}rem` }}
    >
      <motion.h1 variants={taste.motion.fadeRise as Variants}>
        Session 4: Walrus Memory
      </motion.h1>
    </motion.section>
  );
}
```

## Detach & plug into another project

1. **Copy** the entire `lib/skills/taste/` folder into the target repo.
2. Ensure the target uses **React 18+**. No other runtime dependency is needed.
3. *(Optional)* `npm i framer-motion` to consume the motion presets with
   `<motion.* />`. The presets are plain objects, so any animation library —
   or none — works.
4. Import from the barrel and drive your UI:

   ```ts
   import { useTasteSkill } from "@/lib/skills/taste";
   const taste = useTasteSkill({ preset: "landingAgency" });
   ```

5. **To remove:** delete the folder and its imports. Nothing else in the
   codebase reaches inside it.

## Customising the taste

```ts
// Start from a preset, override dials conversationally:
useTasteSkill({ preset: "premiumConsumer", dials: { MOTION_INTENSITY: 8 } });

// Or build a config outside React (server-safe, deterministic):
import { createTasteConfig } from "@/lib/skills/taste";
const taste = createTasteConfig({ preset: "editorial" });
```

## License / attribution

Runtime port of `taste-skill` © 2026 Leonxlnx, MIT. The upstream agent skill
remains the source of truth for the design rules; reinstall it with:

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
```
