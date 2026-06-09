import type { ParsedIntent } from "@/lib/ai/intent";

import { persistProfileCacheOnly, rememberSemanticLine } from "./fan-profile";
import type { ConfidenceLevel, FanMemory, Prediction } from "./types";

/** Apply intent in-memory + one async MemWal enqueue — no awaits before LLM stream. */
export function applyIntentToProfile(
  walletAddress: string,
  profile: FanMemory,
  intent: ParsedIntent,
): FanMemory {
  const next = { ...profile };

  if (intent.intent === "set_team" && intent.favorite_team) {
    const trimmed = intent.favorite_team.trim();
    if (
      next.favorite_team &&
      trimmed &&
      next.favorite_team.toLowerCase() !== trimmed.toLowerCase()
    ) {
      next.flip_flop_count += 1;
      rememberSemanticLine(
        walletAddress,
        `Flip-flop: switched from ${next.favorite_team} to ${trimmed}`,
      );
    }
    next.favorite_team = trimmed;
    rememberSemanticLine(
      walletAddress,
      `User supports ${trimmed}. Confidence: ${next.confidence_level}.`,
    );
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
    rememberSemanticLine(
      walletAddress,
      `Prediction: ${intent.prediction} for ${entry.match} — PENDING`,
    );
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

  persistProfileCacheOnly(walletAddress, next);
  return next;
}
