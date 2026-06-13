import { getClientForWallet, namespaceForWallet } from "./client";
import { markWalletJustCommitted } from "./commit-session";
import { DEFAULT_RECALL_QUERY } from "./constants";
import { buildProfileFromRecallHits } from "./profile-from-recall";
import {
  recallWithOptimization,
  type RecallOutcome,
} from "./recall";
import type { FanMemory } from "./types";
import { emptyFanMemory } from "./types";

const REMEMBER_TIMEOUT_MS = 60_000;

export async function rememberAndWaitForWallet(
  walletAddress: string,
  text: string,
  timeoutMs = REMEMBER_TIMEOUT_MS,
): Promise<void> {
  const client = getClientForWallet(walletAddress);
  if (!client || !text.trim()) return;
  const namespace = namespaceForWallet(walletAddress);
  await client.rememberAndWait(text.trim(), namespace, { timeoutMs });
  markWalletJustCommitted(walletAddress);
}

export function rememberForWallet(walletAddress: string, text: string): void {
  const client = getClientForWallet(walletAddress);
  if (!client || !text.trim()) return;
  const namespace = namespaceForWallet(walletAddress);
  void client.remember(text.trim(), namespace).catch((err) => {
    console.error("[Walrus remember] failed:", err);
  });
}

export async function recallForWallet(
  walletAddress: string,
  query: string,
  topK = 10,
): Promise<string[]> {
  const outcome = await recallWithOptimization(walletAddress, query, {
    limit: topK,
  });
  return outcome.memories;
}

export async function recallForWalletDetailed(
  walletAddress: string,
  query: string,
  topK = 10,
  options?: { skipRestore?: boolean; skipCache?: boolean },
): Promise<RecallOutcome> {
  return recallWithOptimization(walletAddress, query, {
    limit: topK,
    skipRestore: options?.skipRestore,
    skipCache: options?.skipCache,
  });
}

export async function rememberUserTurn(
  walletAddress: string,
  message: string,
): Promise<void> {
  const trimmed = message.trim();
  if (!trimmed) return;
  await rememberAndWaitForWallet(
    walletAddress,
    `User is fan of team mentioned. User said: "${trimmed.replace(/"/g, "'")}"`,
  );
}

export async function loadProfileFromWalrus(
  walletAddress: string,
  query = DEFAULT_RECALL_QUERY,
): Promise<FanMemory> {
  const outcome = await recallWithOptimization(walletAddress, query, {
    limit: 12,
    maxFallbackQueries: 0,
  });
  if (outcome.memories.length === 0) return emptyFanMemory();
  return buildProfileFromRecallHits(
    outcome.memories.map((text) => ({ text })),
  );
}

export { markWalletJustCommitted } from "./commit-session";
export { recallWithOptimization, type RecallOutcome } from "./recall";
