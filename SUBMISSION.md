# Walrus Sessions 4 — Submission Packet

**Project:** Mr. Toxic Special One  
**Track:** [Walrus Memory World Cup](https://thewalrussessions.wal.app/memory-world-cup)  
**Deadline:** June 24, 2026

---

## One-liner

A World Cup 2026 roast-bot that remembers every bad take you make — per Sui wallet — and turns it into escalating comedy via Walrus Memory.

---

## Live links

| Resource | URL |
|----------|-----|
| **Production app** | [special-one-agent.vercel.app](https://special-one-agent.vercel.app) |
| **MemWalAccount (Sui explorer)** | [suiscan.xyz/mainnet/object/0x73b07979a6712f54283c02ddf70e2bdfb3ec729627c9ef0e0d8a214015066a99](https://suiscan.xyz/mainnet/object/0x73b07979a6712f54283c02ddf70e2bdfb3ec729627c9ef0e0d8a214015066a99) |
| **MemWal dashboard** | [memory.walrus.xyz/dashboard](https://memory.walrus.xyz/dashboard) |
| **GitHub** | [github.com/Olympusxvn/special-one-agent](https://github.com/Olympusxvn/special-one-agent) |

---

## Walrus Memory usage (2–5 sentences)

Mr. Toxic Special One stores each fan's team, predictions, flip-flops, and roast history in Walrus via MemWal, isolated per Sui wallet namespace (`special-one-{address.toLowerCase()}`). On each chat turn the server **recalls** up to two semantic memory lines in parallel with profile load and injects them into the roast prompt (80 chars each, 800ms cap). Structured state lives in `FAN_PROFILE_JSON`; semantic lines are written fire-and-forget with `remember()` — never blocking the stream.

**Latency budget:** profile load (500ms) and semantic recall (800ms) run in parallel via `Promise.all`; writes stay fire-and-forget after `streamText()`. See [FINAL_FEEDBACK.md](./FINAL_FEEDBACK.md) for serverless lessons.

---

## Core Walrus capabilities demonstrated

| Capability | How we show it |
|------------|----------------|
| **Portable Memory** | Per-wallet namespace persists across browser sessions — connect the same Sui address days later and the agent still has team, predictions, and roast history. |
| **Long-Term Memory** | Predictions, flip-flops, and roast lines accumulate over time; toxicity escalates as wrong calls stack up. |
| **Agent Coordination** | N/A — single roast agent design. |

**Product direction:** **The Prediction Roast** — official Walrus Sessions example direction. See [WALRUS_SS4_RULE.md](./WALRUS_SS4_RULE.md).

---

## MemWal features kept in production

These are **active in the deployed app** as of the current codebase:

| Feature | Implementation |
|---------|----------------|
| **Per-wallet namespace** | `special-one-{address.toLowerCase()}` in `lib/memory/client.ts` |
| **`FAN_PROFILE_JSON` blob** | `loadFanProfileFast` with **500ms** timeout + in-memory `profileCache`; recall/remember via `lib/memory/fan-profile.ts` |
| **Semantic remember lines** | Team support, flip-flop, prediction PENDING / WRONG / CORRECT, roast delivered — `rememberSemantic()` fire-and-forget |
| **Fire-and-forget writes** | `client.remember(...)` — **not** `rememberAndWait()` on chat hot path |
| **`appendRoast` in `onFinish`** | Background persist after stream completes (`void appendRoast(...).catch(...)`) |
| **`applyIntentToProfile`** | Sync in-memory mutation + async `persistProfileCacheOnly` / `rememberSemanticLine` — no MemWal await before `streamText()` |
| **Toxicity meter** | `computeToxicityLevel` from profile fields (wrong predictions, flip-flops, high-confidence misses) |
| **Prediction tracking + sync** | Intent + profile updates on chat; fixture resolution via **`/api/matches/sync`** (not on every chat turn) |
| **MemWal LIVE badge + explorer** | Press room header: `MemWal 🟢 LIVE` + link to MemWalAccount on SuiScan (`components/chat/MemWalStatus.tsx`) |
| **Sui wallet auth** | Signed `PersonalMessage` → proof in `sessionStorage` → sent with every API call; stateless verify on server |
| **BYOK demo flow** | Settings modal — Gemini / ChatGPT / Claude API keys (`components/chat/LlmSettingsModal.tsx`); default **Gemini 2.0 Flash Lite** |
| **Semantic recall on chat path** | `Promise.all` — `loadFanProfileFast` (500ms) + `recallMemories` (800ms, limit 2, warm-instance cache); injected as `mem:` in system prompt |

---

## Temporarily weakened for demo speed

Honest disclosure — these were cut or reduced to fix `FUNCTION_INVOCATION_TIMEOUT` on Vercel serverless (region `hkg1`, often on message 3):

| Change | Effect |
|--------|--------|
| **No `syncPendingPredictions` on every chat turn** | Sync only when user triggers **Check my predictions** → `/api/matches/sync` |
| **Short roasts** | `maxOutputTokens: 70`, **40-word** cap in `MR_TOXIC_FAST_PROMPT`, `temperature: 0.65` |
| **Slim prompt** | Compact `fan:{...}` JSON plus up to 2 recalled lines (not full profile dump) |
| **Regex-only intent** | No extra LLM `generateObject` call before stream |
| **History cap** | Last **4** turns, **100** chars per message to the model |

Full mitigation list: [CHANGELOG.md](./CHANGELOG.md) §9 (Lessons learned).

---

## Memory Moment — demo script (Day 1 vs Day 4+)

**Goal:** Show memory *changing behaviour* — the clearest signal judges look for.

### Day 1 (first session)

1. Open [special-one-agent.vercel.app](https://special-one-agent.vercel.app) → **Enter Press Room**.
2. Connect Sui wallet → sign message → confirm **MemWal 🟢 LIVE** + explorer link.
3. Settings → paste free **Gemini** key → select **Gemini 2.0 Flash Lite**.
4. Tap chip **🇧🇷 Brazil fan** or type: *"I support Brazil! High confidence!"*
5. Tap **⚽ Predict score**: *"Mexico will beat South Africa 2-1"*
6. Note toxicity meter + prediction sidebar. Roast is punchy (40-word cap) but team/prediction are saved to Walrus.

**Capture:** Screenshot — first roast, prediction card, MemWal LIVE badge.

### Day 4+ (return visit, same wallet)

1. Same wallet — refresh or new browser session.
2. Do **not** repeat Day 1 context. Ask: *"How are my predictions looking?"* or tap **🔀 Flip-flop**: *"Actually I support Argentina now."*
3. Agent should reference prior Brazil support, pending/wrong predictions, or flip-flop count from loaded profile.
4. Optional: **Check my predictions** to resolve fixtures via API-Football.

**Capture:** Side-by-side — Day 1 generic energy vs Day 4+ callback roast (*"I remember everything"* escalation as toxicity rises).

### If natural 4-day wait isn't feasible before deadline

Pre-seed the demo wallet with scripted predictions over several days, or record the Memory Moment segment with timestamps showing namespace persistence on explorer + profile reload after refresh.

---

## Submission checklist status

| Item | Status | Notes |
|------|--------|-------|
| Walrus Memory integration (MemWal SDK) | ✅ Done | `@mysten-incubation/memwal` — mainnet relayer |
| Prediction Roast product fit | ✅ Done | Core product direction |
| Mainnet production deploy URL | ✅ Done | [special-one-agent.vercel.app](https://special-one-agent.vercel.app) |
| MemWalAccount explorer link | ✅ Done | [SuiScan object](https://suiscan.xyz/mainnet/object/0x73b07979a6712f54283c02ddf70e2bdfb3ec729627c9ef0e0d8a214015066a99) |
| 2–5 sentence Walrus usage blurb | ✅ Done | Section above (+ trade-off note) |
| Portable + Long-Term Memory showcase | ✅ Done | Per-wallet namespace, predictions/roasts over sessions |
| Memory Moment (Day 1 vs ≥4 days) | ❌ TODO | Script above — needs capture |
| Demo video (<3 min) | ❌ TODO | Script in [PROJECT.md](./PROJECT.md#demo-script-3-minutes) |
| Honest reflection | 🟡 Draft | [FINAL_FEEDBACK.md](./FINAL_FEEDBACK.md) |
| DeepSurge submission | ❌ TODO | [Campaign page](https://www.deepsurge.xyz/hackathons/cbe3390c-88c1-48c6-a86d-5c1edb4b6d17) |
| Airtable form | ❌ TODO | [Walrus Memory Session form](https://airtable.com/appoDAKpC74UOqoDa/shrIl2BMnzMwpuLhO) |
| MemWal GitHub issues (feedback prize) | ✅ Done | [#246](https://github.com/MystenLabs/MemWal/issues/246), [#247](https://github.com/MystenLabs/MemWal/issues/247), [#248](https://github.com/MystenLabs/MemWal/issues/248) |
| #Walrus X post | ❌ TODO | After video + Memory Moment |

---

## Related docs

| Doc | Purpose |
|-----|---------|
| [PROJECT.md](./PROJECT.md) | Product overview, architecture, demo script |
| [WALRUS_SS4_RULE.md](./WALRUS_SS4_RULE.md) | Official SS4 rules + fit checklist |
| [docs/MEMWAL_SETUP.md](./docs/MEMWAL_SETUP.md) | Mainnet MemWalAccount + delegate key setup |
| [FINAL_FEEDBACK.md](./FINAL_FEEDBACK.md) | Honest latency feedback for Walrus / MemWal team |
| [CHANGELOG.md](./CHANGELOG.md) | Mitigations and lessons learned |

---

## Tóm tắt (VI)

**Mr. Toxic Special One** — chatbot roast World Cup 2026, mỗi ví Sui có namespace Walrus `special-one-{address}`. Production: [special-one-agent.vercel.app](https://special-one-agent.vercel.app), MemWal mainnet + explorer link. MemWal **ghi profile + semantic lines** vẫn bật; **recall semantic** tạm tắt trên `/api/chat` để tránh timeout Vercel. Showcase: Portable Memory + Long-Term Memory (Prediction Roast). Còn TODO: Memory Moment 4 ngày, video demo, submit DeepSurge/Airtable.
