import type { ParsedIntent } from "@/lib/ai/intent";

import type { ConfidenceLevel, FanMemory, Prediction } from "./types";

/** Pure profile merge — safe for client optimistic UI (no MemWal I/O). */
export function mergeIntentIntoProfile(
  profile: FanMemory,
  intent: ParsedIntent,
): FanMemory {
  const next: FanMemory = {
    ...profile,
    past_predictions: [...profile.past_predictions],
    roast_history: [...profile.roast_history],
    last_roast_topics: [...profile.last_roast_topics],
  };

  if (intent.intent === "set_team" && intent.favorite_team) {
    const trimmed = intent.favorite_team.trim();
    if (
      next.favorite_team &&
      trimmed &&
      next.favorite_team.toLowerCase() !== trimmed.toLowerCase()
    ) {
      next.flip_flop_count += 1;
    }
    next.favorite_team = trimmed;
  }

  if (intent.intent === "prediction" && intent.prediction) {
    const confidence = intent.confidence_level as ConfidenceLevel | undefined;
    if (confidence) next.confidence_level = confidence;
    const entry: Prediction = {
      match: intent.match ?? "World Cup 2026 match",
      prediction: intent.prediction,
      result: null,
      fixtureId: intent.fixtureId,
      createdAt: new Date().toISOString(),
    };
    next.past_predictions = [...next.past_predictions, entry].slice(-20);
  }

  if (intent.intent === "report_result" && intent.reported_result) {
    const matchLower = (intent.match ?? "").toLowerCase();
    next.past_predictions = next.past_predictions.map((p) => {
      if (p.result !== null) return p;
      const pendingMatch =
        p.match.toLowerCase().includes(matchLower) ||
        matchLower.includes(p.match.toLowerCase());
      if (!pendingMatch) return p;
      return { ...p, result: intent.reported_result! };
    });
  }

  return next;
}

export function intentMutatesProfile(intent: ParsedIntent): boolean {
  return intent.intent !== "banter";
}
