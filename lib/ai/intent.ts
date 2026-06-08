import { generateObject } from "ai";
import { z } from "zod";

import type { ConfidenceLevel } from "@/lib/memory/types";

import { getIntentModel, hasAnyLlmKey, type UserLlmKeys } from "./providers";

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

const intentSchema = z.object({
  intent: z.enum(["banter", "set_team", "prediction", "report_result"]),
  favorite_team: z.string().optional(),
  match: z.string().optional(),
  prediction: z.string().optional(),
  reported_result: z.string().optional(),
  confidence_level: z.enum(["high", "medium", "low"]).optional(),
  fixtureId: z.number().optional(),
});

const TEAM_PATTERNS = [
  /(?:i\s+support|my\s+team\s+is|fan\s+of)\s+([a-zA-Z\s]+)/i,
  /(?:go|vamos)\s+([a-zA-Z\s]+)!/i,
];

const PREDICTION_PATTERNS = [
  /(?:predict|think|bet)\s+(.+?)\s+(?:will\s+)?(?:win|beat|defeat)\s+(.+)/i,
  /(.+?)\s+(\d+-\d+)\s+(.+)/i,
];

const RESULT_PATTERNS = [
  /(.+?)\s+(?:beat|defeated|won against)\s+(.+?)\s+(\d+-\d+)/i,
  /(?:final|result|score)[:\s]+(.+?)\s+(\d+-\d+)/i,
];

function parseIntentRegex(message: string): ParsedIntent {
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

  if (/predict|scoreline|will win|going to win/i.test(text)) {
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
      return {
        intent: "set_team",
        favorite_team: m[1].trim(),
      };
    }
  }

  return { intent: "banter" };
}

export async function detectIntent(
  message: string,
  userKeys?: UserLlmKeys,
): Promise<ParsedIntent> {
  const fallback = parseIntentRegex(message);

  if (!hasAnyLlmKey(userKeys)) {
    return fallback;
  }

  try {
    const { object } = await generateObject({
      model: getIntentModel(userKeys),
      schema: intentSchema,
      prompt: `Classify this football fan message for a World Cup 2026 roast bot.
Message: "${message}"

Return intent:
- set_team: declares favorite team
- prediction: predicts a match outcome
- report_result: reports actual match result
- banter: general chat`,
    });
    return object;
  } catch {
    return fallback;
  }
}

export function extractRoastTopics(text: string): string[] {
  const topics: string[] = [];
  if (/prediction|predicted|score/i.test(text)) topics.push("wrong_prediction");
  if (/flip|bandwagon|switched/i.test(text)) topics.push("flip_flop");
  if (/team|fan|supporter/i.test(text)) topics.push("team_roast");
  if (/confidence|cope|fiction/i.test(text)) topics.push("confidence_mock");
  return topics.slice(0, 3);
}
