import type { FanMemory } from "@/lib/memory/types";

import { MR_TOXIC_SYSTEM_PROMPT } from "./system-prompt";

export interface BuildPromptInput {
  fanProfile: FanMemory;
  recalledMemories: string[];
  toxicityLevel: number;
  matchContext?: string;
}

/** Slim profile for lower latency (smaller prompt → faster TTFT). */
function compactFanProfile(profile: FanMemory) {
  return {
    favorite_team: profile.favorite_team,
    flip_flop_count: profile.flip_flop_count,
    confidence_level: profile.confidence_level,
    past_predictions: profile.past_predictions.slice(-3),
    last_roast_topics: profile.last_roast_topics.slice(-2),
  };
}

export function buildSystemPrompt(input: BuildPromptInput): string {
  const parts = [MR_TOXIC_SYSTEM_PROMPT];

  parts.push(`\n## RUNTIME CONTEXT`);
  parts.push(`TOXICITY_LEVEL: ${input.toxicityLevel}`);
  parts.push(`Keep replies concise: opening roast + meme beat + 2–3 sentences + closing sting.`);

  parts.push(`\n## FAN_PROFILE`);
  parts.push(JSON.stringify(compactFanProfile(input.fanProfile)));

  if (input.recalledMemories.length > 0) {
    parts.push(`\n## RECALLED_MEMORIES`);
    for (const mem of input.recalledMemories.slice(0, 3)) {
      parts.push(`- ${mem.replace(/\s+/g, " ").trim().slice(0, 200)}`);
    }
  }

  if (input.matchContext) {
    parts.push(`\n## MATCH_CONTEXT`);
    parts.push(input.matchContext);
  }

  return parts.join("\n");
}
