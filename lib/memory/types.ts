export interface Prediction {
  match: string;
  prediction: string;
  result: string | null;
  fixtureId?: number;
  createdAt: string;
}

export type ConfidenceLevel = "high" | "medium" | "low";

export interface FanMemory {
  favorite_team: string;
  past_predictions: Prediction[];
  flip_flop_count: number;
  confidence_level: ConfidenceLevel;
  roast_history: string[];
  last_roast_topics: string[];
}

export function emptyFanMemory(): FanMemory {
  return {
    favorite_team: "",
    past_predictions: [],
    flip_flop_count: 0,
    confidence_level: "medium",
    roast_history: [],
    last_roast_topics: [],
  };
}
