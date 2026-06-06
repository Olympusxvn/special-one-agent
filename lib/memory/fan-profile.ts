import { nanoid } from "nanoid";

import { getMemWalClient, namespaceForWallet } from "./client";
import type { ConfidenceLevel, FanMemory, Prediction } from "./types";
import { emptyFanMemory } from "./types";

const PROFILE_PREFIX = "FAN_PROFILE_JSON:";

const profileCache = new Map<string, FanMemory>();

function parseProfileFromText(text: string): FanMemory | null {
  const idx = text.indexOf(PROFILE_PREFIX);
  if (idx === -1) return null;
  try {
    return JSON.parse(text.slice(idx + PROFILE_PREFIX.length)) as FanMemory;
  } catch {
    return null;
  }
}

export async function loadFanProfile(walletAddress: string): Promise<FanMemory> {
  const cached = profileCache.get(walletAddress);
  if (cached) return { ...cached };

  const client = getMemWalClient();
  const empty = emptyFanMemory();

  if (!client) {
    return empty;
  }

  const namespace = namespaceForWallet(walletAddress);

  try {
    const result = await client.recall({
      query: "fan profile predictions favorite team",
      limit: 10,
      namespace,
    });

    for (const hit of result.results) {
      const parsed = parseProfileFromText(hit.text);
      if (parsed) {
        profileCache.set(walletAddress, parsed);
        return { ...parsed };
      }
    }
  } catch {
    // fall through to empty profile
  }

  return empty;
}

async function persistProfile(
  walletAddress: string,
  profile: FanMemory,
): Promise<void> {
  profileCache.set(walletAddress, profile);

  const client = getMemWalClient();
  if (!client) return;

  const namespace = namespaceForWallet(walletAddress);
  const snapshot = `${PROFILE_PREFIX}${JSON.stringify(profile)}`;

  try {
    await client.rememberAndWait(snapshot, namespace);
  } catch {
    await client.remember(snapshot, namespace);
  }
}

async function rememberSemantic(
  walletAddress: string,
  line: string,
): Promise<void> {
  const client = getMemWalClient();
  if (!client) return;
  const namespace = namespaceForWallet(walletAddress);
  try {
    await client.remember(line, namespace);
  } catch {
    // non-fatal
  }
}

export async function setFavoriteTeam(
  walletAddress: string,
  team: string,
  profile: FanMemory,
): Promise<FanMemory> {
  const next = { ...profile };
  const trimmed = team.trim();

  if (
    next.favorite_team &&
    trimmed &&
    next.favorite_team.toLowerCase() !== trimmed.toLowerCase()
  ) {
    next.flip_flop_count += 1;
    await rememberSemantic(
      walletAddress,
      `Flip-flop: switched from ${next.favorite_team} to ${trimmed}`,
    );
  }

  next.favorite_team = trimmed;
  await persistProfile(walletAddress, next);
  await rememberSemantic(
    walletAddress,
    `User supports ${trimmed}. Confidence: ${next.confidence_level}.`,
  );
  return next;
}

export async function addPrediction(
  walletAddress: string,
  profile: FanMemory,
  input: {
    match: string;
    prediction: string;
    fixtureId?: number;
    confidence?: ConfidenceLevel;
  },
): Promise<FanMemory> {
  const next = { ...profile };
  if (input.confidence) {
    next.confidence_level = input.confidence;
  }

  const entry: Prediction = {
    match: input.match,
    prediction: input.prediction,
    result: null,
    fixtureId: input.fixtureId,
    createdAt: new Date().toISOString(),
  };

  next.past_predictions = [...next.past_predictions, entry].slice(-50);
  await persistProfile(walletAddress, next);
  await rememberSemantic(
    walletAddress,
    `Prediction: ${input.prediction} for ${input.match} — PENDING`,
  );
  return next;
}

export async function resolvePrediction(
  walletAddress: string,
  profile: FanMemory,
  input: { match: string; result: string },
): Promise<FanMemory> {
  const next = { ...profile };
  const matchLower = input.match.toLowerCase();

  next.past_predictions = next.past_predictions.map((p) => {
    if (p.result !== null) return p;
    const pendingMatch =
      p.match.toLowerCase().includes(matchLower) ||
      matchLower.includes(p.match.toLowerCase());
    if (!pendingMatch) return p;
    return { ...p, result: input.result };
  });

  await persistProfile(walletAddress, next);

  const resolved = next.past_predictions.find(
    (p) => p.result === input.result && p.match.toLowerCase().includes(matchLower.slice(0, 8)),
  );

  if (resolved) {
    const wrong =
      resolved.prediction.toLowerCase() !== input.result.toLowerCase();
    await rememberSemantic(
      walletAddress,
      wrong
        ? `Prediction WRONG: said ${resolved.prediction}, actual ${input.result}`
        : `Prediction CORRECT: ${resolved.prediction} matched ${input.result}`,
    );
  }

  return next;
}

export async function appendRoast(
  walletAddress: string,
  profile: FanMemory,
  roast: string,
  topics: string[] = [],
): Promise<FanMemory> {
  const next = { ...profile };
  next.roast_history = [...next.roast_history, roast.slice(0, 500)].slice(-20);
  next.last_roast_topics = [...topics, ...next.last_roast_topics].slice(0, 5);
  await persistProfile(walletAddress, next);
  await rememberSemantic(walletAddress, `Roast delivered: ${roast.slice(0, 200)}`);
  return next;
}

export async function recallMemories(
  walletAddress: string,
  query: string,
  limit = 5,
): Promise<string[]> {
  const client = getMemWalClient();
  if (!client) return [];

  try {
    const result = await client.recall({
      query,
      limit,
      namespace: namespaceForWallet(walletAddress),
    });
    return result.results.map((r) => r.text);
  } catch {
    return [];
  }
}

export function createPredictionId(): string {
  return nanoid(8);
}
