import type { FanMemory, Prediction } from "./types";
import { emptyFanMemory } from "./types";

const PROFILE_PREFIX = "FAN_PROFILE_JSON:";

function parseProfileJson(text: string): FanMemory | null {
  const idx = text.indexOf(PROFILE_PREFIX);
  if (idx === -1) return null;
  try {
    return JSON.parse(text.slice(idx + PROFILE_PREFIX.length)) as FanMemory;
  } catch {
    return null;
  }
}

function parseTeamFromText(text: string): string | null {
  const patterns = [
    /User supports ([A-Za-z][A-Za-z\s'-]+?)(?:\.|,|!| in\b|$)/i,
    /supports ([A-Za-z][A-Za-z\s'-]+?)(?:\.|,|!| in the World Cup)/i,
    /favorite team(?: is)?\s+([A-Za-z][A-Za-z\s'-]+)/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m?.[1]) {
      const team = m[1].trim();
      if (team.length >= 3 && team.length <= 28) return team;
    }
  }
  return null;
}

function parsePredictionFromText(text: string): Prediction | null {
  const pending = text.match(/Prediction: (.+?) for (.+?) — PENDING/i);
  if (pending) {
    return {
      match: pending[2]!.trim(),
      prediction: pending[1]!.trim(),
      result: null,
      createdAt: new Date().toISOString(),
    };
  }
  return null;
}

function parseResolvedPrediction(text: string, profile: FanMemory): void {
  const wrong = text.match(
    /Prediction WRONG: said (.+?), actual (.+?)$/i,
  );
  const correct = text.match(
    /Prediction CORRECT: (.+?) matched (.+?)$/i,
  );
  const actual = wrong?.[2] ?? correct?.[2];
  if (!actual) return;
  const said = wrong?.[1] ?? correct?.[1];
  profile.past_predictions = profile.past_predictions.map((p) => {
    if (p.result !== null) return p;
    if (said && !p.prediction.toLowerCase().includes(said.toLowerCase().slice(0, 8))) {
      return p;
    }
    return { ...p, result: actual.trim() };
  });
}

/** Build ledger state from MemWal recall hits (analyze facts + semantic lines + JSON). */
export function buildProfileFromRecallHits(
  hits: { text: string }[],
): FanMemory {
  let bestJson: FanMemory | null = null;
  const profile = emptyFanMemory();
  const seenPreds = new Set<string>();

  for (const hit of hits) {
    const json = parseProfileJson(hit.text);
    if (json) {
      if (
        !bestJson ||
        json.past_predictions.length > bestJson.past_predictions.length
      ) {
        bestJson = json;
      }
      continue;
    }

    const team = parseTeamFromText(hit.text);
    if (team && !profile.favorite_team) {
      profile.favorite_team = team;
    }

    const pred = parsePredictionFromText(hit.text);
    if (pred) {
      const key = `${pred.match}|${pred.prediction}`;
      if (!seenPreds.has(key)) {
        seenPreds.add(key);
        profile.past_predictions.push(pred);
      }
    }

    if (/Flip-flop:/i.test(hit.text)) {
      profile.flip_flop_count += 1;
    }

    parseResolvedPrediction(hit.text, profile);
  }

  if (bestJson) {
    return {
      ...bestJson,
      favorite_team: bestJson.favorite_team || profile.favorite_team,
      past_predictions:
        bestJson.past_predictions.length >= profile.past_predictions.length
          ? bestJson.past_predictions
          : profile.past_predictions,
      flip_flop_count: Math.max(
        bestJson.flip_flop_count,
        profile.flip_flop_count,
      ),
    };
  }

  return profile;
}
