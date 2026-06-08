import type { ConfidenceLevel } from "@/lib/memory/types";

export type MessageIntent =
  | "banter"
  | "set_team"
  | "prediction"
  | "report_result";

export interface ParsedIntent {
  intent: MessageIntent;
  favorite_team?: string;
  match?: string;
  prediction?: string;
  reported_result?: string;
  confidence_level?: ConfidenceLevel;
  fixtureId?: number;
}

const TEAM_PATTERNS = [
  /(?:i\s+support|my\s+team\s+is|fan\s+of)\s+([a-zA-Z\s]+)/i,
  /my\s+([a-zA-Z\s]+)\s+team/i,
  /(?:go|vamos)\s+([a-zA-Z\s]+)!/i,
  /^([a-zA-Z][a-zA-Z\s]{2,30})$/i,
];

const PREDICTION_PATTERNS = [
  /(?:predict|think|bet)\s+(.+?)\s+(?:will\s+)?(?:win|beat|defeat)\s+(.+)/i,
  /(.+?)\s+(\d+-\d+)\s+(.+)/i,
  /(.+?)\s+will\s+beat\s+(.+)/i,
];

const RESULT_PATTERNS = [
  /(.+?)\s+(?:beat|defeated|won against)\s+(.+?)\s+(\d+-\d+)/i,
  /(?:final|result|score)[:\s]+(.+?)\s+(\d+-\d+)/i,
];

/** Fast regex intent — no extra LLM round-trip before streaming. */
export function detectIntent(message: string): ParsedIntent {
  const text = message.trim();

  for (const pattern of RESULT_PATTERNS) {
    const m = text.match(pattern);
    if (m) {
      return {
        intent: "report_result",
        match: m[1]?.trim() ?? text,
        reported_result: m[2]?.trim() ?? m[3]?.trim() ?? text,
      };
    }
  }

  for (const pattern of PREDICTION_PATTERNS) {
    const m = text.match(pattern);
    if (m) {
      const confidence: ConfidenceLevel = /definitely|100%|sure/i.test(text)
        ? "high"
        : /maybe|perhaps/i.test(text)
          ? "low"
          : "medium";
      return {
        intent: "prediction",
        match: m[1]?.trim() ?? "World Cup match",
        prediction: m[2]?.trim() ?? m[0]?.trim() ?? text,
        confidence_level: confidence,
      };
    }
  }

  if (/predict|scoreline|will win|going to win|will beat/i.test(text)) {
    return {
      intent: "prediction",
      match: "World Cup 2026 match",
      prediction: text,
      confidence_level: /definitely|100%/i.test(text) ? "high" : "medium",
    };
  }

  for (const pattern of TEAM_PATTERNS) {
    const m = text.match(pattern);
    if (m?.[1]) {
      const team = m[1].trim();
      if (team.length >= 3 && !/^(the|and|but)$/i.test(team)) {
        return {
          intent: "set_team",
          favorite_team: team,
        };
      }
    }
  }

  return { intent: "banter" };
}

export function extractRoastTopics(text: string): string[] {
  const topics: string[] = [];
  if (/wrong|missed|failed/i.test(text)) topics.push("wrong_prediction");
  if (/flip.?flop|switched/i.test(text)) topics.push("flip_flop");
  if (/bandwagon/i.test(text)) topics.push("bandwagon");
  return topics;
}
