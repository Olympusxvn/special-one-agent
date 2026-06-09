import { predictionsDiffer } from "./prediction-outcome";
import type { FanMemory } from "./types";

export function computeToxicityLevel(profile: FanMemory): number {
  const wrongCount = profile.past_predictions.filter(
    (p) => p.result !== null && predictionsDiffer(p.prediction, p.result),
  ).length;

  const highConfidenceWrong = profile.past_predictions.some(
    (p) =>
      p.result !== null &&
      predictionsDiffer(p.prediction, p.result) &&
      profile.confidence_level === "high",
  );

  const raw =
    1 +
    wrongCount * 1.5 +
    profile.flip_flop_count * 2 +
    (highConfidenceWrong ? 2 : 0);

  return Math.min(10, Math.max(1, Math.round(raw)));
}
