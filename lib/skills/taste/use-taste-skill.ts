"use client";

/**
 * taste-skill · useTasteSkill HOOK
 * -------------------------------------------------------------------------
 * The public abstraction. UI components call `useTasteSkill(...)` and receive
 * a fully-resolved `TasteConfig` (dials + tokens + motion presets) WITHOUT
 * knowing how any of it is derived. Swap the internals freely; the hook's
 * return shape is the contract.
 *
 * It also wires in the OS "prefers-reduced-motion" setting automatically, so
 * every consumer gets accessible motion for free.
 *
 * PORTABILITY: the only external import is React. Copy the folder and this
 * works in any React 18+ / Next.js app.
 *
 * Usage:
 *   const taste = useTasteSkill(LUXURY_WC_TASTE);
 *   <motion.div variants={taste.motion.fadeRise as Variants} />
 */

import { useEffect, useMemo, useState } from "react";

import {
  createTasteConfig,
  type TasteConfig,
  type TasteConfigInput,
} from "./taste-config";

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function useTasteSkill(input: TasteConfigInput = {}): TasteConfig {
  const prefersReduced = usePrefersReducedMotion();

  // Serialize the declared intent so the memo is stable across renders even
  // when callers pass a fresh object literal each time.
  const dialsKey = JSON.stringify(input.dials ?? null);
  const readKey = JSON.stringify(input.read ?? null);
  const { preset, reducedMotion } = input;

  return useMemo(
    () =>
      createTasteConfig({
        preset,
        reducedMotion: reducedMotion ?? prefersReduced,
        dials: dialsKey ? JSON.parse(dialsKey) : undefined,
        read: readKey ? JSON.parse(readKey) : undefined,
      }),
    [preset, reducedMotion, prefersReduced, dialsKey, readKey],
  );
}
