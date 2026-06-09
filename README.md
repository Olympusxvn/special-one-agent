# Mr. Toxic Special One

[![GitHub](https://img.shields.io/badge/GitHub-Olympusxvn%2Fspecial--one--agent-181717?logo=github)](https://github.com/Olympusxvn/special-one-agent)

American roast-comedy AI for **Walrus Sessions 4 — World Cup 2026**. Connect your Sui wallet, make bold predictions, and get roasted with receipts pulled from **Walrus Memory (MemWal)**. Wrong calls and bandwagon flip-flops crank the toxicity — fun, sharp, never hostile.

→ **Judges & overview:** [PROJECT.md](./PROJECT.md)  
→ **Hackathon submission packet:** [SUBMISSION.md](./SUBMISSION.md)  
→ **MemWal latency feedback:** [FINAL_FEEDBACK.md](./FINAL_FEEDBACK.md)  
→ **Hackathon rules & checklist:** [WALRUS_SS4_RULE.md](./WALRUS_SS4_RULE.md)  
→ **Changelog & lessons learned:** [CHANGELOG.md](./CHANGELOG.md)  
→ **Full spec:** [docs/SPEC.md](./docs/SPEC.md)

## Quick Start

```bash
git clone https://github.com/Olympusxvn/special-one-agent.git
cd special-one-agent

cp .env.example .env.local
# Optional server demo: OPENROUTER_API_KEY (judges / operators)
# Or connect your own key in the chat header (BYOK — no server key required)
# Recommended for demo: MEMWAL_PRIVATE_KEY, MEMWAL_ACCOUNT_ID

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → connect Sui wallet → **Enter Press Room** (`/chat`).  
**Schedules & Results:** [`/schedules`](http://localhost:3000/schedules) — fixtures, results, and free RSS headlines (API-Football free tier when configured; curated demo fixtures otherwise).

**Production:** [special-one-agent.vercel.app](https://special-one-agent.vercel.app) — MemWal mainnet live; connect wallet + paste API key in Settings (see [Demo](#demo-for-judges) below).

**Production build:**

```bash
npm run build
npm start
```

Works with `pnpm` or `npm` interchangeably.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | No | Optional server demo; users can BYOK Gemini in Settings |
| `OPENAI_API_KEY` | No | Optional server demo; users can BYOK ChatGPT in Settings |
| `ANTHROPIC_API_KEY` | No | Optional server demo; users can BYOK Claude in Settings |
| `OPENROUTER_API_KEY` | No | Optional fallback for all models |
| `MEMWAL_PRIVATE_KEY` | No* | Delegate key hex — server only; get from [memory.walrus.xyz/dashboard](https://memory.walrus.xyz/dashboard) |
| `MEMWAL_ACCOUNT_ID` | No* | MemWal account object ID |
| `NEXT_PUBLIC_MEMWAL_ACCOUNT_ID` | No | Same as above — shows explorer link in UI |
| `MEMWAL_SERVER_URL` | No | Relayer URL (default: `https://relayer.memory.walrus.xyz`) |
| `API_FOOTBALL_KEY` | No | Live WC 2026 fixtures via [API-Football](https://www.api-football.com/) free tier (~100 req/day); without it, demo fixtures from `data/wc2026-fixtures.json` |
| `AUTH_MESSAGE_DOMAIN` | No | Wallet sign-in message domain (default: `mr-toxic-special-one`) |
| `NEXT_PUBLIC_AUTH_MESSAGE_DOMAIN` | No | Client-side auth domain (must match server) |
| `NEXT_PUBLIC_SUI_NETWORK` | No | Sui network for wallet (default: `mainnet`) |

\*MemWal keys required for persistent cross-session memory demo. Setup: [docs/MEMWAL_SETUP.md](./docs/MEMWAL_SETUP.md). Verify: `npm run memwal:verify`.

\*Chat requires a user API key in Settings (or operator server keys). Recommended for judges: **Gemini** free key from [Google AI Studio](https://aistudio.google.com/apikey).

## Demo for judges

**~30 seconds to first roast:**

1. Open [special-one-agent.vercel.app/chat](https://special-one-agent.vercel.app/chat)
2. Connect **Sui wallet** → approve verify signature
3. **⚙️ Settings** → **Gemini** tab → paste free `AIza…` key from [AI Studio](https://aistudio.google.com/apikey) → **Save key**
4. Model auto-selects **Gemini 2.0 Flash Lite** (fastest) — tap a **demo line** chip or type your own → **Send**

**Sample inputs** (also shown as chips in the press room): Brazil fan hype, score predictions, team pick (`France`), flip-flop, result report, banter.

Also works with **ChatGPT** or **Claude** keys in Settings. Keys stay in `sessionStorage` only — never on the server or in git.

## Project Structure

```text
special-one-agent/
├── app/
│   ├── page.tsx                 Landing, news feed, wallet gate
│   ├── layout.tsx               Root layout + providers
│   ├── globals.css              WC 2026 festive theme tokens
│   ├── providers.tsx            dapp-kit + react-query
│   ├── chat/page.tsx            Press room (ChatContainer)
│   ├── schedules/page.tsx       Fixtures, results, RSS headlines
│   └── api/
│       ├── chat/route.ts        Streaming roast API
│       ├── memory/profile/      Load fan profile from Walrus (ledger UI)
│       ├── news/route.ts        Free RSS headlines
│       ├── auth/verify/         Wallet signature verification
│       └── matches/
│           ├── fixtures/        WC 2026 fixtures (API-Football or demo JSON)
│           └── sync/            Resolve pending predictions
├── components/
│   ├── chat/                    PressRoomHeader, ToxicityMeter, PredictionCard, ...
│   ├── news/                    NewsFeed
│   ├── world-cup/               WorldCupLogo, stripe, watermark
│   └── wallet/                  WalletButton
├── lib/
│   ├── ai/                      System prompt, intent, OpenRouter
│   ├── memory/                  MemWal client, fan profile, toxicity
│   ├── memwal/                  Explorer constants for UI
│   ├── football/                Provider, API-Football, static fixtures, news RSS
│   ├── auth/                    Wallet message + verification
│   └── samples/                 Demo conversation examples
├── data/
│   └── wc2026-fixtures.json     Zero-key demo fixtures fallback
├── public/
│   ├── mourinho-logo.png
│   └── world-cup-2026-logo.png
├── docs/MEMWAL_SETUP.md         Operator MemWal mainnet setup
└── scripts/verify-memwal-env.mjs
```

## How Memory Works

Each connected Sui wallet gets an isolated Walrus namespace:

```
special-one-{walletAddress.toLowerCase()}
```

**On every chat turn:**

1. Intent is detected (`set_team`, `prediction`, `report_result`, `banter`)
2. Fan profile mutates (team, predictions, flip-flops)
3. Semantic memories are recalled and injected into the system prompt
4. The roast streams back; on finish, the burn is appended to `roast_history` and pushed to MemWal

**Storage patterns:**

| Pattern | Example |
|---------|---------|
| Profile snapshot | `FAN_PROFILE_JSON:{"favorite_team":"Brazil",...}` |
| Prediction | `Prediction: Brazil 3-0 Argentina — PENDING` |
| Wrong result | `Prediction WRONG: said 3-0, actual 1-2` |
| Flip-flop | `Flip-flop: switched from Argentina to Brazil` |

Wallet A never sees Wallet B's memories. Refresh the page with the same wallet — if MemWal is live, your graveyard of bad takes comes right back.

## Demo Conversation Examples

American roast voice — opening hot, meme beat, closing sting:

**User:** `I support Brazil! We are definitely winning the World Cup 100%!`

**Bot:** *With fans like you, I understand why Brazil underachieves — you bring the IQ of a corner flag to every conversation.* 🤡💀😂  
*[Crying Jordan] — You as Brazil, the trophy as your dignity, both crying in separate rooms.*  
*You are not on my level, little supporter. This is football, not fan fiction. Who authorized this opinion? Keep coping.* 🔥

---

**User:** `I predict Brazil 3-0 Argentina in the final!`

**Bot:** *You predicted that? In public? With witnesses? Typical Brazil fan.* 🤡🔥💀  
*[This is Fine] — You sitting in flames while your 3-0 fantasy melts.*  
*Argentina won 1-0 and your spreadsheet made of hope collapsed. I remember everything. Keep coping.* 🚮

---

**User:** `Actually I support Brazil now, Argentina is finished.`

**Bot:** *Typical fan — no principles, just vibes and a wardrobe of jerseys.* 🤡😂🚮  
*[Distracted Boyfriend] — You glancing at Brazil while Argentina watches in disgust.*  
*You flipped faster than a transfer deadline rumor. Pick a personality first.* 🔥

More samples in `lib/samples/conversations.ts`.

## Hackathon Alignment

- **Walrus Memory showcase** — per-wallet namespace, semantic recall, persistent fan profile on Walrus
- **Sui wallet identity** — connect + sign; no traditional auth; memory bound to address
- **World Cup 2026 theme** — predictions, results, toxicity tied to tournament banter
- **Standalone Next.js app** — deployable demo; `build` passes; API routes + `/chat` wired
- **Graceful degradation** — works without API-Football (manual results); regex intent fallback without OpenRouter extras

## MemWal Feedback (Walrus Sessions 4)

Feedback filed on [MystenLabs/MemWal](https://github.com/MystenLabs/MemWal) while building this app (feedback prize pool):

| Issue | Type | Summary |
|-------|------|---------|
| [#246](https://github.com/MystenLabs/MemWal/issues/246) | Docs | Cookbook for multi-tenant server apps — one MemWalAccount, delegate key, namespace per user wallet |
| [#247](https://github.com/MystenLabs/MemWal/issues/247) | Feature | Upsert / key-based recall for structured agent state (JSON profile pattern) |
| [#248](https://github.com/MystenLabs/MemWal/issues/248) | Feature | `healthCheck()` to verify relayer + delegate permissions at deploy time |

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/chat` | POST | Stream toxic roast (requires verified wallet) |
| `/api/auth/verify` | POST | Validate wallet signature |
| `/api/matches/fixtures` | GET | WC 2026 fixtures |
| `/api/matches/sync` | POST | Resolve pending predictions via API |

## License

Private hackathon project — see repo owner for usage terms.
