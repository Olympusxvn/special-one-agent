import type { FanMemory } from "@/lib/memory/types";

import { MR_TOXIC_SYSTEM_PROMPT } from "./system-prompt";

export interface BuildPromptInput {
  fanProfile: FanMemory;
  recalledMemories: string[];
  toxicityLevel: number;
  matchContext?: string;
}

export function buildSystemPrompt(input: BuildPromptInput): string {
  const parts = [MR_TOXIC_SYSTEM_PROMPT];

  parts.push(`\n## RUNTIME CONTEXT`);
  parts.push(`TOXICITY_LEVEL: ${input.toxicityLevel}`);

  parts.push(`\n## FAN_PROFILE`);
  parts.push("```json");
  parts.push(JSON.stringify(input.fanProfile, null, 2));
  parts.push("```");

  if (input.recalledMemories.length > 0) {
    parts.push(`\n## RECALLED_MEMORIES`);
    for (const mem of input.recalledMemories) {
      parts.push(`- ${mem.replace(/\s+/g, " ").trim().slice(0, 400)}`);
    }
  }

  if (input.matchContext) {
    parts.push(`\n## MATCH_CONTEXT`);
    parts.push(input.matchContext);
  }

  return parts.join("\n");
}
