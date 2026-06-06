# Mr. Toxic Special One — Product Specification

> **Status:** Pre-implementation contract (Karpathy-style). No code changes implied by this document alone.  
> **Repo:** `C:\Users\Admin\special-one-agent` (standalone Next.js app)  
> **Hackathon:** [Walrus Sessions 4 — Walrus Memory World Cup](https://thewalrussessions.wal.app/memory-world-cup) (June 5–24, 2026)

---

## Tóm tắt (VI)

- **Mr. Toxic Special One** là chatbot roast kiểu José Mourinho (nhân vật hư cấu) dành cho fan bóng đá World Cup 2026 — toxic nhưng vui, không thô tục.
- **Bộ nhớ Walrus (MemWal):** mỗi ví Sui có namespace riêng (`special-one-{address}`); lưu đội yêu thích, dự đoán, lịch sử roast; toxicity tăng khi dự đoán sai hoặc đổi đội.
- **Xác thực:** kết nối ví Sui + ký `PersonalMessage` trước khi chat; identity gắn với ví, không cần đăng ký.
- **Kết quả trận:** API-Football (WC 2026) tự sync + người dùng nhập tay ("Argentina beat Brazil 1-0").
- **LLM:** OpenRouter (chọn model trên UI); intent parsing (team / prediction / result / banter).
- **UI:** phòng họp báo tối + vàng; ToxicityMeter, PredictionCard, meme stamp trong mỗi roast.
- **Repo hiện tại:** backend + components ~80% xong; landing page chưa nối ChatContainer; thiếu `.env.example`, README, demo script.
- **Phạm vi:** hoàn thiện app standalone này — **không** migrate sang monorepo `memwal-agent-memory` trong sprint hackathon.

---

## 1. Problem Statement

Football fans make bold World Cup predictions, flip-flop teams, and cope when wrong — but no one remembers their track record well enough to roast them personally. **Mr. Toxic Special One** is a satirical press-conference AI (fictional José Mourinho persona) that uses **Walrus Memory (MemWal)** to remember each fan's team, predictions, and roast history per **Sui wallet**, escalates toxicity when they are wrong, and grounds banter in **API-Football + manual match results** for FIFA World Cup 2026. The product must demo MemWal's value for the hackathon while staying deployable as a single Next.js app.

---

## 2. Assumptions

1. **Standalone repo** — `special-one-agent` is the shipping target; not integrating into `memwal-agent-memory` monorepo for this hackathon.
2. **English only** — all user-facing copy and LLM output in English.
3. **Wallet = identity** — one Sui address → one memory namespace; no email/password auth.
4. **Fictional persona** — clearly not the real José Mourinho; roast fandom, not individuals.
5. **MemWal SDK** — `@mysten-incubation/memwal` with `MEMWAL_PRIVATE_KEY`, `MEMWAL_ACCOUNT_ID`, optional `MEMWAL_SERVER_URL`.
6. **OpenRouter** — `OPENROUTER_API_KEY` required for chat; intent parsing degrades to regex without it.
7. **API-Football** — `API_FOOTBALL_KEY` optional; manual result entry always works.
8. **Serverless-friendly** — Next.js App Router on Vercel; in-memory auth sessions acceptable for demo (24h TTL).
9. **World Cup 2026** — league id `1`, season `2026` for fixtures (pre-tournament data may be sparse).
10. **Partial implementation exists** — spec governs *completion and verification*, not greenfield rewrite.

---

## 3. Non-Goals

| Item | Reason |
|------|--------|
| Monorepo migration (`apps/toxic-special-one` in MemWal++) | Out of scope; standalone app is simpler and already started |
| Hybrid local SQLite + Walrus sync layer | Raw MemWal sufficient for hackathon; hybrid is future enhancement |
| Postgres / custom database | MemWal is source of truth |
| Multi-language UI or roasts | User chose English |
| Real-time match streaming / live scores push | Polling sync on chat + manual button is enough |
| Social features, leaderboards, sharing | Speculative |
| Mobile native app | Web responsive only |
| Heavy profanity or harassment | Persona rules forbid it |
| Fabricating match results | Server injects only verified API/manual data |
| NFT minting, on-chain prediction markets | Not requested |

---

## 4. Requirements

### R1 — Wallet gate and verification

**Description:** User must connect Sui wallet and sign an auth message before chatting.

**Acceptance criteria:**
- [ ] UI shows "Connect wallet" when no account; chat input disabled.
- [ ] On connect, client signs `buildAuthMessage(address)` and POSTs to `/api/auth/verify`.
- [ ] `/api/chat` returns `401` if wallet not verified in server session.
- [ ] **Verify:** Connect testnet wallet → sign → send message → `200` stream; disconnect/reconnect new wallet → previous wallet's memory not visible.

### R2 — Per-wallet Walrus memory namespace

**Description:** Fan data isolated per wallet in MemWal.

**Acceptance criteria:**
- [ ] Namespace format: `special-one-{walletAddress.toLowerCase()}`.
- [ ] Profile persisted as `FAN_PROFILE_JSON:{...}` snapshot on every mutation.
- [ ] Semantic lines stored for predictions, roasts, flip-flops.
- [ ] `recall` returns relevant memories injected into system prompt.
- [ ] **Verify:** Wallet A declares team → Wallet B does not see A's team; restart server with MemWal keys → A's team still recalled.

### R3 — Fan memory CRUD

**Description:** Structured `FanMemory` profile with predictions, toxicity inputs, roast history.

**Acceptance criteria:**
- [ ] `setFavoriteTeam` increments `flip_flop_count` on team change.
- [ ] `addPrediction` appends pending prediction (max 50).
- [ ] `resolvePrediction` sets `result` on match (API sync or manual intent).
- [ ] `appendRoast` updates `roast_history` (max 20) and `last_roast_topics` (max 5).
- [ ] **Verify:** Unit-level check — after 2 wrong predictions + 1 flip-flop, `computeToxicityLevel` ≥ 4.

### R4 — Toxic press-conference responses

**Description:** LLM stays in character with mandatory response structure.

**Acceptance criteria:**
- [ ] System prompt includes `TOXICITY_LEVEL`, `FAN_PROFILE`, `RECALLED_MEMORIES`, optional `MATCH_CONTEXT`.
- [ ] Every assistant message contains: opening roast, `[Meme Format]` line, body, closing sting, 3–6 allowed emojis.
- [ ] Toxicity 1–3 vs 9–10 visibly different in tone (manual UAT on same prompt).
- [ ] No helpful-assistant mode for general banter.
- [ ] **Verify:** Send "I support Brazil" → response mentions Brazil; send wrong prediction then result → callback to wrong call.

### R5 — Intent detection

**Description:** Classify user messages: `set_team`, `prediction`, `report_result`, `banter`.

**Acceptance criteria:**
- [ ] Primary: `generateObject` + zod when OpenRouter available.
- [ ] Fallback: regex patterns in `lib/ai/intent.ts`.
- [ ] Chat route applies correct `FanProfile` mutation before LLM call.
- [ ] **Verify:** "I support Argentina" → `favorite_team` set; "Brazil 3-0 Argentina" → prediction added; "Argentina beat Brazil 1-0" → result resolved.

### R6 — Match results (API + manual)

**Description:** Resolve pending predictions via API-Football and user-reported scores.

**Acceptance criteria:**
- [ ] `GET /api/matches/fixtures` returns WC 2026 fixtures or `{ source: "unavailable" }`.
- [ ] `POST /api/matches/sync` resolves predictions with `fixtureId` when fixture finished.
- [ ] Chat route calls `syncPendingPredictions` opportunistically on each message.
- [ ] Manual `report_result` intent resolves without API key.
- [ ] **Verify:** Mock pending prediction with `fixtureId` + finished fixture → sync sets `result`; without API key, manual result still works.

### R7 — Streaming chat API

**Description:** `/api/chat` streams toxic responses via Vercel AI SDK.

**Acceptance criteria:**
- [ ] POST body: `{ messages, walletAddress, modelId? }`.
- [ ] Returns UI message stream; `onFinish` persists roast to memory.
- [ ] Returns `503` without `OPENROUTER_API_KEY`; `400` without wallet/message.
- [ ] **Verify:** `curl` or browser — stream chunks arrive; roast appears in next turn's `RECALLED_MEMORIES`.

### R8 — Press-room UI

**Description:** Dark/gold meme press-room chat experience wired to production landing page.

**Acceptance criteria:**
- [ ] `app/page.tsx` renders `ChatContainer` (not create-next-app boilerplate).
- [ ] Components: `PressRoomHeader`, `MourinhoAvatar`, `MessageBubble`, `MemeStamp`, `ModelSelector`, `PredictionCard`, `ToxicityMeter`, `WalletButton`.
- [ ] `memWalLive` banner when `MEMWAL_*` keys missing.
- [ ] Model selector changes `modelId` in chat transport.
- [ ] **Verify:** Full flow in browser — connect → chat → see toxicity meter update after wrong prediction.

### R9 — Environment and documentation

**Description:** Operator can configure and run without reading source.

**Acceptance criteria:**
- [ ] `.env.example` lists all required/optional vars with comments.
- [ ] `README.md` replaces boilerplate with setup, env, dev, deploy steps.
- [ ] This `docs/SPEC.md` remains the design contract.
- [ ] **Verify:** Fresh clone + `.env.local` from example → `pnpm dev` → app loads.

### R10 — Hackathon demo readiness

**Description:** 3-minute judge walkthrough reproducible.

**Acceptance criteria:**
- [ ] Demo script (Section 11) executable end-to-end in &lt; 5 minutes.
- [ ] Works offline-ish: no API-Football key → manual results still demo memory + toxicity.
- [ ] MemWal keys set → show "memory persisted to Walrus" in header/banner.
- [ ] **Verify:** Run demo script twice; second run shows recalled predictions/roasts.

---

## 5. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (Next.js client)                                   │
│  dapp-kit Wallet → ChatContainer → useChat transport        │
└──────────────────────────┬──────────────────────────────────┘
                           │ POST /api/chat, /api/auth/verify
                           │ POST /api/matches/sync
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Next.js App Router (server)                                │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ verify-wallet│  │ detectIntent │  │ buildSystemPrompt  │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ fan-profile.ts — load/save/recall via MemWal client     ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌──────────────┐  ┌──────────────────────────────────────┐ │
│  │ streamText   │  │ sync-predictions → api-football      │ │
│  └──────────────┘  └──────────────────────────────────────┘ │
└──────────┬───────────────────────────────┬──────────────────┘
           │                               │
           ▼                               ▼
   ┌───────────────┐               ┌────────────────┐
   │ OpenRouter    │               │ API-Football   │
   │ (LLM stream)  │               │ (WC fixtures)  │
   └───────────────┘               └────────────────┘
           │
           ▼
   ┌───────────────┐
   │ MemWal Relayer│  namespace: special-one-{wallet}
   │ (Walrus)      │
   └───────────────┘
```

**Request flow (chat):** verify wallet → sync pending fixtures → detect intent → mutate profile → recall memories → build prompt → stream LLM → append roast → push to MemWal.

---

## 6. Data Model

### `FanMemory`

| Field | Type | Description |
|-------|------|-------------|
| `favorite_team` | `string` | Current supported team; empty until declared |
| `past_predictions` | `Prediction[]` | Up to 50 entries |
| `flip_flop_count` | `number` | Times user changed `favorite_team` |
| `confidence_level` | `"high" \| "medium" \| "low"` | Last declared confidence; affects toxicity |
| `roast_history` | `string[]` | Last 20 assistant roasts (truncated 500 chars) |
| `last_roast_topics` | `string[]` | Last 5 topics to avoid repetition |

### `Prediction`

| Field | Type | Description |
|-------|------|-------------|
| `match` | `string` | Human-readable match label |
| `prediction` | `string` | User's predicted outcome (e.g. "Brazil 3-0") |
| `result` | `string \| null` | Actual result; `null` = pending |
| `fixtureId` | `number?` | API-Football fixture id for auto-sync |
| `createdAt` | `string` | ISO 8601 timestamp |

### MemWal storage conventions

| Content pattern | Example |
|-----------------|---------|
| Profile snapshot | `FAN_PROFILE_JSON:{"favorite_team":"Brazil",...}` |
| Prediction | `Prediction: Brazil 3-0 Argentina for WC final — PENDING` |
| Result | `Prediction WRONG: said 3-0, actual 1-2` |
| Team | `User supports Brazil. Confidence: high.` |
| Roast | `Roast delivered: {excerpt}` |
| Flip-flop | `Flip-flop: switched from Argentina to Brazil` |

### Toxicity formula

```
wrongCount = count(predictions where result ≠ null AND prediction ≠ result)
toxicityLevel = clamp(1, 10, round(1 + wrongCount*1.5 + flip_flop_count*2 + (high_confidence_wrong ? 2 : 0)))
```

---

## 7. API Contracts

### `POST /api/auth/verify`

**Request:**
```json
{
  "walletAddress": "0x…",
  "message": "mr-toxic-special-one wants you to sign…",
  "signature": "base64…"
}
```

**Response 200:**
```json
{ "ok": true }
```

**Errors:** `400` missing fields, `401` invalid signature.

---

### `POST /api/chat`

**Request:**
```json
{
  "messages": [{ "id": "…", "role": "user", "parts": [{ "type": "text", "text": "I support Brazil" }] }],
  "walletAddress": "0x…",
  "modelId": "anthropic/claude-3.5-sonnet"
}
```

**Response:** `200` — UI message stream (`text/event-stream` or AI SDK UI stream).

**Errors:**
| Status | Condition |
|--------|-----------|
| `400` | Missing wallet or user message |
| `401` | Wallet not verified |
| `503` | `OPENROUTER_API_KEY` missing |

---

### `GET /api/matches/fixtures`

**Response 200:**
```json
{
  "fixtures": [
    {
      "id": 12345,
      "date": "2026-06-15T00:00:00+00:00",
      "status": "FT",
      "homeTeam": "Brazil",
      "awayTeam": "Argentina",
      "homeGoals": 2,
      "awayGoals": 1,
      "scoreline": "Brazil 2-1 Argentina"
    }
  ],
  "source": "api-football"
}
```

`source` is `"unavailable"` when `API_FOOTBALL_KEY` unset.

---

### `POST /api/matches/sync`

**Request:**
```json
{ "walletAddress": "0x…" }
```

**Response 200:**
```json
{
  "profile": { /* FanMemory */ },
  "resolved": [{ "match": "Brazil vs Argentina", "result": "Brazil 2-1 Argentina" }],
  "pending": 1
}
```

**Errors:** `400`, `401` same as chat.

---

## 8. System Prompt Contract

**Identity:** Fictional José Mourinho — arrogant press-conference roast machine; user is always a "blind fan"; World Cup 2026 theme.

**Mandatory format (every message):**
1. Opening roast (1–2 sentences)
2. Meme beat — `[Meme Name]` + one-line description
3. Press conference body (2–5 sentences)
4. Closing sting (callback to memory if available)
5. Emojis: 3–6 from `🤡 💀 😂 🔥 🚮`

**Injected runtime blocks:**
- `TOXICITY_LEVEL` (1–10) — controls escalation
- `FAN_PROFILE` (JSON)
- `RECALLED_MEMORIES` (bullets)
- `MATCH_CONTEXT` (optional ground-truth scores)

**Behavior rules:**
- Reference `favorite_team` every response once known
- Roast prediction vs result deltas
- Escalate on `flip_flop_count` and high-confidence wrong calls
- Do not repeat `last_roast_topics` angles back-to-back
- Never fabricate match results
- English only; witty toxicity, no heavy profanity
- Never break character unless user asks for meta help

**Intent handling:**
| Intent | Behavior |
|--------|----------|
| `set_team` | Accuse bandwagoning if change; mock confidence |
| `prediction` | Mock confidence; save prediction |
| `report_result` | Wrong → escalate; right → grudging acknowledgment + still roast record |
| `banter` | Roast anyway |

---

## 9. Tradeoffs

| Decision | Option A | Option B | **Chosen** | Why |
|----------|----------|----------|------------|-----|
| Repo structure | Standalone `special-one-agent` | Monorepo `memwal-agent-memory` | **A** | Already scaffolded; faster to ship; Karpathy simplicity |
| Memory stack | Raw `@mysten-incubation/memwal` | MemWal++ hybrid (SQLite + sync) | **A** | Matches current `lib/memory/client.ts`; hybrid is post-hackathon |
| Auth persistence | In-memory Map (24h TTL) | Redis / signed JWT cookies | **A** | Zero infra for demo; document limitation |
| Intent parsing | LLM `generateObject` | Regex only | **LLM + regex fallback** | Accuracy when key present; resilience when not |
| Profile storage | Single JSON blob per wallet | Separate MemoryRecords per field | **JSON blob** | Simpler CRUD; semantic lines for recall |
| Next.js version | Stay on 14.2 | Upgrade to 15 | **14** | Works today; upgrade non-blocking |
| Landing UX | Single-page chat | `/` landing + `/chat` | **Single-page** | Fewer routes; ChatContainer is the app |
| Match data | API-Football only | API + manual | **Both** | User requirement; API quota may fail |

---

## 10. Implementation Plan

Each step ends with a **verify** check (Karpathy goal-driven).

| Step | Task | Verify |
|------|------|--------|
| 1 | Wire `app/page.tsx` → `ChatContainer` + `isMemWalLive()` | Browser shows press room, not Next.js boilerplate |
| 2 | Add `.env.example` + update `README.md` | Clone → copy env → `pnpm dev` succeeds |
| 3 | Audit `fan-profile.ts` persistence edge cases (empty MemWal, recall miss) | Wallet A team survives page refresh with keys set |
| 4 | Fix `report_result` regex → `reported_result` shape if mismatched | Manual "X beat Y 2-1" resolves pending prediction |
| 5 | Ensure `PredictionCard` loads profile after first chat turn | Sidebar shows team + pending count |
| 6 | Add `memWalLive` / `openRouter` status in `PressRoomHeader` | Banner visible when keys missing |
| 7 | Smoke test all 4 intents + toxicity escalation | Script in Section 11 passes |
| 8 | `pnpm build` clean | No TypeScript or lint errors |
| 9 | Deploy to Vercel with env vars | Public URL loads wallet connect |
| 10 | Run demo script twice on deployed URL | Second run recalls prior roast |

**Out of plan (explicitly deferred):** monorepo extraction, SQLite hybrid, Redis auth, Next.js 15 upgrade.

---

## 11. Demo Script (3-minute judge walkthrough)

**Prep:** `OPENROUTER_API_KEY` + `MEMWAL_*` set; Sui wallet on testnet/mainnet; optional `API_FOOTBALL_KEY`.

| Time | Action | What to show |
|------|--------|--------------|
| 0:00 | Open app URL | Press-room theme; "Connect wallet" gate |
| 0:20 | Connect Sui wallet | Auto sign → verified; header shows address |
| 0:30 | Point at MemWal banner | "Live" = memories go to Walrus |
| 0:45 | Type: *"I support Brazil, high confidence"* | Toxic roast mentions Brazil; team saved |
| 1:15 | Type: *"I predict Brazil 3-0 Argentina in the final"* | Prediction appears in sidebar card |
| 1:45 | Type: *"Argentina beat Brazil 1-0"* | Wrong prediction → toxicity meter rises; savage callback |
| 2:15 | Type: *"Actually I support Argentina now"* | Flip-flop roast; `flip_flop_count` visible in tone |
| 2:30 | Refresh page; same wallet | Recalled memory — still knows Brazil prediction graveyard |
| 2:45 | (Optional) Click Sync | API-Football resolves fixture if key + finished match |
| 3:00 | Closing line | "Every roast reads and writes Walrus Memory per wallet — the Special One remembers." |

---

## 12. Open Questions

| # | Question | Default if unanswered |
|---|----------|----------------------|
| 1 | Deploy target URL for hackathon submission? | Vercel project root `special-one-agent` |
| 2 | Required Sui network (mainnet vs testnet)? | `NEXT_PUBLIC_SUI_NETWORK=mainnet` default |
| 3 | WC 2026 fixtures sparse pre-tournament — use mock fixtures for demo? | Manual results only until API has data |

*No blocking open questions — implementation can proceed with defaults above.*

---

## Appendix A — Current Repo Inventory

*Snapshot: 2026-06-06. Standalone Next.js 14 app at `special-one-agent`.*

### Implemented (exists, largely complete)

| Area | Path | Notes |
|------|------|-------|
| FanMemory types | `lib/memory/types.ts` | Matches spec schema |
| Toxicity | `lib/memory/toxicity.ts` | Formula implemented |
| MemWal client | `lib/memory/client.ts` | Raw SDK, per-wallet namespace |
| Fan profile service | `lib/memory/fan-profile.ts` | load/save/recall; in-memory cache |
| System prompt | `lib/ai/system-prompt.ts` | Full persona contract |
| Prompt builder | `lib/ai/build-prompt.ts` | Injects profile + memories |
| Intent detection | `lib/ai/intent.ts` | LLM + regex fallback |
| Models / providers | `lib/ai/models.ts`, `providers.ts` | OpenRouter |
| Wallet auth | `lib/auth/verify-wallet.ts`, `messages.ts` | PersonalMessage verify |
| Football API | `lib/football/api-football.ts` | Cached fixtures |
| Sync | `lib/football/sync-predictions.ts` | Fixture-based resolve |
| Chat API | `app/api/chat/route.ts` | Full flow wired |
| Auth API | `app/api/auth/verify/route.ts` | ✓ |
| Matches API | `app/api/matches/fixtures`, `sync/route.ts` | ✓ |
| Chat UI components | `components/chat/*` | Press room UI built |
| Wallet UI | `components/wallet/WalletButton.tsx` | Used in header |
| Providers | `app/providers.tsx` | dapp-kit + react-query |
| Theme | `app/globals.css` | Charcoal + gold |
| Layout metadata | `app/layout.tsx` | Branded title |

### Missing or incomplete

| Gap | Impact | Spec requirement |
|-----|--------|------------------|
| `app/page.tsx` still create-next-app boilerplate | **App unusable in browser** | R8 |
| `ChatContainer` not imported anywhere | UI not reachable | R8 |
| No `.env.example` | Setup friction | R9 |
| `README.md` boilerplate | Setup friction | R9 |
| No `docs/` before this spec | No design contract | R9 |
| In-memory auth sessions | Lost on cold serverless start | Acceptable for demo; document |
| In-memory `profileCache` | Stale without MemWal keys | MemWal keys required for persistence |
| No `packages/fan-memory` extraction | N/A for standalone | Non-goal |
| No demo script doc (until Section 11) | Judge friction | R10 |
| `lib/samples/conversations.ts` | Unused sample data | Optional for testing |
| Production deploy config | No public URL | R10 step 9 |

### Dependency snapshot (`package.json`)

- `next@14.2.35`, `ai@^6`, `@ai-sdk/openai`, `@ai-sdk/react`
- `@mysten/dapp-kit`, `@mysten/sui`
- `@mysten-incubation/memwal@^0.0.7`
- `zod`, `nanoid`

### Environment variables (required for full experience)

```bash
# Required
OPENROUTER_API_KEY=

# MemWal / Walrus (required for persistent memory demo)
MEMWAL_PRIVATE_KEY=
MEMWAL_ACCOUNT_ID=
MEMWAL_SERVER_URL=https://relayer.memory.walrus.xyz  # optional

# Optional
API_FOOTBALL_KEY=
AUTH_MESSAGE_DOMAIN=mr-toxic-special-one
NEXT_PUBLIC_AUTH_MESSAGE_DOMAIN=mr-toxic-special-one
NEXT_PUBLIC_SUI_NETWORK=mainnet
```

---

*End of specification.*
