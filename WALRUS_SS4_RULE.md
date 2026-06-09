# Walrus Sessions 4 — Official Rules Summary

**Track:** [Walrus Memory World Cup](https://thewalrussessions.wal.app/memory-world-cup) · June 5–24, 2026  
**Project:** [Mr. Toxic Special One](./PROJECT.md)  
**Source:** Official hackathon rules (summarized for team alignment)

---

## 1. Tóm tắt (VI)

Bullet summary cho team — bám sát rules gốc:

- **Mục tiêu:** Agent AI có **bộ nhớ bền (Walrus Memory / MemWal)** xoay quanh **World Cup 2026**.
- **3 năng lực cốt lõi:** Portable Memory · Agent Coordination · Long-Term Memory (cần showcase ≥1) — dự án showcase **2/3**: Portable + Long-Term (chi tiết §2).
- **Hướng ví dụ khớp dự án:** **The Prediction Roast** — nhớ dự đoán, lý do, kết quả; xây profile predictor; roast càng ngày càng sắc.
- **Submission bắt buộc:**
  - Agent **deploy live** trên **Walrus Mainnet**
  - Link **explorer MemWalAccount** (object chứa memories)
  - Repo public + mô tả 2–5 câu cách dùng Walrus Memory
  - **Memory Moment:** Day 1 vs **≥4 ngày** — before/after rõ ràng (screenshot/video/live)
  - **Reflection** trung thực (kỳ vọng, bất ngờ, làm khác đi)
  - **Demo video** < 3 phút
- **Thêm:** DeepSurge + Airtable form, MemWal GitHub issues (feedback prize), Discord, post **#Walrus** trên X.
- **Chấm điểm:** Memory Depth & Authenticity · Creativity & Flair · Technical Execution & Completeness.
- **Ưu tiên team:** Deploy mainnet → ghi Memory Moment 4 ngày → quay video → submit forms.

---

## 2. What We're Looking For

Projects must showcase **one or more** core capabilities of Walrus Memory:

| Capability | Meaning |
|------------|---------|
| **Portable Memory** | Context persists across sessions, workflows, and applications. |
| **Agent Coordination** | Multiple agents share context and coordinate through a common source of truth. |
| **Long-Term Memory** | The agent builds on prior interactions, decisions, and observations instead of starting from scratch. |

> **Mr. Toxic Special One** showcases **2 of 3** capabilities (**Portable Memory** + **Long-Term Memory**) — meets the rules requirement of **≥1**. Single-agent design — **Agent Coordination** is N/A (not required).

### Portable Memory — chi tiết

**Rules definition:** *Context persists across sessions, workflows, and applications.*

| Judge question | Answer + proof in this repo |
|----------------|----------------------------|
| Where is memory stored? | **Walrus mainnet** via MemWal relayer — not browser `localStorage` for fan state |
| How is each user isolated? | `namespaceForWallet()` → `special-one-{address.toLowerCase()}` (`lib/memory/client.ts`) |
| Cross-session persistence? | Every `/api/chat` calls `loadFanProfileFast` + `recallMemories` from MemWal |
| Cross-device / cross-browser? | Same Sui wallet → same namespace → same receipts (wallet = identity) |
| Operator vs fan | One operator `MemWalAccount` + delegate key; fans only connect wallet |

**What to demo for judges:**

1. Connect wallet → declare team + prediction → note **MemWal 🟢 LIVE** + [explorer link](https://suiscan.xyz/mainnet/object/0x73b07979a6712f54283c02ddf70e2bdfb3ec729627c9ef0e0d8a214015066a99).
2. **Refresh the page** (or open a new browser) with the **same wallet** — agent still knows team and predictions without the user repeating context.
3. Connect a **different wallet** — clean slate (per-wallet isolation).

**Code path:** `loadFanProfileFast` (500ms cap) → `FAN_PROFILE_JSON` recall; `recallMemories` (800ms cap, 2 lines) → semantic graveyard. See [PROJECT.md — Data Flow](./PROJECT.md#data-flow-for-judges).

---

### Long-Term Memory — chi tiết

**Rules definition:** *The agent builds on prior interactions, decisions, and observations instead of starting from scratch.*

| Mechanism | Implementation | How behaviour changes |
|-----------|----------------|----------------------|
| Structured profile | `FAN_PROFILE_JSON` — team, up to 50 predictions (`createdAt`), flip-flops, roast history (20) | Prediction sidebar + compact `fan:{...}` in prompt |
| Semantic graveyard | `rememberSemantic()` — flip-flop, PENDING / WRONG / CORRECT, roast delivered | Recalled into prompt as `mem:line1 \| line2` |
| Escalation over time | `computeToxicityLevel()` — wrongCount × 1.5, flip_flop × 2, high-confidence wrong +2 | `tox:N` in system prompt → hotter roasts |
| Accumulation | Each turn: intent apply + `appendRoast` in `onFinish` (fire-and-forget `remember()`) | More wrong calls / flip-flops → higher toxicity + richer recall |

**What to demo for judges (Memory Moment — clearest judging signal):**

| Phase | Action | Expected behaviour |
|-------|--------|-------------------|
| **Day 1** | Team + bold prediction | Roast saves to Walrus; toxicity baseline |
| **Same session** | Report wrong result or flip team | Toxicity rises; roast callbacks prediction / bandwagon |
| **Day 4+** (same wallet) | Return without re-stating history | Agent references prior prediction or flip-flop from **recall** + profile |

**Gap (honest):** multi-day **Memory Moment** capture (screenshots / video) is still **TODO** — code supports it; need real or pre-seeded wallet evidence before submit.

---

### Agent Coordination — N/A

**Rules definition:** *Multiple agents share context through a common source of truth.*

This project is a **single roast agent** (`/api/chat`). Multi-tenant namespaces (one MemWalAccount, many wallets) are **not** multi-agent coordination. **No deduction** — rules require showcase **≥1** capability, not all three.

---

## 3. Example Directions

Official starting points (build your own twist if stronger):

- **The Prediction Roast** ⭐ **← Our track**
  - Track World Cup predictions throughout the tournament.
  - Remember every prediction, reasoning, and outcome.
  - Build a predictor profile — biases, blind spots, recurring mistakes.
  - By the finals, the agent knows the user better than they know themselves.

Other directions exist on the campaign page; organizers encourage original ideas if they show persistent memory during a live tournament.

**Fit:** Mr. Toxic Special One is a direct implementation of **The Prediction Roast** — Sui wallet identity, `special-one-{address}` namespace, prediction cards, flip-flop tracking, toxicity escalation, roast callbacks from Walrus recall.

---

## 4. Submission Requirements

### Setup checklist

| Item | Requirement |
|------|-------------|
| Deployed agent | Live URL on **Walrus Mainnet** (MemWal + relayer on mainnet) |
| MemWalAccount explorer | Link to Sui explorer showing your **MemWalAccount** object holding memories |
| Public repo | GitHub (or equivalent) with readable setup |
| Walrus usage blurb | **2–5 sentences** explaining how Walrus Memory is used |

**Draft blurb (edit after deploy):**

> Mr. Toxic Special One stores each fan's team, predictions, flip-flops, and roast history in Walrus via MemWal, isolated per Sui wallet namespace (`special-one-{address}`). On every chat turn the agent recalls semantic memories and injects them into the roast prompt, so wrong calls and bandwagon switches escalate toxicity across sessions. Memories persist on Walrus mainnet through the MemWal relayer — refresh the browser days later and the agent still has your receipts.

### The Memory Moment

**Core of the submission — make it obvious.**

- Clear **before/after:** agent on **Day 1** vs after **at least 4 days** of use.
- Screenshot, video, or live link showing the agent **referencing a past prediction or opinion**.
- Suggested demo arc for our project:
  1. **Day 1:** Declare team + bold prediction → generic-ish roast, memory saved.
  2. **Day 4+:** Return with same wallet → agent callbacks prior prediction, wrong result, or flip-flop without user repeating context.
  3. Capture side-by-side: empty recall vs "I remember everything" roast.

### Your Reflection

Answer honestly (honest > marketing):

- Did the agent behave how you expected?
- What surprised you?
- What would you build differently?

Save answers for Airtable / DeepSurge submission text fields.

### Demo Video

- **Under 3 minutes**
- Show: wallet connect → MemWal live badge → prediction → wrong result → flip-flop → **refresh / return days later** → memory callback
- See also: demo script in [PROJECT.md](./PROJECT.md#demo-script-3-minutes)

---

## 5. Additional Requirements

| Requirement | Link / action |
|-------------|---------------|
| Walrus Memory integration | Required — MemWal SDK (`@mysten-incubation/memwal`) |
| DeepSurge campaign | Submit via [DeepSurge — Walrus Memory World Cup](https://www.deepsurge.xyz/hackathons/cbe3390c-88c1-48c6-a86d-5c1edb4b6d17) |
| Walrus Memory Session form | [Airtable submission form](https://airtable.com/appoDAKpC74UOqoDa/shrIl2BMnzMwpuLhO) |
| Feedback prize pool | Open GitHub issues for bugs/feature requests on [MystenLabs/MemWal](https://github.com/MystenLabs/MemWal) |
| Discord | Join [Walrus Discord](https://discord.com/invite/walrusprotocol) |
| Social | Post demo, screenshot, or project link on X with **#Walrus** |

---

## 6. Judging Criteria

### Memory Depth & Authenticity

Does memory **actually change behaviour** over time? Is Walrus Memory doing real work — shaping decisions and responses — or just logging?

**Clearest signal:** genuine before/after — Day 1 vs ≥4 days of use.

### Creativity & Flair

Is it interesting? Would you use, share, or return?

World Cup is a live, high-stakes backdrop — unexpected or genuinely fun use scores higher. Same-looking projects score lower here regardless of technical quality.

### Technical Execution & Completeness

Live on **Walrus Mainnet** with Walrus Memory correctly integrated? Does it work?

Judges evaluate stability, code quality, and whether the core experience delivers on the submission promise. **Focused, working MVP > ambitious but broken.**

---

## 7. Project Fit Checklist — `special-one-agent`

Honest mapping: requirement → status.

| Requirement | Status | Notes |
|-------------|--------|-------|
| **Showcase ≥1 core capability** | ✅ HAVE | **Portable** + **Long-Term** — see §2 detail sections |
| Walrus Memory integrated | ✅ HAVE | `@mysten-incubation/memwal` in `lib/memory/client.ts` |
| Portable memory (per wallet) | ✅ HAVE | Namespace `special-one-{walletAddress.toLowerCase()}`; refresh / new session same wallet |
| Agent coordination | ➖ N/A | Single roast agent — not required (rules: ≥1 capability) |
| Long-term memory (predictions/roasts) | ✅ HAVE | `fan-profile.ts` — predictions, flip-flops, roast history, parallel semantic recall on chat path |
| World Cup 2026 theme | ✅ HAVE | Predictions, fixtures API, manual results |
| Prediction Roast direction | ✅ HAVE | Core product — matches official example direction |
| Sui wallet identity | ✅ HAVE | dapp-kit + `/api/auth/verify` (stateless signature per request) |
| MemWal live indicator in UI | ✅ HAVE | Press room header: MemWal 🟢 LIVE + explorer link (`MemWalStatus.tsx`) |
| `npm run build` passes | ✅ HAVE | Deployable Next.js 14 app |
| Mainnet deploy (public URL) | ✅ HAVE | [special-one-agent.vercel.app](https://special-one-agent.vercel.app) |
| MemWalAccount on mainnet | ✅ HAVE | `MEMWAL_*` on Vercel production |
| MemWalAccount explorer link | ✅ HAVE | [suiscan object](https://suiscan.xyz/mainnet/object/0x73b07979a6712f54283c02ddf70e2bdfb3ec729627c9ef0e0d8a214015066a99) |
| 2–5 sentence Walrus usage blurb | ✅ HAVE | [SUBMISSION.md](./SUBMISSION.md#walrus-memory-usage-25-sentences) |
| Memory Moment (Day 1 vs ≥4 days) | ❌ TODO | Code ready — need screenshots/video (§2 Long-Term detail) |
| Reflection answers | 🟡 DRAFT | [FINAL_FEEDBACK.md](./FINAL_FEEDBACK.md) — finalize for Airtable / DeepSurge |
| Demo video (<3 min) | ❌ TODO | Script: [PROJECT.md](./PROJECT.md#demo-script-3-minutes) |
| DeepSurge submission | ❌ TODO | [campaign page](https://www.deepsurge.xyz/hackathons/cbe3390c-88c1-48c6-a86d-5c1edb4b6d17) |
| Airtable form | ❌ TODO | [form](https://airtable.com/appoDAKpC74UOqoDa/shrIl2BMnzMwpuLhO) |
| MemWal GitHub issues (feedback prize) | 🟡 PARTIAL | [#246](https://github.com/MystenLabs/MemWal/issues/246), [#247](https://github.com/MystenLabs/MemWal/issues/247), [#248](https://github.com/MystenLabs/MemWal/issues/248) filed |
| Walrus Discord | ❓ VERIFY | [invite](https://discord.com/invite/walrusprotocol) |
| #Walrus X post | ❌ TODO | Post after Memory Moment + video |

---

## 8. Action Items (prioritized)

Ordered for hackathon submission success:

### P0 — MemWal mainnet (operator)

→ **Step-by-step:** [docs/MEMWAL_SETUP.md](./docs/MEMWAL_SETUP.md)

| Step | Action |
|------|--------|
| 1 | [memory.walrus.xyz/dashboard](https://memory.walrus.xyz/dashboard) → **Connect wallet** (Sui mainnet) |
| 2 | Create **MemWalAccount** (first time) |
| 3 | Create **delegate key** (not owner key) → `MEMWAL_PRIVATE_KEY` |
| 4 | Copy account object ID → `MEMWAL_ACCOUNT_ID` + `NEXT_PUBLIC_MEMWAL_ACCOUNT_ID` |
| 5 | `npm run memwal:verify` → deploy Vercel with same env |

Users in the app only connect wallet; memories use namespace `special-one-{address}` on your account.

### P0 — Submission blockers (remaining)

1. ~~**Create MemWalAccount on mainnet**~~ — ✅ done; see [MEMWAL_SETUP.md](./docs/MEMWAL_SETUP.md).
2. ~~**Deploy to production**~~ — ✅ [special-one-agent.vercel.app](https://special-one-agent.vercel.app).
3. ~~**Save MemWalAccount explorer link**~~ — ✅ in SUBMISSION.md + press room header.
4. **Run 4+ day Memory Moment** — same test wallet: Day 1 predictions → Day 4+ return → record before/after (screenshots + short clip). See §2 Long-Term Memory detail.
5. **Record demo video** (<3 min) following [PROJECT.md](./PROJECT.md#demo-script-3-minutes); include Memory Moment beat.
6. **Write honest Reflection** — 3 questions; draft in [FINAL_FEEDBACK.md](./FINAL_FEEDBACK.md), finalize for forms.

### P1 — Submission packaging

7. **Submit DeepSurge** — [campaign page](https://www.deepsurge.xyz/hackathons/cbe3390c-88c1-48c6-a86d-5c1edb4b6d17) with deploy URL, explorer link, repo, video.
8. **Submit Airtable form** — [Walrus Memory Session form](https://airtable.com/appoDAKpC74UOqoDa/shrIl2BMnzMwpuLhO).
9. ~~**Finalize 2–5 sentence Walrus usage** blurb~~ — ✅ [SUBMISSION.md](./SUBMISSION.md).

### P2 — Community & prizes

10. **Open MemWal GitHub issues** for any bugs/feature requests found (feedback prize pool).
11. **Join Walrus Discord** if not joined — [invite](https://discord.com/invite/walrusprotocol).
12. **Post on X** with #Walrus — demo GIF, Memory Moment screenshot, or live link.

### P3 — Polish (optional, improves judging scores)

13. Pre-seed demo wallet with 4 days of scripted predictions before judging (if natural 4-day wait isn't feasible before deadline).
14. ~~Add explorer link to press-room~~ — ✅ `MemWalStatus.tsx` + PROJECT.md.
15. File API-Football fixture mocks if WC 2026 data sparse during demo window.

---

## Quick links

| Resource | URL |
|----------|-----|
| Walrus Sessions hub | https://thewalrussessions.wal.app/memory-world-cup |
| **Production app** | https://special-one-agent.vercel.app |
| **MemWalAccount explorer** | https://suiscan.xyz/mainnet/object/0x73b07979a6712f54283c02ddf70e2bdfb3ec729627c9ef0e0d8a214015066a99 |
| MemWal dashboard | https://memory.walrus.xyz |
| MemWal docs | https://docs.memwal.ai |
| DeepSurge campaign | https://www.deepsurge.xyz/hackathons/cbe3390c-88c1-48c6-a86d-5c1edb4b6d17 |
| Airtable form | https://airtable.com/appoDAKpC74UOqoDa/shrIl2BMnzMwpuLhO |
| MemWal GitHub | https://github.com/MystenLabs/MemWal |
| This repo | https://github.com/Olympusxvn/special-one-agent |
