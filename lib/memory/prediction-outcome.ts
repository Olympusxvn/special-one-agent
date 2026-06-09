import type { Prediction } from "./types";

export function normalizeScore(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

export function predictionsDiffer(prediction: string, result: string): boolean {
  return normalizeScore(prediction) !== normalizeScore(result);
}

export type PredictionOutcome = "pending" | "correct" | "wrong";

export function getPredictionOutcome(p: Prediction): PredictionOutcome {
  if (p.result === null) return "pending";
  return predictionsDiffer(p.prediction, p.result) ? "wrong" : "correct";
}
