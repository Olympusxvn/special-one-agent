# Walrus Sessions 4 — Official Rules Summary

**Track:** [Walrus Memory World Cup](https://thewalrussessions.wal.app/memory-world-cup) · June 5–24, 2026  
**Project:** [Mr. Toxic Special One](./PROJECT.md)  
**Source:** Official hackathon rules (summarized for team alignment)

---

## 1. Tóm tắt (VI)

Bullet summary cho team — bám sát rules gốc:

- **Mục tiêu:** Agent AI có **bộ nhớ bền (Walrus Memory / MemWal)** xoay quanh **World Cup 2026**.
- **3 năng lực cốt lõi:** Portable Memory · Agent Coordination · Long-Term Memory (cần showcase ≥1).
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

> **Mr. Toxic Special One** primarily demonstrates **Portable Memory** + **Long-Term Memory** (per-wallet namespace, predictions/roasts accumulate over days). Single-agent design — **Agent Coordination** is N/A unless we add a second agent later.

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
| Walrus Memory integrated | ✅ HAVE | `@mysten-incubation/memwal` in `lib/memory/client.ts` |
| Portable memory (per wallet) | ✅ HAVE | Namespace `special-one-{walletAddress.toLowerCase()}` |
| Agent coordination | ➖ N/A | Single roast agent — not required unless we expand |
| Long-term memory (predictions/roasts) | ✅ HAVE | `fan-profile.ts` — predictions, flip-flops, roast history, semantic recall |
| World Cup 2026 theme | ✅ HAVE | Predictions, fixtures API, manual results |
| Prediction Roast direction | ✅ HAVE | Core product — matches official example direction |
| Sui wallet identity | ✅ HAVE | dapp-kit + `/api/auth/verify` |
| MemWal live indicator in UI | ✅ HAVE | Press room header: MemWal 🟢 LIVE / ⚪ offline |
| `npm run build` passes | ✅ HAVE | Deployable Next.js 14 app |
| Mainnet deploy (public URL) | ❌ MISSING | No production URL documented yet — [PROJECT.md](./PROJECT.md) lists as optional polish |
| MemWalAccount on mainnet | ❓ VERIFY | Need `MEMWAL_PRIVATE_KEY` + `MEMWAL_ACCOUNT_ID` from [memory.walrus.xyz](https://memory.walrus.xyz) on deploy |
| MemWalAccount explorer link | ❌ MISSING | Capture after account setup — e.g. `https://suiscan.xyz/mainnet/object/{MEMWAL_ACCOUNT_ID}` |
| 2–5 sentence Walrus usage blurb | 🟡 DRAFT | Draft above — finalize at submit time |
| Memory Moment (Day 1 vs ≥4 days) | ❌ TODO | Need real multi-day usage + before/after capture |
| Reflection answers | ❌ TODO | Write after Memory Moment testing |
| Demo video (<3 min) | ❌ TODO | Script exists in PROJECT.md; not recorded |
| DeepSurge submission | ❌ TODO | Register + submit on campaign page |
| Airtable form | ❌ TODO | Submit after assets ready |
| MemWal GitHub issues (feedback prize) | ❌ TODO | File any bugs/requests encountered during build |
| Walrus Discord | ❓ VERIFY | Join if not already |
| #Walrus X post | ❌ TODO | Post after deploy + video |

---

## 8. Action Items (prioritized)

Ordered for hackathon submission success:

### P0 — Blockers (must have before submit)

1. **Create MemWalAccount on mainnet** — dashboard at [memory.walrus.xyz](https://memory.walrus.xyz); set `MEMWAL_PRIVATE_KEY`, `MEMWAL_ACCOUNT_ID` on production host.
2. **Deploy to production** (Vercel or similar) with mainnet env — document URL in README + PROJECT.md.
3. **Save MemWalAccount explorer link** — add to submission packet and PROJECT.md submission section.
4. **Run 4+ day Memory Moment** — same test wallet: Day 1 predictions → Day 4+ return → record before/after (screenshots + short clip).
5. **Record demo video** (<3 min) following PROJECT.md demo script; include Memory Moment beat.
6. **Write honest Reflection** — 3 questions, real feedback on MemWal UX.

### P1 — Submission packaging

7. **Submit DeepSurge** — [campaign page](https://www.deepsurge.xyz/hackathons/cbe3390c-88c1-48c6-a86d-5c1edb4b6d17) with deploy URL, explorer link, repo, video.
8. **Submit Airtable form** — [Walrus Memory Session form](https://airtable.com/appoDAKpC74UOqoDa/shrIl2BMnzMwpuLhO).
9. **Finalize 2–5 sentence Walrus usage** blurb (section 4 draft).

### P2 — Community & prizes

10. **Open MemWal GitHub issues** for any bugs/feature requests found (feedback prize pool).
11. **Join Walrus Discord** if not joined — [invite](https://discord.com/invite/walrusprotocol).
12. **Post on X** with #Walrus — demo GIF, Memory Moment screenshot, or live link.

### P3 — Polish (optional, improves judging scores)

13. Pre-seed demo wallet with 4 days of scripted predictions before judging (if natural 4-day wait isn't feasible before deadline).
14. Add explorer link to press-room footer or PROJECT.md only (no code change required).
15. File API-Football fixture mocks if WC 2026 data sparse during demo window.

---

## Quick links

| Resource | URL |
|----------|-----|
| Walrus Sessions hub | https://thewalrussessions.wal.app/memory-world-cup |
| MemWal dashboard | https://memory.walrus.xyz |
| MemWal docs | https://docs.memwal.ai |
| DeepSurge campaign | https://www.deepsurge.xyz/hackathons/cbe3390c-88c1-48c6-a86d-5c1edb4b6d17 |
| Airtable form | https://airtable.com/appoDAKpC74UOqoDa/shrIl2BMnzMwpuLhO |
| MemWal GitHub | https://github.com/MystenLabs/MemWal |
| This repo | https://github.com/Olympusxvn/special-one-agent |
