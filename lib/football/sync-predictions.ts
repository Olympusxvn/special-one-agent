import {
  loadFanProfile,
  resolvePrediction,
} from "@/lib/memory/fan-profile";
import type { FanMemory } from "@/lib/memory/types";

import {
  formatFixtureResult,
  getFixtureById,
  isFixtureFinished,
} from "./provider";

export interface SyncResult {
  profile: FanMemory;
  resolved: Array<{ match: string; result: string }>;
  pending: number;
}

export async function syncPendingPredictions(
  walletAddress: string,
): Promise<SyncResult> {
  let profile = await loadFanProfile(walletAddress);
  const resolved: Array<{ match: string; result: string }> = [];

  for (const pred of profile.past_predictions) {
    if (pred.result !== null || !pred.fixtureId) continue;

    const fixture = await getFixtureById(pred.fixtureId);
    if (!fixture || !isFixtureFinished(fixture) || !fixture.scoreline) {
      continue;
    }

    const result = formatFixtureResult(fixture);
    profile = await resolvePrediction(walletAddress, profile, {
      match: pred.match,
      result,
    });
    resolved.push({ match: pred.match, result });
  }

  const pending = profile.past_predictions.filter((p) => p.result === null).length;

  return { profile, resolved, pending };
}
