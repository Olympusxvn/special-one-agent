# Feedback for Walrus Sessions / MemWal — Serverless Latency

**Project:** [Mr. Toxic Special One](https://special-one-agent.vercel.app)  
**Stack:** Next.js 14 on Vercel (region `hkg1`) + MemWal mainnet + Sui wallet auth  
**Audience:** Walrus Sessions organizers, MemWal SDK team, hackathon reflection forms

---

## What we built

A **Prediction Roast** agent for World Cup 2026: fans connect a Sui wallet, declare teams and scores, get roasted by a fictional "Mr. Toxic Special One" persona. Each wallet gets an isolated MemWal namespace (`special-one-{address.toLowerCase()}`) storing structured fan profile JSON plus semantic memory lines (predictions, flip-flops, roast callbacks). Toxicity escalates as wrong predictions and bandwagon switches accumulate.

---

## What worked well

- **Wallet-only identity** — no signup; one address = one memory namespace. Clean fit for hackathon "portable memory."
- **MemWal mainnet + explorer link** — judges can verify memories land on Walrus via SuiScan and the press-room **MemWal 🟢 LIVE** badge.
- **Structured profile + semantic lines** — `FAN_PROFILE_JSON` blob for fast reads; `remember()` lines for graveyard callbacks when recall is enabled.
- **Multi-tenant operator pattern** — one MemWalAccount + delegate key on server; users only sign with their wallet (filed cookbook gap as [#246](https://github.com/MystenLabs/MemWal/issues/246)).
- **Stateless wallet auth** — `sessionStorage` proof + per-request signature verify; fixes lambda-hopping on Vercel (in-memory sessions do not survive).
- **BYOK + demo chips** — Gemini 2.0 Flash Lite free tier + one-tap prompt chips made live demos reproducible for judges.
- **Separation of sync from chat** — `/api/matches/sync` for API-Football resolution instead of blocking every roast turn.

---

## Pain points (with evidence)

### `FUNCTION_INVOCATION_TIMEOUT` on 3rd message

**Symptom (production `special-one-agent.vercel.app`, region `hkg1`):**

- Messages 1–2: roast streams but **slow** TTFT (several seconds before text).
- Message 3: `An error occurred with your deployment` — **`FUNCTION_INVOCATION_TIMEOUT`**.
- Occasional red herring: `API quota or billing issue` when Gemini key exhausted or model dropdown mismatched saved provider.

This is **not** a Sui wallet bug — it is serverless wall-clock budget vs blocking work + stream duration.

### Latency stack (pre-mitigation)

| Layer | What it did | Impact |
|-------|-------------|--------|
| **`rememberAndWait()`** | `setFavoriteTeam` / `addPrediction` / `appendRoast` awaited MemWal relayer before `streamText()` | +1–3s before first token; turn 3 also pays `onFinish` + longer history |
| **Extra LLM intent call** | `generateObject` before every stream | Full extra API round-trip per message |
| **`syncPendingPredictions()` every chat turn** | `loadFanProfile` + MemWal recall + possible API-Football per `fixtureId` | Unbounded blocking on hot path |
| **Sequential recall + profile** | Await profile load, then recall, then prompt build | TTFT sums latencies instead of overlapping |
| **Fat prompt** | ~2k-token persona + full `FAN_PROFILE` JSON + 5 recalled memories | Slow TTFT, long lambda occupancy |
| **Long stream** | `maxOutputTokens: 380`, multi-paragraph roasts | Lambda runs until stream ends; Hobby ~10s cap, Pro up to 60s |
| **Growing history** | Full conversation sent each turn | Input tokens grow — message 3 slower than message 1 |

**Why message 3 specifically:** cumulative blocking (MemWal + intent + sync) + longer stream + `onFinish` MemWal write often exceeds serverless limit mid- or post-stream.

---

## What we changed

From [CHANGELOG.md](./CHANGELOG.md) `[Unreleased]`:

1. **MemWal writes:** `remember()` fire-and-forget — never `rememberAndWait()` on chat hot path.
2. **`loadFanProfileFast`** — **500ms** timeout, in-memory cache first; **no `recall` on `/api/chat`**.
3. **Removed `syncPendingPredictions` from chat** — sync via explicit **Check my predictions** button.
4. **Intent = regex only** — dropped auxiliary LLM `generateObject` before stream.
5. **`MR_TOXIC_FAST_PROMPT`** — **40 words max**, one paragraph; `maxOutputTokens: 70`.
6. **History cap** — last **4** turns, **100** chars per message to model.
7. **`onFinish` → `void appendRoast(...)`** — does not block HTTP response.
8. **`vercel.json`** — `maxDuration: 60` on `/api/chat` (Pro plan; Hobby still ~10s).
9. **Fast path:** `applyIntentToProfile` — sync in-memory + async persist before stream.

---

## Trade-offs we accepted

| Trade-off | Why we accepted it |
|-----------|-------------------|
| Fire-and-forget `remember` | Faster demo; write may lag response by seconds — acceptable for live judging |
| No semantic recall on hot path *(was true pre-fix)* | Re-enabled with parallel 800ms cap — see Recall section below |
| Shorter roasts (40 words) | Punchier live demo; less "press conference" depth |
| No per-turn fixture sync | User-triggered sync only — fewer API-Football + MemWal calls |
| Profile-first context | Compact `fan:{team,flips,last}` JSON instead of full profile + memories in prompt |

**Honest reflection:** The agent still *writes* to Walrus and *loads* structured profile per wallet — but the **Memory Moment** demo is weaker without semantic recall on the hot path. Judges see persistence via refresh + profile fields, not always the savage "you said Mexico 2-1 six days ago" callback.

---

## Recall — re-enabled (latency-safe pattern)

Semantic recall is **core** to **Memory Moment** and **Prediction Roast** judging. Shipped pattern in `app/api/chat/route.ts`:

```text
// Parallel fetch with separate budgets — do NOT await remember() before stream
const [profile, memories] = await Promise.all([
  loadFanProfileFast(wallet, 500),      // structured blob — hard cap
  recallMemories(wallet, query, 2),     // semantic — ~800ms cap, return [] on timeout
]);

// Prompt injection: max 1–2 memories, 80 chars each (build-prompt already slices to 80)
recalledMemories: memories.slice(0, 2).map(m => m.slice(0, 80))

// Never await remember() / rememberAndWait() before streamText()
// onFinish: void appendRoast(...) only

// Optional: in-memory recall cache after first turn in warm lambda (same wallet, same container)
// Keep short output (maxOutputTokens 70), no sync on chat path
```

**Expected trade-off:** +0.5–1s TTFT vs much stronger judge demo and authentic Memory Moment. Worth it on Vercel Pro with `maxDuration: 60` if recall is capped and parallelized.

**Separate timeouts matter:** profile recall (structured `FAN_PROFILE_JSON` hit) and semantic recall (graveyard lines) should not share one blocking chain — `Promise.all` + independent caps.

---

## Ask for MemWal / Walrus Sessions

| Ask | Context | Issue |
|-----|---------|-------|
| **Serverless latency guide** | Budget template: what to parallelize, what to fire-and-forget, typical relayer RTT on mainnet | — |
| **`remember` vs `rememberAndWait` cookbook** | When writes must be awaited vs demo-safe fire-and-forget; multi-tenant delegate-key pattern | [#246](https://github.com/MystenLabs/MemWal/issues/246) |
| **Profile upsert / key-based recall** | Structured JSON snapshots can return stale duplicates on recall | [#247](https://github.com/MystenLabs/MemWal/issues/247) |
| **`healthCheck()` beyond env verify** | `npm run memwal:verify` only checks keys — no live relayer ping | [#248](https://github.com/MystenLabs/MemWal/issues/248) |

**Surprises:**

- Quickstart assumes single-user MemWalAccount; multi-tenant (one operator account, per-user namespaces) needed more trial-and-error than expected.
- `rememberAndWait` before LLM stream is a foot-gun on serverless — easy to miss until message 3 times out.
- Semantic recall quality is excellent for roast callbacks; turning it off fixed latency but dulled the product's core promise.

**What we'd build differently:** Start with the parallel capped-recall pattern on day one; never put `syncPendingPredictions` or `rememberAndWait` on the chat hot path; ship a "serverless mode" flag in MemWal docs.

---

## Links

| Resource | URL |
|----------|-----|
| Production | https://special-one-agent.vercel.app |
| MemWalAccount explorer | https://suiscan.xyz/mainnet/object/0x73b07979a6712f54283c02ddf70e2bdfb3ec729627c9ef0e0d8a214015066a99 |
| Submission packet | [SUBMISSION.md](./SUBMISSION.md) |
| MemWal setup | [docs/MEMWAL_SETUP.md](./docs/MEMWAL_SETUP.md) |
| Full lessons | [CHANGELOG.md](./CHANGELOG.md) §1–11 |

---

## Tóm tắt (VI)

Build roast-bot WC 2026 + MemWal per-wallet trên Vercel **hkg1**. **Timeout message 3** do `rememberAndWait`, LLM intent, sync mỗi turn, prompt dài, stream dài. Đã chuyển sang `remember()` fire-and-forget, `loadFanProfileFast` 500ms, tắt recall trên chat, roast 40 từ. **Vẫn muốn bật lại recall** — song song `Promise.all`, cap 1–2 memory × 80 ký tự, ~800ms — trade-off +0.5–1s TTFT để demo Memory Moment mạnh hơn. Cần MemWal: hướng dẫn serverless, cookbook remember ([#246](https://github.com/MystenLabs/MemWal/issues/246)), upsert profile ([#247](https://github.com/MystenLabs/MemWal/issues/247)), healthCheck ([#248](https://github.com/MystenLabs/MemWal/issues/248)).
