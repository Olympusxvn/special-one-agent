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

const SCORE_RE = /(\d+-\d+)/;

const TEAM_STOP_WORDS =
  /^(the|and|but|actually|now|we|are|is|my|i|fan|of|support|team)$/i;

function detectConfidence(text: string): ConfidenceLevel {
  if (/definitely|100%|sure/i.test(text)) return "high";
  if (/maybe|perhaps/i.test(text)) return "low";
  return "medium";
}

function extractScore(text: string): string | undefined {
  return text.match(SCORE_RE)?.[1];
}

/** Strip trailing punctuation and filler from a captured team name. */
function cleanTeamName(raw: string): string {
  return raw
    .replace(/\s+in\s+the\b.*$/i, "")
    .replace(/[!.,;:].*$/, "")
    .replace(/\s+(fan|team|fc|now)$/i, "")
    .trim();
}

function isPlausibleTeam(name: string): boolean {
  const cleaned = cleanTeamName(name);
  if (cleaned.length < 3 || cleaned.length > 28) return false;
  if (TEAM_STOP_WORDS.test(cleaned)) return false;
  if (/\b(beat|will|predict|score|win|lost|defeat)\b/i.test(cleaned)) {
    return false;
  }
  return /^[a-zA-Z][a-zA-Z\s'-]*$/.test(cleaned);
}

function detectPrediction(text: string): ParsedIntent | null {
  const score = extractScore(text);

  const willBeatScored = text.match(
    /\b([a-zA-Z][\w\s'-]+)\s+will\s+beat\s+(.+?)\s+(\d+-\d+)/i,
  );
  const willBeat = willBeatScored ??
    text.match(/\b([a-zA-Z][\w\s'-]+)\s+will\s+beat\s+([a-zA-Z][\w\s'-]+)/i);
  if (willBeat) {
    const team1 = cleanTeamName(willBeat[1]!);
    const team2 = cleanTeamName(willBeat[2]!);
    const predScore = willBeatScored?.[3] ?? score;
    return {
      intent: "prediction",
      match: `${team1} vs ${team2}`,
      prediction: predScore ? `${team1} ${predScore}` : text,
      confidence_level: detectConfidence(text),
    };
  }

  const iPredict = text.match(
    /\bi\s+predict\s+([a-zA-Z][\w\s'-]*?)\s+(\d+-\d+)\s+([a-zA-Z][\w\s'-]*)/i,
  );
  if (iPredict) {
    const team1 = cleanTeamName(iPredict[1]!);
    const team2 = cleanTeamName(iPredict[3]!);
    return {
      intent: "prediction",
      match: `${team1} vs ${team2}`,
      prediction: `${team1} ${iPredict[2]}`,
      confidence_level: detectConfidence(text),
    };
  }

  const scoreline = text.match(
    /\b([a-zA-Z][\w\s'-]*?)\s+(\d+-\d+)\s+([a-zA-Z][\w\s'-]*)/i,
  );
  if (
    scoreline &&
    /\b(predict|think|bet|going to|will win|scoreline)\b/i.test(text)
  ) {
    const team1 = cleanTeamName(scoreline[1]!);
    const team2 = cleanTeamName(scoreline[3]!);
    return {
      intent: "prediction",
      match: `${team1} vs ${team2}`,
      prediction: `${team1} ${scoreline[2]}`,
      confidence_level: detectConfidence(text),
    };
  }

  if (
    /\b(predict|scoreline|going to win|will win)\b/i.test(text) ||
    (/\b(predict|think|bet)\b/i.test(text) &&
      /\b(win|beat|score)\b/i.test(text))
  ) {
    return {
      intent: "prediction",
      match: "World Cup 2026 match",
      prediction: text,
      confidence_level: detectConfidence(text),
    };
  }

  return null;
}

function detectReportResult(text: string): ParsedIntent | null {
  if (/\bwill\s+(?:beat|defeat|win)\b/i.test(text)) return null;

  const pastBeat = text.match(
    /\b([a-zA-Z][\w\s'-]+)\s+(beat|defeated)\s+([a-zA-Z][\w\s'-]+)\s+(\d+-\d+)/i,
  );
  if (pastBeat) {
    const winner = cleanTeamName(pastBeat[1]!);
    const loser = cleanTeamName(pastBeat[3]!);
    const resultScore = pastBeat[4] ?? extractScore(text);
    return {
      intent: "report_result",
      match: `${winner} vs ${loser}`,
      reported_result: resultScore ?? text,
    };
  }

  const finalScore = text.match(
    /(?:final|result|score)[:\s]+([a-zA-Z][\w\s'-]*?)\s+(\d+-\d+)/i,
  );
  if (finalScore) {
    return {
      intent: "report_result",
      match: cleanTeamName(finalScore[1]!),
      reported_result: finalScore[2]!,
    };
  }

  return null;
}

function detectSetTeam(text: string): ParsedIntent | null {
  const support = text.match(
    /(?:i\s+support|my\s+team\s+is|fan\s+of)\s+([a-zA-Z][a-zA-Z\s'-]{0,24}?)(?:[!.,]|$|\s+(?:now|and|we|is|who|are))/i,
  );
  if (support?.[1]) {
    const team = cleanTeamName(support[1]);
    if (isPlausibleTeam(team)) {
      return { intent: "set_team", favorite_team: team };
    }
  }

  const flipFlop = text.match(
    /(?:actually|now)\s+(?:i\s+support|my\s+team\s+is)\s+([a-zA-Z][a-zA-Z\s'-]{0,24}?)(?:[!.,]|$|\s)/i,
  );
  if (flipFlop?.[1]) {
    const team = cleanTeamName(flipFlop[1]);
    if (isPlausibleTeam(team)) {
      return { intent: "set_team", favorite_team: team };
    }
  }

  if (!/\b(beat|will|predict|score|win|lost|defeat|messi|world cup)\b/i.test(text)) {
    const bare = text.match(/^([A-Za-z]+(?:\s+[A-Za-z]+)?)$/);
    if (bare?.[1]) {
      const team = cleanTeamName(bare[1]);
      if (isPlausibleTeam(team)) {
        return { intent: "set_team", favorite_team: team };
      }
    }
  }

  return null;
}

/** Fast regex intent — no extra LLM round-trip before streaming. */
export function detectIntent(message: string): ParsedIntent {
  const text = message.trim();

  const prediction = detectPrediction(text);
  if (prediction) return prediction;

  const result = detectReportResult(text);
  if (result) return result;

  const team = detectSetTeam(text);
  if (team) return team;

  return { intent: "banter" };
}

export function extractRoastTopics(text: string): string[] {
  const topics: string[] = [];
  if (/wrong|missed|failed/i.test(text)) topics.push("wrong_prediction");
  if (/flip.?flop|switched/i.test(text)) topics.push("flip_flop");
  if (/bandwagon/i.test(text)) topics.push("bandwagon");
  return topics;
}
