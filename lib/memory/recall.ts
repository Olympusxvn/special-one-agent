import {
  AGENT_MEMORY_PREFIX,
  DEFAULT_RECALL_QUERY,
  LEGACY_MEMORY_PREFIX,
  RECALL_CACHE_TTL_MS,
  RECALL_DEFAULT_LIMIT,
  RECALL_MAX_DISTANCE,
  RECALL_MAX_FALLBACK_QUERIES,
  RECALL_RETRY_BASE_MS,
} from "./constants";
import { getClientForWallet, isMemWalLive, namespaceForWallet } from "./client";
import { isWalletJustCommitted } from "./commit-session";

function legacyNamespaceForWallet(walletAddress: string): string {
  return `${LEGACY_MEMORY_PREFIX}-${walletAddress.toLowerCase()}`;
}

export interface RecallOutcome {
  memories: string[];
  ok: boolean;
  error?: string;
  namespace: string;
  hitCount: number;
  /** Served from in-memory cache (no relayer round-trip). */
  fromCache?: boolean;
  /** Relayer returned 429 — partial or cached results only. */
  rateLimited?: boolean;
}

export interface RecallOptimizationOptions {
  limit?: number;
  maxDistance?: number;
  /** Override auto skip-restore (default: skip when justCommitted). */
  skipRestore?: boolean;
  /** Allow restore() on cold paths (default: false — direct recall first). */
  allowRestore?: boolean;
  /** Extra fallback queries after primary (default: RECALL_MAX_FALLBACK_QUERIES). */
  maxFallbackQueries?: number;
  /** Second namespace read only when primary returns zero hits (default: true). */
  tryLegacyNamespace?: boolean;
  /** Read/write in-memory recall cache (default: true). */
  useCache?: boolean;
  /** Bypass cache read (still writes on success). */
  skipCache?: boolean;
}

interface RecallItemLike {
  text?: string;
  content?: string;
  memory?: string;
  snippet?: string;
}

interface CacheEntry {
  memories: string[];
  expiresAt: number;
}

const recallCache = new Map<string, CacheEntry>();

const PRIMARY_FALLBACK_QUERY = DEFAULT_RECALL_QUERY;

function extractText(item: RecallItemLike): string {
  return (item.text ?? item.content ?? item.memory ?? item.snippet ?? "").trim();
}

function cacheKey(walletAddress: string, query: string): string {
  return `${walletAddress.toLowerCase()}::${query.replace(/\s+/g, " ").trim().toLowerCase()}`;
}

function getCachedRecall(walletAddress: string, query: string): string[] | null {
  const entry = recallCache.get(cacheKey(walletAddress, query));
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    recallCache.delete(cacheKey(walletAddress, query));
    return null;
  }
  return entry.memories;
}

function getAnyCachedRecall(walletAddress: string): string[] | null {
  const prefix = `${walletAddress.toLowerCase()}::`;
  const now = Date.now();
  let bestMemories: string[] | null = null;
  for (const [key, entry] of Array.from(recallCache.entries())) {
    if (!key.startsWith(prefix) || now > entry.expiresAt) continue;
    if (!bestMemories || entry.memories.length > bestMemories.length) {
      bestMemories = entry.memories;
    }
  }
  return bestMemories;
}

function setCachedRecall(
  walletAddress: string,
  query: string,
  memories: string[],
): void {
  recallCache.set(cacheKey(walletAddress, query), {
    memories,
    expiresAt: Date.now() + RECALL_CACHE_TTL_MS,
  });
}

function isRateLimitError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("429") ||
    msg.includes("Rate limit") ||
    msg.includes("rate limit")
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function restoreBestEffort(
  walletAddress: string,
  namespace: string,
): Promise<void> {
  const client = getClientForWallet(walletAddress);
  if (!client) return;
  try {
    await Promise.race([
      client.restore(namespace, 10),
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error("restore timeout")), 6_000),
      ),
    ]);
  } catch (err) {
    if (isRateLimitError(err)) {
      console.warn("[Walrus recall] restore rate-limited, skipping");
      return;
    }
    console.warn("[Walrus recall] restore skipped:", err);
  }
}

function buildQueryList(
  primaryQuery: string,
  maxFallbackQueries: number,
): string[] {
  const primary = primaryQuery.trim() || DEFAULT_RECALL_QUERY;
  const queries = [primary];
  if (
    maxFallbackQueries > 0 &&
    primary.toLowerCase() !== PRIMARY_FALLBACK_QUERY.toLowerCase()
  ) {
    queries.push(PRIMARY_FALLBACK_QUERY);
  }
  return queries.slice(0, 1 + maxFallbackQueries);
}

/**
 * Optimized MemWal recall — minimizes 429s:
 * - Skips restore() after recent commit (justCommitted window)
 * - Direct recall() first; at most 1–2 queries + optional legacy namespace
 * - Exponential backoff between retries
 * - 3-minute in-memory cache; graceful 429 → cached memories
 */
export async function recallWithOptimization(
  walletAddress: string,
  query: string,
  options: RecallOptimizationOptions = {},
): Promise<RecallOutcome> {
  const namespace = namespaceForWallet(walletAddress);
  const limit = options.limit ?? RECALL_DEFAULT_LIMIT;
  const maxDistance = options.maxDistance ?? RECALL_MAX_DISTANCE;
  const useCache = options.useCache !== false;
  const maxFallbackQueries =
    options.maxFallbackQueries ?? RECALL_MAX_FALLBACK_QUERIES;
  const tryLegacyNamespace = options.tryLegacyNamespace !== false;

  if (!isMemWalLive()) {
    return {
      memories: [],
      ok: false,
      error: "MemWal not configured (MEMWAL_PRIVATE_KEY / MEMWAL_ACCOUNT_ID)",
      namespace,
      hitCount: 0,
    };
  }

  const client = getClientForWallet(walletAddress);
  if (!client) {
    return {
      memories: [],
      ok: false,
      error: "MemWal client unavailable",
      namespace,
      hitCount: 0,
    };
  }

  // --- Cache hit (avoid relayer entirely) ---
  if (useCache && !options.skipCache) {
    const cached = getCachedRecall(walletAddress, query);
    if (cached && cached.length > 0) {
      return {
        memories: cached.slice(0, limit),
        ok: true,
        namespace,
        hitCount: Math.min(cached.length, limit),
        fromCache: true,
      };
    }
  }

  const justCommitted = isWalletJustCommitted(walletAddress);
  // Default: direct recall only — restore() is expensive and triggers 429s.
  const shouldRestore =
    options.allowRestore === true &&
    !justCommitted &&
    options.skipRestore !== true;

  if (shouldRestore) {
    await restoreBestEffort(walletAddress, namespace);
  }

  const queries = buildQueryList(query, maxFallbackQueries);
  const seen = new Set<string>();
  const memories: string[] = [];
  let lastError: string | undefined;
  let rateLimited = false;

  async function runRecallForNamespace(ns: string): Promise<boolean> {
    for (let i = 0; i < queries.length; i++) {
      if (memories.length >= limit || rateLimited) break;
      const q = queries[i]!;

      if (i > 0) {
        await sleep(RECALL_RETRY_BASE_MS * 2 ** (i - 1));
      }

      try {
        const res = await client!.recall({
          query: q,
          limit,
          namespace: ns,
          maxDistance,
        });

        for (const hit of res.results ?? []) {
          const text = extractText(hit as RecallItemLike);
          if (!text || seen.has(text)) continue;
          seen.add(text);
          memories.push(text);
          if (memories.length >= limit) break;
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
        if (isRateLimitError(err)) {
          rateLimited = true;
          console.warn("[Walrus recall] rate limited, stopping retries");
          return true;
        }
        console.error("[Walrus recall] query failed:", ns, q, lastError);
      }
    }
    return rateLimited;
  }

  await runRecallForNamespace(namespace);

  if (
    memories.length === 0 &&
    tryLegacyNamespace &&
    !rateLimited
  ) {
    const legacy = legacyNamespaceForWallet(walletAddress);
    if (legacy !== namespace) {
      await sleep(RECALL_RETRY_BASE_MS);
      await runRecallForNamespace(legacy);
    }
  }

  // --- 429 or empty: fall back to any recent cache for this wallet ---
  if (memories.length === 0 || rateLimited) {
    const fallback = getAnyCachedRecall(walletAddress);
    if (fallback && fallback.length > 0) {
      const sliced = fallback.slice(0, limit);
      return {
        memories: sliced,
        ok: true,
        namespace,
        hitCount: sliced.length,
        fromCache: true,
        rateLimited: rateLimited || undefined,
        error: rateLimited ? "Rate limited — using cached memories" : undefined,
      };
    }
  }

  const finalMemories = memories.slice(0, limit);

  if (finalMemories.length > 0 && useCache) {
    setCachedRecall(walletAddress, query, finalMemories);
  }

  const outcome: RecallOutcome = {
    memories: finalMemories,
    ok: finalMemories.length > 0,
    error:
      finalMemories.length === 0
        ? rateLimited
          ? "Rate limit exceeded"
          : lastError ?? "No memories found"
        : rateLimited
          ? "Partial recall (rate limited)"
          : undefined,
    namespace,
    hitCount: finalMemories.length,
    rateLimited: rateLimited || undefined,
  };

  if (outcome.ok) {
    console.log(
      `[Walrus recall] ok namespace=${namespace} hits=${outcome.hitCount}${outcome.fromCache ? " (cache)" : ""}`,
    );
  } else {
    console.warn(
      `[Walrus recall] miss namespace=${namespace} error=${outcome.error}`,
    );
  }

  return outcome;
}

/** @deprecated Use recallWithOptimization */
export async function recallWalrusMemories(
  walletAddress: string,
  query: string,
  options: {
    limit?: number;
    maxDistance?: number;
    restoreFirst?: boolean;
    fallbackQueries?: boolean;
  } = {},
): Promise<RecallOutcome> {
  return recallWithOptimization(walletAddress, query, {
    limit: options.limit,
    maxDistance: options.maxDistance,
    allowRestore: options.restoreFirst !== false,
    maxFallbackQueries: options.fallbackQueries ? RECALL_MAX_FALLBACK_QUERIES : 0,
  });
}

export function formatMemoriesForPrompt(memories: string[], max = 5): string[] {
  return memories
    .slice(0, max)
    .map((line) => line.replace(/\s+/g, " ").trim().slice(0, 120))
    .filter(Boolean);
}

/** Human-readable block for Mourinho system prompt injection. */
export function formatMemoriesBlock(memories: string[], max = 5): string {
  const lines = formatMemoriesForPrompt(memories, max);
  if (lines.length === 0) return "";
  return lines.map((line, i) => `${i + 1}. ${line}`).join("\n");
}

export { AGENT_MEMORY_PREFIX, namespaceForWallet };
