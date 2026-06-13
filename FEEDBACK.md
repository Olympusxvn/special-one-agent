# MemWal Feedback — Walrus Sessions 4

**Project:** [Mr. Toxic Special One](https://special-one-agent.vercel.app)  
**Repo:** [Olympusxvn/special-one-agent](https://github.com/Olympusxvn/special-one-agent)  
**MemWalAccount:** [SuiScan explorer](https://suiscan.xyz/mainnet/object/0x73b07979a6712f54283c02ddf70e2bdfb3ec729627c9ef0e0d8a214015066a99)  
**Stack:** Next.js 14 · Vercel (`hkg1`) · `@mysten-incubation/memwal@0.0.7` · mainnet relayer

---

## Đánh giá: có mở thêm issue không?

**Kết luận: không.** Bốn issue dưới đây đã cover toàn bộ gap SDK/docs mà team gặp khi build production. Các pain point còn lại (recall 429, `restore()` vs `recall()`) là chi tiết triển khai — ghi trong doc này và trong [#277](https://github.com/MystenLabs/MemWal/issues/277), không cần issue riêng.

| # | Issue | Type | Tóm tắt | Status | Team response |
|---|-------|------|---------|--------|---------------|
| 1 | [#246](https://github.com/MystenLabs/MemWal/issues/246) | Docs | Cookbook multi-tenant: 1 MemWalAccount + delegate key, namespace per wallet | **Closed** | Acknowledged — cookbook gap filed |
| 2 | [#247](https://github.com/MystenLabs/MemWal/issues/247) | Feature | Upsert / key-based recall cho JSON profile (tránh stale snapshot) | **Closed** | `ducnmm`: upsert added, shipping to main |
| 3 | [#248](https://github.com/MystenLabs/MemWal/issues/248) | Feature | `healthCheck()` — verify relayer + delegate, không chỉ check env | **Closed** | `ducnmm`: under consideration for SDK updates |
| 4 | [#277](https://github.com/MystenLabs/MemWal/issues/277) | Docs | Serverless latency guide (Vercel, remember vs await, recall budgets) | **Open** | Awaiting MemWal docs — see [FINAL_FEEDBACK.md](./FINAL_FEEDBACK.md) |

---

## What we built

Prediction Roast bot World Cup 2026: user kết nối Sui wallet → namespace `special-one-{address}` trên Walrus. Lưu fan profile (team, predictions, flip-flops) + semantic lines cho roast callback. Toxicity tăng theo số lần dự đoán sai.

---

## What worked well

- **Wallet = identity** — portable memory, không signup.
- **Multi-tenant operator** — server giữ delegate key; user chỉ sign wallet ([#246](https://github.com/MystenLabs/MemWal/issues/246)).
- **Structured JSON + semantic lines** — profile blob + graveyard predictions qua `recall`.
- **Mainnet + explorer** — judges verify on-chain qua SuiScan + badge **MemWal 🟢 LIVE**.
- **Stateless auth** — `sessionStorage` proof; phù hợp lambda cold start trên Vercel.

---

## Pain points

### 1. Serverless timeout (message 3)

Production `hkg1`: message 1–2 chậm; message 3 → **`FUNCTION_INVOCATION_TIMEOUT`**.

Nguyên nhân chính: `rememberAndWait()` trước stream, LLM intent thêm một round-trip, sync fixtures mỗi turn, recall tuần tự, prompt/stream quá dài.

→ File [#277](https://github.com/MystenLabs/MemWal/issues/277). Chi tiết kỹ thuật: [FINAL_FEEDBACK.md](./FINAL_FEEDBACK.md).

### 2. Structured profile qua semantic recall ([#247](https://github.com/MystenLabs/MemWal/issues/247))

Pattern hiện tại: `rememberAndWait` full JSON + `recall` query → parse `FAN_PROFILE_JSON:` — dễ stale, không deterministic.

### 3. Deploy verify chỉ check env ([#248](https://github.com/MystenLabs/MemWal/issues/248))

`npm run memwal:verify` không ping relayer; lỗi delegate chỉ lộ lúc user chat.

### 4. Recall rate limit (429) — *không mở issue riêng*

`restore()` trên cold path gây 429; app tự build `recallWithOptimization` (direct recall, backoff, cache, toast “Walrus is a bit busy”). Đủ ghi trong [#277](https://github.com/MystenLabs/MemWal/issues/277) + `lib/memory/recall.ts`.

---

## Mitigations đã ship

1. `remember()` fire-and-forget trên chat hot path — không `rememberAndWait()` trước stream.
2. `loadFanProfileFast` — cap **500ms**; recall song song cap **~800ms**, max 2 memories × 80 chars.
3. Intent = regex only; bỏ sync fixtures khỏi `/api/chat`.
4. Roast ngắn (40 words, `maxOutputTokens: 70`); history cap 4 turns.
5. `vercel.json` — `maxDuration: 60` cho `/api/chat` và `/api/memory/*`.
6. `onFinish` → `void appendRoast(...)` — không block response.

---

## Honest reflection (for Airtable / DeepSurge)

**What surprised you building with Walrus Memory?**  
Quickstart hướng single-user; multi-tenant (1 account, namespace/ví) phải tự đoán. `rememberAndWait` trước LLM stream là foot-gun trên serverless — dễ miss đến message 3.

**What would you build differently?**  
Bắt đầu với pattern recall song song + cap từ ngày 1; không đặt sync hoặc `rememberAndWait` trên chat path; upsert profile thay vì embed JSON lặp lại ([#247](https://github.com/MystenLabs/MemWal/issues/247)).

**Trade-off chấp nhận:**  
Fire-and-forget write → demo nhanh, persistence có thể trễ vài giây. Recall cap → TTFT +0.5–1s nhưng Memory Moment mạnh hơn.

---

## Links

| Resource | URL |
|----------|-----|
| Production | https://special-one-agent.vercel.app |
| MemWal setup (self-written) | [docs/MEMWAL_SETUP.md](./docs/MEMWAL_SETUP.md) |
| Deep technical write-up | [FINAL_FEEDBACK.md](./FINAL_FEEDBACK.md) |
| Submission checklist | [SUBMISSION.md](./SUBMISSION.md) |
| README (project face) | [README.md](./README.md) |
| MemWal GitHub | https://github.com/MystenLabs/MemWal |
| License | [MIT — educational & research](./LICENSE) |

---

## Tóm tắt (VI)

Build roast-bot WC 2026 + MemWal per-wallet trên Vercel. **4 issue MemWal** — **3 Closed** ([#246](https://github.com/MystenLabs/MemWal/issues/246), [#247](https://github.com/MystenLabs/MemWal/issues/247), [#248](https://github.com/MystenLabs/MemWal/issues/248)), **1 Open** ([#277](https://github.com/MystenLabs/MemWal/issues/277)) — đủ feedback prize, **không cần thêm**. Doc này là bản tóm tắt nộp form; chi tiết latency xem [FINAL_FEEDBACK.md](./FINAL_FEEDBACK.md).
