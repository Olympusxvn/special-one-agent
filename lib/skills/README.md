# Agent Skills — Mr. Toxic Special One

Portable agent skills extracted from this codebase. Cursor loads `SKILL.md`
files when descriptions match your request.

**Judges — production lessons & latency:** [FINAL_FEEDBACK.md](../../FINAL_FEEDBACK.md)

---

## Skills in this repo

| Skill | Path | Use when |
|-------|------|----------|
| **memwal-serverless** | [memwal-serverless/SKILL.md](./memwal-serverless/SKILL.md) | Vercel + MemWal streaming chat, timeouts, remember vs await |
| ↳ recall optimization | [memwal-serverless/recall-optimization.md](./memwal-serverless/recall-optimization.md) | 429 handling, cache, skip restore |
| **memwal-multi-tenant-setup** | [memwal-multi-tenant-setup/SKILL.md](./memwal-multi-tenant-setup/SKILL.md) | Dashboard, delegate key, namespace per wallet |
| **sui-wallet-stateless-auth** | [sui-wallet-stateless-auth/SKILL.md](./sui-wallet-stateless-auth/SKILL.md) | dapp-kit sign-in, serverless auth |
| **prediction-roast-agent** | [prediction-roast-agent/SKILL.md](./prediction-roast-agent/SKILL.md) | Dual memory, intent, toxicity, judge ledger |
| **luxury-wc-ui** | [luxury-wc-ui/SKILL.md](./luxury-wc-ui/SKILL.md) | Obsidian/gold glass UI |
| **taste** | [taste/SKILL.md](./taste/SKILL.md) | Anti-slop motion/spacing dials (runtime port) |

---

## Personal Cursor skills (`~/.cursor/skills/`)

| Skill | Scope |
|-------|-------|
| [luxury-wc-ui](file:///C:/Users/Admin/.cursor/skills/luxury-wc-ui/SKILL.md) | Luxury UI — all projects |
| [byok-streaming-chat](file:///C:/Users/Admin/.cursor/skills/byok-streaming-chat/SKILL.md) | BYOK LLM + demo chips |
| [walrus-hackathon-submission](file:///C:/Users/Admin/.cursor/skills/walrus-hackathon-submission/SKILL.md) | Submit pack + judge script |

---

## Related docs

| Doc | Purpose |
|-----|---------|
| [FINAL_FEEDBACK.md](../../FINAL_FEEDBACK.md) | **Judges** — serverless latency, trade-offs, MemWal asks |
| [SUBMISSION.md](../../SUBMISSION.md) | Hackathon packet + checklist |
| [FEEDBACK.md](../../FEEDBACK.md) | MemWal issue summary |
| [docs/MEMWAL_SETUP.md](../../docs/MEMWAL_SETUP.md) | Operator setup |

---

## Invoke in Cursor

Examples:

- *"Follow memwal-serverless skill to fix chat timeout"*
- *"Apply prediction-roast-agent pattern to this route"*
- *"Use walrus-hackathon-submission to draft form answers"*
