# Mr. Toxic Special One

[![GitHub](https://img.shields.io/badge/GitHub-Olympusxvn%2Fspecial--one--agent-181717?logo=github)](https://github.com/Olympusxvn/special-one-agent)

American roast-comedy AI for **Walrus Sessions 4 — World Cup 2026**. Connect your Sui wallet, make bold predictions, and get roasted with receipts pulled from **Walrus Memory (MemWal)**. Wrong calls and bandwagon flip-flops crank the toxicity — fun, sharp, never hostile.

→ **Judges & overview:** [PROJECT.md](./PROJECT.md)  
→ **Full spec:** [docs/SPEC.md](./docs/SPEC.md)

## Quick Start

```bash
git clone https://github.com/Olympusxvn/special-one-agent.git
cd special-one-agent

cp .env.example .env.local
# Required: OPENROUTER_API_KEY
# Recommended for demo: MEMWAL_PRIVATE_KEY, MEMWAL_ACCOUNT_ID

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → connect Sui wallet → **Enter Press Room** (`/chat`).

**Production build:**

```bash
npm run build
npm start
```

Works with `pnpm` or `npm` interchangeably.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | **Yes** (chat) | OpenRouter API key for streaming roasts |
| `MEMWAL_PRIVATE_KEY` | No* | Delegate key hex — server only; get from [memory.walrus.xyz](https://memory.walrus.xyz) |
| `MEMWAL_ACCOUNT_ID` | No* | MemWal account object ID |
| `MEMWAL_SERVER_URL` | No | Relayer URL (default: `https://relayer.memory.walrus.xyz`) |
| `API_FOOTBALL_KEY` | No | Auto-sync WC 2026 fixtures; manual results work without it |
| `AUTH_MESSAGE_DOMAIN` | No | Wallet sign-in message domain (default: `mr-toxic-special-one`) |
| `NEXT_PUBLIC_AUTH_MESSAGE_DOMAIN` | No | Client-side auth domain (must match server) |
| `NEXT_PUBLIC_SUI_NETWORK` | No | Sui network for wallet (default: `mainnet`) |

\*MemWal keys required for persistent cross-session memory demo. Without them, the app runs in offline demo mode (in-memory cache only).

## Project Structure

```
app/
  page.tsx              # Landing — wallet gate, Enter Press Room
  chat/page.tsx         # Chat UI (ChatContainer)
  api/
    chat/route.ts       # Streaming roast API
    auth/verify/        # Wallet signature verification
    matches/
      fixtures/         # WC 2026 fixtures (API-Football)
      sync/             # Resolve pending predictions
  providers.tsx         # dapp-kit + react-query
  globals.css           # Charcoal + gold press-room theme

components/
  chat/                 # PressRoomHeader, ToxicityMeter, PredictionCard, …
  wallet/               # WalletButton

lib/
  ai/                   # System prompt, intent detection, OpenRouter providers
  memory/               # MemWal client, fan profile, toxicity scoring
  football/             # API-Football + prediction sync
  auth/                 # Wallet message + verification
  samples/              # Demo conversation examples
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

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/chat` | POST | Stream toxic roast (requires verified wallet) |
| `/api/auth/verify` | POST | Validate wallet signature |
| `/api/matches/fixtures` | GET | WC 2026 fixtures |
| `/api/matches/sync` | POST | Resolve pending predictions via API |

## License

Private hackathon project — see repo owner for usage terms.
