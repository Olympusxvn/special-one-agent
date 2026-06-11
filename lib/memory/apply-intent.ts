import type { ParsedIntent } from "@/lib/ai/intent";

import { rememberSemanticLine, setProfileCache } from "./fan-profile";
import { mergeIntentIntoProfile } from "./merge-intent";
import type { FanMemory } from "./types";

/** Apply intent in-memory + semantic MemWal lines — no awaits before LLM stream. */
export function applyIntentToProfile(
  walletAddress: string,
  profile: FanMemory,
  intent: ParsedIntent,
): FanMemory {
  const prevTeam = profile.favorite_team;
  const next = mergeIntentIntoProfile(profile, intent);

  if (intent.intent === "set_team" && intent.favorite_team) {
    const trimmed = intent.favorite_team.trim();
    if (
      prevTeam &&
      trimmed &&
      prevTeam.toLowerCase() !== trimmed.toLowerCase()
    ) {
      rememberSemanticLine(
        walletAddress,
        `Flip-flop: switched from ${prevTeam} to ${trimmed}`,
      );
    }
    rememberSemanticLine(
      walletAddress,
      `User supports ${trimmed}. Confidence: ${next.confidence_level}.`,
    );
  }

  if (intent.intent === "prediction" && intent.prediction) {
    rememberSemanticLine(
      walletAddress,
      `Prediction: ${intent.prediction} for ${intent.match ?? "World Cup 2026 match"} — PENDING`,
    );
  }

  setProfileCache(walletAddress, next);
  return next;
}
