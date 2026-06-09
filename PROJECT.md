# Mr. Toxic Special One

**One-liner:** A World Cup 2026 roast-bot that remembers every bad take you make — per Sui wallet — and turns it into escalating comedy via Walrus Memory.

**Hackathon track:** [Walrus Sessions 4 — Walrus Memory World Cup](https://thewalrussessions.wal.app/memory-world-cup) (June 5–24, 2026)

---

## Problem & Solution

Football fans talk big before the World Cup: bold predictions, team flip-flops, and selective amnesia when results land. Nobody keeps the receipts — so the banter stays generic.

**Mr. Toxic Special One** fixes that with **Walrus Memory (MemWal)**. Connect your Sui wallet, declare your team, drop predictions, report results — and the bot roasts you with *your own history*. Wrong calls and bandwagon switches crank up a **Toxicity Meter** (1–10). It's American roast comedy energy: sharp, funny, personal — never mean for the sake of it.

---

## Key Features

| Feature | What it does |
|---------|----------------|
| **Memory-driven roast** | Recalls team, predictions, flip-flops, and past burns from Walrus per wallet |
| **Wallet identity** | Sui connect + signed message — no signup, one address = one memory namespace |
| **Prediction tracking** | Saves pending calls; resolves via API-Football sync or manual score entry |
| **Toxicity escalation** | Wrong predictions + flip-flops + high-confidence misses → hotter roasts |
| **Streaming chat** | BYOK LLM (Gemini / ChatGPT / Claude in Settings); short streaming roasts (~40 words) |
| **Press-room UI** | Dark/gold theme, toxicity meter, prediction sidebar, MemWal live banner |

---

## Data Flow (for judges)

**Production:** [special-one-agent.vercel.app](https://special-one-agent.vercel.app) · **MemWal namespace:** `special-one-{walletAddress}` (one Sui wallet = one isolated memory space on Walrus mainnet).

### At a glance

| Step | What happens | Walrus involved? |
|------|----------------|------------------|
| 1 | User connects Sui wallet + signs auth message | No |
| 2 | User pastes LLM API key in Settings (stays in browser) | No |
| 3 | User sends a chat message | **Read** — profile + semantic recall |
| 4 | Bot streams a roast | No (LLM only) |
| 5 | After stream ends | **Write** — profile + roast line saved to Walrus |
| 6 | User refreshes days later, same wallet | **Read** — agent still has receipts |

**Judge takeaway:** Every wallet gets its own Walrus memory. The bot **reads** memory before each roast and **writes** after — without blocking the stream.

---

### System overview

```mermaid
flowchart TB
    subgraph Browser["Browser — user device only"]
        Wallet[Sui Wallet]
        SS[(sessionStorage<br/>auth proof + API keys)]
        Chat[Press Room /chat]
        Wallet --> SS
        SS --> Chat
    end

    subgraph Server["Vercel — Next.js server"]
        AUTH["/api/auth/verify"]
        CHAT["/api/chat"]
        SYNC["/api/matches/sync"]
    end

    subgraph External["External services"]
        LLM[Gemini / ChatGPT / Claude API]
        MW[MemWal Relayer → Walrus mainnet]
        AF[API-Football optional]
    end

    Chat --> AUTH
    Chat --> CHAT
    Chat --> SYNC
    CHAT --> LLM
    CHAT --> MW
    SYNC --> AF
    SYNC --> MW
```

**What never hits our server:** LLM API keys (browser `sessionStorage` only).  
**What stays on server:** MemWal delegate key (`MEMWAL_*` env) — one operator account, many user namespaces.

---

### 1. Wallet auth (once per session)

```mermaid
sequenceDiagram
    participant Judge as Judge / User
    participant Wallet as Sui Wallet
    participant Browser as Browser
    participant API as /api/auth/verify

    Judge->>Wallet: Connect + Sign message
    Wallet->>Browser: message + signature
    Browser->>Browser: Save to sessionStorage
    Browser->>API: POST verify
    API->>API: Verify Sui signature
    API-->>Browser: OK

    Note over Browser: Every chat message includes<br/>authMessage + authSignature in body
```

No traditional signup. The wallet address **is** the user ID and the MemWal namespace key.

---

### 2. One chat message — the hot path

This is what happens when a judge taps a demo chip or types a message:

```mermaid
sequenceDiagram
    participant Browser as Browser
    participant API as /api/chat
    participant MW as MemWal / Walrus
    participant LLM as User's LLM API

    Browser->>API: messages + wallet + API key + auth proof
    API->>API: Verify wallet signature

    par Parallel — separate timeouts
        API->>MW: Load FAN_PROFILE_JSON (max 500ms)
        API->>MW: Semantic recall from user text (max 800ms, 2 lines)
    end
    MW-->>API: Team, predictions, past roasts

    API->>API: Detect intent (regex): team / prediction / result
    API->>API: Update profile in memory + toxicity score
    API->>API: Build prompt: fan + mem + tox
    API->>LLM: streamText (short roast, ~70 tokens max)
    LLM-->>Browser: Stream roast text

    Note over API,MW: After stream finishes (background)
    API->>MW: remember() profile + roast line (fire-and-forget)
```

**Numbered flow (easy to follow in a demo):**

1. **Verify** — server checks the Sui signature on every request (serverless-safe).
2. **Read Walrus (parallel)** — structured profile blob + up to 2 semantic memory lines (e.g. *"Prediction WRONG: said Brazil 3-0, actual 1-0"*).
3. **Parse intent** — regex extracts team, prediction, or reported score from the user's message.
4. **Build prompt** — compact fan state + recalled receipts + toxicity level (1–10).
5. **Stream roast** — user's chosen LLM (default Gemini 2.0 Flash Lite); reply capped ~40 words for live-demo speed.
6. **Write Walrus (async)** — save updated profile and roast line; does **not** delay the response.

**Latency design (why it doesn't timeout on message 3):** profile load and semantic recall run **in parallel** with hard caps (500ms / 800ms). Writes use `remember()` without waiting — never `rememberAndWait()` before the stream.

---

### 3. What gets stored in Walrus

```mermaid
flowchart LR
    subgraph PerWallet["Namespace: special-one-{wallet}"]
        JSON["FAN_PROFILE_JSON<br/>team, predictions, flip-flops, roast history"]
        SEM["Semantic lines<br/>flip-flop, PENDING/WRONG/CORRECT, roast delivered"]
    end

    READ["Read before roast"] --> JSON
    READ --> SEM
    WRITE["Write after intent / roast"] --> JSON
    WRITE --> SEM
```

| Storage type | Example | When |
|--------------|---------|------|
| **Profile JSON** | `{ favorite_team: "Brazil", past_predictions: [...] }` | Loaded every turn; updated on intent |
| **Semantic line** | `Flip-flop: switched from Brazil to Argentina` | Written on team change, prediction, result, roast |

See [Memory Fields](#memory-fields) below for the full schema.

---

### 4. Prediction sync (optional — not on every chat turn)

Fixture resolution is **user-triggered** (sidebar **Check my predictions**), not automatic on each message — keeps chat fast.

```mermaid
flowchart LR
    User[User clicks sync] --> SYNC["/api/matches/sync"]
    SYNC --> AF[API-Football]
    SYNC --> MW[MemWal: mark predictions WRONG/CORRECT]
```

Manual score entry in chat (*"Argentina beat Brazil 1-0"*) also updates profile + Walrus via intent detection — no API-Football required for the demo.

---

### 5. What judges should look for (Memory Moment)

| Demo moment | Walrus proof |
|-------------|--------------|
| Declare team + prediction | `remember()` lines appear in [MemWalAccount explorer](https://suiscan.xyz/mainnet/object/0x73b07979a6712f54283c02ddf70e2bdfb3ec729627c9ef0e0d8a214015066a99) |
| Wrong call / flip-flop | Toxicity meter rises; roast references past line from **recall** |
| Refresh browser, same wallet | Agent still knows team + predictions — **portable memory** |
| Different wallet | Clean slate — **per-wallet isolation** |

Press room header shows **MemWal 🟢 LIVE** when server MemWal env is configured.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| UI | React 18, Tailwind CSS, `@mysten/dapp-kit` |
| LLM | Vercel AI SDK + BYOK (Gemini / ChatGPT / Claude in Settings) |
| Memory | `@mysten-incubation/memwal` — namespace `special-one-{wallet}` |
| Identity | Sui wallet + `PersonalMessage` signature verification |
| Football data | API-Football (league 1, season 2026) + manual result parsing |
| Validation | Zod schemas for intent + profile shapes |

---

## Memory Fields

Stored per wallet in Walrus (`special-one-{address.toLowerCase()}`):

| Field | Type | Purpose |
|-------|------|---------|
| `favorite_team` | `string` | Current supported team |
| `past_predictions` | `Prediction[]` | Up to 50 match predictions (pending or resolved) |
| `flip_flop_count` | `number` | Times the user switched `favorite_team` |
| `confidence_level` | `"high" \| "medium" \| "low"` | Last declared confidence — fuels escalation |
| `roast_history` | `string[]` | Last 20 assistant roasts (for variety) |
| `last_roast_topics` | `string[]` | Last 5 topics to avoid repetitive angles |

**Prediction object:** `match`, `prediction`, `result`, optional `fixtureId`, `createdAt`.

**Toxicity formula:** `clamp(1, 10, 1 + wrongCount×1.5 + flip_flop_count×2 + highConfidenceWrong×2)`

---

## Personality

**Mr. Toxic Special One** is a *fictional* character — American roast-show energy, not a cold press-conference monologue.

- **Tone:** Confident, theatrical, callback-heavy — like a roast host who actually did their homework on your terrible takes.
- **Format:** Every reply opens hot, drops a `[Meme Format]` beat, builds the roast, lands a closing sting tied to memory.
- **Rules:** English only; witty toxicity, no heavy profanity; roasts fandom and predictions, not real people; never fabricates scores.
- **Escalation:** Early roasts are smug; after wrong predictions and jersey swaps, the bot goes full "I remember everything" mode.

Think Comedy Central Roast meets World Cup group-chat chaos — fun, not hostile.

---

## Demo Script (~3 minutes)

**Prep:** Connect Sui wallet → Settings → paste free [Gemini API key](https://aistudio.google.com/apikey). Operator sets `MEMWAL_*` on server. `API_FOOTBALL_KEY` optional.

| Time | Action | Show judges |
|------|--------|-------------|
| 0:00 | Open `/` | Landing + "Enter Press Room" |
| 0:20 | Connect wallet + sign | Verified identity in header |
| 0:30 | Point at MemWal badge | 🟢 LIVE = memories persist to Walrus |
| 0:45 | *"I support Brazil, high confidence"* | Roast names Brazil; team saved |
| 1:15 | *"I predict Brazil 3-0 Argentina in the final"* | Prediction card updates |
| 1:45 | *"Argentina beat Brazil 1-0"* | Wrong call → toxicity meter rises; savage callback |
| 2:15 | *"Actually I support Argentina now"* | Flip-flop roast; tone escalates |
| 2:30 | Refresh page, same wallet | Memory recalled — still knows the graveyard |
| 2:45 | (Optional) Sync matches | API-Football resolves fixture if available |
| 3:00 | Closing | *"Every roast reads and writes Walrus Memory per wallet — the Special One remembers."* |

---

## Walrus Sessions 4 — Submission Status

→ **Data flow (judges):** see [Data Flow (for judges)](#data-flow-for-judges) above · **Submission packet:** [SUBMISSION.md](./SUBMISSION.md) · **MemWal feedback:** [FINAL_FEEDBACK.md](./FINAL_FEEDBACK.md) · **Rules:** [WALRUS_SS4_RULE.md](./WALRUS_SS4_RULE.md)

| Submission item | Status |
|-----------------|--------|
| Walrus Memory integration (MemWal SDK) | ✅ Done |
| Prediction Roast product fit | ✅ Done |
| Mainnet production deploy URL | ✅ [special-one-agent.vercel.app](https://special-one-agent.vercel.app) |
| MemWalAccount explorer link | ✅ [suiscan](https://suiscan.xyz/mainnet/object/0x73b07979a6712f54283c02ddf70e2bdfb3ec729627c9ef0e0d8a214015066a99) |
| Memory Moment (Day 1 vs ≥4 days) | ❌ TODO |
| Demo video (<3 min) | ❌ TODO |
| DeepSurge + Airtable submit | ❌ TODO |
| Reflection + #Walrus X post | ❌ TODO |

**Deadline:** June 24, 2026 · Track: [Walrus Memory World Cup](https://thewalrussessions.wal.app/memory-world-cup)

---

## Status

### Done

- Next.js 14 app with routes: `/` (landing), `/chat` (press room), API routes (`/api/chat`, `/api/auth/verify`, `/api/matches/*`)
- MemWal client + per-wallet namespace + fan profile CRUD
- Intent detection (LLM + regex fallback), toxicity scoring, system prompt contract
- Streaming chat API, wallet auth, API-Football + manual result resolution
- Press-room UI: toxicity meter, prediction card, model selector, meme stamps
- `.env.example`, `docs/SPEC.md`, `pnpm build` / `npm run build` passes

### Optional polish

- Production deploy URL (Vercel) for hackathon submission
- Pre-tournament fixture mocks if API-Football data is sparse
- Redis-backed auth sessions (current: in-memory 24h TTL — fine for demo)
- Single-page vs `/chat` route consolidation

---

## Links

| Resource | Description |
|----------|-------------|
| [docs/MEMWAL_SETUP.md](./docs/MEMWAL_SETUP.md) | Mainnet MemWalAccount + delegate key setup |
| [WALRUS_SS4_RULE.md](./WALRUS_SS4_RULE.md) | Official SS4 rules summary + submission checklist |
| [GitHub Repository](https://github.com/Olympusxvn/special-one-agent) | Source code and issues |
| [docs/SPEC.md](./docs/SPEC.md) | Full product spec — source of truth |
| [docs/superpowers/specs/2026-06-06-mr-toxic-special-one-design.md](./docs/superpowers/specs/2026-06-06-mr-toxic-special-one-design.md) | Implementation design snapshot |
| [README.md](./README.md) | Developer setup and quick start |

---

## Tóm tắt (VI)

**Mr. Toxic Special One** là chatbot roast kiểu American comedy cho fan bóng đá World Cup 2026 — vui, cá nhân hóa, không thô tục. Mỗi ví Sui có bộ nhớ Walrus riêng (`special-one-{address}`): đội yêu thích, dự đoán, lịch sử roast; độ toxic tăng khi dự đoán sai hoặc đổi đội. Stack: Next.js 14, MemWal, Sui wallet, OpenRouter, API-Football.
