import type { FanMemory, Prediction } from "./types";

function predictionKey(p: Prediction): string {
  return `${p.match}|${p.prediction}|${p.createdAt}`;
}

function mergePredictions(
  a: Prediction[],
  b: Prediction[],
): Prediction[] {
  const byKey = new Map<string, Prediction>();
  for (const p of [...a, ...b]) {
    byKey.set(predictionKey(p), p);
  }
  return Array.from(byKey.values()).slice(-20);
}

/** Keep the richest field-wise merge — never wipe local team with empty remote. */
export function mergeFanProfiles(
  local: FanMemory,
  remote: FanMemory,
): FanMemory {
  return {
    favorite_team: remote.favorite_team || local.favorite_team,
    flip_flop_count: Math.max(local.flip_flop_count, remote.flip_flop_count),
    confidence_level:
      remote.favorite_team && remote.confidence_level !== "medium"
        ? remote.confidence_level
        : local.confidence_level,
    past_predictions: mergePredictions(
      local.past_predictions,
      remote.past_predictions,
    ),
    roast_history: Array.from(
      new Set([...remote.roast_history, ...local.roast_history]),
    ).slice(-20),
    last_roast_topics:
      remote.last_roast_topics.length > 0
        ? remote.last_roast_topics
        : local.last_roast_topics,
  };
}
