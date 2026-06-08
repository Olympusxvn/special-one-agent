# Changelog

All notable changes to **Mr. Toxic Special One** (Walrus Sessions 4).

Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

### Planned

- Public repo (target ~19 Jun 2026) for hackathon submission
- Memory Moment demo (Day 1 vs Day 4+ with same wallet)
- Demo video & DeepSurge / Airtable forms

---

## [0.2.0] — 2026-06-08

### Added

- WC 2026 festive UI + official logo watermarks
- `/schedules` — fixtures/results (API-Football free tier or static demo JSON)
- Free RSS news feed (`/api/news`) — Google News + BBC Sport, no API key
- Direct LLM connect: Claude, ChatGPT, Gemini via Settings modal + per-provider API keys
- MemWal feedback issues [#246](https://github.com/MystenLabs/MemWal/issues/246), [#247](https://github.com/MystenLabs/MemWal/issues/247), [#248](https://github.com/MystenLabs/MemWal/issues/248)
- Stateless wallet auth proof in `sessionStorage` for serverless

### Changed

- Dropped SportMonks (paid) — free-only football data path
- Replaced OpenRouter-only BYOK with provider-specific keys in **Settings**
- README project structure tree (GitHub-safe rendering)

### Fixed

- Chat input invisible text (`.chat-input` contrast + autofill override)
- Settings modal z-index — LLM key form no longer covered by chat welcome card
- `Wallet not verified` on Vercel — in-memory session does not survive across lambdas
- `No user message` — `prepareSendMessagesRequest` must include `messages` in custom body
- Manual `vercel --prod` when Git auto-deploy not wired for private repo

---

## [0.1.0] — 2026-06-07

### Added

- Next.js 14 press-room chat with MemWal per-wallet namespace (`special-one-{address}`)
- Sui wallet sign-in + streaming roast API (`/api/chat`)
- OpenRouter BYOK (later superseded by direct provider keys)
- MemWal mainnet setup docs ([docs/MEMWAL_SETUP.md](./docs/MEMWAL_SETUP.md))
- Production deploy: [special-one-agent.vercel.app](https://special-one-agent.vercel.app)
- Walrus Sessions 4 rules summary ([WALRUS_SS4_RULE.md](./WALRUS_SS4_RULE.md))

---

## Bài học (Lessons learned)

Ghi lại từ quá trình build hackathon — để lần sau không lặp lại.

### 1. MemWal trên serverless (Vercel)

**Vấn đề:** Một `MemWalAccount` + **delegate key** trên server, mỗi user chỉ connect Sui wallet — pattern multi-tenant không có sẵn trong quickstart.

**Bài học:**

- Document rõ: operator tạo account, user chỉ ký ví; namespace `special-one-{address}`.
- Structured state (JSON profile) + semantic `recall` dễ trả snapshot cũ → đã file issue [#247](https://github.com/MystenLabs/MemWal/issues/247) (upsert / key-based recall).
- `npm run memwal:verify` chỉ check env — nên có `healthCheck()` thật ([#248](https://github.com/MystenLabs/MemWal/issues/248)).

### 2. Wallet auth và serverless

**Vấn đề:** `/api/auth/verify` ghi session vào `Map` in-memory → request `/api/chat` rơi sang lambda khác → `Wallet not verified`.

**Bài học:**

- **Không tin in-memory session** trên Vercel/serverless.
- Lưu `message` + `signature` trong `sessionStorage`, gửi kèm **mỗi** API call; server verify chữ ký Sui (stateless).
- Lỗi hiện ở app backend, **không phải** lỗi ChatGPT/Claude.

### 3. AI SDK `DefaultChatTransport`

**Vấn đề:** `prepareSendMessagesRequest` trả `body` tùy chỉnh → SDK **thay hẳn** body mặc định → thiếu `messages` → `No user message`.

**Bài học:**

- Khi override `body`, **bắt buộc** spread và thêm `messages` từ callback.
- Lỗi xảy ra **trước** khi gọi LLM — đừng debug nhầm sang API key OpenAI.

### 4. Dữ liệu bóng đá — free-first

**Vấn đề:** SportMonks WC API trả phí; widget embed cần domain whitelist.

**Bài học:**

- **News:** RSS (Google News + BBC) — ổn, không key.
- **Lịch/kết quả:** `API_FOOTBALL_KEY` (free tier ~100 req/ngày) hoặc `data/wc2026-fixtures.json` demo khi không có key.
- Đừng trộn widget hub vào app roast nếu user chỉ cần schedules — giữ scope nhỏ.

### 5. UI / UX

**Vấn đề:** Dropdown nhập key trong header bị welcome card che; input chat chữ trắng trên nền trắng (autofill).

**Bài học:**

- Form nhạy cảm (API key) → **modal Settings** full-screen `z-[200]`, không dropdown trong header.
- Input dark theme: class `.chat-input` + `color-scheme: dark` + override `-webkit-autofill`.

### 6. Deploy Vercel

**Vấn đề:** `git push` không tự deploy; production lag vài commit.

**Bài học:**

- Repo **private** cần Git integration + quyền Vercel trên GitHub, hoặc `npx vercel --prod --yes` sau mỗi push quan trọng.
- Verify production: `curl` `/schedules`, `/api/news`, `/api/matches/fixtures` — không chỉ xem landing cũ.
- Windows đôi khi `.next` ENOENT khi build — `rm -rf .next` rồi build lại.

### 7. Hackathon & repo

**Vấn đề:** Issue MemWal public ≠ repo private; judge không đọc được code/README.

**Bài học:**

- Submission cần **repo public** + live URL + explorer MemWalAccount + video Memory Moment.
- Feedback prize: link issue MemWal trong form — không phụ thuộc README private.
- 3 issue đã mở: cookbook multi-tenant ([#246](https://github.com/MystenLabs/MemWal/issues/246)), structured state ([#247](https://github.com/MystenLabs/MemWal/issues/247)), healthCheck ([#248](https://github.com/MystenLabs/MemWal/issues/248)).

### 8. LLM — “login web” vs API key

**Kỳ vọng:** User login Claude/ChatGPT/Gemini như trên web.

**Thực tế:** App không OAuth trực tiếp vào tài khoản chat web. Flow đúng: đăng nhập trên site provider → tạo **API key** → dán vào Settings (sessionStorage).

**Bài học:** Ghi rõ trong UI/docs để user không kỳ vọng “đăng nhập một lần như ChatGPT.com”.

---

## Links

| Resource | URL |
|----------|-----|
| Production | https://special-one-agent.vercel.app |
| MemWalAccount (explorer) | https://suiscan.xyz/mainnet/object/0x73b07979a6712f54283c02ddf70e2bdfb3ec729627c9ef0e0d8a214015066a99 |
| MemWal dashboard | https://memory.walrus.xyz/dashboard |
| Walrus Sessions 4 | https://thewalrussessions.wal.app/memory-world-cup |

[Unreleased]: https://github.com/Olympusxvn/special-one-agent/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/Olympusxvn/special-one-agent/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Olympusxvn/special-one-agent/commit/93e3f62
