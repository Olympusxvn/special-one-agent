# Changelog

All notable changes to **Mr. Toxic Special One** (Walrus Sessions 4).

Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Planned

- Public repo polish for hackathon submission (target ~19 Jun 2026)
- Memory Moment demo (Day 1 vs Day 4+ with same wallet)
- Demo video & DeepSurge / Airtable forms

---

## [0.3.0] — 2026-06-07

### Added

- **`SUBMISSION.md`** — Walrus Sessions 4 hackathon submission packet (MemWal features, Memory Moment script, checklist)
- **`FINAL_FEEDBACK.md`** — honest MemWal / serverless latency feedback for organizers ([#246](https://github.com/MystenLabs/MemWal/issues/246), [#247](https://github.com/MystenLabs/MemWal/issues/247), [#248](https://github.com/MystenLabs/MemWal/issues/248))
- Demo prompt chips in press room (`lib/samples/demo-prompts.ts`) — tap to fill chat input for judges
- `vercel.json` — `maxDuration: 60` on `/api/chat` (requires Vercel Pro for full effect; Hobby still capped ~10s)
- Fast-path chat pipeline: `loadFanProfileFast`, `applyIntentToProfile`, `MR_TOXIC_FAST_PROMPT`
- `lib/memory/apply-intent.ts` — in-memory intent apply without blocking MemWal before stream
- **`recallMemories` options API** — `RecallMemoriesOptions` (`limit`, `timeoutMs`, `useCache`); filters `FAN_PROFILE_JSON` from semantic hits; warm-instance recall cache per wallet + query

### Changed

- Removed Vercel AI Gateway — demo flow is **wallet + BYOK** (Gemini / ChatGPT / Claude in Settings)
- Default model: **Gemini 2.0 Flash Lite** (fastest free-tier path)
- Intent detection: regex only (removed extra LLM `generateObject` call before every stream)
- MemWal writes: `remember()` fire-and-forget instead of `rememberAndWait()` on chat hot path
- **Ultra-short roasts (demo speed):** `maxOutputTokens: 70`, hard **40-word** cap in prompt (~⅓ prior length), `temperature: 0.65`
- **Semantic recall re-enabled on chat path:** `Promise.all` — `loadFanProfileFast` (500ms) + `recallMemories` (800ms, limit 2, `useCache: true`); prompt injects up to **2** memories × **80** chars as `mem:line1 | line2`
- Chat history: last **4** turns, each message truncated to **100** chars before LLM
- Lessons learned section translated to **English** (feeds `FINAL_FEEDBACK.md`)
- `/schedules` — removed demo/API-Football info banners (fixtures list only)
- `README.md` / `PROJECT.md` — links to `SUBMISSION.md` and `FINAL_FEEDBACK.md`

### Fixed

- `FUNCTION_INVOCATION_TIMEOUT` on 3rd+ message — serverless function exceeded wall clock while waiting on MemWal + long stream
- Model mismatch (“No API key for Claude…”) when user saved ChatGPT/Gemini key but dropdown still on Claude
- Slow time-to-first-token — sequential blocking work before `streamText()` (see lesson §9 below)
- Verbose multi-paragraph roasts — prompt now enforces one short paragraph for faster stream completion

---

## [0.2.0] — 2026-06-08

### Added

- WC 2026 festive UI + official logo watermarks
- `/schedules` — fixtures/results (API-Football free tier or static demo JSON)
- Free RSS news feed (`/api/news`) — Google News + BBC Sport, no API key
- Direct LLM connect: Claude, ChatGPT, Gemini via Settings modal + per-provider API keys
- MemWal feedback issues [#246](https://github.com/MystenLabs/MemWal/issues/246), [#247](https://github.com/MystenLabs/MemWal/issues/247), [#248](https://github.com/MystenLabs/MemWal/issues/248)
- Stateless wallet auth proof in `sessionStorage` for serverless

### Changed

- Dropped SportMonks (paid) — free-only football data path
- Replaced OpenRouter-only BYOK with provider-specific keys in **Settings**
- README project structure tree (GitHub-safe rendering)

### Fixed

- Chat input invisible text (`.chat-input` contrast + autofill override)
- Settings modal z-index — LLM key form no longer covered by chat welcome card
- `Wallet not verified` on Vercel — in-memory session does not survive across lambdas
- `No user message` — `prepareSendMessagesRequest` must include `messages` in custom body
- Manual `vercel --prod` when Git auto-deploy not wired for private repo

---

## [0.1.0] — 2026-06-07

### Added

- Next.js 14 press-room chat with MemWal per-wallet namespace (`special-one-{address}`)
- Sui wallet sign-in + streaming roast API (`/api/chat`)
- OpenRouter BYOK (later superseded by direct provider keys)
- MemWal mainnet setup docs ([docs/MEMWAL_SETUP.md](./docs/MEMWAL_SETUP.md))
- Production deploy: [special-one-agent.vercel.app](https://special-one-agent.vercel.app)
- Walrus Sessions 4 rules summary ([WALRUS_SS4_RULE.md](./WALRUS_SS4_RULE.md))

---

## Lessons learned

Notes from the hackathon build — so we do not repeat the same mistakes.

### 1. MemWal on serverless (Vercel)

**Problem:** One `MemWalAccount` + **delegate key** on the server; each user only connects a Sui wallet — a multi-tenant pattern not covered in the quickstart.

**Lessons:**

- Document clearly: operator creates the account; users only sign with their wallet; namespace `special-one-{address}`.
- Structured state (JSON profile) + semantic `recall` can return stale snapshots → filed issue [#247](https://github.com/MystenLabs/MemWal/issues/247) (upsert / key-based recall).
- `npm run memwal:verify` only checks env — a real `healthCheck()` would help ([#248](https://github.com/MystenLabs/MemWal/issues/248)).

### 2. Wallet auth and serverless

**Problem:** `/api/auth/verify` wrote sessions to an in-memory `Map` → `/api/chat` hit a different lambda → `Wallet not verified`.

**Lessons:**

- **Do not trust in-memory sessions** on Vercel/serverless.
- Store `message` + `signature` in `sessionStorage` and send them with **every** API call; server verifies the Sui signature (stateless).
- The error is in the app backend, **not** a ChatGPT/Claude API key issue.

### 3. AI SDK `DefaultChatTransport`

**Problem:** `prepareSendMessagesRequest` returned a custom `body` → SDK **replaced** the default body entirely → missing `messages` → `No user message`.

**Lessons:**

- When overriding `body`, **must** spread defaults and include `messages` from the callback.
- The failure happens **before** the LLM call — do not misdiagnose as an OpenAI API key problem.

### 4. Football data — free-first

**Problem:** SportMonks WC API is paid; embed widgets need domain whitelisting.

**Lessons:**

- **News:** RSS (Google News + BBC) — works well, no key.
- **Schedules/results:** `API_FOOTBALL_KEY` (free tier ~100 req/day) or `data/wc2026-fixtures.json` demo when no key.
- Do not bolt a widget hub onto the roast app if users only need schedules — keep scope small.

### 5. UI / UX

**Problem:** Header key dropdown was covered by the welcome card; chat input showed white text on white background (autofill).

**Lessons:**

- Sensitive forms (API keys) → **Settings modal** full-screen `z-[200]`, not a header dropdown.
- Dark-theme inputs: `.chat-input` + `color-scheme: dark` + `-webkit-autofill` override.

### 6. Vercel deploy

**Problem:** `git push` did not auto-deploy; production lagged several commits behind.

**Lessons:**

- **Private** repos need Git integration + Vercel permissions on GitHub, or `npx vercel --prod --yes` after important pushes.
- Verify production: `curl` `/schedules`, `/api/news`, `/api/matches/fixtures` — not just the landing page cache.
- On Windows, `.next` ENOENT during build sometimes — `rm -rf .next` then rebuild.

### 7. Hackathon and repo

**Problem:** Public MemWal issues ≠ private repo; judges cannot read code/README.

**Lessons:**

- Submission needs **public repo** + live URL + MemWalAccount explorer link + Memory Moment video.
- Feedback prize: link MemWal issues in the form — does not depend on a private README.
- Three issues filed: multi-tenant cookbook ([#246](https://github.com/MystenLabs/MemWal/issues/246)), structured state ([#247](https://github.com/MystenLabs/MemWal/issues/247)), healthCheck ([#248](https://github.com/MystenLabs/MemWal/issues/248)).

### 8. LLM — web login vs API key

**Expectation:** Users log into Claude/ChatGPT/Gemini like on the web.

**Reality:** The app does not OAuth into chat web accounts. Correct flow: sign in on the provider site → create an **API key** → paste into Settings (`sessionStorage`).

**Lesson:** State clearly in UI/docs so users do not expect “one-click login like ChatGPT.com”.

**Most stable judge demo path:** Connect Sui wallet → Verify → Settings → Gemini (free key from [AI Studio](https://aistudio.google.com/apikey)) → Save → select **Gemini 2.0 Flash Lite** → send a message (or tap a demo chip).

### 9. Slow chat and `FUNCTION_INVOCATION_TIMEOUT` (3rd message)

> **For `FINAL_FEEDBACK.md`:** production symptoms, root causes, and MemWal trade-offs on serverless.

**Symptoms (production `special-one-agent.vercel.app`, region `hkg1`):**

- Messages 1–2: roast streams OK but **slow** (several seconds before text appears).
- Message 3: red error `An error occurred with your deployment` — `FUNCTION_INVOCATION_TIMEOUT`.
- Sometimes: `API quota or billing issue` when the Gemini key is out of quota or the selected model does not match the saved key.

**Root causes (not a Sui wallet bug):**

| # | Cause | Impact |
|---|--------|--------|
| 1 | **`rememberAndWait()` before each stream** — `setFavoriteTeam` / `addPrediction` / `appendRoast` await MemWal relayer | Adds 1–3s+ **before** LLM streaming starts; message 3 also pays `onFinish` + longer history |
| 2 | **LLM intent** (`generateObject`) before `streamText` | One extra full API round-trip per message |
| 3 | **`syncPendingPredictions()` on every chat turn** | `loadFanProfile` + MemWal `recall` + possible API-Football calls per `fixtureId` |
| 4 | **Long system prompt** (~2k tokens) + full `FAN_PROFILE` JSON + 5 recalled memories | Slow TTFT, longer total lambda time |
| 5 | **`maxOutputTokens: 380`** + incomplete stream | Vercel lambda runs until stream ends; Hobby ~10s, Pro up to 60s (`export const maxDuration`) |
| 6 | **Full conversation history** sent each turn | Input tokens grow per turn → message 3 slower than message 1 |

**Why the failure often hits on message 3:**

- Turn 1: cold start + MemWal load + prompt build + stream.
- Turn 2: longer history, possible prediction persist.
- Turn 3: total **blocking + streaming** time exceeds serverless limit → timeout **during** or **after** stream (when `onFinish` still awaited MemWal).

**Mitigations applied (in repo):**

1. MemWal: `remember()` **not awaited** on hot path; in-memory cache first.
2. `loadFanProfileFast` — **500ms** timeout, fallback to empty profile.
3. **Parallel semantic recall** — `Promise.all` with `recallMemories` (**800ms** cap, limit **2**, filters profile JSON, warm-instance cache); never blocks stream with `rememberAndWait`.
4. Removed `syncPendingPredictions` from `/api/chat` — sync via **Check my predictions** (`/api/matches/sync`).
5. Intent = regex (`detectIntent`), no auxiliary LLM call.
6. `MR_TOXIC_FAST_PROMPT` — **40 words max**, one paragraph; `maxOutputTokens: 70` (~⅓ of earlier 200-token cap).
7. History capped at **4** turns, **100** chars per message sent to the model.
8. `onFinish` → `void appendRoast(...)` does not block the response.
9. `vercel.json` `maxDuration: 60` for the chat route.

**Trade-offs (for MemWal feedback — see [FINAL_FEEDBACK.md](./FINAL_FEEDBACK.md)):**

- Fire-and-forget `remember` → faster demo but **no guarantee** the write committed before the response; judges see the roast immediately, memory may lag a few seconds.
- Capped parallel recall (+0.5–1s TTFT vs no recall) → stronger **Memory Moment** callbacks without sequential MemWal blocking.
- Shorter output → punchier demo but less “press conference” depth; acceptable for live judge sessions.
- SDK needs a clear **`remember` vs `rememberAndWait`** pattern in the cookbook ([#246](https://github.com/MystenLabs/MemWal/issues/246)) plus a serverless latency budget.

### 10. Vercel AI Gateway (tried, removed)

**Goal:** Users only connect a wallet, no API key (free Claude Haiku via Gateway).

**Outcome:** Works for operators with Gateway credits/OIDC; for hackathon BYOK demo, **Settings + free Gemini key** is simpler and easier to debug. Gateway removed from codebase (`lib/ai/gateway.ts` deleted); production uses direct provider APIs + user keys.

**Lesson:** Do not mix two models (server-side Gateway vs client-side BYOK) — pick one demo path and document it for judges.

### 11. Model / API key mismatch

**Symptom:** `No API key for Claude Sonnet` even after pasting a ChatGPT/Gemini key.

**Cause:** `DEFAULT_MODEL_ID` was `claude-sonnet`; dropdown did not auto-sync after Save.

**Fix:** `pickModelForProviders` / `syncModelWithProviders` — after Save, dropdown switches to the matching provider; default `gemini`.

---

## Links

| Resource | URL |
|----------|-----|
| Production | https://special-one-agent.vercel.app |
| MemWalAccount (explorer) | https://suiscan.xyz/mainnet/object/0x73b07979a6712f54283c02ddf70e2bdfb3ec729627c9ef0e0d8a214015066a99 |
| MemWal dashboard | https://memory.walrus.xyz/dashboard |
| Walrus Sessions 4 | https://thewalrussessions.wal.app/memory-world-cup |

[Unreleased]: https://github.com/Olympusxvn/special-one-agent/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/Olympusxvn/special-one-agent/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/Olympusxvn/special-one-agent/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Olympusxvn/special-one-agent/commit/93e3f62
