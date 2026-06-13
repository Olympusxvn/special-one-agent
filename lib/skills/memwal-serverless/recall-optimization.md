# Recall Optimization (MemWal Serverless)

Sub-skill of [memwal-serverless](./SKILL.md). Source: `lib/memory/recall.ts`,
`lib/memory/constants.ts`, `lib/memory/commit-session.ts`.

**Judges:** context in [FINAL_FEEDBACK.md](../../../FINAL_FEEDBACK.md) § Recall.

---

## Goals

1. Semantic recall for personalization without blowing serverless TTFT.
2. Survive relayer **429** without failing the chat stream.
3. Avoid `restore()` storms after fresh writes.

---

## Constants (tune per deploy)

```typescript
RECALL_CACHE_TTL_MS = 3 * 60 * 1000;   // warm lambda cache
JUST_COMMITTED_TTL_MS = 45 * 1000;     // skip restore after write
RECALL_RETRY_BASE_MS = 500;            // exponential backoff
RECALL_MAX_FALLBACK_QUERIES = 1;
RECALL_MAX_DISTANCE = 0.85;
RECALL_DEFAULT_LIMIT = 10;             // cap before prompt slice
```

Chat hot path typically passes `limit: 2`, `timeoutMs: 800`.

---

## Algorithm (`recallWithOptimization`)

```text
1. If useCache && hit cache[wallet+query] → return cached (fromCache: true)
2. If isWalletJustCommitted(wallet) → skipRestore = true (default)
3. Try client.recall(query) on primary namespace
4. On 429 → backoff retry; set rateLimited flag; try any cached wallet hits
5. If zero hits && tryLegacyNamespace → recall on legacy namespace
6. Optional fallback queries (max 1) with DEFAULT_RECALL_QUERY
7. allowRestore: false on hot path — only enable on cold/admin routes
8. Write cache on success
```

---

## Prompt injection caps

After recall returns, slice before system prompt:

```typescript
recalledMemories.slice(0, 2).map(m => m.slice(0, 80));
```

Use `formatMemoriesBlock()` in `lib/memory/recall.ts` for consistent markdown.

---

## Profile vs semantic recall

| Read | Source | Timeout |
|------|--------|---------|
| Structured state | `FAN_PROFILE_JSON:` via profile load / recall parse | 500ms (`loadFanProfileFast`) |
| Graveyard lines | Semantic `recall(query)` | 800ms |

Run in **`Promise.all`** — never chain awaits.

---

## UI when rate limited

Show non-blocking toast: *"Walrus is a bit busy — using cached context."*
Do not fail the stream. Partial recall > no chat.

---

## When NOT to recall on hot path

- Hobby plan 10s cap with long streams — profile-only may be enough.
- Immediately after bulk commit — wait for `JUST_COMMITTED_TTL_MS` or use cache.

Re-enable recall when Pro + `maxDuration: 60` + caps above (shipped in this repo).

---

## Tests / smoke

```bash
node scripts/test-walrus-recall-flow.mjs
```

See also `npm run memwal:verify` for env-only check (not relayer ping).
