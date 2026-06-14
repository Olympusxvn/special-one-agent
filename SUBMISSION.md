# Walrus Sessions 4 — Submission Packet

**Project:** Mr. Toxic Special One  
**Track:** [Walrus Memory World Cup](https://thewalrussessions.wal.app/memory-world-cup)  
**Deadline:** June 24, 2026

**Platform sibling (Sui Overflow 2026):** [MemWal Agent Memory](https://github.com/Olympusxvn/memwal-agent-memory) — hybrid memory layer, MCP, Move marketplace. Cross-map: [companion doc](https://github.com/Olympusxvn/memwal-agent-memory/blob/main/docs/companion-mvp-special-one-agent.md).

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

## What sets our solution apart

Most Walrus Memory demos show “the agent remembers something.” We built **memory as the product** — the roast is driven by **your own on-chain receipts**, not generic banter.

### 1. Prediction Roast + accountability loop

Fans declare a team, predict scores, and report results. Walrus stores pending and resolved predictions; wrong calls and flip-flops feed a **Toxicity Meter (1–10)** and hotter roasts. Memory is not passive storage — it **changes behavior** over time.

### 2. Dual memory model (structured + semantic)

We combine a structured fan profile (`FAN_PROFILE_JSON`) with semantic graveyard lines (“Prediction WRONG: …”). Chat **recalls** up to two memory hits in parallel with profile load and injects them into the stream — so the bot can say *“you said Brazil 3–0 six days ago”*, not just *“you like Brazil.”*

### 3. Memory visible to judges, not hidden in logs

The **Walrus Memory Ledger** sidebar shows open predictions, resolved history (PENDING / CORRECT / WRONG), favorite team, and toxicity — all tied to a connected Sui wallet. **MemWal 🟢 LIVE** + a mainnet explorer link prove writes land on Walrus.

### 4. Portable + long-term memory on mainnet

One wallet = one namespace (`special-one-{address}`). Refresh or return days later with the same wallet and the ledger reloads from Walrus — built for **Portable Memory** and **Long-Term Memory**, not a single-session chat toy.

### 5. Full World Cup 2026 surface, not chat-only

Luxury schedules (104 fixtures, national team crests, live scores via WorldCup26), **click-to-predict** modal that writes straight to Walrus Memory, press room, and media — memory is wired across the app, not only `/chat`.

### 6. Production serverless, not a local demo

Deployed on Vercel mainnet with parallel recall budgets (500ms profile / 800ms semantic), fire-and-forget `remember()` so streams do not timeout, and documented MemWal feedback from real latency pain — **3 Closed, 1 Open**: [#246](https://github.com/MystenLabs/MemWal/issues/246) ✓, [#247](https://github.com/MystenLabs/MemWal/issues/247) ✓, [#248](https://github.com/MystenLabs/MemWal/issues/248) ✓, [#277](https://github.com/MystenLabs/MemWal/issues/277) (Open).

**Short pitch (form field):** Memory is not a bolt-on — it is the roast engine: per-wallet Walrus namespaces, prediction ledger with WRONG/CORRECT resolution, toxicity escalation, semantic recall in chat, judge-visible UI + mainnet explorer proof, and a full WC 2026 app on production Vercel.

---

## Submission requirements (official → our project)

Mapping from Walrus Sessions 4 requirements to what judges can verify live.

### 1. Public interface — memory visible and meaningful

| Requirement | How we satisfy it | Where to look |
|-------------|-------------------|---------------|
| Publicly accessible site | Production press room, no repo clone needed | [special-one-agent.vercel.app/chat](https://special-one-agent.vercel.app/chat) |
| Prediction history | **Walrus Memory Ledger** sidebar — open + **resolved** predictions with PENDING / CORRECT / WRONG badges | Right column after wallet connect |
| Roast of user's record | Streaming chat references recalled Walrus lines + profile state | Main chat thread |
| Memory updates in UI | Ledger + toxicity meter refresh after each chat turn (`/api/memory/profile`) | Send a prediction → sidebar updates |
| On-chain proof | MemWal 🟢 LIVE + explorer link | Press room header |

**Judge walkthrough (60s):** Connect wallet → Settings → Gemini key → *"I support Brazil, high confidence"* → see **Team: Brazil** in ledger → *"I predict Brazil 3-0 Argentina"* → **Open predictions** → *"Argentina beat Brazil 1-0"* → **Resolved history** shows WRONG → toxicity meter rises → roast callbacks in chat.

### 2. Walrus Mainnet + dedicated Sessions wallet

| Item | Value |
|------|--------|
| **Deploy** | Vercel production, MemWal mainnet relayer `https://relayer.memory.walrus.xyz` |
| **MemWalAccount (object)** | `0x73b07979a6712f54283c02ddf70e2bdfb3ec729627c9ef0e0d8a214015066a99` |
| **Explorer** | [SuiScan MemWalAccount](https://suiscan.xyz/mainnet/object/0x73b07979a6712f54283c02ddf70e2bdfb3ec729627c9ef0e0d8a214015066a99) |
| **Per-user memory** | Namespace `special-one-{walletAddress.toLowerCase()}` on operator account |
| **Sessions operator wallet** | Sui address used to create MemWalAccount on [memory.walrus.xyz/dashboard](https://memory.walrus.xyz/dashboard) — see object owner on SuiScan |

Fans connect **their own** Sui wallet in the app; the **Sessions wallet** is the operator account that owns the MemWalAccount object.

### 3. Live link + demo video (≤ 3 minutes)

| Item | Status | URL / notes |
|------|--------|-------------|
| **Live project** | ✅ | [special-one-agent.vercel.app](https://special-one-agent.vercel.app) |
| **Demo video** | ❌ TODO | Record per [PROJECT.md demo script](./PROJECT.md#demo-script-3-minutes) — include ledger + refresh + Memory Moment |

### Core capabilities (≥ 1 required — we show 2)

| Capability | Status | Evidence |
|------------|--------|----------|
| **Portable Memory** | ✅ | Same wallet after refresh → ledger reloads from Walrus |
| **Long-Term Memory** | ✅ | Resolved history + toxicity escalation over sessions |
| **Agent Coordination** | N/A | Single roast agent |

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
| **Walrus Memory Ledger (judge UI)** | `PredictionCard` — open + resolved history, WRONG/CORRECT badges; `/api/memory/profile` refresh after each chat |

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

## MemWal GitHub feedback (Walrus Sessions 4)

| Issue | Type | Summary | Status |
|-------|------|---------|--------|
| [#246](https://github.com/MystenLabs/MemWal/issues/246) | Docs | Multi-tenant cookbook | **Closed** |
| [#247](https://github.com/MystenLabs/MemWal/issues/247) | Feature | Upsert / key-based recall | **Closed** — upsert added |
| [#248](https://github.com/MystenLabs/MemWal/issues/248) | Feature | `healthCheck()` at deploy | **Closed** — SDK review |
| [#277](https://github.com/MystenLabs/MemWal/issues/277) | Docs | Serverless latency guide | **Open** |

Form summary: [FEEDBACK.md](./FEEDBACK.md) · technical depth: [FINAL_FEEDBACK.md](./FINAL_FEEDBACK.md) · skills: [lib/skills/README.md](./lib/skills/README.md)

---

## Memory Moment — demo script (Day 1 vs Day 4+)

**Goal:** Show memory *changing behaviour* — the clearest signal judges look for.

### Day 1 (first session)

1. Open [special-one-agent.vercel.app](https://special-one-agent.vercel.app) → **Enter Press Room**.
2. Connect Sui wallet → sign message → confirm **MemWal 🟢 LIVE** + explorer link.
3. Settings → paste free **Gemini** key → select **Gemini 2.0 Flash Lite**.
4. Tap chip **🇧🇷 Brazil fan** or type: *"I support Brazil! High confidence!"*
5. Tap **⚽ Predict score**: *"Mexico will beat South Africa 2-1"*
6. Note **Walrus Memory Ledger** (right sidebar) + toxicity meter — team and open prediction appear after send. Roast is punchy (40-word cap) but state is saved to Walrus.

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
| Public memory-visible UI (prediction history) | ✅ Done | Walrus Memory Ledger — open + resolved predictions |
| Profile sync after chat | ✅ Done | `POST /api/memory/profile` — ledger + toxicity refresh |
| Memory Moment (Day 1 vs ≥4 days) | ❌ TODO | Script above — needs capture |
| Demo video (<3 min) | ❌ TODO | Script in [PROJECT.md](./PROJECT.md#demo-script-3-minutes) |
| Honest reflection | 🟡 Draft | [FINAL_FEEDBACK.md](./FINAL_FEEDBACK.md) |
| DeepSurge submission | ❌ TODO | [Campaign page](https://www.deepsurge.xyz/hackathons/cbe3390c-88c1-48c6-a86d-5c1edb4b6d17) |
| Airtable form | ❌ TODO | [Walrus Memory Session form](https://airtable.com/appoDAKpC74UOqoDa/shrIl2BMnzMwpuLhO) |
| MemWal GitHub issues (feedback prize) | ✅ Done | **3 Closed, 1 Open** — [#246](https://github.com/MystenLabs/MemWal/issues/246) ✓, [#247](https://github.com/MystenLabs/MemWal/issues/247) ✓, [#248](https://github.com/MystenLabs/MemWal/issues/248) ✓, [#277](https://github.com/MystenLabs/MemWal/issues/277) Open — [FEEDBACK.md](./FEEDBACK.md) |
| #Walrus X post | ❌ TODO | After video + Memory Moment |

---

## Related docs

| Doc | Purpose |
|-----|---------|
| [README.md](./README.md) | Project overview — live demo, quick start, issue status |
| [PROJECT.md](./PROJECT.md) | Architecture, demo script |
| [docs/MEMWAL_SETUP.md](./docs/MEMWAL_SETUP.md) | Mainnet MemWalAccount + delegate key setup |
| [FEEDBACK.md](./FEEDBACK.md) | MemWal feedback summary + GitHub issue list for forms |
| [FINAL_FEEDBACK.md](./FINAL_FEEDBACK.md) | Honest latency feedback for Walrus / MemWal team **(judges)** |
| [lib/skills/README.md](./lib/skills/README.md) | Agent skills index — memwal-serverless, auth, roast agent |
| [MemWal #277 — serverless latency](https://github.com/MystenLabs/MemWal/issues/277) | Production Vercel timeout lessons + cookbook ask |
| [WALRUS_SS4_RULE.md](./WALRUS_SS4_RULE.md) | Official SS4 rules + fit checklist |
| [CHANGELOG.md](./CHANGELOG.md) | Mitigations and lessons learned |
| [LICENSE](./LICENSE) | MIT — educational & research use |

---

## Tóm tắt (VI)

**Mr. Toxic Special One** — chatbot roast World Cup 2026, mỗi ví Sui có namespace Walrus `special-one-{address}`. Production: [special-one-agent.vercel.app](https://special-one-agent.vercel.app). Sidebar **Walrus Memory Ledger** hiện prediction pending + resolved (WRONG/CORRECT) cho judges. Showcase Portable + Long-Term Memory. MemWal feedback: **3 Closed** ([#246](https://github.com/MystenLabs/MemWal/issues/246), [#247](https://github.com/MystenLabs/MemWal/issues/247), [#248](https://github.com/MystenLabs/MemWal/issues/248)), **1 Open** ([#277](https://github.com/MystenLabs/MemWal/issues/277)). License MIT — học tập & nghiên cứu. Còn TODO: video demo, Memory Moment 4 ngày, DeepSurge/Airtable.
