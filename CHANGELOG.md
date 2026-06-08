# Changelog

All notable changes to **Mr. Toxic Special One** (Walrus Sessions 4).

Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Added

- Demo prompt chips in press room (`lib/samples/demo-prompts.ts`) — tap to fill chat input for judges
- `vercel.json` — `maxDuration: 60` on `/api/chat` (requires Vercel Pro for full effect; Hobby still capped ~10s)
- Fast-path chat pipeline: `loadFanProfileFast`, `applyIntentToProfile`, `MR_TOXIC_FAST_PROMPT`

### Changed

- Removed Vercel AI Gateway — demo flow is **wallet + BYOK** (Gemini / ChatGPT / Claude in Settings)
- Default model: **Gemini 2.0 Flash Lite** (fastest free-tier path)
- Intent detection: regex only (removed extra LLM `generateObject` call before every stream)
- MemWal writes: `remember()` fire-and-forget instead of `rememberAndWait()` on chat hot path
- Chat history capped to last 6 turns; `maxOutputTokens: 200`; compact system prompt (~120 words target)

### Fixed

- `FUNCTION_INVOCATION_TIMEOUT` on 3rd+ message — serverless function exceeded wall clock while waiting on MemWal + long stream
- Model mismatch (“No API key for Claude…”) when user saved ChatGPT/Gemini key but dropdown still on Claude
- Slow time-to-first-token — sequential blocking work before `streamText()` (see lesson §9 below)

### Planned

- Public repo (target ~19 Jun 2026) for hackathon submission
- Memory Moment demo (Day 1 vs Day 4+ with same wallet)
- Demo video & DeepSurge / Airtable forms
- `FINAL_FEEDBACK.md` — synthesize lessons below for Walrus Sessions / MemWal forms

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

## Bài học (Lessons learned)

Ghi lại từ quá trình build hackathon — để lần sau không lặp lại.

### 1. MemWal trên serverless (Vercel)

**Vấn đề:** Một `MemWalAccount` + **delegate key** trên server, mỗi user chỉ connect Sui wallet — pattern multi-tenant không có sẵn trong quickstart.

**Bài học:**

- Document rõ: operator tạo account, user chỉ ký ví; namespace `special-one-{address}`.
- Structured state (JSON profile) + semantic `recall` dễ trả snapshot cũ → đã file issue [#247](https://github.com/MystenLabs/MemWal/issues/247) (upsert / key-based recall).
- `npm run memwal:verify` chỉ check env — nên có `healthCheck()` thật ([#248](https://github.com/MystenLabs/MemWal/issues/248)).

### 2. Wallet auth và serverless

**Vấn đề:** `/api/auth/verify` ghi session vào `Map` in-memory → request `/api/chat` rơi sang lambda khác → `Wallet not verified`.

**Bài học:**

- **Không tin in-memory session** trên Vercel/serverless.
- Lưu `message` + `signature` trong `sessionStorage`, gửi kèm **mỗi** API call; server verify chữ ký Sui (stateless).
- Lỗi hiện ở app backend, **không phải** lỗi ChatGPT/Claude.

### 3. AI SDK `DefaultChatTransport`

**Vấn đề:** `prepareSendMessagesRequest` trả `body` tùy chỉnh → SDK **thay hẳn** body mặc định → thiếu `messages` → `No user message`.

**Bài học:**

- Khi override `body`, **bắt buộc** spread và thêm `messages` từ callback.
- Lỗi xảy ra **trước** khi gọi LLM — đừng debug nhầm sang API key OpenAI.

### 4. Dữ liệu bóng đá — free-first

**Vấn đề:** SportMonks WC API trả phí; widget embed cần domain whitelist.

**Bài học:**

- **News:** RSS (Google News + BBC) — ổn, không key.
- **Lịch/kết quả:** `API_FOOTBALL_KEY` (free tier ~100 req/ngày) hoặc `data/wc2026-fixtures.json` demo khi không có key.
- Đừng trộn widget hub vào app roast nếu user chỉ cần schedules — giữ scope nhỏ.

### 5. UI / UX

**Vấn đề:** Dropdown nhập key trong header bị welcome card che; input chat chữ trắng trên nền trắng (autofill).

**Bài học:**

- Form nhạy cảm (API key) → **modal Settings** full-screen `z-[200]`, không dropdown trong header.
- Input dark theme: class `.chat-input` + `color-scheme: dark` + override `-webkit-autofill`.

### 6. Deploy Vercel

**Vấn đề:** `git push` không tự deploy; production lag vài commit.

**Bài học:**

- Repo **private** cần Git integration + quyền Vercel trên GitHub, hoặc `npx vercel --prod --yes` sau mỗi push quan trọng.
- Verify production: `curl` `/schedules`, `/api/news`, `/api/matches/fixtures` — không chỉ xem landing cũ.
- Windows đôi khi `.next` ENOENT khi build — `rm -rf .next` rồi build lại.

### 7. Hackathon & repo

**Vấn đề:** Issue MemWal public ≠ repo private; judge không đọc được code/README.

**Bài học:**

- Submission cần **repo public** + live URL + explorer MemWalAccount + video Memory Moment.
- Feedback prize: link issue MemWal trong form — không phụ thuộc README private.
- 3 issue đã mở: cookbook multi-tenant ([#246](https://github.com/MystenLabs/MemWal/issues/246)), structured state ([#247](https://github.com/MystenLabs/MemWal/issues/247)), healthCheck ([#248](https://github.com/MystenLabs/MemWal/issues/248)).

### 8. LLM — “login web” vs API key

**Kỳ vọng:** User login Claude/ChatGPT/Gemini như trên web.

**Thực tế:** App không OAuth trực tiếp vào tài khoản chat web. Flow đúng: đăng nhập trên site provider → tạo **API key** → dán vào Settings (sessionStorage).

**Bài học:** Ghi rõ trong UI/docs để user không kỳ vọng “đăng nhập một lần như ChatGPT.com”.

**Demo path cho judges (ổn định nhất):** Connect Sui wallet → Verify → Settings → Gemini (free key từ [AI Studio](https://aistudio.google.com/apikey)) → Save → chọn **Gemini 2.0 Flash Lite** → gửi tin (hoặc tap demo chip).

### 9. Chat chậm & `FUNCTION_INVOCATION_TIMEOUT` (tin nhắn thứ 3)

> **Dùng cho `FINAL_FEEDBACK.md`:** mô tả triệu chứng production, nguyên nhân gốc, và trade-off MemWal trên serverless.

**Triệu chứng (production `special-one-agent.vercel.app`, region `hkg1`):**

- Tin 1–2: roast stream OK nhưng **chậm** (vài giây trước khi thấy chữ).
- Tin 3: lỗi đỏ `An error occurred with your deployment` — `FUNCTION_INVOCATION_TIMEOUT`.
- Một số lần: `API quota or billing issue` khi user dán Gemini key hết quota hoặc chọn model không khớp key.

**Nguyên nhân gốc (không phải lỗi ví Sui):**

| # | Nguyên nhân | Tác động |
|---|-------------|----------|
| 1 | **`rememberAndWait()` trước mỗi stream** — `setFavoriteTeam` / `addPrediction` / `appendRoast` await MemWal relayer | Cộng dồn 1–3s+ **trước** khi LLM bắt đầu stream; tin 3 cộng thêm `onFinish` + history dài |
| 2 | **LLM intent** (`generateObject`) trước `streamText` | Thêm **một** round-trip API đầy đủ mỗi tin nhắn |
| 3 | **`syncPendingPredictions()`** trên mọi chat turn | `loadFanProfile` + `recall` MemWal + có thể gọi API-Football theo `fixtureId` |
| 4 | **System prompt dài** (~2k tokens) + full `FAN_PROFILE` JSON + 5 recalled memories | TTFT chậm, tổng thời gian lambda dài |
| 5 | **`maxOutputTokens: 380`** + stream chưa xong | Lambda Vercel vẫn chạy đến hết stream; Hobby ~10s, Pro tối đa 60s (`export const maxDuration`) |
| 6 | **Conversation history** gửi nguyên thread | Token input tăng theo số turn → tin 3 chậm hơn tin 1 |

**Vì sao lỗi hay xuất hiện ở tin 3:**

- Turn 1: cold start + MemWal load + prompt build + stream.
- Turn 2: history dài hơn, có thể thêm prediction persist.
- Turn 3: tổng thời gian **blocking + streaming** vượt ngưỡng serverless → timeout **trong lúc** hoặc **sau** stream (khi `onFinish` còn await MemWal).

**Hướng xử lý đã áp dụng (trong repo):**

1. MemWal: `remember()` **không await** trên hot path; cache in-memory trước.
2. `loadFanProfileFast` / `recallMemories` — timeout ~1.2s, fallback profile/rỗng.
3. Bỏ `syncPendingPredictions` khỏi `/api/chat` — sync qua nút **Check my predictions** (`/api/matches/sync`).
4. Intent = regex (`detectIntent`), không gọi LLM phụ.
5. `MR_TOXIC_FAST_PROMPT`, `maxOutputTokens: 200`, cap 6 turns history.
6. `onFinish` → `void appendRoast(...)` không block response.
7. `vercel.json` `maxDuration: 60` cho route chat.

**Trade-off (ghi vào feedback MemWal):**

- Fire-and-forget `remember` → demo nhanh hơn nhưng **không đảm bảo** write đã commit trước response; judge thấy roast ngay, memory có thể trễ vài giây.
- Timeout recall → lần đầu wallet có thể roast **không** có full graveyard cho đến khi cache warm.
- Cần pattern SDK: **`remember` vs `rememberAndWait`** rõ trong cookbook ([#246](https://github.com/MystenLabs/MemWal/issues/246)) + health/latency budget cho serverless.

### 10. Vercel AI Gateway (đã thử, đã gỡ)

**Mục tiêu:** User chỉ connect ví, không cần API key (Claude Haiku free qua Gateway).

**Kết quả:** Phù hợp operator có Gateway credits/OIDC; với BYOK demo hackathon, flow **Settings + Gemini free key** đơn giản và dễ debug hơn. Gateway đã remove khỏi codebase (`lib/ai/gateway.ts` deleted); production dùng direct provider APIs + user keys.

**Bài học:** Đừng trộn hai mô hình (Gateway server-side vs BYOK client-side) — chọn một demo path và document rõ cho judges.

### 11. Model / API key mismatch

**Triệu chứng:** `No API key for Claude Sonnet` dù user đã dán ChatGPT/Gemini key.

**Nguyên nhân:** `DEFAULT_MODEL_ID` từng là `claude-sonnet`; dropdown không auto-sync sau Save.

**Fix:** `pickModelForProviders` / `syncModelWithProviders` — sau Save key, dropdown chuyển sang provider khớp; default `gemini`.

---

## Gợi ý outline `FINAL_FEEDBACK.md`

```markdown
## What we built
- Roast bot + per-wallet MemWal namespace + Sui wallet auth

## What worked
- Wallet-only identity, semantic recall for roasts, demo chips, BYOK Gemini free tier

## Pain points (with evidence)
- FUNCTION_INVOCATION_TIMEOUT — MemWal rememberAndWait + long stream on serverless
- Latency stack: intent LLM + sync + recall + fat prompt
- MemWal multi-tenant cookbook gap ([#246])

## What we changed
- (copy from [Unreleased] above)

## Ask for MemWal / Walrus Sessions
- Serverless latency guide, rememberAndWait semantics, upsert profile ([#247]), healthCheck ([#248])
```

---

## Links

| Resource | URL |
|----------|-----|
| Production | https://special-one-agent.vercel.app |
| MemWalAccount (explorer) | https://suiscan.xyz/mainnet/object/0x73b07979a6712f54283c02ddf70e2bdfb3ec729627c9ef0e0d8a214015066a99 |
| MemWal dashboard | https://memory.walrus.xyz/dashboard |
| Walrus Sessions 4 | https://thewalrussessions.wal.app/memory-world-cup |

[Unreleased]: https://github.com/Olympusxvn/special-one-agent/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/Olympusxvn/special-one-agent/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Olympusxvn/special-one-agent/commit/93e3f62
