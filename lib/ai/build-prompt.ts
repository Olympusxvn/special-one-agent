import type { FanMemory } from "@/lib/memory/types";
import { formatMemoriesBlock } from "@/lib/memory/recall";

import { MR_TOXIC_FAST_PROMPT } from "./system-prompt";

export interface BuildPromptInput {
  fanProfile: FanMemory;
  recalledMemories: string[];
  toxicityLevel: number;
  matchContext?: string;
}

function compactFanProfile(profile: FanMemory) {
  const lastPred = profile.past_predictions.at(-1);
  return {
    team: profile.favorite_team || null,
    flips: profile.flip_flop_count,
    confidence: profile.confidence_level,
    last: lastPred
      ? `${lastPred.prediction}${lastPred.result ? ` → ${lastPred.result}` : ""}`
      : null,
  };
}

export function buildSystemPrompt(input: BuildPromptInput): string {
  const parts = [MR_TOXIC_FAST_PROMPT];

  parts.push(`tox:${input.toxicityLevel}`);
  parts.push(`fan:${JSON.stringify(compactFanProfile(input.fanProfile))}`);

  const memBlock = formatMemoriesBlock(input.recalledMemories, 5);
  if (memBlock) {
    parts.push("## WALRUS_MEMORY (personalize roast — reference these facts)");
    parts.push(memBlock);
    parts.push(
      "Use WALRUS_MEMORY for callbacks: wrong predictions, flip-flops, favorite team.",
    );
  }

  if (input.matchContext) {
    parts.push(`\n## MATCH_CONTEXT`);
    parts.push(input.matchContext);
  }

  return parts.join("\n");
}
