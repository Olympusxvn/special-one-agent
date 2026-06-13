/** Agent prefix for MemWal namespaces (per-wallet isolation). */
export const AGENT_MEMORY_PREFIX = "mr-toxic-special-one";

/** Pre-migration namespace prefix (dual-read on recall). */
export const LEGACY_MEMORY_PREFIX = "special-one";

export const DEFAULT_RECALL_QUERY =
  "User's past predictions, favorite team, and flip-flops about World Cup";

export const RECALL_MAX_DISTANCE = 0.85;

export const RECALL_DEFAULT_LIMIT = 10;

/** In-memory recall cache TTL (recent hits per wallet+query). */
export const RECALL_CACHE_TTL_MS = 3 * 60 * 1000;

/** Skip restore() after commit/remember for this window. */
export const JUST_COMMITTED_TTL_MS = 45 * 1000;

/** Base delay for exponential backoff between recall retries. */
export const RECALL_RETRY_BASE_MS = 500;

/** Max extra fallback queries after the primary (not counting legacy namespace). */
export const RECALL_MAX_FALLBACK_QUERIES = 1;
