import { nanoid } from "nanoid";

import type { ConfidenceLevel, FanMemory, Prediction } from "./types";
import { emptyFanMemory } from "./types";
import {
  loadProfileFromWalrus,
  recallWithOptimization,
  rememberAndWaitForWallet,
  rememberForWallet,
} from "./wallet-memory";

const PROFILE_PREFIX = "FAN_PROFILE_JSON:";

const profileCache = new Map<string, FanMemory>();
const recallCache = new Map<string, { query: string; memories: string[] }>();

export async function loadFanProfile(walletAddress: string): Promise<FanMemory> {
  const cached = profileCache.get(walletAddress);
  if (cached) return { ...cached };

  const profile = await loadProfileFromWalrus(walletAddress);
  if (
    profile.favorite_team ||
    profile.past_predictions.length > 0 ||
    profile.roast_history.length > 0
  ) {
    profileCache.set(walletAddress, profile);
  }
  return { ...profile };
}

export function setProfileCache(walletAddress: string, profile: FanMemory): void {
  profileCache.set(walletAddress, profile);
}

export function persistProfileCacheOnly(
  walletAddress: string,
  profile: FanMemory,
): void {
  setProfileCache(walletAddress, profile);
}

export function rememberSemanticLine(walletAddress: string, line: string): void {
  rememberForWallet(walletAddress, line);
}

export function persistProfileEnqueue(
  walletAddress: string,
  profile: FanMemory,
): void {
  setProfileCache(walletAddress, profile);
  if (profile.favorite_team) {
    rememberForWallet(
      walletAddress,
      `Favorite team: ${profile.favorite_team}. User supports ${profile.favorite_team} for World Cup 2026.`,
    );
  }
  rememberForWallet(
    walletAddress,
    `${PROFILE_PREFIX}${JSON.stringify(profile)}`,
  );
}

export async function persistProfileAndWait(
  walletAddress: string,
  profile: FanMemory,
): Promise<void> {
  setProfileCache(walletAddress, profile);

  if (profile.favorite_team) {
    await rememberAndWaitForWallet(
      walletAddress,
      `Favorite team: ${profile.favorite_team}. User supports ${profile.favorite_team} for World Cup 2026.`,
    );
  }

  await rememberAndWaitForWallet(
    walletAddress,
    `${PROFILE_PREFIX}${JSON.stringify(profile)}`,
  );
}

export async function loadFanProfileFast(
  walletAddress: string,
  timeoutMs = 500,
): Promise<FanMemory> {
  const cached = profileCache.get(walletAddress);
  if (cached) return { ...cached };

  const empty = emptyFanMemory();
  const loaded = await Promise.race([
    loadFanProfile(walletAddress),
    new Promise<FanMemory>((resolve) =>
      setTimeout(() => resolve(empty), timeoutMs),
    ),
  ]);
  return loaded;
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
    rememberForWallet(
      walletAddress,
      `Flip-flop: switched from ${next.favorite_team} to ${trimmed}`,
    );
  }

  next.favorite_team = trimmed;
  setProfileCache(walletAddress, next);
  rememberForWallet(
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
  setProfileCache(walletAddress, next);
  rememberForWallet(
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

  setProfileCache(walletAddress, next);

  const resolved = next.past_predictions.find(
    (p) =>
      p.result === input.result &&
      p.match.toLowerCase().includes(matchLower.slice(0, 8)),
  );

  if (resolved) {
    const wrong =
      resolved.prediction.toLowerCase() !== input.result.toLowerCase();
    rememberForWallet(
      walletAddress,
      wrong
        ? `Prediction WRONG: said ${resolved.prediction}, actual ${input.result}`
        : `Prediction CORRECT: ${resolved.prediction} matched ${input.result}`,
    );
  }

  return next;
}

export function appendRoastToProfile(
  profile: FanMemory,
  roast: string,
  topics: string[] = [],
): FanMemory {
  const next = { ...profile };
  next.roast_history = [...next.roast_history, roast.slice(0, 500)].slice(-20);
  next.last_roast_topics = [...topics, ...next.last_roast_topics].slice(0, 5);
  return next;
}

export async function appendRoast(
  walletAddress: string,
  profile: FanMemory,
  roast: string,
  topics: string[] = [],
): Promise<FanMemory> {
  const next = appendRoastToProfile(profile, roast, topics);
  setProfileCache(walletAddress, next);
  rememberForWallet(walletAddress, `Roast delivered: ${roast.slice(0, 200)}`);
  return next;
}

export interface RecallMemoriesOptions {
  limit?: number;
  timeoutMs?: number;
  useCache?: boolean;
}

function normalizeRecallQuery(query: string): string {
  const trimmed = query.replace(/\s+/g, " ").trim();
  return trimmed.slice(0, 120) || "predictions team flip-flop roast wrong";
}

function trimRecallLines(lines: string[], limit: number): string[] {
  return lines
    .filter((text) => !text.includes(PROFILE_PREFIX))
    .slice(0, limit)
    .map((line) => line.replace(/\s+/g, " ").trim().slice(0, 80))
    .filter(Boolean);
}

export async function recallMemories(
  walletAddress: string,
  query: string,
  options: RecallMemoriesOptions = {},
): Promise<string[]> {
  const limit = options.limit ?? 5;
  const timeoutMs = options.timeoutMs ?? 5_000;
  const useCache = options.useCache ?? true;
  const normalizedQuery = normalizeRecallQuery(query);

  if (useCache) {
    const cached = recallCache.get(walletAddress);
    if (cached?.query === normalizedQuery) {
      return cached.memories;
    }
  }

  try {
    const outcome = await Promise.race([
      recallWithOptimization(walletAddress, normalizedQuery, {
        limit: limit + 2,
        useCache: true,
        maxFallbackQueries: 1,
      }),
      new Promise<Awaited<ReturnType<typeof recallWithOptimization>>>(
        (resolve) =>
          setTimeout(
            () =>
              resolve({
                memories: [],
                ok: false,
                namespace: "",
                hitCount: 0,
              }),
            timeoutMs,
          ),
      ),
    ]);

    const memories = trimRecallLines(outcome.memories, limit);

    if (useCache && memories.length > 0) {
      recallCache.set(walletAddress, { query: normalizedQuery, memories });
    }

    if (memories.length > 0) {
      console.log(
        `[Walrus recall/chat] ${memories.length} memories for ${walletAddress.slice(0, 10)}…${outcome.fromCache ? " (cache)" : ""}`,
      );
    } else if (outcome.rateLimited) {
      console.warn("[Walrus recall/chat] rate limited, no cache available");
    }

    return memories;
  } catch (err) {
    console.error("[Walrus recall/chat] failed:", err);
    return [];
  }
}

export function createPredictionId(): string {
  return nanoid(8);
}
