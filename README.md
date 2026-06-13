# Mr. Toxic Special One

[![Live Demo](https://img.shields.io/badge/demo-special--one--agent.vercel.app-00C853?style=flat-square)](https://special-one-agent.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Olympusxvn%2Fspecial--one--agent-181717?style=flat-square&logo=github)](https://github.com/Olympusxvn/special-one-agent)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](./LICENSE)
[![Walrus Sessions 4](https://img.shields.io/badge/Walrus%20Sessions-4%20%C2%B7%20Memory%20World%20Cup-6C5CE7?style=flat-square)](https://thewalrussessions.wal.app/memory-world-cup)

> A World Cup 2026 **Prediction Roast** agent — per Sui wallet, powered by **Walrus Memory (MemWal)** on mainnet. Bold takes become receipts; wrong calls and flip-flops fuel escalating comedy.

Built for **[Walrus Sessions 4 — Walrus Memory World Cup](https://thewalrussessions.wal.app/memory-world-cup)** (June 2026).

---

## Overview

Football fans talk big before a tournament. **Mr. Toxic Special One** keeps the receipts.

Connect a Sui wallet, declare your team, predict scores, and get roasted in American comedy voice — sharp, personal, never gratuitously hostile. Every wallet gets an isolated Walrus namespace (`special-one-{address}`). The bot **reads** your profile and recalled memories before each roast and **writes** new state after — without blocking the stream.

Memory is not a bolt-on feature. It drives the product: prediction ledger, toxicity meter, semantic callbacks (*“you said Brazil 3–0 six days ago”*), and judge-visible on-chain proof.

| | |
|---|---|
| **Production** | [special-one-agent.vercel.app](https://special-one-agent.vercel.app) |
| **Press Room** | [/chat](https://special-one-agent.vercel.app/chat) |
| **Schedules** | [/schedules](https://special-one-agent.vercel.app/schedules) — 104 fixtures, crests, live scores |
| **MemWalAccount** | [`0x73b0…6699` on SuiScan](https://suiscan.xyz/mainnet/object/0x73b07979a6712f54283c02ddf70e2bdfb3ec729627c9ef0e0d8a214015066a99) |

---

## Features

| Capability | Description |
|------------|-------------|
| **Portable Memory** | Same wallet after refresh → ledger reloads from Walrus |
| **Long-Term Memory** | Predictions, flip-flops, and roasts accumulate across sessions |
| **Dual memory model** | Structured `FAN_PROFILE_JSON` + semantic graveyard lines |
| **Prediction Roast loop** | PENDING → CORRECT / WRONG resolution; toxicity escalates |
| **Judge-visible UI** | Walrus Memory Ledger sidebar, toxicity meter, MemWal 🟢 LIVE badge |
| **Wallet identity** | Sui connect + signed message — no traditional signup |
| **BYOK LLM** | Gemini / ChatGPT / Claude keys stay in `sessionStorage` only |
| **Serverless-ready** | Parallel recall budgets, fire-and-forget `remember()` on Vercel |

---

## How Memory Works

Each connected wallet maps to one namespace:

```text
special-one-{walletAddress.toLowerCase()}
```

**Per chat turn**

1. **Read** — `loadFanProfileFast` (500 ms cap) + semantic recall (800 ms cap, max 2 lines) in parallel
2. **Stream** — roast via user’s LLM key; intent detected by regex (`set_team`, `prediction`, `report_result`, `banter`)
3. **Write** — profile + semantic lines persisted with `remember()` (fire-and-forget); `onFinish` appends roast history

**Storage patterns**

| Pattern | Example |
|---------|---------|
| Profile snapshot | `FAN_PROFILE_JSON:{"favorite_team":"Brazil",…}` |
| Prediction | `Prediction: Brazil 3-0 Argentina — PENDING` |
| Wrong result | `Prediction WRONG: said 3-0, actual 1-2` |
| Flip-flop | `Flip-flop: switched from Argentina to Brazil` |

Wallet A never sees Wallet B’s memories. Operator docs: [docs/MEMWAL_SETUP.md](./docs/MEMWAL_SETUP.md).

---

## Tech Stack

Next.js 14 · TypeScript · Tailwind CSS · `@mysten-incubation/memwal` · `@mysten/dapp-kit` · Vercel (`hkg1`) · AI SDK (Gemini / OpenAI / Anthropic)

---

## Quick Start

```bash
git clone https://github.com/Olympusxvn/special-one-agent.git
cd special-one-agent

cp .env.example .env.local
# Recommended: MEMWAL_PRIVATE_KEY, MEMWAL_ACCOUNT_ID (see docs/MEMWAL_SETUP.md)
# Chat: users BYOK in Settings, or set server keys for operator demo

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → connect wallet → **Enter Press Room**.

**Production build**

```bash
npm run build && npm start
```

Works with `npm` or `pnpm`. Verify MemWal env: `npm run memwal:verify`.

---

## Environment Variables

| Variable | Required | Description |
|----------|:--------:|-------------|
| `MEMWAL_PRIVATE_KEY` | For memory* | Delegate key hex — server only |
| `MEMWAL_ACCOUNT_ID` | For memory* | MemWal account object ID |
| `NEXT_PUBLIC_MEMWAL_ACCOUNT_ID` | No | Explorer link in UI |
| `MEMWAL_SERVER_URL` | No | Relayer (default: `https://relayer.memory.walrus.xyz`) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | No | Optional server demo; users can BYOK Gemini |
| `OPENAI_API_KEY` | No | Optional server demo; users can BYOK ChatGPT |
| `ANTHROPIC_API_KEY` | No | Optional server demo; users can BYOK Claude |
| `OPENROUTER_API_KEY` | No | Optional fallback for all models |
| `API_FOOTBALL_KEY` | No | Live fixtures (~100 req/day free tier); falls back to WorldCup26 / static JSON |
| `AUTH_MESSAGE_DOMAIN` | No | Wallet sign-in domain (default: `mr-toxic-special-one`) |
| `NEXT_PUBLIC_SUI_NETWORK` | No | Sui network (default: `mainnet`) |

\*MemWal keys required for persistent cross-session memory. Chat requires a user API key in Settings (or operator server keys). Judges: free **Gemini 2.0 Flash Lite** key from [Google AI Studio](https://aistudio.google.com/apikey).

---

## Demo for Judges (~30 seconds)

1. Open [special-one-agent.vercel.app/chat](https://special-one-agent.vercel.app/chat)
2. Connect **Sui wallet** → approve signature
3. **⚙️ Settings** → **Gemini** → paste free `AIza…` key → **Save**
4. Tap a **demo chip** or type a prediction → **Send**
5. Confirm **Walrus Memory Ledger** (sidebar) + **MemWal 🟢 LIVE** + explorer link

Full walkthrough: [SUBMISSION.md](./SUBMISSION.md) · demo script: [PROJECT.md](./PROJECT.md)

---

## Project Structure

```text
app/
├── chat/              Press room (streaming roast)
├── schedules/         WC 2026 fixtures + click-to-predict → Walrus
└── api/
    ├── chat/          Streaming roast API
    ├── memory/        Profile load for ledger UI
    ├── auth/verify/   Wallet signature verification
    └── matches/       Fixtures + prediction sync

components/            chat/, world-cup/, wallet/
lib/
├── memory/            MemWal client, fan profile, recall, toxicity
├── ai/                System prompt, intent, model routing
└── api/worldcup.ts    Unified fixture service (API-Football → WorldCup26 → fallback)

docs/MEMWAL_SETUP.md   Operator mainnet setup
```

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/chat` | POST | Stream roast (verified wallet + BYOK) |
| `/api/auth/verify` | POST | Validate wallet signature |
| `/api/memory/profile` | POST | Load fan profile for ledger UI |
| `/api/matches/fixtures` | GET | WC 2026 fixtures |
| `/api/matches/sync` | POST | Resolve pending predictions |

---

## MemWal Community Feedback

Issues filed on [MystenLabs/MemWal](https://github.com/MystenLabs/MemWal) while building this production app (Walrus Sessions 4 feedback prize):

| Issue | Type | Summary | Status |
|-------|------|---------|--------|
| [#246](https://github.com/MystenLabs/MemWal/issues/246) | Docs | Multi-tenant cookbook — one MemWalAccount, namespace per wallet | **Closed** |
| [#247](https://github.com/MystenLabs/MemWal/issues/247) | Feature | Upsert / key-based recall for structured JSON profile | **Closed** — upsert added, shipping to main |
| [#248](https://github.com/MystenLabs/MemWal/issues/248) | Feature | `healthCheck()` — relayer + delegate verify at deploy | **Closed** — under SDK review |
| [#277](https://github.com/MystenLabs/MemWal/issues/277) | Docs | Serverless latency guide — Vercel, `remember` vs `rememberAndWait`, recall budgets | **Open** |

Summary for forms: [FEEDBACK.md](./FEEDBACK.md) · deep technical write-up: [FINAL_FEEDBACK.md](./FINAL_FEEDBACK.md)

---

## Documentation

| Document | Purpose |
|----------|---------|
| [PROJECT.md](./PROJECT.md) | Product overview, architecture, demo script |
| [SUBMISSION.md](./SUBMISSION.md) | Hackathon submission packet + checklist |
| [FEEDBACK.md](./FEEDBACK.md) | MemWal feedback summary (issue status synced) |
| [FINAL_FEEDBACK.md](./FINAL_FEEDBACK.md) | Serverless latency lessons for MemWal team |
| [docs/MEMWAL_SETUP.md](./docs/MEMWAL_SETUP.md) | Mainnet MemWalAccount + delegate key setup |
| [WALRUS_SS4_RULE.md](./WALRUS_SS4_RULE.md) | Official SS4 rules + fit checklist |
| [CHANGELOG.md](./CHANGELOG.md) | Mitigations and lessons learned |

---

## License

This project is released under the **[MIT License](./LICENSE)**.

It is intended for **educational and research purposes** — learning Walrus Memory integration, serverless AI patterns, and hackathon experimentation. Use at your own risk in production; roast content is entertainment, not financial or betting advice.
