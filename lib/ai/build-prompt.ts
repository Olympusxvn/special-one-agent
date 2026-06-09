import type { FanMemory } from "@/lib/memory/types";

import { MR_TOXIC_FAST_PROMPT } from "./system-prompt";

export interface BuildPromptInput {
  fanProfile: FanMemory;
  recalledMemories: string[];
  toxicityLevel: number;
  matchContext?: string;
}

/** Slim profile for lower latency (smaller prompt → faster TTFT). */
function compactFanProfile(profile: FanMemory) {
  const lastPred = profile.past_predictions.at(-1);
  return {
    team: profile.favorite_team || null,
    flips: profile.flip_flop_count,
    last: lastPred
      ? `${lastPred.prediction}${lastPred.result ? ` → ${lastPred.result}` : ""}`
      : null,
  };
}

export function buildSystemPrompt(input: BuildPromptInput): string {
  const parts = [MR_TOXIC_FAST_PROMPT];

  parts.push(`tox:${input.toxicityLevel}`);
  parts.push(`fan:${JSON.stringify(compactFanProfile(input.fanProfile))}`);

  if (input.recalledMemories.length > 0) {
    parts.push(
      `mem:${input.recalledMemories[0]!.replace(/\s+/g, " ").trim().slice(0, 80)}`,
    );
  }

  if (input.matchContext) {
    parts.push(`\n## MATCH_CONTEXT`);
    parts.push(input.matchContext);
  }

  return parts.join("\n");
}
