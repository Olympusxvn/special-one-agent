# Mr. Toxic Special One — Design Spec

**Date:** 2026-06-06  
**Hackathon:** Walrus Sessions 4 — Walrus Memory World Cup  
**Status:** Implemented

## Overview

Satirical José Mourinho AI agent that roasts World Cup 2026 football fans using persistent Walrus Memory. Each Sui wallet gets an isolated memory namespace.

## Architecture

- **Frontend:** Next.js 14 App Router, Tailwind, `@mysten/dapp-kit`
- **LLM:** Vercel AI SDK + OpenRouter (user-selectable model)
- **Memory:** `@mysten-incubation/memwal` with namespace `special-one-{wallet}`
- **Football data:** API-Football (league=1, season=2026) + manual result parsing

## Memory Schema

```typescript
interface FanMemory {
  favorite_team: string;
  past_predictions: Array<{ match, prediction, result, fixtureId?, createdAt }>;
  flip_flop_count: number;
  confidence_level: "high" | "medium" | "low";
  roast_history: string[];
  last_roast_topics: string[];
}
```

Storage: canonical `FAN_PROFILE_JSON:` snapshot + semantic recall lines per prediction/roast.

## Toxicity Escalation

```
toxicityLevel = clamp(1, 10, 1 + wrongCount*1.5 + flip_flop_count*2 + highConfidenceWrong*2)
```

## Auth Flow

1. User connects Sui wallet
2. Signs `buildAuthMessage(wallet)` personal message
3. `/api/auth/verify` validates signature, marks session verified
4. `/api/chat` requires verified wallet

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/chat` | POST | Stream toxic roast |
| `/api/auth/verify` | POST | Wallet signature verify |
| `/api/matches/fixtures` | GET | WC 2026 fixtures |
| `/api/matches/sync` | POST | Resolve pending predictions |

## Persona Rules

- English only, press conference style
- Every response: opening roast → meme beat → body → closing sting
- No heavy profanity; witty toxicity only
- Never fabricate match results
